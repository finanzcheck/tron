var net = require('net'),
    client = new net.Socket(),
    interfaces = require('os').networkInterfaces(),
    conf = require('config'),
//    wpi = require('wiring-pi'),
    macAddress = (function (interfaces) {
        var testInterfaces = ['eth0', 'en0', 'wlan0'],
            mac;

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
    })(interfaces),
    protocol = new (require('../lib/protocol'))(),
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
    mdns = require('mdns'),
    mdnsBrowser = mdns.createBrowser(mdns.tcp(conf.protocol.name)),
    browserUrl = conf.browser.url,
    tvState;

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
    console.log(data.toString());
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
