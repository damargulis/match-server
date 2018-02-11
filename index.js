const fs = require('fs');
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
const websocket = socketio(server);

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

var auth = require('./src/auth.js');
app.use('/auth', auth);

var event = require('./src/event.js');
app.use('/event', event);

var user = require('./src/user.js');
app.use('/user', user);

var swipe = require('./src/swipe.js');
app.use('/swipe', swipe);

app.get('/chats/:id', (req, res) => {
	req.db.collection('chat').find({ userIds: req.params.id }).toArray()
	.then((chats) => {
		res.send(JSON.stringify(chats.reverse()));
	}).catch((error) => {
		console.log(error);
	});
});

server.listen(3000, () => console.log('Server running on port 3000'));

websocket.on('connection', function (socket) {
	let id = socket.handshake.query.chatId;
	socket.join(id);

	socket.on('sendMessage', function(data) {
		mongoConnection.collection('chat').updateOne(
			{_id: new ObjectID(id) },
			{ $push: { messages: data.message[0] } }
		).then(() => {
			console.log('update successful');
		}).catch((error) => {
			console.log(error);
		});
		socket.broadcast.to(id).emit('receiveMessage', {
			message: data,
		});
	});

	socket.on('disconnect', function(data) {
		socket.leave(id);
	});
});
