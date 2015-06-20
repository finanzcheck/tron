global.jQuery = require('jquery');
var $ = jQuery;
var bootstrap = require('bootstrap');
var api = require('./lib/api');

$('body').on('click', '[data-tron]', function(){
    var state = true;
    $(this).toggleClass('active', state);
});
