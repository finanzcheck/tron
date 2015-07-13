var util = require('util');
var Client = require('../../lib/client');
var Group = require('../../lib/group');
var Cache = require('./cache');
var EventEmitter = require('events').EventEmitter;
var moment = require('moment-timezone');

require('array.prototype.find');

/**
 * @constructor
 *
 * @param {Cache}  [cache]
 * @param {String} [cacheName]
 */
function ClientPool(cache, cacheName) {
    this.cache = cache;
    this.clients = [];
    this.cacheName = cacheName || 'clientPool';

    var groups = [];

    Object.defineProperties(this, {
        groups: {
            enumerable: true,
            get: function () {
                return groups;
            }
        }
    });

    this._initCached();
}

util.inherits(ClientPool, EventEmitter);

/**
 * @private
 */
ClientPool.prototype._initCached = function () {
    if (this.cache) {
        var self = this;
        var cached = this.cache.getSync(this.cacheName);

        function initCache(cache, cClass, handler) {
            var cachedObjs = cached[cache];
            if (cachedObjs && cachedObjs instanceof  Array) {
                cachedObjs.forEach(function (elem) {
                    var cObj = new cClass(elem);
                    cObj.on('change', handler.bind(self));

                    self[cache].push(cObj);
                });
            }
        }

        if (cached) {
            initCache('clients', Client, self._updateClientHandler);
            initCache('groups', Group, self._updateGroupHandler);

            self.groups.forEach(function (group) {
                group.on('switch', self._switchGroupHandler.bind(self));
                // find missed cronjobs
                var now = moment();
                var today = now.format('YYYY-MM-DD 00:00:00');
                var findClosest = function (carry, job) {
                    var execDate = job.cronTime._getNextDateFrom(today);
                    // is same day?
                    if (execDate.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
                        var diff = now.diff(execDate, 'seconds');
                        // diff lt 0 is some time in the future
                        if (diff >= 0 && (false === carry || diff < carry)) {
                            return diff;
                        }
                    }

                    return carry;
                };
                var shouldHaveBeenOn = group.onSchedules.reduce(findClosest, false);
                var shouldHaveBeenOff = group.offSchedules.reduce(findClosest, false);
                // if there is no indication for a
                // missed cronjob don't do anything
                if (false !== shouldHaveBeenOn || false !== shouldHaveBeenOff) {
                    // missed off-cronjob
                    if (false === shouldHaveBeenOn && false !== shouldHaveBeenOff) {
                        group.emit('switch', group, false);
                    }
                    // missed on-cronjob
                    else if (false !== shouldHaveBeenOn && false === shouldHaveBeenOff) {
                        group.emit('switch', group, true);
                    }
                    // missed at least on of each, find out what the last one was
                    else {
                        // emit the state based on the event which is missed most recently
                        group.emit('switch', group, shouldHaveBeenOn < shouldHaveBeenOff);
                    }
                }
            });
        }
    }
};

/**
 * @private
 */
ClientPool.prototype._updateCache = function () {
    if (this.cache) {
        this.cache.set(this.cacheName, this);
    }
};

/**
 * @private
 */
ClientPool.prototype._updateClientHandler = function () {
    this._updateCache();
    this.emit('clientsUpdated');
};

/**
 * @private
 */
ClientPool.prototype._updateGroupHandler = function () {
    this._updateCache();
    this.emit('groupsUpdated');
};

/**
 * @param {Group}   group
 * @param {Boolean} state
 * @private
 */
ClientPool.prototype._switchGroupHandler = function (group, state) {
    var clients = this.getClientsByGroupId(group.id);
    clients.forEach(function (client) {
        client.state = state;
    });
    this.emit('clientsSwitched', clients);
};

/**
 * @param {...Client} [items]
 * @return {Number}
 */
ClientPool.prototype.add = function (items) {
    Array.prototype.push.apply(this.clients, arguments);
    var self = this;

    for (var i = 0; i < arguments.length; i++) {
        var client = arguments[i];

        if (client instanceof Client) {
            client.on('change', this._updateClientHandler.bind(self));
        }
    }

    this._updateClientHandler();
};

/**
 * @param {...Group} [items]
 * @return {Number}
 */
ClientPool.prototype.addGroup = function (items) {
    Array.prototype.push.apply(this.groups, arguments);
    var self = this;

    for (var i = 0; i < arguments.length; i++) {
        var group = arguments[i];

        if (group instanceof Group) {
            group.on('change', this._updateGroupHandler.bind(self));
            group.on('switch', this._switchGroupHandler.bind(self));
        }
    }

    this._updateGroupHandler();
};

/**
 * @param {Client} client
 * @return {Array.<Client>|undefined}
 */
ClientPool.prototype.remove = function (client) {
    var index = this.clients.indexOf(client);
    if (index === -1) {
        return;
    }

    var spliced = this.clients.splice(index, 1);
    for (var i = 0; i < spliced.length; i++) {
        spliced[i].removeListener('change', this._updateClientHandler);
    }

    return spliced;
};

/**
 * @param  {String} groupId
 * @return {Array.<Client>}
 */
ClientPool.prototype.getClientsByGroupId = function (groupId) {
    return this.clients.filter(function (client) {
        return client.group === groupId;
    });
};

/**
 *
 * @param   {String} id
 * @returns {Client}
 */
ClientPool.prototype.getClientById = function (id) {
    return this.clients.find(function (client) {
        return client.id == id;
    });
};

/**
 *
 * @param   {String} id
 * @returns {Group}
 */
ClientPool.prototype.getGroupById = function (id) {
    return this.groups.find(function (client) {
        return client.id == id;
    });
};

/**
 * @returns {{groups: Array.<Group>, clients: Array.<Client>}}
 */
ClientPool.prototype.toJSON = function () {
    return {
        groups: this.groups,
        clients: this.clients
    };
};

/**
 *
 * @param   {Array} clients
 * @param   {Array} groups
 * @returns {ClientPool}
 */
ClientPool.fromArray = function (clients, groups) {
    var clientPool = new ClientPool();
    clients.forEach(function (client) {
        clientPool.add(new Client(client));
    });
    groups.forEach(function (group) {
        clientPool.addGroup(new Group(group));
    });

    return clientPool;
};

module.exports = ClientPool;
