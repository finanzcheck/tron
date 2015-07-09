var expect = require('chai').expect;
var assert = require('chai').assert;

var eventTimeout = require('../../lib/test/eventTimeout');
var CallbackPool = require('../../lib/protocolCallbackPool');
var noop = require('../../lib/noop');

describe('CallbackPool', function () {
    describe('#add()', function () {
        it('should accept a callback and resolve it automatically', function (done) {
            var pool = new CallbackPool();
            pool.add('4711', function () {
                expect(pool).to.have.length(0);
                done();
            }, 10);

            expect(pool).to.be.instanceof(Array);
            expect(pool).to.have.length(1);
        });
    });
});
