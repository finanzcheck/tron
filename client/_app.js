Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

var net = require('net'),
    protocol = require('../lib/protocol'),
    os = require('os'),
    mdns = require('mdns'),
    conf = {
        proto: {
            name: 'rpcc',
            port: 4321
        }
    },
    discoveredServices = [],
    client = new net.Socket(),
    connected = false,
    connect = function (service) {
        if (!connected) {
            connected = true;

            client.connect({
                port: service.port,
                host: service.host
            });
        }
    },
    browser = mdns.createBrowser(mdns.tcp(conf.protocol.name));

client.on('connect', function () {
    console.log('connected to server!');
    client.write('world!\r\n');
});

client.on('data', function (data) {
    console.log(data.toString());
    client.end();
});
client.on('end', function () {
    console.log('disconnected from server');
});

browser.on('serviceUp', function (service) {
    if (service.networkInterface) {
        console.log('service discovered on ' + service.host + ' via interface ' + service.networkInterface);

        discoveredServices.push(service);

        connect(service);
    }
});
browser.on('serviceDown', function (service) {
    console.log('service down: ', service);

    discoveredServices.remove(service);
});
browser.start();
