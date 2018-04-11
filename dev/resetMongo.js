/*eslint-disable no-console*/
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

const mongoPw = process.env.MONGO_PASSWORD;
const mongoUser = process.env.MONGO_USER;
const Grid = require('gridfs');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb://' + mongoUser + ':' + mongoPw
    + '@nativematch-shard-00-00-fvbif.mongodb.net:27017,nativematch-shard-00-01'
    + '-fvbif.mongodb.net:27017,nativematch-shard-00-02-fvbif.mongodb.net:27017'
    + '/test?ssl=true&replicaSet=nativeMatch-shard-0&authSource=admin';

const data = require('./data.js');

function reset() {
    let database = null;
    let nativeMatch = null;
    let gfs = null;
    MongoClient.connect(uri)
    .then((db) => {
        database = db;
        const oldDb = database.db('nativeMatch');
        console.log('dropping old db');
        return oldDb.dropDatabase();
    }).then(() => {
        console.log('dropped');
        nativeMatch = database.db('nativeMatch');
        gfs = Grid(nativeMatch, mongo);
        console.log('Adding test data');
        return Promise.all([
            nativeMatch.collection('user').insertMany(data.users),
            nativeMatch.collection('event').insertMany(data.events),
        ]);
    }).then(() => {
        console.log('Adding Indexes');
        return Promise.all([
            nativeMatch.collection('user').ensureIndex(
                { location: '2dsphere' }
            ),
            nativeMatch.collection('event').ensureIndex(
                { location: '2dsphere' },
                {sparse: true}
            ),
            nativeMatch.collection('event').ensureIndex(
                { moviedbId: 1},
                {unique: true, sparse: true}
            ),
        ]);
    }).then(() => {
        console.log('Adding Photos');
        return Promise.all([
            new Promise(function(resolve, reject) {
                const file = fs.readFileSync(
                    path.resolve(__dirname, './stickman.png')
                );
                gfs.writeFile(
                    {filename: 'test', mode: 'w', content_type: 'image'},
                    file,
                    (err, file) => {
                        if(err) {
                            reject(err);
                        } else {
                            nativeMatch.collection('user').updateOne(
                                {username: 'test'},
                                { $push: {photos: file._id } }
                            ).then(() => {
                                resolve();
                            });
                        }
                    });
            }),
            new Promise(function(resolve, reject) {
                const file = fs.readFileSync(
                    path.resolve(__dirname, './stickman2.png')
                );
                gfs.writeFile(
                    {filename: 'test', mode: 'w', content_type: 'image'},
                    file,
                    (err, file) => {
                        if(err) {
                            reject(err);
                        } else {
                            nativeMatch.collection('user').updateOne(
                                {username: 'test'},
                                {$push: {photos: file._id } }
                            ).then(() => {
                                resolve();
                            });
                        }
                    });
            }),
            new Promise(function(resolve, reject) {
                const file = fs.readFileSync(
                    path.resolve(__dirname, './stickman3.png')
                );
                gfs.writeFile(
                    {filename: 'test', mode: 'w', content_type: 'image'},
                    file,
                    (err, file) => {
                        if(err) {
                            reject(err);
                        } else {
                            nativeMatch.collection('user').updateOne(
                                {username: 'test'},
                                {$push: { photos: file._id } }
                            ).then(() => {
                                resolve();
                            });
                        }
                    });
            }),
            new Promise(function(resolve, reject) {
                const file = fs.readFileSync(
                    path.resolve(__dirname, './stickwoman.jpg')
                );
                gfs.writeFile(
                    {filename: 'test', mode: 'w', content_type: 'image'},
                    file,
                    (err, file) => {
                        if(err) {
                            reject(err);
                        } else {
                            nativeMatch.collection('user').updateOne(
                                {username: 'test1'},
                                { $push: {photos: file._id } }
                            ).then(() => {
                                resolve();
                            });
                        }
                    });
            }),
            new Promise(function(resolve, reject) {
                const file = fs.readFileSync(
                    path.resolve(__dirname, './stickwoman2.png')
                );
                gfs.writeFile(
                    {filename: 'test', mode: 'w', content_type: 'image'},
                    file,
                    (err, file) => {
                        if(err) {
                            reject(err);
                        } else {
                            nativeMatch.collection('user').updateOne(
                                {username: 'test1'},
                                { $push: {photos: file._id } }
                            ).then(() => {
                                resolve();
                            });
                        }
                    });
            }),
            new Promise(function(resolve, reject) {
                const file = fs.readFileSync(
                    path.resolve(__dirname, './stickwoman3.jpg')
                );
                gfs.writeFile(
                    {filename: 'test', mode: 'w', content_type: 'image'},
                    file,
                    (err, file) => {
                        if(err) {
                            reject(err);
                        } else {
                            nativeMatch.collection('user').updateOne(
                                {username: 'test1'},
                                { $push: {photos: file._id } }
                            ).then(() => {
                                resolve();
                            });
                        }
                    });
            }),
        ]);
    }).then(() => {
        console.log('finished');
        database.close();
    }).catch((err) => {
        console.log(err);
    });
}

reset();
/*eslint-enable no-console*/
