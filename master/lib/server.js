var Q = require('q');
var os = require('os');
var net = require('net');
var mdns = require('mdns');
var config = require('config');
var Protocol = require('../../lib/protocol');
var protocolConfig = config.get('protocol');
var hostname = os.hostname();
var mdnsAd = mdns.createAdvertisement(mdns.tcp(protocolConfig.name), protocolConfig.port, {
    txtRecord: protocolConfig.txtRecord,
    name: hostname
});
var Client = require('./client');
var clients = new (require('./clientPool'))();

var server = net.createServer();
var protocol = new Protocol({
    onGreeting: function (data, con) {
        var self = this;

        data.up = true;

        var client = clients.getClientById(data.id);

        if (!client) {
            clients.push(new Client(data, con));
        }

        self.respond(self.GREETING, con);

        // Testing navigateUrl action
        setInterval(function () {
            self.ask(self.REQUEST, {
                action: 'navigateUrl',
                url: (function (urls) {
                    return urls[Math.floor(Math.random() * urls.length)];
                })([
                    'https://www.google.de/',
                    'https://www.github.com/',
                    'https://www.heise.de/',
                    'https://www.apple.com/',
                    'https://www.finanzcheck.de/'
                ])
            }, con);
        }, 2500);
    },
    onReceipt: function (data, con) {
        console.log('onReceipt', data);
    },
    onRequest: function (data, con) {
        console.log('onRequest', data);
    },
    onPassage: function (data, con) {
        console.log('onPassage', data);
    },
    onError: function (data, con) {
        console.log('onError', data);
    }
});

server.on('connection', function (c) {
    console.log('client connected');
    c.on('end', function () {
        console.log('client disconnected');
    });
    c.on('data', function (data) {
        protocol.interpret(data, this);
    });
});

server.on('listening', function () {
    console.log('server bound');
    mdnsAd.start();
    console.log('server announced');
});

server.on('close', function () {
});

server.on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(function () {
            server.close();
            server.listen(protocolConfig.port);
        }, 1000);
    }
});

module.exports = {
    start: function () {
        server.listen(protocolConfig.port);
    },
    stop: function () {
        server.close();
    },
    changeUrl: function () {

    },
    switchTV: function (state, which, callback) {

    },
    getClients: function () {
        return clients;
    }
};
