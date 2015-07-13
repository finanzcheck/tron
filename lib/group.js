var util = require('util');
var uuid = require('node-uuid');
var EventEmitter = require('events').EventEmitter;
var CronJob = require('cron').CronJob;

/**
 * @param {Object}  data
 * @param {String}  [data.id]
 * @param {String}  data.panicUrl
 * @param {String}  [data.title]
 * @param {Boolean} [data.state]
 * @param {Object}  [data.schedules]
 * @param {Array}   [data.schedules.on]
 * @param {Array}   [data.schedules.off]
 *
 * @constructor
 */
function Group(data) {
    data = data || {};
    /** @type {Group} */
    var self = this;
    /** @type {String} */
    var id = data.id || uuid.v4();
    /** @type {String} */
    var panicUrl = data.panicUrl;
    /** @type {Boolean} */
    var panicState = false;
    /** @type {String} */
    var title = data.title || data.id;
    /** @type {Boolean} */
    var state = data.state;
    /** @type {Array.<CronJob>} */
    var onSchedules = [];
    /** @type {Array.<CronJob>} */
    var offSchedules = [];

    Object.defineProperties(this, {
        id: {
            enumerable: true,
            get: function () {
                return id;
            }
        },
        panicUrl: {
            enumerable: true,
            get: function () {
                return panicUrl;
            },
            set: function (val) {
                panicUrl = val;
                this.emit('change', this);
            }
        },
        panicState: {
            enumerable: true,
            get: function () {
                return panicState;
            },
            set: function (val) {
                panicState = !!val;
                this.emit('change', this);
            }
        },
        title: {
            enumerable: true,
            get: function () {
                return title;
            },
            set: function (val) {
                title = val;
                this.emit('change', this);
            }
        },
        state: {
            enumerable: true,
            get: function () {
                return state;
            }
        },
        onSchedules: {
            enumerable: true,
            get: function () {
                return onSchedules;
            }
        },
        offSchedules: {
            enumerable: true,
            get: function () {
                return offSchedules;
            }
        }
    });

    this.on('switch', function (group, newState) {
        state = newState;
    });

    (function (schedules) {
        (schedules.on || []).forEach(function (job) {
            self.addOnSchedule(job);
        });
        (schedules.off || []).forEach(function (job) {
            self.addOffSchedule(job);
        });
    }(data.schedules || {}));
}

util.inherits(Group, EventEmitter);

/**
 * @param {String} cronTime
 */
Group.prototype.addOnSchedule = function (cronTime) {
    var self = this;
    var job = new CronJob({
        cronTime: cronTime,
        onTick: function () {
            self.emit('switch', self, true);
        },
        start: true,
        context: this
    });

    this.onSchedules.push(job);
};

/**
 * @param {String} cronTime
 */
Group.prototype.addOffSchedule = function (cronTime) {
    var self = this;
    var job = new CronJob({
        cronTime: cronTime,
        onTick: function () {
            self.emit('switch', self, false);
        },
        start: true,
        context: this
    });

    this.offSchedules.push(job);
};

/**
 *
 * @return {{id: {String}, panicUrl: {String}, panicState: {Boolean}, title: {String}}}
 */
Group.prototype.toJSON = function () {
    /**
     * @param  {Array.<CronJob>} schedule
     * @return {Array.<String>}
     */
    function mapJobs(schedule) {
        return schedule.map(function (job) {
            return job.cronTime.toString();
        })
    }

    return {
        id: this.id,
        panicUrl: this.panicUrl,
        panicState: this.panicState,
        title: this.title,
        schedules: {
            on: mapJobs(this.onSchedules),
            off: mapJobs(this.offSchedules)
        }
    };
};

module.exports = Group;
