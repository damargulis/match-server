var onConnect = (socket) => {
    const id = socket.handshake.query.userId;
    socket.join(id);

    socket.on('disconnect', function() {
        socket.leave(id);
    });
};

module.exports = {
    onConnect: onConnect,
};
