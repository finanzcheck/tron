var express = require('express');
var hbs = require('hbs');
var browserify = require('browserify-middleware');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var server = require('./lib/server');

var routes = require('./routes/index')(server);
var api = require('./routes/api')(server);
var clients = require('./routes/clients');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var blocks = {};

hbs.registerHelper( 'eachInMap', function ( map, block ) {
   var out = '';
   Object.keys( map ).map(function( prop ) {
      out += block.fn( {key: prop, value: map[ prop ]} );
   });
   return out;
} );

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/js', browserify(path.join(__dirname, 'public/js')));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.start();

var appServer = app.listen(3000, function () {

  var host = appServer.address().address;
  var port = appServer.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

module.exports = app;
