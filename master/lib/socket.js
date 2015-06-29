var serverService = require('./server');
var socketEvents = require('./socketEvents');
var debug = require('debug')('master:socket');
//socket.io connection
var socket;

function socketError(data) {
    socket.emit(socketEvents.ERROR, data);
}

function Socket(server) {
    // create connection;
    if (server && null == socket) {
        var io = require('socket.io')(server);
        io.on('connection', function (_socket) {

            socket = _socket;

            socket.on(socketEvents.CLIENTS_GET, function (data) {
                debug([socketEvents.CLIENTS_GET, data]);

                socket.emit(socketEvents.CLIENTS_LIST, serverService.getClients().getArrayCopy());
            });

            socket.on(socketEvents.CLIENT_SWITCH, function (data) {
                debug([socketEvents.CLIENT_SWITCH, data]);

                socket.emit(socketEvents.CLIENT_PENDING, data.id);

                serverService.switchTV(data.state, data.id, function (err) {
                    if (err) {
                        socketErrorListener({id: data.id, message: 'Error on switch TV!'});
                        return;
                    }
                    socket.emit(socketEvents.CLIENT_UPDATE, data);
                })
            });

            socket.on(socketEvents.CLIENT_CHANGEURL, function (data) {
                debug([socketEvents.CLIENT_CHANGEURL, data]);
                socket.emit(socketEvents.CLIENT_PENDING, data.id);

                serverService.changeUrl(data.url, data.id, function (err) {
                    if (err) {
                        socketErrorListener({id: data.id, message: 'Error on changeUrl!'});
                        return;
                    }
                    socket.emit(socketEvents.CLIENT_UPDATE, data);
                });
            });

            socket.on(socketEvents.CLIENT_CHANGETITLE, function (data) {
                debug([socketEvents.CLIENT_CHANGETITLE, data]);
                socket.emit(socketEvents.CLIENT_PENDING, data.id);

                serverService.changeTitle(data.title, data.id, function (err) {
                    if (err) {
                        socketErrorListener({id: data.id, message: 'Error on changeTitle!'});
                        return;
                    }
                    socket.emit(socketEvents.CLIENT_UPDATE, data);
                });
            });


        });
    }
}

module.exports = Socket;


