var net = require('net'),
    mdns = require('mdns'),
    config = require('config'),
    Protocol = require('../../lib/protocol'),
    protocolConfig = config.get('protocol'),
    mdnsAd = mdns.createAdvertisement(mdns.tcp(protocolConfig.name), protocolConfig.port, {
        txtRecord: protocolConfig.txtRecord,
        name: 'mcp'
    }),
    clients = {},
    server = net.createServer(),
    protocol = new Protocol({
        'onGreeting': function (data, con) {
            con.write(this.GREETING);
        },
        'onReceipt': function (data, con) {
        },
        'onRequest': function (data, con) {
        },
        'onPassage': function (data, con) {
        },
        'onError': function (data, con) {
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
    getClients: function () {
        return clients;
    }
};
