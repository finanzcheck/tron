var express = require('express');
var router = express.Router();
var server;

// middleware specific to this router
router.get('/clients', function (req, res) {
    res.json(server.getClients());
});

module.exports = function (_server) {
    server = _server;
    return router;
};
