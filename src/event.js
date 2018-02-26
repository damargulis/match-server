const express = require('express');
const ObjectID = require('mongodb').ObjectID;

const router = express.Router();

router.get('/rsvp', (req, res) => {
	req.db.collection('event').findOne({_id: new ObjectID(req.query.eventId)})
	.then((evt) => {
		res.send(JSON.stringify({
			attending: (evt.attendees.indexOf(req.query.userId) > -1)
		}));
	}).catch((err) => {
		console.log(err);
	});
});

router.post('/rsvp', (req, res) => {
	req.db.collection('event').update({_id: new ObjectID(req.body.eventId)},
		{ $push: { attendees: req.body.userId } }
	).catch((error) => {
		console.log(error);
	});
	req.db.collection('user').update({_id: new ObjectID(req.body.userId)},
		{ $push: {attending: req.body.eventId } }
	).catch((error) => {
		console.log(error);
	});
	res.send(JSON.stringify({success: true}));
});

router.post('/cancel', (req, res) => {
	req.db.collection('event').update({_id: new ObjectID(req.body.eventId)},
		{ $pull: { attendees: req.body.userId } }
	).catch((error) => {
		console.log(error);
	});
    req.db.collection('user').update({_id: new ObjectID(req.body.userId)},
        { $pull: { attending: req.body.eventId } }
    ).catch((error) => {
        console.log(error);
    });
    res.send(JSON.stringify({success: true}));
});

router.get('/:id', (req, res) => {
	req.db.collection('event').findOne({ _id: new ObjectID(req.params.id) })
	.then((evt) => {
		res.send(JSON.stringify(evt));
	}).catch((err) => {
		console.log(err);
	});
});

router.get('/', (req, res) => {
	req.db.collection('event').find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [
                        parseFloat(req.query.long),
                        parseFloat(req.query.lat),
                    ],
                },
                $maxDistance: parseInt(req.query.maxDist) * 1609.344, // conver to meters
            }
        }
    }, {sort: ['startTime', 'endTime']})
	.toArray()
	.then((events) => {
		res.send(JSON.stringify(events));
	}).catch((error) => {
		console.log(error);
	});
});

module.exports = router;
