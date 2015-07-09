var sinon = require('sinon');
var expect = require('chai').expect;
var assert = require('chai').assert;
var net = require('net');
var Protocol = require('../../lib/protocol');
var eventTimeout = require('../../lib/test/eventTimeout');

describe('Protocol', function () {
    var socket = new net.Socket();
    var stub = sinon.stub(socket, 'write', function (data, encoding, cb) {
        var args = stub.args;

        // this will echo whatever they wrote
        if (args.length > 0)
            this.emit('data', stub.args[stub.callCount - 1][0]);
    });

    describe('#constructor', function () {
        it('should accept event callbacks', function (done) {
            var triggerCount = 0;
            var eventCount;

            var callback = function () {
                triggerCount++;

                if (triggerCount >= eventCount) {
                    done();
                }
            };

            var events = {
                onGreeting: callback,
                onRequest: callback,
                onReceipt: callback,
                onPassage: callback,
                onError: callback
            };
            var additionalEvents = {
                something: callback,
                else: callback

            };
            eventCount = Object.keys(events).length + Object.keys(additionalEvents).length;
            events.additional = additionalEvents;

            var protocol = new Protocol(events);

            protocol.emit(protocol.GREETING);
            protocol.emit(protocol.REQUEST);
            protocol.emit(protocol.RECEIPT);
            protocol.emit(protocol.PASSAGE);
            protocol.emit(protocol.ERROR);

            for (var event in additionalEvents) {
                protocol.emit(event);
            }
        });
    });

    describe('#interpret()', function () {
        var protocol = new Protocol();

        var samplePayload = JSON.stringify({token: '4711'});

        var validRequest = protocol.GREETING + protocol.TYPE.REQUEST + samplePayload;
        var validRequestBuffer = new Buffer(protocol.GREETING + protocol.TYPE.REQUEST + samplePayload);
        var validResponse = protocol.GREETING + protocol.TYPE.RESPONSE + samplePayload;

        var incompleteMessages = [
            '',
            protocol.GREETING,
            protocol.GREETING + protocol.TYPE.REQUEST,
            protocol.GREETING + protocol.TYPE.REQUEST + '{',
            protocol.GREETING + protocol.TYPE.REQUEST + '{\o/}'
        ];

        it('should parse a valid request and trigger an event', function (done) {
            var errTimeout = eventTimeout(done);

            protocol = new Protocol();
            protocol.on(protocol.GREETING, function () {
                clearTimeout(errTimeout);
                assert(true, 'Event fired');
                done();
            });

            var results = protocol.interpret(validRequest, socket);

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
            protocol.interpret(validRequestBuffer, socket);
        });

        it('should parse a valid response and trigger an event', function (done) {
            var errTimeout = eventTimeout(done);

            protocol = new Protocol();
            protocol.on(protocol.GREETING, function () {
                clearTimeout(errTimeout);
                assert(true, 'Event fired');
            });

            var results = protocol.interpret(validResponse, socket);

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
                protocol.interpret(msg, socket);
            })
        });
    });

    describe('#greet()', function () {
        it('should send a greeting message', function (done) {
            protocol = new Protocol();

            protocol.greet(socket, function () {
                done();
            });
        });

        it('should return a greeting message', function (done) {
            protocol = new Protocol();
            socket.once('data', function () {
                done();
            });

            protocol.greetBack(socket, {token: '4711'});
        });
    });
});
