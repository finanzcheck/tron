var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var uuid = require('node-uuid');

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

/**
 * doesn't do anything…on purpose!
 */
function noop() {
}

/**
 * @return {String}
 */
function generateToken() {
    return uuid.v4();
}

/**
 *
 * @param {Object}                    opts
 * @param {Function}                  opts.onGreeting
 * @param {Function}                  opts.onRequest
 * @param {Function}                  opts.onResponse
 * @param {Function}                  opts.onReceipt
 * @param {Function}                  opts.onPassage
 * @param {Function}                  opts.onError
 * @param {Object.<String, Function>} opts.additional
 *
 * @constructor
 */
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

/**
 * @typedef {String} ProtocolType
 * @typedef {{REQUEST: ProtocolType, RESPONSE: ProtocolType}} ProtocolTypes
 * @type ProtocolTypes
 */
Protocol.prototype.TYPE = {
    REQUEST: '?',
    RESPONSE: '!'
};

Protocol.prototype.GREETING = 'OHAI';
Protocol.prototype.RECEIPT = 'AWSUMTHX';
Protocol.prototype.REQUEST = 'CANHAZ';
Protocol.prototype.PASSAGE = 'KTHXBYE';
Protocol.prototype.ERROR = 'ONOES';

/**
 *
 * @param {Buffer}     msg
 * @param {net.Socket} con
 *
 * @return {{method: string, type: string, data: object}}
 */
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

/**
 * @param {String}       keyword
 * @param {ProtocolType} type
 * @param {Object}       data
 * @param {net.Socket}   con
 * @param {Function}     cb
 */
Protocol.prototype.send = function (keyword, type, data, con, cb) {
    if (typeof con == 'function') {
        cb = con;
    }
    if (data instanceof net.Socket) {
        con = data;
        data = {};
    }

    con.write(keyword + type + JSON.stringify(data), cb);
};

/**
 * @param {String}     keyword
 * @param {Object}     data
 * @param {net.Socket} con
 * @param {Function}   [cb]
 */
Protocol.prototype.ask = function (keyword, data, con, cb) {
    data.token = data.token || generateToken();

    this.send(keyword, this.TYPE.REQUEST, data, con, cb);
};

/**
 * @param {String}     keyword
 * @param {Object}     data
 * @param {net.Socket} con
 * @param {Function}   [cb]
 */
Protocol.prototype.respond = function (keyword, data, con, cb) {
    this.send(keyword, this.TYPE.RESPONSE, data, con, cb);
};

module.exports = Protocol;
