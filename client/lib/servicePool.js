var net = require('net');
var util = require('util');
var equal = require('deep-equal');
var mdns = require('mdns');

require('array.prototype.find');
require('array.prototype.findindex');

/**
 * @param {Object} serviceA
 * @param {Object} serviceB
 *
 * @return {boolean}
 */
function compareServices(serviceA, serviceB) {
    return serviceA.networkInterface === serviceB.networkInterface
        && equal(serviceA.type, serviceB.type)
        && serviceA.name === serviceB.name;
}

/**
 * @param {net.Socket}   client
 * @param {mdns.Browser} browser
 *
 * @constructor
 */
function ServicePool(client, browser) {
    var self = this;
    /**
     * @type {boolean}
     */
    this.connected = false;
    /**
     * @type {boolean}
     */
    this.connecting = false;
    /**
     * @type {Number}
     */
    this.connectionTimer = undefined;
    /**
     * @type {net.Socket}
     */
    this.client = client;

    this.client.setKeepAlive(true);

    this.client.on('connect', function () {
        self.connected = true;
        self.connecting = false;
    });
    this.client.on('error', function (err) {
        var socket = this,
            service = self.find(function (elem) {
                return elem.host === socket._host;
            });
        socket.destroy();
        self.flag(service, false);
        console.log(err);
    });
    this.client.on('end', function () {
        self.connected = false;
        self.connecting = false;

        self.connect();
    });
    /**
     * @type {mdns.Browser}
     */
    this.browser = browser;

    this.browser.on('serviceUp', function (service) {
        if (service.networkInterface) {
            self.push(service);
            self.connect();
        }
    });
    this.browser.on('serviceDown', function (service) {
        self.remove(service);
    });
}

util.inherits(ServicePool, Array);

/**
 * @param {Object} service
 *
 * @return {Number}
 */
ServicePool.prototype.serviceIndex = function (service) {
    return this.findIndex(function (elem) {
        return compareServices(service, elem);
    });
};

/**
 * @return {Object}
 */
ServicePool.prototype.pick = function () {
    var service = undefined;

    this.forEach(function (elem) {
        if (undefined === service) {
            if (undefined === elem.flag) {
                service = elem;
            }
        }
    });

    return service;
};

/**
 * @param {Object} service
 */
ServicePool.prototype.remove = function (service) {
    var idx = this.serviceIndex(service);

    if (-1 !== idx) {
        this.splice(idx, 1);
    }
};

/**
 * @param {Object} service
 * @param {*}      flag
 * @param {Number} [timeout]
 */
ServicePool.prototype.flag = function (service, flag, timeout) {
    var self = this,
        idx = this.serviceIndex(service);

    if (-1 !== idx) {
        this[idx].flag = flag;
    }

    // don't let flags be there forever
    if (undefined !== timeout) {
        setTimeout(function () {
            self.unflag(service);
        }, timeout);
    }
};

/**
 * @param {Object} service
 */
ServicePool.prototype.unflag = function (service) {
    this.flag(service);
};

/**
 * @return {Number}
 */
ServicePool.prototype.unflaggedCount = function () {
    return this.reduce(function (carry, elem) {
        return carry + elem.flag === undefined;
    }, 0);
};

ServicePool.prototype.connect = function () {
    if (!this.connected && !this.connecting) {
        this.connecting = true;

        var service = this.pick();

        if (service) {
            this.client.connect({
                port: service.port,
                host: service.host
            });
        }
        else {
            this.connecting = false;
        }
    }
};

ServicePool.prototype.start = function () {
    this.browser.start();
    var self = this;
    this.connectionTimer = setTimeout(function () {
        self.connect();
    }, 2500);
};

ServicePool.prototype.stop = function () {
    this.browser.stop();
    clearTimeout(this.connectionTimer);
};

module.exports = ServicePool;
