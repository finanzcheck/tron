/**
 * @typedef {{id: string, url: string, title: string}}
 *
 * @param {Object}     data
 * @param {net.Socket} [socket]
 *
 * @constructor
 */
function Client(data, socket) {
    this.id = data.id;
    this.socket = socket;
    this.url = data.url;
    this.title = data.title || data.id;
}

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

Client.prototype.toJSON = function () {
    return {
        title: this.title,
        state: this.state,
        id: this.id,
        url: this.url
    };
};

module.exports = Client;
