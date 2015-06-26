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

                _socket.emit(socketEvents.CLIENTS_LIST, serverService.getClients());
            });

            _socket.on(socketEvents.CLIENT_SWITCH, function (data) {
                debug([socketEvents.CLIENT_SWITCH, data]);

                _socket.emit(socketEvents.CLIENT_PENDING, data.client);

                serverService.switchTV(data.state, data.client, function (err, _state, _client) {
                    _socket.emit(socketEvents.CLIENT_UPDATE, {state: _state, id: _client});
                })
            });

            _socket.on(socketEvents.CLIENT_CHANGEURL, function (data) {
                debug([socketEvents.CLIENT_CHANGEURL, data]);
                _socket.emit(socketEvents.CLIENT_PENDING, data.client);

                serverService.changeUrl(data.url, data.client, function (err, _state, _client) {
                    _socket.emit(socketEvents.CLIENT_UPDATE, {state: _state, id: _client});
                });
            });

            _socket.on(socketEvents.CLIENT_CHANGETITLE, function (data) {
                debug([socketEvents.CLIENT_CHANGETITLE, data]);
                _socket.emit(socketEvents.CLIENT_PENDING, data.client);

                serverService.changeUrl(data.url, data.client, function (err, _state, _client) {
                    _socket.emit(socketEvents.CLIENT_UPDATE, {state: _state, id: _client});
                });
            });


            socket = _socket;
        });
    }
}

module.exports = Socket;


