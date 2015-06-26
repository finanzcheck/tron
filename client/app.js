var net = require('net');
var spawn = require('child_process').spawn;
var async = require('async');
var client = new net.Socket();
var chromeCtrl = require('chrome-remote-interface');
var chromeInstance;
var conf = require('config');

var clientState = {
    browserUrl: conf.client.browser.url,
    tvState: undefined
};

var gpio = require('./lib/gpio');
var macAddress = require('./lib/macAddressResolver');
var Protocol = require('../lib/protocol');
var ServicePool = require('./lib/servicePool');

var protocol = new Protocol({
    onGreeting: function (data, con) {
        // server acknowledged our existence
    },
    onReceipt: function (data, con) {
        console.log('onReceipt', data);
    },
    onRequest: function (data, con) {
        this.emit(data.action, data, con);
    },
    onPassage: function (data, con) {
        console.log('onPassage', data);
    },
    onError: function (data, con) {
        console.log('onError', data);
    },
    additional: {
        navigateUrl: function (data, con) {
            var self = this;

            clientState.browserUrl = data.url;

            if (chromeInstance) {
                chromeInstance.Page.navigate({
                    url: clientState.browserUrl
                });

                self.respond({
                    token: data.token
                }, con);
            }
            else {
                self.error({
                    token: data.token,
                    message: 'Cannot connect to Chrome'
                }, con);
            }
        },
        switchTV: function (data, con) {
            var self = this;

            clientState.tvState = data.state;

            gpio.write(conf.client.io.tv, clientState.tvState, function (err) {
                if (err) {
                    self.error({
                        token: data.token,
                        message: err
                    }, con);
                }
                else {
                    self.respond({
                        token: data.token
                    }, con);
                }
            });
        }
    }
});
var mdns = require('mdns');
var mdnsBrowser = mdns.createBrowser(mdns.tcp(conf.protocol.name));

var services = new ServicePool(client, mdnsBrowser);

client.on('connect', function () {
    // introduce ourselves
    protocol.greet({
        id: macAddress,
        tv: clientState.tvState,
        url: clientState.browserUrl
    }, this);
});

client.on('data', function (data) {
    protocol.interpret(data, this);
});

// initializations
async.waterfall([
    // setup GPIO
    function (next) {
        gpio.setup(conf.client.io.tv, gpio.DIR_OUT, function (err) {
            if (err) {
                next(err);
            }
            else {
                gpio.read(conf.client.io.tv, function (err, value) {
                    if (!err) {
                        clientState.tvState = !!value;
                    }

                    next(err);
                });
            }
        });
    },
    // setup Chrome
    function (next) {
        var chrome = spawn(conf.client.browser.path, conf.client.browser.args);

        chrome.on('error', function (err) {
            next(err);
        });
        chrome.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });

        // wait to let chrome start gracefully
        setTimeout(next, conf.client.browser.startupGracePeriod);
    },
    // setup Chrome Protocol
    function (next) {
        chromeCtrl(function (chrome) {
            chromeInstance = chrome;
            next();
        }).on('error', function () {
            next('Init chrome failed');
        });
    },
    // start mdns Browser
    function (next) {
        services.start();
        next();
    }
], function (err) {
    if (err) {
        console.log('Initialization failed due to raised error: ', err);
        process.exit(1);
    }
});
