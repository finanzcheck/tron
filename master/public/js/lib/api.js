var $ = require('jquery');
var Q = require('q');

function getClients() {
    return $.ajax('/api/clients');
}
module.exports = function () {
    return {
        switchAllTV: function (state, callback) {
                return $.ajax('/api/switchall');

        }
    }
}();
