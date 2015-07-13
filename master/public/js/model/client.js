var clientState = require('../lib/clientState');

function Client(data) {

    /** @type {String} */
    var id = data.id;
    /** @type {String} */
    var url = data.url;
    /** @type {String} */
    var title = data.title;
    /** @type {String} */
    var group = data.group;
    /** @type {String} */
    var up = data.up;
    /** @type {Boolean} */
    var panicState = data.panicState;

    /** @type {String} */
    var state = clientState[((!data.up ? 'undefined' : data.state ? 'on' : 'off') + '').toUpperCase()];

    Object.defineProperties(this, {
        id: {
            enumerable: true,
            get: function () {
                return id;
            }
        },
        url: {
            enumerable: true,
            get: function () {
                return url;
            }
        },
        title: {
            enumerable: true,
            get: function () {
                return title;
            }
        },
        group: {
            enumerable: true,
            get: function () {
                return group;
            }
        },
        state: {
            enumerable: true,
            get: function () {
                return state;
            }
        },
        panicState: {
            enumerable: true,
            get: function () {
                return panicState;
            }
        },
        up: {
            enumerable: true,
            get: function () {
                return up;
            }
        }
    });
}

module.exports = Client;
