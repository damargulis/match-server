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
	next();
});

var auth = require('./src/auth.js');
app.use('/auth', auth);

var event = require('./src/event.js');
app.use('/event', event);

app.post('/user/:id/photos', (req, res) => {
    console.log('update photos');
    console.log(req.files);
    console.log(req.body);
    console.log(req.params.id);

    gfs.writeFile({filename: 'test', mode: 'w', content_type: 'image'}, req.files.photo.data, (err, file) => {
        if(err) throw Error('Shit done fucked');
        console.log('file_id');
        console.log(file._id);
        console.log(req.params.id);
        req.db.collection('user').updateOne(
            {_id: new ObjectID(req.params.id)},
            { $push: { photos: file._id } }
        ).then((success) => {
            console.log(success);
            res.send(JSON.stringify({
                success: 'true',
                photoId: file._id,
            }));
        }).catch((error) => {
            console.log(error);
        });
    });
});

app.get('/user/photo/:id', (req, res) => {
    console.log(req.params.id);
    gfs.readFile({_id: new ObjectID(req.params.id)}, (err, data) => {
        console.log(err);
        console.log(data);
        res.send(JSON.stringify({
            data: data
        }));
    });
});


app.get('/user/:id', (req, res) => {
	req.db.collection('user').findOne({_id: new ObjectID(req.params.id)})
	.then((user) => {
		res.send(JSON.stringify(user));
	}).catch((err) => {
		console.log(err);
	});
});

app.put('/user/:id', (req, res) => {
	delete req.body.profile._id;
	delete req.body.profile.id;
	delete req.body.profile.username;
	delete req.body.profile.password;
	req.db.collection('user').updateOne(
		{_id: new ObjectID(req.params.id)},
		{ $set: req.body.profile }
	).then((result) => {
		res.send(JSON.stringify({success: true}));
	}).catch((error) => {
		console.log(error);
	});
});

function isEligable(user, test_id, db) {
	return db.collection('user').findOne({_id: new ObjectID(test_id)})
	.then((test_user) => {
		if(test_user.age > user.interestsAgeMax || test_user.age < user.interestsAgeMin) {
			return false;
		}
		if(test_user.gender != user.interestsGender && user.interestsGender != 'Any'){
			return false;
		}
		if(user.liked.includes(test_id) || user.disliked.includes(test_id)){
			return false;
		}
		//TODO: Test distance and whatever else
		return true;
	});
}

app.get('/possibleMatches/:id', (req, res) => {
	req.db.collection('user').findOne({ _id: new ObjectID(req.params.id) })
	.then((user) => {
		let attendingEvents = [];
		for(var i=0; i<user.attending.length; i++){
			attendingEvents.push(new ObjectID(user.attending[i]));
		}
		req.db.collection('event').find({ _id: { $in: attendingEvents } }).toArray()
		.then((events) => {
			let users = events.reduce((users, evt) => {
				for(var i = 0; i<evt.attendees.length; i++){
					if(evt.attendees[i] != req.params.id){
						users.add(evt.attendees[i]);
					}
				}
				return users;
			}, new Set());

			var usersArray = [...users];
			Promise.all(usersArray.map(entry => isEligable(user, entry, req.db)))
			.then(bits => usersArray.filter(entry => bits.shift()))
			.then((results) => {
				res.send(JSON.stringify({
					swipeDeck: results
				}));
			});	
		}).catch((error) => {
			console.log(error);
		});
	});
});

function createMatch(userId, swipeId, db){
	db.collection('user').update({ _id: new ObjectID(userId) },
		{ $push: { matches: swipeId } }
	).catch((error) => {
		console.log(error);
	});
	db.collection('user').update({ _id: new ObjectID(swipeId) },
		{ $push: { matches: userId } }
	).catch((error) => {
		console.log(error);
	});
	db.collection('chat').insertOne({
		userIds: [userId, swipeId],
		messages: [],
	}).catch((error) => {
		console.log(errro);
	});
}

function checkMatch(userId, swipeId, db){
	db.collection('user').findOne({ _id: new ObjectID(userId) })
	.then((user) => {
		db.collection('user').findOne({ _id: new ObjectID(swipeId) })
		.then((swipe) => {
			if(swipe.liked.includes(userId) && user.liked.includes(swipeId)){
				//TODO: send notifications of some kind
				
				createMatch(userId, swipeId, db);
			} else {
			}
		}).catch((error) => {
			console.log(error);
		});
	}).catch((error) => {
		console.log(error);
	});
}

app.post('/swipe', (req, res) => {
	if(req.body.liked){
		req.db.collection('user').update({ _id: new ObjectID(req.body.userId) },
			{ $push: { liked: req.body.swipeId }}
		).then(() => {
			checkMatch(req.body.userId, req.body.swipeId, req.db);
		}).catch((error) => {
			console.log(error);
		});
	} else {
		req.db.collection('user').update({ _id: new ObjectID(req.body.userId) },
			{ $push: { disliked: req.body.swipeId }}
		).then(() => {
			checkMatch(req.body.userId, req.body.swipeId, req.db);
		}).catch((error) => {
			console.log(error);
		});
	}
	res.send({ success: true });
});

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
