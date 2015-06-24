

//socket.io connection
var socket;

function MockSocket() {
}

MockSocket.prototype.on = function () {
};

MockSocket.prototype.emit = function () {
};

function Socket(server) {
    // create connection;
    if (server && null == socket) {
        var io = require('socket.io')(server);
        io.on('connection', function (_socket) {
            _socket.emit('news', {hello: 'world'});
            _socket.on('my other event', function (data) {
                console.log(data);
            });

            socket = _socket;
        });
    } else if (null == socket) {
        return new MockSocket();
    } else {
        return socket;
    }
}

module.exports = Socket;


