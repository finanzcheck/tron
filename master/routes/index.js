var express = require('express');
var router = express.Router();
var server;

/* GET home page. */
router.get('/', function (req, res, next) {

    console.log(server.getClients());

    res.render('index', {title: 'Express', clients: server.getClients()});
});

module.exports = function (_server) {
    server = _server;
    return router;
};
