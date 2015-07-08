var expect = require('chai').expect;
var assert = require('chai').assert;
var net = require('net');
var Protocol = require('../../lib/protocol');

describe('Protocol', function () {
    describe('#interpret()', function () {
        var protocol = new Protocol();
        var validMessage = protocol.GREETING + protocol.TYPE.REQUEST + JSON.stringify({});
        var incompleteMessages = [
            '',
            protocol.GREETING,
            protocol.GREETING + protocol.TYPE.REQUEST
        ];
        var invalidDataMessages = protocol.GREETING + protocol.TYPE.REQUEST + '{';
        var con = new net.Socket();

        it('should parse valid messages and trigger events', function (done) {
            var errTimeout = setTimeout(function () {
                assert(false, 'Event never fired');
                done();
            }, 1000);

            protocol.on(protocol.GREETING, function () {
                clearTimeout(errTimeout);
                assert(true, 'Event fired');
            });

            var results = protocol.interpret(validMessage, con);

            expect(results).to.have.a.property('method', protocol.GREETING);
            expect(results).to.have.a.property('type', 'REQUEST');
            expect(results.data).to.be.an('object');
            expect(results.data).to.be.empty;

            done();
        });

        it('should not parse invalid messages and throw an error', function (done) {
            var count = 0;
            errTimeout = setTimeout(function () {
                assert(false, 'Event never fired');
                done();
            }, 1000);

            protocol.on(protocol.ERROR, function () {
                count++;
                if (count >= incompleteMessages.length) {
                    clearTimeout(errTimeout);
                    assert(true, 'Event fired');
                    done();
                }
            });

            incompleteMessages.forEach(function (msg) {
                protocol.interpret(msg, con);
            })
        });
    });
});
