var Client = require('./client');
var clientState = require('../lib/clientState');

function Group(group, poolClients) {

    /** @type {String} */
    var id = group.id;
    /** @type {Array} */
    var clients = poolClients
        .filter(function (client) {
            return client.group == group.id;
        })
        .map(function (client) {
            return new Client(client);
        });

    /** @type {String} */
    var title = group.title;

    /** @type {String} */
    var panicUrl = group.panicUrl;

    /** @type {Boolean} */
    var panicState = group.panicState;

    /** @type {String} */
    var state = 'true';

    /** @type {Boolean} */
    var up = clients.reduce(function (carry, client) {
        return carry || !!client.up;
    }, false);

    Object.defineProperties(this, {
        id: {
            enumerable: true,
            get: function () {
                return id;
            }
        },
        settings: {
            enumerable: true,
            get: function () {
                false;
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
        },
        up: {
            enumerable: true,
            get: function () {
                return up;
            }
        },
        panicUrl: {
            enumerable: true,
            get: function () {
                return panicUrl;
            },
            set: function (val) {
                panicUrl = val;
                this.emit('change');
            }
        },
        panicState: {
            enumerable: true,
            get: function () {
                return panicUrl;
            },
            set: function (val) {
                panicUrl = !!val;
                this.emit('change', panicState);
            }
        },
    });
}

module.exports = Group;
