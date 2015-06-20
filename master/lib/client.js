var util = require('util');

function Client(data, socket) {
    this.id = data.id;
    this.socket = socket;
    this.url = data.url;
}

Client.prototype.toJSON = function () {
    return {
        'id': this.id,
        'url': this.url
    };
};

module.exports = Client;
