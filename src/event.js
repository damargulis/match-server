const express = require('express');
const ObjectID = require('mongodb').ObjectID;

const router = express.Router();

router.get('/rsvp', (req, res) => {
    req.db.collection('event').findOne({_id: new ObjectID(req.query.eventId)})
    .then((evt) => {
        res.send(JSON.stringify({
            attending: (evt.attendees.indexOf(req.query.userId) > -1),
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
    let queryTime = req.query.afterTime ? 
        new Date(req.query.afterTime) : new Date();
    let maxEvents = req.query.maxEvents ? req.query.maxEvents : 25;
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
                },
            },
        }, { sort: ['startTime', 'endTime'] })
        .toArray().then((events) => {
            return events.filter((event) => {
                return event.startTime > queryTime;
            });
        }), 
        req.db.collection('event').find({
            $and: [{
                location: {
                    $exists: false,
                },
            }, {
                startTime: {
                    $gt: queryTime,
                },
            }],
        }, { sort: ['startTime', 'endTime'] }).limit(maxEvents)
        .toArray(),
    ]).then((results) => {
        return [].concat.apply([], results).slice(0,maxEvents);
    }).then((results) => {
        res.send(JSON.stringify(results));
    });
});

module.exports = router;
