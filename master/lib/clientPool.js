var util = require('util');
var Client = require('./client');

function ClientPool() {

}

util.inherits(ClientPool, Array);

ClientPool.prototype.getClientById = function (id) {
    return this.filter(function (client) {
        return client.id == id;
    })[0];
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
