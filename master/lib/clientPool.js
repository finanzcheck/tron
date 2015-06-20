var util = require('util');

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

module.exports = ClientPool;
