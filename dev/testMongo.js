
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
        db.db('nativeMatch').collection('user').find({}).toArray()
        .then((docs) => {
            console.log(docs);
            let id1 = docs[0]._id
        });
    });
}

test();
