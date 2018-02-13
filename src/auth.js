var express = require('express');
var router = express.Router();
var passwordHash = require('password-hash');

class UserError extends Error {};

router.post('/login', (req, res) => {
    console.log('here!')
	req.db.collection('user').findOne({username: req.body.username})
	.then((user) => {
        if(user && passwordHash.verify(req.body.password, user.password)) {
            console.log('success')
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
	req.db.collection('user').findOne({username: req.body.username})
	.then((user) => {
		if(user) {
			return Promise.reject(new UserError('Username Taken'));
		} else {
			return Promise.resolve();
		}
	}).then(() => {
        var hashedPassword = passwordHash.generate(req.body.password);
		return req.db.collection('user').insertOne({
			username: req.body.username,
            password: hashedPassword,
		});
	}).then((user) => {
		res.send(JSON.stringify({
			success: true,
			userId: user.insertedId,
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
