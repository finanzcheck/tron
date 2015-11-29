var async = require('async');
var noop = require('../../lib/noop');
var spawn = require('child_process').spawn;
var logger = require('../../lib/logger')('browser.log');
var chromeCtrl = require('chrome-remote-interface');
var chromeConnection;
var chromeInstance;

var params = {};
var currentUrl;
var initialized = false;

function initChromeInstance(cb) {
    chromeInstance = spawn(params.path, params.args.concat([params.url]));

    chromeInstance.on('error', function (err) {
        cb(err);
    });
    chromeInstance.on('close', function (code) {
        logger.warn('Chrome instance exited with code ' + code);
        initChromeInstance();
    });
    chromeInstance.stdout.on('data', function (data) {
        logger.info(data.toString());
    });

    chromeInstance.stderr.on('data', function (data) {
        logger.error(data.toString());
    });

    // wait to let chrome start gracefully
    setTimeout(cb, params.startupGracePeriod);
}

module.exports = {
    isInitialized: function () {
        return initialized;
    },
    init: function (options, cb) {
        cb = cb || noop;

        if (!initialized) {
            params = options || {};
            currentUrl = params.url;

            async.waterfall([
                function (next) {
                    initChromeInstance(function (err) {
                        next(err);
                    });
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

function exitHandler(options, err) {
    if (options.cleanup) {
        console.log('clean');
    }
    if (err) {
        console.log(err.stack);
    }
    if (options.exit) {
        process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', exitHandler);
