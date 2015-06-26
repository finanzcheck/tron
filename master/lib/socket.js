var serverService = require('./server');
var socketEvents = require('./socketEvents');
var debug = require('debug')('master:socket');
//socket.io connection
var socket;

function Socket(server) {
    // create connection;
    if (server && null == socket) {
        var io = require('socket.io')(server);
        io.on('connection', function (_socket) {

            _socket.on(socketEvents.CLIENTS_GET, function (data) {
                debug([socketEvents.CLIENTS_GET, data]);

                console.log(serverService.getClients().getArrayCopy());

                _socket.emit(socketEvents.CLIENTS_LIST, serverService.getClients().getArrayCopy());
            });

            _socket.on(socketEvents.CLIENT_SWITCH, function (data) {
                debug([socketEvents.CLIENT_SWITCH, data]);

                _socket.emit(socketEvents.CLIENT_PENDING, data.id);

                serverService.switchTV(data.state, data.id, function (err) {
                    // @todo err behandeln
                    _socket.emit(socketEvents.CLIENT_UPDATE, data);
                })
            });

            _socket.on(socketEvents.CLIENT_CHANGEURL, function (data) {
                debug([socketEvents.CLIENT_CHANGEURL, data]);
                _socket.emit(socketEvents.CLIENT_PENDING, data.id);

                serverService.changeUrl(data.url, data.id, function (err) {
                    // @todo err behandeln
                    _socket.emit(socketEvents.CLIENT_UPDATE, data);
                });
            });

            _socket.on(socketEvents.CLIENT_CHANGETITLE, function (data) {
                debug([socketEvents.CLIENT_CHANGETITLE, data]);
                _socket.emit(socketEvents.CLIENT_PENDING, data.id);

                serverService.changeTitle(data.title, data.id, function (err) {
                    // @todo err behandeln
                    _socket.emit(socketEvents.CLIENT_UPDATE, data);
                });
            });


            socket = _socket;
        });
    }
}

module.exports = Socket;


