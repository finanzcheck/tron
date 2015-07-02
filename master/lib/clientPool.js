var util = require('util');
var Client = require('../../lib/client');

require('array.prototype.find');

function ClientPool() {

}

util.inherits(ClientPool, Array);

ClientPool.prototype.getById = function (id) {
    return this.find(function (client) {
        return client.id == id;
    });
};

ClientPool.prototype.getArrayCopy = function () {
    return this.slice();
};

ClientPool.fromArray = function (clients) {
    var clientPool = new ClientPool();
    clients.forEach(function (client) {
        clientPool.push(new Client(client));
    });
    return clientPool;
};

module.exports = ClientPool;
