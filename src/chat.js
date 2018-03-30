var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;

router.get('/:id', (req, res) => {
    req.db.collection('chat').find({ userIds: new ObjectID(req.params.id) })
    .toArray().then((chats) => {
        res.send(JSON.stringify(chats.reverse()));
    });
});

module.exports = router;
