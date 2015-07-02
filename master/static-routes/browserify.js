var browserify = require('browserify');
var debug = require('debug')('master:staticr:browserify');

var routes = {
    '/dist/js/index.js': function factory() {
        debug('run on /dist/js/index.js');
        var bundler = browserify({
            entries: './master/public/js/index.js',
            debug: process.env.NODE_ENV !== 'production'
        });

        if (process.env.NODE_ENV === 'production') {
            bundler.transform({
                global: true
            }, 'uglifyify');
        }

        return bundler.bundle()

    }
};
module.exports = routes;
