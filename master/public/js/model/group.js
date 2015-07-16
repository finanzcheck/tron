var Client = require('./client');
var clientState = require('../lib/clientState');

function Group(group, poolClients) {

    /** @type {String} */
    var id = group.id;
    /** @type {Array} */
    var clients = poolClients
        .filter(function (client) {
            return group.id == (client.group || 'undefined');
        })
        .map(function (client) {
            return new Client(client);
        });

    /** @type {String} */
    var title = group.title;

    /** @type {String} */
    var panicUrl = group.panicUrl;

    /** @type {Boolean} */
    var panicState = clients.reduce(function (carry, client) {
        return carry || !!client.panicState;
    }, false);

    /** @type {String} */
    var state = 'true';

    /** @type {Boolean} */
    var up = clients.reduce(function (carry, client) {
        return carry || !!client.up;
    }, false);

    /** @type {Object} */
    var schedules = group.schedules;

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
            }
        },
        panicState: {
            enumerable: true,
            get: function () {
                return panicState;
            }
        },
        schedules: {
            enumerable: true,
            get: function () {
                return schedules;
            }
        },
        isUndefined: {
            enumerable: true,
            get: function(){
                return this.id == 'undefined';
            }
        },
        isAvailable: {
            enumerable: true,
            get: function(){
                return this.isUndefined || !window.showSettings || clients.length > 0;
            }
        }
    });
}

module.exports = Group;
