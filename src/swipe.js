var express = require('express');
const ObjectID = require('mongodb').ObjectID;
var router = express.Router();

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

router.get('/possibleMatches/:id', (req, res) => {
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

router.post('/', (req, res) => {
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

module.exports = router;
