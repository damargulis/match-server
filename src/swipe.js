var express = require('express');
const ObjectID = require('mongodb').ObjectID;
var router = express.Router();

module.exports = function(websocket) {

    function isEligable(user, test_id, db) {
        return db.collection('user').findOne({_id: new ObjectID(test_id)})
        .then((test_user) => {
            if(test_user.age > user.interestsAgeMax 
                || test_user.age < user.interestsAgeMin
            ) {
                return false;
            }
            if(test_user.gender != user.interestsGender 
                && user.interestsGender != 'Any'
            ){
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
            req.db.collection('event').find({ _id: { $in: attendingEvents } })
            .toArray().then((events) => {
                let users = events.reduce((users, evt) => {
                    for(var i = 0; i<evt.attendees.length; i++){
                        if(evt.attendees[i] != req.params.id){
                            users.add(evt.attendees[i]);
                        }
                    }
                    return users;
                }, new Set());

                var usersArray = [...users];
                Promise.all(usersArray.map(
                    entry => isEligable(user, entry, req.db))
                ).then(bits => usersArray.filter(entry => bits.shift()))
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


    function createMatch(user, swipe, db){
        db.collection('user').update({ _id: new ObjectID(user._id) },
            { $push: { matches: swipe._id } }
        ).catch((error) => {
            console.log(error);
        });
        db.collection('user').update({ _id: new ObjectID(swipe._id) },
            { $push: { matches: user._id } }
        ).catch((error) => {
            console.log(error);
        });
        let swipeEvents = new Set(swipe.attending);
        let commonEvents = user.attending.filter(
            event => swipeEvents.has(event)
        ).map((eventId) => new ObjectID(eventId));
        db.collection('event').find( {
            "_id": {"$in": commonEvents},
        }).toArray()
        .then((events) => {
            db.collection('chat').insertOne({
                userIds: [user._id, swipe._id],
                messages: [{
                    _id: 1,
                    text: 'New Match!\nYou are both going to\n' + events
                        .map(event => event.name)
                        .join(',\n'),
                    system: true,
                }]
            }).then(() => {
                websocket.of('/matchNotification').to(swipe._id).emit(
                    'newMatch', {
                        match: user,
                    }
                );
                websocket.of('/matchNotification').to(user._id).emit(
                    'newMatch', {
                        match: swipe, 
                    }
                );
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    function checkMatch(userId, swipeId, db){
        db.collection('user').findOne({ _id: new ObjectID(userId) })
        .then((user) => {
            db.collection('user').findOne({ _id: new ObjectID(swipeId) })
            .then((swipe) => {
                if(swipe.liked.includes(userId) 
                    && user.liked.includes(swipeId)
                ){
                    createMatch(user, swipe, db);
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
            req.db.collection('user').update(
                { _id: new ObjectID(req.body.userId) },
                { $push: { liked: req.body.swipeId }}
            ).then(() => {
                checkMatch(req.body.userId, req.body.swipeId, req.db);
            }).catch((error) => {
                console.log(error);
            });
        } else {
            req.db.collection('user').update(
                { _id: new ObjectID(req.body.userId) },
                { $push: { disliked: req.body.swipeId }}
            ).then(() => {
                checkMatch(req.body.userId, req.body.swipeId, req.db);
            }).catch((error) => {
                console.log(error);
            });
        }
        res.send({ success: true });
    });
    return router;
}
