var express = require('express');
var router = express.Router();
var server;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'TRON', js: 'index'});
});

/* GET home page with react. */
router.get('/app', function (req, res, next) {
    res.render('app', {title: 'TRON-APP', js: 'app'});
});

module.exports = router;

