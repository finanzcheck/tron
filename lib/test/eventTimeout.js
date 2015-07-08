var assert = require('chai').assert;

function eventTimeout(done, timeout) {
    return setTimeout(function () {
        assert(false, 'Event never fired');
        done();
    }, timeout || 1000);
}

module.exports = eventTimeout;
