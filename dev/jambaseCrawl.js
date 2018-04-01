/*eslint-disable no-console*/
const MongoClient = require('mongodb').MongoClient;

var rp = require('request-promise');

const BASE_URL = 'http://api.jambase.com/events/'
const ZIP_CODE = 63112;
const API_KEY = process.env.JAMBASE_API_KEY;
const mongoPw = process.env.MONGO_PASSWORD;
const mongoUser = process.env.MONGO_USER;
const uri = 'mongodb://' + mongoUser + ':' + mongoPw
    + '@nativematch-shard-00-00-fvbif.mongodb.net:27017,nativematch-shard-00-01'
    + '-fvbif.mongodb.net:27017,nativematch-shard-00-02-fvbif.mongodb.net:27017'
    + '/test?ssl=true&replicaSet=nativeMatch-shard-0&authSource=admin';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function crawlRequest(url, query={}, results=[]){
    console.log(query);
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
        let totalResults = results.concat(response.Events)
        if(totalResults.length >= response.Info.TotalResults){
            return totalResults;
        }else{
            query.page = response.Info.PageNumber + 1;
            return crawlRequest(
                url,
                query,
                totalResults
            );
        }
    }).catch((error) => {
        if(error.statusCode == 403){
            console.log('Rate Limited');
            return sleep(1000 * 60 * 60 * 24).then(() => {
                return crawlRequest(url, query, results);
            });
        }else{
            console.log(error);
            throw error;
        }
    });
}

console.log('Crawling concerts for ', ZIP_CODE);
crawlRequest(BASE_URL, {api_key: API_KEY, radius: 50, startDate: new Date(), zipCode: ZIP_CODE})
.then((response) => {
    console.log('Finished crawl');
    var db;
    MongoClient.connect(uri)
    .then((database) => {
        db = database;
        console.log('upserting concerts');
        return Promise.all(response.map((event) => {
            let name = event.Artists.map((artist) => { return artist.Name }).join(', ');
            let startTime = new Date(event.Date);
            let endTime = new Date(event.Date);
            endTime.setHours(24);
            return db.db('nativeMatch').collection('event').update({
                jambaseId: event.Id,
            }, {
                type: 'Concert',
                jambaseId: event.Id,
                name: name,
                startTime: startTime,
                endTime: endTime,
                location: {
                    type: 'Point',
                    coordinates: [
                        event.Venue.Longitude,
                        event.Venue.Latitude,
                    ],
                },
                address: {
                    name: event.Venue.Name,
                    street: event.Venue.Address,
                    city: event.Venue.City,
                    state: event.Venue.State,
                    zip: event.Venue.ZipCode,
                },
            }, {upsert: true});
        }));
    }).then(() => {
        console.log('Setting attending');
        return db.db('natvieMatch').collection('event').updateMany({
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

/*eslint-enable no-console*/
