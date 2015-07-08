var eventTimeout = require('../../../lib/test/eventTimeout');

describe('eventTimeout', function () {
    it('should trigger callback before canceled', function (done) {
        var timeout = eventTimeout(done, 20);

        setTimeout(function () {
            clearTimeout(timeout);
            done();
        }, 10);
    });
});
