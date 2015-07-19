var express = require('express');
var router = express.Router();
var hbs = require('hbs');
//var browserify = require('browserify-middleware');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var server = require('./lib/server');

//var routes = require('./routes/index');

var app = express();

//passport plugin initialize
passport.use(new LocalStrategy(
    function (username, password, done) {
        console.log(username, password);

        User.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (!user.validPassword(password)) {
                return done(null, false, {message: 'Incorrect password.'});
            }
            return done(null, user);
        });
    }
));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var blocks = {};

hbs.registerHelper('eachInMap', function (map, block) {
    var out = '';
    Object.keys(map).map(function (prop) {
        out += block.fn({key: prop, value: map[prop]});
    });
    return out;
});

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('extend', function (name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function (name) {
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

if (process.env.NODE_ENV != 'production') {
    var serve = require("staticr/serve");
    app.use(serve(require("./static-routes/browserify")));
    app.use(serve(require("./static-routes/less")));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

/* GET home page. */
var routes = router.get('/',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }),
    function (req, res, next) {
        req.login('testuser', function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/users/' + req.user.username);
        });
        //res.render('index', {title: 'TRON'});
    });


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
if (app.get('env') != 'production') {
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

module.exports = app;
