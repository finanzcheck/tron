var util = require('util');
var EventEmitter = require('events').EventEmitter;

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

function noop() {
}

function Protocol(opts) {
    opts = opts || {};

    this.on(this.GREETING, opts.onGreeting || noop);
    this.on(this.REQUEST, opts.onRequest || noop);
    this.on(this.RESPONSE, opts.onResponse || noop);
    this.on(this.RECEIPT, opts.onReceipt || noop);
    this.on(this.PASSAGE, opts.onPassage || noop);
    this.on(this.ERROR, opts.onError || noop);

    if (opts.additional) {
        for (var event in opts.additional) {
            if (opts.additional.hasOwnProperty(event)) {
                this.on(event, opts.additional[event]);
            }
        }
    }
}

util.inherits(Protocol, EventEmitter);

Protocol.prototype.TYPE = {
    REQUEST: '?',
    RESPONSE: '!'
};

Protocol.prototype.GREETING = 'OHAI';
Protocol.prototype.RECEIPT = 'AWSUMTHX';
Protocol.prototype.REQUEST = 'CANHAZ';
Protocol.prototype.PASSAGE = 'KTHXBYE';
Protocol.prototype.ERROR = 'ONOES';

Protocol.prototype.interpret = function (msg, con) {
    if (msg instanceof Buffer) {
        msg = msg.toString();
    }

    var match = msg.match(/^([A-Z]+)(\!|\?)(.*)$/);
    if (null === match) {
        this.emit(this.ERROR);

        return;
    }
    var status = match[1],
        isRequest = match[2] == this.TYPE.REQUEST,
        data;

    try {
        data = JSON.parse(match[3]);
    }
    catch (e) {
        data = match[3];
    }

    this.emit(status, data, con);

    return {
        method: status,
        type: isRequest ? 'REQUEST' : 'RESPONSE',
        data: data
    }
};

module.exports = Protocol;
