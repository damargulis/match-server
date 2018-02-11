const ObjectID = require('mongodb').ObjectID;

var onConnect = (socket, mongoConnection) => {
	let id = socket.handshake.query.chatId;
	socket.join(id);

	socket.on('sendMessage', function(data) {
		mongoConnection.collection('chat').updateOne(
			{_id: new ObjectID(id) },
			{ $push: { messages: data.message[0] } }
		).then(() => {
			console.log('update successful');
		}).catch((error) => {
			console.log(error);
		});
		socket.broadcast.to(id).emit('receiveMessage', {
			message: data,
		});
	});

	socket.on('disconnect', function(data) {
		socket.leave(id);
	});
};

module.exports = {
    onConnect: onConnect
};
