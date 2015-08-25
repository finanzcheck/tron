import SocketIo from 'socket.io-client';
import SocketEvents from '../../../lib/socketEvents.js'

let socket = (() => {
    if (socket == null && typeof document !== 'undefined') {
        let full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        socket = SocketIo(full);
    } else {
        socket = {
            on: function () {
            },
            emit: function () {
            }
        }
    }
    return socket;
})();

/**
 *
 */
export default class Socket {
    /**
     *
     * @returns {*}
     */
    static getSocket() {
        return socket;
    }

    static onConnect(cb) {
        socket.on('connect', cb);
    }

    static onDisconnect(cb) {
        socket.on('disconnect', cb);
    }

    static receiveClientsList(cb) {
        socket.on(SocketEvents.CLIENTS_LIST, cb);
    }

    static emitGetClients() {
        socket.emit(SocketEvents.CLIENTS_GET);
    }

    static emitSwitchClient(client, state) {
        socket.emit(SocketEvents.CLIENT_SWITCH, {
            id: client.id,
            state: state
        });
    }

    static emitChangeClientPanicState(client, state) {
        socket.emit(SocketEvents.CLIENT_CHANGEPANICSTATE, {
            id: client.id,
            panicState: state
        });
    }
}
