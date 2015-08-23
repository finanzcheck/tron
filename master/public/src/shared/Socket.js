import SocketIo from 'socket.io-client';
let full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
let socket;

export default (function () {
    if (socket == null) {
        let full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        socket = SocketIo(full);
    }
    return socket;
})();
