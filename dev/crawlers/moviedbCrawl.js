/*eslint-disable no-console*/
const MongoClient = require('mongodb').MongoClient;

const mongoPw = process.env.MONGO_PASSWORD;
const mongoUser = process.env.MONGO_USER;
const API_KEY = process.env.MOVIEDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3/';

var rp = require('request-promise');

const uri = 'mongodb://' + mongoUser + ':' + mongoPw
    + '@nativematch-shard-00-00-fvbif.mongodb.net:27017,nativematch-shard-00-01'
    + '-fvbif.mongodb.net:27017,nativematch-shard-00-02-fvbif.mongodb.net:27017'
    + '/test?ssl=true&replicaSet=nativeMatch-shard-0&authSource=admin';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function crawlRequest(url, query={}, results=[], max_pages=null){
    query.api_key = API_KEY;
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
        max_pages = Math.max(max_pages, response.total_pages);
        if(response.page >= max_pages) {
            return results.concat(response.results);
        } else {
            query.page = response.page + 1;
            return crawlRequest(
                url,
                query,
                results.concat(response.results),
                max_pages
            );
        }
    }).catch((error) => {
        if(error.statusCode == 429){
            console.log('Rate Limited');
            return sleep(10000).then(() => {
                return crawlRequest(url, query, results, max_pages);
            });
        } else {
            console.log(error);
            throw error;
        }
    });
}

console.log('Crawling upcoming movies');
crawlRequest(BASE_URL + 'movie/upcoming', {language: 'en-US'})
.then((response) => {
    console.log('finished');

    MongoClient.connect(uri)
    .then((db) => {
        console.log('upserting movies');
        Promise.all(response.map((movie) => {
            const startTime = new Date(movie.release_date);
            const endTime = new Date(startTime);
            endTime.setTime(endTime.getTime() + 14 * 86400000);
            return db.db('nativeMatch').collection('event').update({
                moviedbId: movie.id,
            }, {
                type: 'Movie',
                moviedbId: movie.id,
                name: movie.title,
                startTime: startTime,
                endTime: endTime,
            }, {
                upsert: true,
            });
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
            console.log('finsihed');
        });
    });
}).catch((err) => {
    console.log(err);
});
/*eslint-enable no-console*/
