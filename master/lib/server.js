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

var Cache = require('./cache');
var Client = require('../../lib/client');
var ClientPool = require('./clientPool');

var cache = new Cache();
var clientPool = new ClientPool(cache);

var server = net.createServer();
var protocol = new Protocol({
    onGreeting: function (data, con) {
        var self = this;
        var client = clientPool.getById(data.id);

        if (client) {
            client.state = data.state;
        }
        else {
            client = new Client(data);
            clientPool.add(client);
        }

        client.socket = con;

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
    /**
     * @param {Function} cb
     */
    start: function (cb) {
        server.listen(protocolConfig.port, cb || noop);
    },
    /**
     * @param {Function} cb
     */
    stop: function (cb) {
        server.close(cb || noop);
    },
    /**
     * @param {String}   url
     * @param {String}   which
     * @param {Function} cb
     */
    changeUrl: function (url, which, cb) {
        try {
            var client = this.getClient(which, true);
            client.url = url;

            if (client.up) {
                protocol.requestNavigateUrl(url, client.socket, cb);
            }
            else {
                cb(null, client);
            }
        } catch (e) {
            cb(e);
        }
    },
    /**
     * @param {String}   title
     * @param {String}   which
     * @param {Function} cb
     */
    changeTitle: function (title, which, cb) {
        try {
            var client = this.getClient(which, true);
            client.title = title;

            cb(null, client);
        }
        catch (e) {
            cb(e);
        }
    },
    /**
     * @param {Boolean|Number} state
     * @param {String}         which
     * @param {Function}       cb
     */
    switchTV: function (state, which, cb) {
        try {
            var client = this.getClient(which);
            protocol.requestSwitchTV(state, client.socket, cb);
        }
        catch (e) {
            cb(e);
        }
    },
    /**
     * @param  {String}  id
     * @param  {Boolean} [includeOffline]
     *
     * @return {Client}
     */
    getClient: function (id, includeOffline) {
        var client = clientPool.getById(id);

        if (client) {
            if (client.up || includeOffline) {
                return client;
            }
            else {
                throw new Error('Client offline');
            }
        }
        else {
            throw new Error('Client not found!');
        }
    },
    /**
     * @return {ClientPool}
     */
    getClientPool: function () {
        return clientPool;
    }
};
