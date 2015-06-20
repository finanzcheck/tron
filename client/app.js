var os = require('os');
var net = require('net');
var client = new net.Socket();
var interfaces = os.networkInterfaces();
var chromeCtrl = require('chrome-remote-interface');
var chromeInstance;
var conf = require('config');
// var wpi = require('wiring-pi');
// determine a mac address we may use to identify ourselves
var macAddress = (function (interfaces) {
    var testInterfaces = ['eth0', 'en0', 'wlan0'],
        mac = undefined;

    testInterfaces.forEach(function (name) {
        var anInterface = interfaces[name];

        if (anInterface) {
            mac = anInterface[0].mac;
        }
    });

    return mac || Object.keys(interfaces).reduce(function (carry, current) {
            if (carry) {
                return carry;
            }
            else {
                return interfaces[current].reduce(function (carry, current) {
                    return carry || true === current.internal ? undefined : current.mac;
                }, undefined);
            }
        }, undefined);
})(interfaces);
var Protocol = require('../lib/protocol');
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

            if (chromeInstance) {
                chromeInstance.Page.navigate({'url': data.url});
                con.write(self.RECEIPT + '!' + JSON.stringify({}));
            }
            else {
                con.write(self.ERROR + '!' + JSON.stringify({'message': 'Cannot connect to Chrome'}));
            }
        }
    }
});
var connected = false;
var connect = function (service) {
    if (!connected) {
        connected = true;

        client.connect({
            port: service.port,
            host: service.host
        });
    }
};
var mdns = require('mdns');
var mdnsBrowser = mdns.createBrowser(mdns.tcp(conf.protocol.name));
var browserUrl = conf.browser.url;
var tvState;

// setup chromeCtrl
chromeCtrl(function (chrome) {
    chromeInstance = chrome;
}).on('error', function () {
    console.error('Init chrome failed');
});

client.on('connect', function () {
    // introduce ourselves
    client.write(protocol.GREETING + '!' + JSON.stringify({
        'id': macAddress,
        'tv': tvState,
        'url': browserUrl
    }));
});

client.on('error', function () {
    console.log(arguments);
});

client.on('data', function (data) {
    protocol.interpret(data, this);
});

client.on('end', function () {
    connected = false;
    console.log('disconnected from server');
});

mdnsBrowser.on('serviceUp', function (service) {
    if (service.networkInterface) {
        console.log('service discovered on ' + service.host + ' via interface ' + service.networkInterface);

        connect(service);
    }
});
mdnsBrowser.on('serviceDown', function (service) {
    // console.log('service down: ', service);
});
mdnsBrowser.start();
