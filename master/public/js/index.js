global.jQuery = require('jquery');
var $ = jQuery;
var bootstrap = require('bootstrap');
var api = require('./lib/api');

$('body').on('click', '[data-tron]', function () {
    var $this = $(this);
    api[$(this).data('tron')]($(this).data('tronState'), function (state) {
        $this.toggleClass('active', state).data('tronState', state ? 'on' : 'off');
    });
});
