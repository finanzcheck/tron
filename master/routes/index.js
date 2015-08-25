var express = require('express');
var router = express.Router();
var server;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'TRON', js: 'index'});
});

/* GET home page with react. */
router.get('/app', function (req, res, next) {
    require('babel/register');

    var React = require('react');
    var App = require('../public/src/App/App.jsx');

    var app = React.createElement(App);

    res.render('app', {title: 'TRON-APP', js: 'app', content: React.renderToString(app)});
});

module.exports = router;

