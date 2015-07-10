var socketEvents = require('../../../lib/socketEvents');
var clientState = require('../lib/clientState');

function Client(data){

    /** @type {String} */
    var id = data.id;
    /** @type {String} */
    var url = data.url;
    /** @type {String} */
    var title = data.title;

    /** @type {String} */
    var state = clientState[((!data.up ? 'undefined' : data.state ? 'on' : 'off') + '').toUpperCase()];
    /** @type {Object} */
    var events = {
        title: socketEvents.CLIENT_CHANGETITLE,
        url: socketEvents.CLIENT_CHANGEURL
    };

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
        events: {
            enumerable: true,
            get: function () {
                return events;
            }
        }
    });
}

module.exports = Client;
