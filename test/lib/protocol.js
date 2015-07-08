var expect = require('chai').expect;
var assert = require('chai').assert;
var net = require('net');
var Protocol = require('../../lib/protocol');
var eventTimeout = require('../../lib/test/eventTimeout');

describe('Protocol', function () {
    describe('#interpret()', function () {
        var protocol = new Protocol();

        var samplePayload = JSON.stringify({token: '4711'});

        var validRequest = protocol.GREETING + protocol.TYPE.REQUEST + samplePayload;
        var validRequestBuffer = new Buffer(protocol.GREETING + protocol.TYPE.REQUEST + samplePayload);
        var validResponse = protocol.GREETING + protocol.TYPE.RESPONSE + samplePayload;

        var incompleteMessages = [
            '',
            protocol.GREETING,
            protocol.GREETING + protocol.TYPE.REQUEST
        ];
        var invalidDataMessages = protocol.GREETING + protocol.TYPE.REQUEST + '{';
        var con = new net.Socket();

        it('should parse a valid request and trigger an event', function (done) {
            var errTimeout = eventTimeout(done);

            protocol = new Protocol();
            protocol.on(protocol.GREETING, function () {
                clearTimeout(errTimeout);
                assert(true, 'Event fired');
                done();
            });

            var results = protocol.interpret(validRequest, con);

            expect(results).to.have.a.property('method', protocol.GREETING);
            expect(results).to.have.a.property('type', 'REQUEST');
            expect(results.data).to.be.an('object');
            expect(results.data).to.have.a.property('token');
        });

        it('should parse a valid request buffer and trigger an event', function (done) {
            var errTimeout = eventTimeout(done);

            protocol = new Protocol();
            protocol.on(protocol.GREETING, function () {
                clearTimeout(errTimeout);
                assert(true, 'Event fired');
                done();
            });
            protocol.interpret(validRequestBuffer, con);
        });

        it('should parse a valid response and trigger an event', function (done) {
            var errTimeout = eventTimeout(done);

            protocol = new Protocol();
            protocol.on(protocol.GREETING, function () {
                clearTimeout(errTimeout);
                assert(true, 'Event fired');
            });

            var results = protocol.interpret(validResponse, con);

            expect(results).to.have.a.property('method', protocol.GREETING);
            expect(results).to.have.a.property('type', 'RESPONSE');
            expect(results.data).to.be.an('object');
            expect(results.data).to.have.a.property('token');

            done();
        });

        it('should not parse invalid messages and throw an error', function (done) {
            var count = 0;
            var errTimeout = eventTimeout(done);

            protocol = new Protocol();
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
