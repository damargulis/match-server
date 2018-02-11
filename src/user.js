var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;

router.post('/:id/photos', (req, res) => {
    req.gfs.writeFile({filename: 'test', mode: 'w', content_type: 'image'}, req.files.photo.data, (err, file) => {
        if(err) throw Error('Shit done fucked');
        req.db.collection('user').updateOne(
            {_id: new ObjectID(req.params.id)},
            { $push: { photos: file._id } }
        ).then((success) => {
            res.send(JSON.stringify({
                success: 'true',
                photoId: file._id,
            }));
        }).catch((error) => {
            console.log(error);
        });
    });
});

router.get('/photo/:id', (req, res) => {
    console.log(req.params.id);
    req.gfs.readFile({_id: new ObjectID(req.params.id)}, (err, data) => {
        if(err) console.log(err);
        res.send(JSON.stringify({
            data: data
        }));
    });
});

router.get('/:id', (req, res) => {
	req.db.collection('user').findOne({_id: new ObjectID(req.params.id)})
	.then((user) => {
		res.send(JSON.stringify(user));
	}).catch((err) => {
		console.log(err);
	});
});

router.put('/user/:id', (req, res) => {
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

module.exports = router;
