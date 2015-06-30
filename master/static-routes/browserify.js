var browserify = require('browserify');
var uglify = require('uglify-stream');

var routes = {
    '/dist/js/index.js': function factory() {
        var bundler = browserify({
            entries: './master/public/js/index.js',
            debug: process.env.NODE_ENV === 'development'
        });

        if (process.env.NODE_ENV !== 'development') {
            bundler.transform({
                global: true
            }, 'uglifyify');
        }

        return bundler.bundle()

    }
};
module.exports = routes;
