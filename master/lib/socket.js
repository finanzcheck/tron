var serverService = require('./server');
var socketEvents = require('./socketEvents');
var debug = require('debug')('master:socket');
var SocketIO = require('socket.io');
var Group = require('../../lib/group');

function Socket(server) {
    var self = this;

    this.ioServer = new SocketIO(server);

    function socketError(data) {
        self.ioServer.emit(socketEvents.ERROR, data);
    }

    this.ioServer.on('connection', function (socket) {
        socket.on(socketEvents.CLIENTS_GET, function (data) {
            debug([socketEvents.CLIENTS_GET, data]);

            self.ioServer.emit(socketEvents.CLIENTS_LIST, serverService.getClientPool());
        });

        socket.on(socketEvents.CLIENT_SWITCH, function (data) {
            debug([socketEvents.CLIENT_SWITCH, data]);

            self.ioServer.emit(socketEvents.CLIENT_PENDING, data.id);

            serverService.switchTV(data.state, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on switch TV!'});
                }
            })
        });

        socket.on(socketEvents.CLIENT_CHANGEURL, function (data) {
            debug([socketEvents.CLIENT_CHANGEURL, data]);

            serverService.changeUrl(data.url, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeUrl!'});
                }
            });
        });

        socket.on(socketEvents.CLIENT_CHANGEPANICSTATE, function (data) {
            debug([socketEvents.CLIENT_CHANGEPANICSTATE, data]);

            serverService.setPanicState(data.panicState, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeUrl!'});
                }
            });
        });

        socket.on(socketEvents.CLIENT_CHANGETITLE, function (data) {
            debug([socketEvents.CLIENT_CHANGETITLE, data]);

            serverService.changeTitle(data.title, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeTitle!'});
                }
            });
        });

        socket.on(socketEvents.CLIENT_MOVED, function (data) {
            debug([socketEvents.CLIENT_MOVED, data]);

            serverService.changeGroup(data.group, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeGroup!'});
                }
            });
        });

        socket.on(socketEvents.GROUP_CHANGETITLE, function (data) {
            debug([socketEvents.GROUP_CHANGETITLE, data]);

            serverService.changeGroupTitle(data.title, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeTitle!'});
                }
            });
        });

        socket.on(socketEvents.GROUP_CHANGEPANICURL, function (data) {
            debug([socketEvents.GROUP_CHANGEPANICURL, data]);

            serverService.changeGroupPanicUrl(data.panicUrl, data.id, function (err) {
                if (err) {
                    socketError({id: data.id, message: 'Error on changeGroupPanicUrl!'});
                }
            });
        });

        socket.on(socketEvents.GROUP_CHANGESETTINGS, function (data) {
            debug([socketEvents.GROUP_CHANGESETTINGS, data]);

            //TODO save schedules in ClientPool
            //serverService.changeGroupTitle(data.title, data.id, function (err) {
            //    if (err) {
            //        socketError({id: data.id, message: 'Error on changeTitle!'});
            //    }
            //});
        });

        socket.on(socketEvents.GROUP_ADD, function (data) {
            debug([socketEvents.GROUP_ADD, data]);

            var clientPool = serverService.getClientPool();
            clientPool.addGroup(new Group());
        });

        serverService.getClientPool().on('clientsUpdated', function () {
            self.ioServer.emit(socketEvents.CLIENTS_LIST, serverService.getClientPool());
        });

        serverService.getClientPool().on('groupsUpdated', function () {
            self.ioServer.emit(socketEvents.CLIENTS_LIST, serverService.getClientPool());
        });
    });
}

module.exports = Socket;
