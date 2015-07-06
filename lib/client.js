var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * @param {Object}     data
 * @param {String}     data.id
 * @param {Boolean}    [data.up]
 * @param {String}     data.url
 * @param {String}     [data.title]
 * @param {net.Socket} [socket]
 *
 * @constructor
 */
function Client(data, socket) {
    data = data || {};
    /** @type {String} */
    var id = data.id;
    /** @type {String} */
    var url = data.url;
    /** @type {String} */
    var title = data.title || data.id;

    Object.defineProperties(this, {
        id: {
            enumerable: true,
            get: function () {
                return id;
            },
            set: function (val) {
                id = val;
                this.emit('change');
            }
        },
        url: {
            enumerable: true,
            get: function () {
                return url;
            },
            set: function (val) {
                url = val;
                this.emit('change');
            }
        },
        title: {
            enumerable: true,
            get: function () {
                return title;
            },
            set: function (val) {
                title = val;
                this.emit('change');
            }
        }
    });

    /** @type {net.Socket} */
    this.socket = socket;
    /** @type {Boolean} */
    this.online = data.up || false;
    /** @type {Boolean} */
    this.state = undefined;
}

util.inherits(Client, EventEmitter);

/**
 * @param {Object} [data]
 *
 * @return {Object}
 */
Client.prototype.responseData = function (data) {
    data = data || {};

    var responseData = this.toJSON();
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            responseData[key] = data[key];
        }
    }

    return responseData;
};

/**
 * @return {{id: String, title: String, state: Boolean, up: Boolean, url: String}}
 */
Client.prototype.toJSON = function () {
    return {
        id: this.id,
        title: this.title,
        state: this.state,
        up: this.up,
        url: this.url
    };
};

module.exports = Client;
