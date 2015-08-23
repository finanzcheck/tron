var browserify = require('browserify');
var babelify = require('babelify');

var debug = require('debug')('master:staticr:browserify');
var debugEnabled = process.env.NODE_ENV !== 'production';
var routes = {
    '/dist/js/index.js': function factory(cb) {
        debug('run on /dist/js/index.js');
        var bundle = browserify({
            entries: './master/public/js/index.js',
            debug: true
        });

        bundle.plugin('envify');

        if (!debugEnabled) {
            bundle.plugin('minifyify', {map: 'bundle.map.json'});
        }

        return bundle.bundle(cb);

    },
    '/dist/js/app.js': function factory(cb) {
        debug('run on /dist/js/app.js');
        var bundle = browserify({
            entries: './master/public/src/index.jsx',
            extensions: ['.jsx'],
            debug: true
        })
            .transform(babelify);
        bundle.plugin('envify');

        if (!debugEnabled) {
            bundle.plugin('minifyify', {map: 'bundle.map.json'});
        }

        return bundle.bundle(cb);

    }
};

module.exports = routes;
