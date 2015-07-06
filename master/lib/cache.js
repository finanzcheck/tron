var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var touch = require('touch');
var Q = require('q');
var noop = require('../../lib/noop');

function Cache() {
    this.rootCacheDir = path.join(process.cwd(), 'cache');
    mkdirp.sync(this.rootCacheDir);
}

util.inherits(Cache, EventEmitter);

/**
 * @param  {String} cache
 * @private
 *
 * @return {deferred.promise|*}
 */
Cache.prototype._cachePath = function (cache) {
    return path.join(this.rootCacheDir, cache + '.json');
};

/**
 *
 * @param {Buffer} content
 * @param {String} [key]
 *
 * @return {*}
 * @private
 */
Cache.prototype._processContent = function (content, key) {
    try {
        var data = JSON.parse(content);
    }
    catch (e) {
        return;
    }

    return key ? data[key] : data;
};

/**
 * @param {String}   cache
 * @param {String}   [key]
 * @param {*}        value
 * @param {Function} [cb]
 */
Cache.prototype.set = function (cache, key, value, cb) {
    var self = this;
    var path = this._cachePath(cache);

    if (typeof value === 'function' || typeof value === 'undefined') {
        value = key;
        key = undefined;
        cb = noop;
    }

    cb = cb || noop;

    if (undefined === key) {
        fs.writeFile(path, JSON.stringify(value, null, 4), cb);
    }
    else {
        this.get(cache, function (err, content) {
            if (!err) {
                content[key] = value;
                self.set(cache, content, cb);
            }
        });
    }
};


/**
 * @param {String}   cache
 * @param {String}   [key]
 * @param {Function} cb
 *
 * @return {Object|*}
 */
Cache.prototype.get = function (cache, key, cb) {
    var self = this;
    var path = this._cachePath(cache);

    if (typeof key === 'function') {
        cb = key;
        key = undefined;
    }

    cb = cb || noop;

    touch(path, function (err) {
        fs.readFile(path, 'utf-8', function (err, content) {
            if (!err) {
                content = self._processContent(content, key);
            }

            cb(err, content);
        });
    });
};

/**
 * @param {String}   cache
 * @param {String}   [key]
 *
 * @return {Object|*}
 */
Cache.prototype.getSync = function (cache, key) {
    var path = this._cachePath(cache);
    touch.sync(path);

    var content = fs.readFileSync(path);
    content = this._processContent(content, key);

    return content;
};

module.exports = Cache;
