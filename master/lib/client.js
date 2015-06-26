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
    this.title = data.title;
}

Client.prototype.toJSON = function () {
    return {
        title: this.title,
        state: this.state,
        id: this.id,
        url: this.url
    };
};

module.exports = Client;
