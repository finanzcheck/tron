var serverService = require('./server');
var socketEvents = require('./socketEvents');
var debug = require('debug');
//socket.io connection
var socket;

function Socket(server) {
    // create connection;
    if (server && null == socket) {
        var io = require('socket.io')(server);
        io.on('connection', function (_socket) {

            _socket.on(socketEvents.CLIENTS_GET, function (data) {
                _socket.emit(socketEvents.CLIENTS_LIST, serverService.getClients());
            });

            _socket.on(socketEvents.CLIENT_SWITCH, function (data) {
                _socket.emit(socketEvents.CLIENT_PENDING, data.client);
                console.log(data);
                serverService.switchTV(data.state, data.client, function (err, _state, _client) {
                    _socket.emit(socketEvents.CLIENT_UPDATE, {state: _state, id: _client});
                })
            });

            _socket.on(socketEvents.CLIENT_CHANGEURL, function (data) {
                debug('master:socket', [socketEvents.CLIENT_CHANGEURL, data]);
                _socket.emit(socketEvents.CLIENT_PENDING, data.client);
            });


            socket = _socket;
        });
    }
}

module.exports = Socket;


