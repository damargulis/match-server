var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;

router.post('/:id/location', (req, res) => {
    req.db.collection('user').updateOne({_id: new ObjectID(req.params.id)},
        { $set: {location: [
            req.body.long,
            req.body.lat,
        ] } }
    ).then(() => {
        res.send(JSON.stringify({ success: true }));
    });
});

router.delete('/:id/photo/:photoId', (req, res) => {
    req.gfs.remove({_id: new ObjectID(req.params.photoId)}, () => {
        req.db.collection('user').updateOne(
            {_id: new ObjectID(req.params.id) },
            { $pull: { photos: new ObjectID(req.params.photoId) } }
        ).then(() => {
            res.send(JSON.stringify({
                success: 'true',
            }));
        });
    });
});

router.post('/:id/photos', (req, res) => {
    req.gfs.writeFile({filename: 'test', mode: 'w', content_type: 'image'},
        req.files.photo.data, (err, file) => {
            if(err) throw Error('Shit done fucked');
            req.db.collection('user').updateOne(
                {_id: new ObjectID(req.params.id)},
                { $push: { photos: file._id } }
            ).then(() => {
                res.send(JSON.stringify({
                    success: 'true',
                    photoId: file._id,
                }));
            });
        });
});

router.get('/photo/:id', (req, res) => {
    req.gfs.readFile({_id: new ObjectID(req.params.id)}, (err, data) => {
        res.send(JSON.stringify({
            data: data,
        }));
    });
});

router.get('/:id/events', (req, res) => {
    req.db.collection('user').findOne({_id: new ObjectID(req.params.id)})
    .then((user) => {
        const attending = user.attending.map((evt) => new ObjectID(evt));
        req.db.collection('event').find({_id: { '$in': attending } })
        .toArray().then((events) => {
            res.send(JSON.stringify(events));
        });
    });
});

router.get('/:id', (req, res) => {
    req.db.collection('user').findOne({_id: new ObjectID(req.params.id)})
    .then((user) => {
        res.send(JSON.stringify(user));
    });
});

router.put('/:id', (req, res) => {
    delete req.body.profile._id;
    delete req.body.profile.id;
    delete req.body.profile.username;
    delete req.body.profile.password;
    req.db.collection('user').findOneAndUpdate(
        {_id: new ObjectID(req.params.id)},
        { $set: req.body.profile },
        { returnOriginal: false}
    ).then((response) => {
        res.send(
            JSON.stringify({
                success: true,
                profile: response.value,
            })
        );
    });
});

module.exports = router;
