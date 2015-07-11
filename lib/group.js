var util = require('util');
var uuid = require('node-uuid');
var EventEmitter = require('events').EventEmitter;

/**
 * @param {Object} data
 * @param {String} [data.id]
 * @param {String} data.panicUrl
 * @param {String} [data.title]
 *
 * @constructor
 */
function Group(data) {
    data = data || {};
    /** @type {String} */
    var id = data.id || uuid.v4();
    /** @type {String} */
    var panicUrl = data.panicUrl;
    /** @type {Boolean} */
    var panicState = false;
    /** @type {String} */
    var title = data.title || data.id;

    Object.defineProperties(this, {
        id: {
            enumerable: true,
            get: function () {
                return id;
            }
        },
        panicUrl: {
            enumerable: true,
            get: function () {
                return panicUrl;
            },
            set: function (val) {
                panicUrl = val;
                this.emit('change', this);
            }
        },
        panicState: {
            enumerable: true,
            get: function () {
                return panicState;
            },
            set: function (val) {
                panicState = !!val;
                this.emit('change', this);
            }
        },
        title: {
            enumerable: true,
            get: function () {
                return title;
            },
            set: function (val) {
                title = val;
                this.emit('change', this);
            }
        }
    });
}

util.inherits(Group, EventEmitter);

/**
 *
 * @return {{id: {String}, panicUrl: {String}, panicState: {Boolean}, title: {String}}}
 */
Group.prototype.toJSON = function () {
    return {
        id: this.id,
        panicUrl: this.panicUrl,
        panicState: this.panicState,
        title: this.title
    };
};

module.exports = Group;
