var serverService = require('./server');
var socketEvents = require('./socketEvents');
var debug = require('debug')('master:socket');
var SocketIO = require('socket.io');

function Socket(server) {
    var self = this;

    this.ioServer = new SocketIO(server);

    function socketError(data) {
        self.ioServer.emit(socketEvents.ERROR, data);
    }

    this.ioServer.on('connection', function (socket) {
        socket.on(socketEvents.CLIENTS_GET, function (data) {
            debug([socketEvents.CLIENTS_GET, data]);

            self.ioServer.emit(socketEvents.CLIENTS_LIST, serverService.getClients());
        });

        socket.on(socketEvents.CLIENT_SWITCH, function (data) {
            debug([socketEvents.CLIENT_SWITCH, data]);

            self.ioServer.emit(socketEvents.CLIENT_PENDING, data.id);

            serverService.switchTV(data.state, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on switch TV!'});
                    return;
                }
                self.ioServer.emit(socketEvents.CLIENT_UPDATE, data);
            })
        });

        socket.on(socketEvents.CLIENT_CHANGEURL, function (data) {
            debug([socketEvents.CLIENT_CHANGEURL, data]);
            self.ioServer.emit(socketEvents.CLIENT_PENDING, data.id);

            serverService.changeUrl(data.url, data.id, function (err, clientData) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeUrl!'});
                    return;
                }
                self.ioServer.emit(socketEvents.CLIENT_UPDATE, clientData);
            });
        });

        socket.on(socketEvents.CLIENT_CHANGETITLE, function (data) {
            debug([socketEvents.CLIENT_CHANGETITLE, data]);
            self.ioServer.emit(socketEvents.CLIENT_PENDING, data.id);

            serverService.changeTitle(data.title, data.id, function (err, clientData) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeTitle!'});
                    return;
                }
                self.ioServer.emit(socketEvents.CLIENT_UPDATE, clientData);
            });
        });
    });
}

module.exports = Socket;
