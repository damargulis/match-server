const express = require('express');
const ObjectID = require('mongodb').ObjectID;

const router = express.Router();

router.get('/rsvp', (req, res) => {
    req.db.collection('event').findOne({_id: new ObjectID(req.query.eventId)})
    .then((evt) => {
        res.send(JSON.stringify({
            attending: (evt.attendees.indexOf(req.query.userId) > -1)
        }));
    });
});

router.post('/rsvp', (req, res) => {
    req.db.collection('event').update({_id: new ObjectID(req.body.eventId)},
        { $push: { attendees: req.body.userId } }
    );
    req.db.collection('user').update({_id: new ObjectID(req.body.userId)},
        { $push: {attending: req.body.eventId } }
    );
    res.send(JSON.stringify({success: true}));
});

router.post('/cancel', (req, res) => {
    req.db.collection('event').update({_id: new ObjectID(req.body.eventId)},
        { $pull: { attendees: req.body.userId } }
    );
    req.db.collection('user').update({_id: new ObjectID(req.body.userId)},
        { $pull: { attending: req.body.eventId } }
    );
    res.send(JSON.stringify({success: true}));
});

router.get('/:id', (req, res) => {
    req.db.collection('event').findOne({ _id: new ObjectID(req.params.id) })
    .then((evt) => {
        res.send(JSON.stringify(evt));
    });
});

router.get('/', (req, res) => {
    Promise.all([
        req.db.collection('event').find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(req.query.long),
                            parseFloat(req.query.lat),
                        ],
                    },
                    $maxDistance: parseInt(req.query.maxDist) * 1609.344,
                }
            }
        }).toArray(),
        req.db.collection('event').find({
            location: {
                $exists: false
            }
        }).toArray(),
    ]).then((results) => {
        return [].concat.apply([], results).filter((event) => {
            return event.endTime > Date.now();
        });
    }).then((results) => {
        res.send(JSON.stringify(results));
    });
});

module.exports = router;
