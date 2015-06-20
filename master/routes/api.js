var express = require('express');
var router = express.Router();
var server;

// middleware specific to this router
router.get('/clients', function (req, res) {
    var clients = server.getClients();

    res.json(clients);
});

router.get('/switchall', function (req, res) {
    var clients = server.getClients();

    res.json(clients);
});

module.exports = function (_server) {
    server = _server;
    return router;
};
