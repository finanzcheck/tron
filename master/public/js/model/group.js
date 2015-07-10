var Client = require('./client');
var clientState = require('../lib/clientState');

function Group(clientPool) {

    /** @type {String} */
    var id = null;
    /** @type {Array} */
    var clients = clientPool.clients.map(function (client) {
        return new Client(client);
    });

    /** @type {String} */
    var title = 'Default';

    /** @type {String} */
    var state = 'true';

    var self = this;
    Object.defineProperties(this, {
        id: {
            enumerable: true,
            get: function () {
                return id;
            }
        },
        clients: {
            enumerable: true,
            get: function () {
                return clients;
            }
        },
        title: {
            enumerable: true,
            get: function () {
                return title;
            }
        },
        state: {
            enumerable: true,
            get: function () {
                return state;
            }
        }
    });
}

module.exports = Group;
