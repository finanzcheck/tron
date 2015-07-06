var util = require('util');
var Client = require('../../lib/client');

require('array.prototype.find');

/**
 *
 * @constructor
 */
function ClientPool() {

}

util.inherits(ClientPool, Array);

/**
 *
 * @param id
 * @returns {T}
 */
ClientPool.prototype.getById = function (id) {
    return this.find(function (client) {
        return client.id == id;
    });
};

/**
 *
 * @returns {Array.<T>}
 */
ClientPool.prototype.getArrayCopy = function () {
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
