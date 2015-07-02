var Q = require('q');
var os = require('os');
var net = require('net');
var mdns = require('mdns');
var config = require('config');
var noop = require('../../lib/noop');
var Protocol = require('../../lib/protocol');
var protocolConfig = config.get('protocol');
var hostname = os.hostname();
var mdnsAd = mdns.createAdvertisement(mdns.tcp(protocolConfig.name), protocolConfig.port, {
    txtRecord: protocolConfig.txtRecord,
    name: hostname
});

var Client = require('../../lib/client');
var ClientPool = require('./clientPool');
var clients = new ClientPool();

var server = net.createServer();
var protocol = new Protocol({
    onGreeting: function (data, con) {
        var self = this;

        data.up = true;

        var client = clients.getById(data.id);

        if (!client) {
            clients.push(new Client(data, con));
        }

        self.greetBack({token: data.token}, con);
    },
    onReceipt: function (data, con) {
        console.log('onReceipt', data);
    },
    onRequest: function (data, con) {
        console.log('onRequest', data);
    },
    onPassage: function (data, con) {
        console.log('onPassage', data);
    },
    onError: function (data, con) {
        console.log('onError', data);
    }
});

server.on('connection', function (c) {
    console.log('client connected');
    c.on('end', function () {
        console.log('client disconnected');
    });
    c.on('data', function (data) {
        protocol.interpret(data, this);
    });
});

server.on('listening', function () {
    console.log('server bound');
    mdnsAd.start();
    console.log('server announced');
});

server.on('close', function () {
});

server.on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(function () {
            server.close();
            server.listen(protocolConfig.port);
        }, 1000);
    }
});

module.exports = {
    start: function (cb) {
        server.listen(protocolConfig.port, cb || noop);
    },
    stop: function (cb) {
        server.close(cb || noop);
    },
    /**
     * @param {String}   url
     * @param {String}   which
     * @param {Function} callback
     */
    changeUrl: function (url, which, callback) {
        var client = this.getClient(which);

        if (client) {
            protocol.requestNavigateUrl(url, client.socket, callback);
        }
        else {
            callback(new Error('Client not found!'));
        }
    },
    /**
     * @param {String}   title
     * @param {String}   which
     * @param {Function} callback
     */
    changeTitle: function (title, which, callback) {
        var client = this.getClient(which);

        if (client) {
            client.title = title;

            cb(null);
        }
        else {
            callback(new Error('Client not found!'));
        }
    },
    /**
     * @param {Boolean|Number} state
     * @param {String}         which
     * @param {Function}       callback
     */
    switchTV: function (state, which, callback) {
        var client = this.getClient(which);

        if (client) {
            protocol.requestSwitchTV(state, client.socket, callback);
        }
        else {
            callback(new Error('Client not found!'));
        }
    },
    getClient: function (id) {
        return clients.getById(id);
    },
    getClients: function () {
        return clients;
    }
};
