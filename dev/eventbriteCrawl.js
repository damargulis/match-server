/*eslint-disable no-console*/
const MongoClient = require('mongodb').MongoClient;

const mongoPw = process.env.MONGO_PASSWORD;
const mongoUser = process.env.MONGO_USER;
const API_KEY = process.env.EVENTBRITE_API_KEY;
const BASE_URL = 'https://www.eventbriteapi.com/v3/'

var rp = require('request-promise');

const uri = 'mongodb://' + mongoUser + ':' + mongoPw
    + '@nativematch-shard-00-00-fvbif.mongodb.net:27017,nativematch-shard-00-01'
    + '-fvbif.mongodb.net:27017,nativematch-shard-00-02-fvbif.mongodb.net:27017'
    + '/test?ssl=true&replicaSet=nativeMatch-shard-0&authSource=admin';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const CATEGORY_WHITELIST = new Set([
    'Music',
    'Food & Drink',
    'Community & Culture',
    'Performing & Visual Arts',
    'Film, Media & Entertainment',
    'Sports & Fitness',
    'Travel & Outdoor',
    'Religion & Spirituality',
    'Fashion & Beauty',
    'Hobbies & Special Interest',
]);

function crawlRequest(url, resultString, query={}, results=[]){
    var options = {
        uri: url,
        qs: query,
        headers: {
            'User-Agent': 'Request-Promise',
        },
        json: true,
    };
    return rp(options)
    .then((response) => {
        if(response.pagination.has_more_items){
            query.page = response.pagination.page_number + 1;
            return crawlRequest(
                url,
                resultString,
                query,
                results.concat(response[resultString])
            );
        } else {
            return results.concat(response[resultString]);
        }
    }).catch((error) => {
        if(error.statusCode == 429){
            console.log('Rate Limited');
            return sleep(1000 * 60 * 60).then(() => {
                return crawlRequest(url, resultString, query, results);
            });
        }
    });
}

console.log('Crawling categories');
crawlRequest(BASE_URL + '/categories', 'categories', {
    'token': API_KEY,
}).then((results) => {
    return results.filter((cat) => {
        return CATEGORY_WHITELIST.has(cat.name);
    }).map((cat) => {
        return cat.id;
    });
}).then((catIds) => {
    console.log('Crawling upcoming events');
    return crawlRequest(BASE_URL + '/events/search/', 'events', {
        'sort_by': 'date',
        'location.within': '50mi',
        'location.latitude': 38.650768,
        'location.longitude': -90.295861,
        'expand': 'category,venue',
        'categories': catIds.join(','),
        'include_unavailable_events': true,
        'token': API_KEY,
    }).then((events) => {
        MongoClient.connect(uri)
        .then((db) => {
            console.log('upserting events');
            Promise.all(events.map((event) => {
                return db.db('nativeMatch').collection('event').update({
                    eventbriteId: event.id
                }, {
                    type: event.category.name,
                    eventbriteId: event.id,
                    name:  event.name.text,
                    startTime: new Date(event.start.utc),
                    endTime: new Date(event.end.etc),
                    logoUrl: event.logo ? event.logo.url : null,
                    location: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(event.venue.longitude),
                            parseFloat(event.venue.latitude),
                        ],
                    },
                    address: {
                        street: event.venue.address_1,
                        city: event.venue.city,
                        state: event.venue.region,
                        zip: event.venue.postal_code,
                    }
                }, {upsert: true});
            })).then(() => {
                console.log('Setting attending');
                return db.db('nativeMatch').collection('event').updateMany({
                    attendees: {
                        $exists: false,
                    },
                }, {
                    $set: {
                        'attendees': [],
                    },
                });
            }).then(() => {
                db.close();
                console.log('finished');
            });
        });
    });
});

//console.log('Crawling upcoming events');
//crawlRequest(BASE_URL + '/events/search/', 'events', {
//    'sort_by': "date",
//    'location.within': '50mi',
//    'location.latitude': 38.650768,
//    'location.longitude': -90.295861,
//    'expand': 'category',
//    'token': API_KEY,
//}).then((results) => {
//    results.map((result) => {
//        console.log(result.category);
//    })
//});

/*eslint-enable no-console*/
