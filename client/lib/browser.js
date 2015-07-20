var async = require('async');
var noop = require('../../lib/noop');
var spawn = require('child_process').spawn;
var logger = require('../../lib/logger')('browser.log');
var chromeCtrl = require('chrome-remote-interface');
var chromeConnection;
var chromeInstance;

var params = {};
var initialized = false;

module.exports = {
    isInitialized: function () {
        return initialized;
    },
    init: function (options, cb) {
        cb = cb || noop;

        if (!initialized) {
            params = options || {};

            async.waterfall([
                function (next) {
                    chromeInstance = spawn(params.path, params.args.concat([params.url]));

                    chromeInstance.on('error', function (err) {
                        next(err);
                    });
                    chromeInstance.on('close', function (code) {
                        logger.warn('child process exited with code ' + code);
                    });
                    chromeInstance.stdout.on('data', function (data) {
                        logger.info(data.toString());
                    });

                    chromeInstance.stderr.on('data', function (data) {
                        logger.error(data.toString());
                    });

                    // wait to let chrome start gracefully
                    setTimeout(next, params.startupGracePeriod);
                },
                // setup Chrome Protocol
                function (next) {
                    chromeCtrl(function (chrome) {
                        chromeConnection = chrome;
                        next();
                    }).on('error', function () {
                        next('Init chrome failed');
                    });
                }
            ], function (err, result) {
                if (!err) {
                    initialized = true;
                }
                else {
                    logger.error(err);
                }

                cb(err, result);
            });
        }
    },
    navigate: function (url, cb) {
        cb = cb || noop;

        if (chromeConnection) {
            chromeConnection.Page.navigate({
                url: url
            }, function (err) {
                if (err) {
                    logger.error(err);
                }
                else {
                    cb();
                }
            });
        }
        else {
            logger.error('Cannot connect to Chrome');
        }
    }
};
