var express = require('express');
var router = express.Router();
var passwordHash = require('password-hash');

class UserError extends Error {};

router.post('/login', (req, res) => {
	req.db.collection('user').findOne({username: req.body.username})
	.then((user) => {
        if(user && passwordHash.verify(req.body.password, user.password)) {
			res.send(JSON.stringify({
				success: true,
				userId: user._id,
                user: user
			}));
		} else {
            console.log('fail');
			res.send(JSON.stringify({
				success: false,
			}));
		}
	});
});

router.post('/createAccount', (req, res) => {
	req.db.collection('user').findOne({username: req.body.user.username})
	.then((user) => {
		if(user) {
			return Promise.reject(new UserError('Username Taken'));
		} else {
			return Promise.resolve();
		}
	}).then(() => {
        var hashedPassword = passwordHash.generate(req.body.user.password);
		return req.db.collection('user').insertOne({
			username: req.body.user.username,
            password: hashedPassword,
            firstName: req.body.user.firstName,
            age: req.body.user.age,
            gender: req.body.user.gender,
            occupation: req.body.user.occupation,
            school: req.body.user.school,
            interestsGender: req.body.user.interestsGender,
            interestsDistance: req.body.user.interestsDistance,
            interestsAgeMin: req.body.user.interestsAgeMin,
            interestsAgeMax: req.body.user.interestsAgeMax,
            attending: [],
            liked: [],
            disliked: [],
            photos: [],
		});
    }).then(() => {
        return req.db.collection('user').findOne({username: req.body.user.username})
	}).then((user) => {
		res.send(JSON.stringify({
			success: true,
			userId: user._id,
            user: user
		}));	
	}).catch((error) => {
		console.log(error);
		const message = error instanceof UserError ? error.message : 'Something Went Wrong';
		res.send(JSON.stringify({
			success: false,
			reason: message,
		}));
	});
});

module.exports = router;
