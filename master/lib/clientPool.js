var util = require('util');
var Client = require('../../lib/client');
var Cache = require('./cache');
var EventEmitter = require('events').EventEmitter;

require('array.prototype.find');

/**
 * @constructor
 *
 * @param {Cache}  [cache]
 * @param {String} [cacheName]
 */
function ClientPool(cache, cacheName) {
    this.cache = cache;
    this.clients = [];
    this.cacheName = cacheName || 'clientPool';

    this._initCached();
}

util.inherits(ClientPool, EventEmitter);

/**
 * @private
 */
ClientPool.prototype._initCached = function () {
    if (this.cache) {
        var self = this;
        var cached = this.cache.getSync(this.cacheName);

        if (cached && cached instanceof Array) {
            cached.forEach(function (elem) {
                var client = new Client(elem);
                client.on('change', self._updateCacheHandler.bind(self));

                self.clients.push(client);
            });
        }
    }
};

/**
 * @private
 */
ClientPool.prototype._updateCacheHandler = function () {
    if (this.cache) {
        this.cache.set(this.cacheName, this);
    }

    this.emit('clientsUpdated');
};

/**
 * @param {...Client} [items]
 * @return {Number}
 */
ClientPool.prototype.add = function (items) {
    Array.prototype.push.apply(this.clients, arguments);
    var self = this;

    for (var i = 0; i < arguments.length; i++) {
        var client = arguments[i];

        if (client instanceof Client) {
            client.on('change', this._updateCacheHandler.bind(self));
        }
    }

    this._updateCacheHandler();
};

/**
 * @param {Client} client
 * @return {Array.<Client>|undefined}
 */
ClientPool.prototype.remove = function (client) {
    var index = this.clients.indexOf(client);
    if (index === -1) {
        return;
    }

    var spliced = this.clients.splice(index, 1);
    for (var i = 0; i < spliced.length; i++) {
        spliced[i].removeListener('change', this._updateCacheHandler);
    }

    return spliced;
};

/**
 *
 * @param   {String} id
 * @returns {Client}
 */
ClientPool.prototype.getById = function (id) {
    return this.clients.find(function (client) {
        return client.id == id;
    });
};

/**
 * @returns {Array.<Client>}
 */
ClientPool.prototype.toJSON = function () {
    return this.clients;
};

/**
 *
 * @param clients
 * @returns {ClientPool}
 */
ClientPool.fromArray = function (clients) {
    var clientPool = new ClientPool();
    clients.forEach(function (client) {
        clientPool.add(new Client(client));
    });
    return clientPool;
};

module.exports = ClientPool;
