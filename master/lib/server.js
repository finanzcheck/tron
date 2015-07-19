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
        var client = clientPool.getClientById(data.id);

        if (client) {
            var group = clientPool.getGroupById(client.group);
            if (group && undefined !== group.state) {
                client.state = group.state;
            }
        }
        else {
            client = new Client(data);
            clientPool.add(client);
        }

        client.socket = con;

        self.greetBack(client.responseData({token: data.token}), client.socket);
    },
    onReceipt: function (data, con) {
        // update client-state
        if (data && data.id) {
            var client = clientPool.getClientById(data.id);

            if (client) {
                client.update(data);
            }
        }
    }
});

clientPool.on('clientsSwitched', function (clients) {
    clients.forEach(function (client) {
        if (client.up) {
            protocol.requestSwitchTV(client.state, client.socket);
        }
    });
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
     * @param {Function} [cb]
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
     * @param {String}   clientId
     * @param {Function} cb
     */
    changeUrl: function (url, clientId, cb) {
        try {
            var client = this.getClient(clientId, true);
            client.url = url;

            if (client.up) {
                protocol.requestSetUrl(url, client.socket, cb);
            }
            else {
                cb(null, client);
            }
        } catch (e) {
            cb(e);
        }
    },
    /**
     * @param {String}   url
     * @param {String}   clientId
     * @param {Function} cb
     */
    changePanicUrl: function (url, clientId, cb) {
        try {
            var client = this.getClient(clientId, true);
            client.panicUrl = url;
            cb(null, client);

        } catch (e) {
            cb(e);
        }
    },
    /**
     * @param {String}   state
     * @param {String}   clientId
     * @param {Function} cb
     */
    setPanicState: function (state, clientId, cb) {
        try {
            var client = this.getClient(clientId, true);
            client.panicState = state;

            if (client.up) {
                protocol.requestSetPanicState(state, client.socket, cb);
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
     * @param {String}   clientId
     * @param {Function} cb
     */
    changeTitle: function (title, clientId, cb) {
        try {
            var client = this.getClient(clientId, true);
            client.title = title;

            cb(null, client);
        }
        catch (e) {
            cb(e);
        }
    },
    /**
     * @param {String}   groupId
     * @param {String}   clientId
     * @param {Function} cb
     */
    changeGroup: function (groupId, clientId, cb) {
        try {
            var client = this.getClient(clientId, true);
            var group = this.getGroup(groupId);

            client.group = groupId;
            client.panicUrl = group.panicUrl;
            client.panicState = group.panicState;

            cb(null, client);
        }
        catch (e) {
            cb(e);
        }
    },
    /**
     * @param {String}   title
     * @param {String}   groupId
     * @param {Function} cb
     */
    changeGroupTitle: function (title, groupId, cb) {
        try {
            var group = this.getGroup(groupId);
            group.title = title;

            cb(null, group);
        }
        catch (e) {
            cb(e);
        }
    },
    /**
     * @param {Boolean|Number} state
     * @param {String}         clientId
     * @param {Function}       cb
     */
    switchTV: function (state, clientId, cb) {
        try {
            var client = this.getClient(clientId);
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
        var client = clientPool.getClientById(id);

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
     * @param  {String}  id
     *
     * @return {Group}
     */
    getGroup: function (id) {
        var group = clientPool.getGroupById(id);

        if (group) {
            return group;
        }
        else {
            throw new Error('Group not found!');
        }
    },
    /**
     * @return {ClientPool}
     */
    getClientPool: function () {
        return clientPool;
    }
};
