var express = require('express');
var router = express.Router();
var server;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'TRON'});
});

module.exports = router;

