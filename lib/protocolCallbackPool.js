var util = require('util');

require('array.prototype.find');
require('array.prototype.findindex');

/**
 * @param {Number} [timeout=1000]
 *
 * @constructor
 */
function CallbackPool(timeout) {
    this.timeout = timeout || 1000;
}

util.inherits(CallbackPool, Array);

/**
 * @param {String}   token
 * @param {Function} cb
 * @param {Number}   [timeout]
 */
CallbackPool.prototype.add = function (token, cb, timeout) {
    var self = this,
        timer = setTimeout(function () {
            var cb = self.resolve(token);
            if (cb) {
                cb(new Error('Operation ' + token + 'timed out!'));
            }
        }, timeout || self.timeout);

    this.push({
        token: token,
        cb: cb,
        timer: timer
    });
};

/**
 * @param {String} id
 *
 * @return {Function}
 */
CallbackPool.prototype.resolve = function (id) {
    var idx = this.findIndex(function (elem) {
        return elem.token = id;
    });

    if (-1 < idx) {
        var cbArr = this.splice(idx, 1);
        if (cbArr.length) {
            var cbObj = cbArr[0];
            clearTimeout(cbObj.timer);

            return cbObj.cb;
        }
    }
};

module.exports = CallbackPool;
