var express = require('express');
var router = express.Router();

router.get('/:id', (req, res) => {
	req.db.collection('chat').find({ userIds: req.params.id }).toArray()
	.then((chats) => {
		res.send(JSON.stringify(chats.reverse()));
	}).catch((error) => {
		console.log(error);
	});
});

module.exports = router;
