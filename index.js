const express = require('express');
const fileUpload = require('express-fileupload');
const http = require('http');
const bodyParser = require('body-parser');
const socketio = require('socket.io');

const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const GridFSBucket = require('mongodb').GridFSBucket;
const Grid = require('gridfs');

const app = express();
const server = http.Server(app);
const websocket = socketio(server, {pingTimeout: 30000, path: '/socket.io'});

const mongoPw = process.env.MONGO_PASSWORD;
const mongoUser = process.env.MONGO_USER;

const uri = 'mongodb://' + mongoUser + ':' + mongoPw + '@nativematch-shard-00-00-fvbif.mongodb.net:27017,nativematch-shard-00-01-fvbif.mongodb.net:27017,nativematch-shard-00-02-fvbif.mongodb.net:27017/test?ssl=true&replicaSet=nativeMatch-shard-0&authSource=admin';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(fileUpload());

app.use('/', (req, res, next) => {
	console.log(req.originalUrl);
	next();
})

var mongoConnection;
var gfs;
MongoClient.connect(uri, function(err, client) {
	mongoConnection = client.db('nativeMatch');
    gfs = Grid(mongoConnection, mongo);
	console.log('Database connected');
});

app.use(function(req, res, next) {
	req.db = mongoConnection;
    req.gfs = gfs
	next();
});

app.use('/auth', require('./src/auth.js'));
app.use('/chat', require('./src/chat.js'));
app.use('/event', require('./src/event.js'));
app.use('/swipe', require('./src/swipe.js')(websocket));
app.use('/user', require('./src/user.js'));

var chatSocket = require('./src/chatSocket.js').onConnect;
websocket.of('/chatNotification').on('connection', (socket) => {
    chatSocket(socket, mongoConnection);
});

var matchSocket = require('./src/matchSocket.js').onConnect;
websocket.of('/matchNotification').on('connection', (socket) => {
    matchSocket(socket);
});

server.listen(3000, () => console.log('Server running on port 3000'));

