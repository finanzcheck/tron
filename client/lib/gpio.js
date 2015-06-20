var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var gpio = require('rpi-gpio');

// try to figure out as good as possible if this is a raspberry pi
if ('linux' === os.platform() && 'arm' === os.arch()) {
    module.exports = gpio;
}
else {
    function MockGpio() {
        this.channels = [];
    }

    util.inherits(MockGpio, EventEmitter);

    /**
     * Setup a channel for use as an input or output
     *
     * @param {number}   channel   Reference to the pin in the current mode's schema
     * @param {string}   direction The pin direction, either 'in' or 'out'
     * @param {function} onSetup   Optional callback
     */
    MockGpio.prototype.setup = function (channel, direction, onSetup /*err*/) {
        if (arguments.length === 2 && typeof direction == 'function') {
            onSetup = direction;
            direction = gpio.DIR_OUT;
        }

        direction = direction || gpio.DIR_OUT;
        onSetup = onSetup || function () {
        };

        if (!channel) {
            return process.nextTick(function () {
                onSetup(new Error('Channel must be a number'));
            });
        }

        if (direction !== gpio.DIR_IN && direction !== gpio.DIR_OUT) {
            return process.nextTick(function () {
                onSetup(new Error('Cannot set invalid direction'));
            });
        }

        this.channels[channel] = 0;

        setTimeout(onSetup, 100);
    };

    /**
     * Read a value from a channel
     *
     * @param {number}   channel The channel to read from
     * @param {function} cb      Callback which receives the channel's boolean value
     */
    MockGpio.prototype.input = function (channel, cb /*err,value*/) {
        var self = this;

        if (undefined === self.channels[channel]) {
            return process.nextTick(function () {
                cb(new Error('Pin has not been exported'));
            });
        }

        setTimeout(function () {
            cb(null, self.channels[channel]);
        }, 10);
    };

    /**
     * Read a value from a channel
     *
     * @param {number}   channel The channel to read from
     * @param {function} cb      Callback which receives the channel's boolean value
     */
    MockGpio.prototype.read = MockGpio.prototype.input;

    /**
     * Write a value to a channel
     *
     * @param {number}   channel The channel to write to
     * @param {boolean}  value   If true, turns the channel on, else turns off
     * @param {function} cb      Optional callback
     */
    MockGpio.prototype.output = function (channel, value, cb /*err*/) {
        var self = this;

        if (undefined === self.channels[channel]) {
            return process.nextTick(function () {
                cb(new Error('Pin has not been exported'));
            });
        }

        self.channels[channel] = value;

        return process.nextTick(function () {
            cb(null);
        });
    };

    /**
     * Write a value to a channel
     *
     * @param {number}   channel The channel to write to
     * @param {boolean}  value   If true, turns the channel on, else turns off
     * @param {function} cb      Optional callback
     */
    MockGpio.prototype.write = MockGpio.prototype.output;

    /**
     * Set pin reference mode. Defaults to 'mode_rpi'.
     *
     * @param {string} mode Pin reference mode, 'mode_rpi' or 'mode_bcm'
     */
    MockGpio.prototype.setMode = function (mode) {
        this.emit('modeChange', mode);
    };

    /**
     * Set a custom polling frequency for watching pin changes
     *
     * @param {number} value The frequency to poll at, in milliseconds
     */
    MockGpio.prototype.setPollFrequency = function (value) {
    };

    /**
     * Unexport any pins setup by this module
     *
     * @param {function} cb Optional callback
     */
    MockGpio.prototype.destroy = function (cb) {
        this.channels = [];

        return process.nextTick(function () {
            cb(null);
        });
    };

    module.exports = new MockGpio();
}
