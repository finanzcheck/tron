var serverService = require('./server');
var socketEvents = require('./socketEvents');
var debug = require('debug')('master:socket');
//socket.io connection
var io;

function socketError(data, socket) {
    io.emit(socketEvents.ERROR, data);
}

function Socket(server) {
    // create connection;
    if (server && null == io) {
        io = require('socket.io')(server);
    }

    io.on('connection', function (socket) {
        socket.on(socketEvents.CLIENTS_GET, function (data) {
            debug([socketEvents.CLIENTS_GET, data]);

            socket.emit(socketEvents.CLIENTS_LIST, serverService.getClients().getArrayCopy());
        });

        socket.on(socketEvents.CLIENT_SWITCH, function (data) {
            debug([socketEvents.CLIENT_SWITCH, data]);

            io.emit(socketEvents.CLIENT_PENDING, data.id);

            serverService.switchTV(data.state, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on switch TV!'});
                    return;
                }
                io.emit(socketEvents.CLIENT_UPDATE, data);
            })
        });

        socket.on(socketEvents.CLIENT_CHANGEURL, function (data) {
            debug([socketEvents.CLIENT_CHANGEURL, data]);
            io.emit(socketEvents.CLIENT_PENDING, data.id);

            serverService.changeUrl(data.url, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeUrl!'});
                    return;
                }
                io.emit(socketEvents.CLIENT_UPDATE, data);
            });
        });

        socket.on(socketEvents.CLIENT_CHANGETITLE, function (data) {
            debug([socketEvents.CLIENT_CHANGETITLE, data]);
            io.emit(socketEvents.CLIENT_PENDING, data.id);

            serverService.changeTitle(data.title, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeTitle!'});
                    return;
                }
                io.emit(socketEvents.CLIENT_UPDATE, data);
            });
        });


    });
}

module.exports = Socket;


