const MongoClient = require('mongodb').MongoClient;

const mongoPw = process.env.MONGO_PASSWORD;
const mongoUser = process.env.MONGO_USER;

var passwordHash = require('password-hash');

const uri = 'mongodb://' + mongoUser + ':' + mongoPw + '@nativematch-shard-00-00-fvbif.mongodb.net:27017,nativematch-shard-00-01-fvbif.mongodb.net:27017,nativematch-shard-00-02-fvbif.mongodb.net:27017/test?ssl=true&replicaSet=nativeMatch-shard-0&authSource=admin';

function test() {
    let database = null;
    let nativeMatch = null;
    MongoClient.connect(uri)
    .then((db) => {
        console.log('here1');
        database = db;
        nativeMatch = database.db('nativeMatch');
    }).then(() => {
        console.log('here');
        nativeMatch.collection('user').find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [ -90.295861, 36.650768] },
                }
            }
        }).toArray()
        .then((users) => {
            console.log('users');
            console.log(users);
        }).catch((error) => {
            console.log(error);
        });
    }).catch((error) => {
        console.log(error);
    });
}

test()
