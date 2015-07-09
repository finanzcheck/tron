var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * @param {Object}     data
 * @param {String}     data.id
 * @param {String}     data.url
 * @param {String}     [data.title]
 * @param {net.Socket} [data.socket]
 *
 * @constructor
 */
function Client(data) {
    data = data || {};
    /** @type {String} */
    var id = data.id;
    /** @type {String} */
    var url = data.url;
    /** @type {String} */
    var title = data.title || data.id;
    /** @type {net.Socket} */
    var socket;
    /** @type {Boolean} */
    var state;

    var self = this;

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
        },
        socket: {
            get: function () {
                return socket;
            },
            set: function (val) {
                socket = val;

                if (socket) {
                    socket.on('close', function () {
                        self.socket = undefined;
                    });
                }
            }
        },
        up: {
            enumerable: true,
            get: function () {
                return undefined !== self.socket;
            }
        },
        state: {
            enumerable: true,
            get: function () {
                return state;
            },
            set: function (val) {
                state = !!val;
            }
        }
    });

    this.socket = data.socket;
}

util.inherits(Client, EventEmitter);

/**
 * @type {Array<String>}
 */
Client.prototype.managedProperties = ['id', 'title', 'up'];

/**
 * @param  {String} prop
 * @return {boolean}
 */
Client.prototype.isManagedProperty = function (prop) {
    return -1 < this.managedProperties.indexOf(prop);
};

/**
 * @param {Object} data
 */
Client.prototype.update = function (data) {
    for (var key in data) {
        if (data.hasOwnProperty(key) && this.hasOwnProperty(key) && !this.isManagedProperty(key)) {
            this[key] = data[key];
        }
    }
};

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
