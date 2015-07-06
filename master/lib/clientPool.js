var util = require('util');
var Client = require('../../lib/client');
var Cache = require('./cache');

require('array.prototype.find');

/**
 * @constructor
 *
 * @param {Cache}  [cache]
 * @param {String} [cacheName]
 */
function ClientPool(cache, cacheName) {
    this.cache = cache;
    this.cacheName = cacheName || 'clientPool';

    this._initCached();
}

util.inherits(ClientPool, Array);

/**
 * @private
 */
ClientPool.prototype._initCached = function () {
    var self = this;

    if (this.cache) {
        var cached = this.cache.getSync(this.cacheName);
        var clients = [];

        if (cached && cached instanceof Array) {
            cached.forEach(function (elem) {
                var client = new Client(elem);
                client.on('change', self._updateCacheHandler);

                clients.push(client);
            });

            Array.prototype.push.apply(this, clients);
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
};

/**
 * @param {...Client} [items]
 * @return {Number}
 */
ClientPool.prototype.push = function (items) {
    Array.prototype.push.apply(this, arguments);

    for (var i = 0; i < arguments.length; i++) {
        var client = arguments[i];

        if (client instanceof Client) {
            client.on('change', this._updateCacheHandler);
        }
    }

    this._updateCacheHandler();
};

/**
 * @return {Client}
 */
ClientPool.prototype.pop = function () {
    var popped = Array.prototype.push.apply(this, arguments);

    if (popped instanceof Client) {
        popped.removeListener('change', this._updateCacheHandler);
    }

    return popped;
};

/**
 @param {Number} [start]
 @param {Number} [deleteCount]
 @param {...T} [items]
 @return {Array.<Client>}
 */
ClientPool.prototype.splice = function (start, deleteCount, items) {
    var spliced = Array.prototype.splice.apply(this, arguments);

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
    return this.find(function (client) {
        return client.id == id;
    });
};

/**
 * @returns {Array.<Client>}
 */
ClientPool.prototype.toJSON = function () {
    return this.slice();
};

/**
 *
 * @param clients
 * @returns {ClientPool}
 */
ClientPool.fromArray = function (clients) {
    var clientPool = new ClientPool();
    clients.forEach(function (client) {
        clientPool.push(new Client(client));
    });
    return clientPool;
};

module.exports = ClientPool;
