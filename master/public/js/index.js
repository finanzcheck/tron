global.jQuery = require('jquery');
var $ = jQuery;
var bootstrap = require('bootstrap');

var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
var socket = require('socket.io-client')(full);
var api = require('./lib/api');

$('body').on('click', '[data-tron]', function () {
    var $this = $(this);
    api[$(this).data('tron')]($(this).data('tronState'), function (state) {
        $this.toggleClass('active', state).data('tronState', state ? 'on' : 'off');
    });
});

socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', {my: 'data'});
});
