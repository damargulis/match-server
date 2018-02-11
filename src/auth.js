var express = require('express');
var router = express.Router();

class UserError extends Error {};

router.post('/login', (req, res) => {
	req.db.collection('user').findOne({username: req.body.username})
	.then((user) => {
		if(user && user.password == req.body.password) {
			res.send(JSON.stringify({
				success: true,
				userId: user._id,
			}));
		} else {
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
		return req.db.collection('user').insertOne({
			username: req.body.username,
			password: req.body.password,
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
