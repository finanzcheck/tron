var fs = require('fs');
var path = require('path');
var less = require('less');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer-core');
var CleanCSS = require('clean-css');
var debug = require('debug')('master:staticr:less');

var routes = {
    '/dist/css/style.css': function factory(callback) {
        debug('run on /dist/css/style.css');
        fs.readFile(path.join(__dirname, '/../public/stylesheets/style.less'), 'utf8', function (err, lessContent) {
            less.render(lessContent, {sourceMap: {sourceMapFileInline: process.env.NODE_ENV !== 'production'}, paths: [path.join(__dirname, '/../public/stylesheets/')]}, function (err, output) {

                postcss([autoprefixer]).process(output.css).then(function (result) {
                    result.warnings().forEach(function (warn) {
                        console.warn(warn.toString());
                    });

                    if(process.env.NODE_ENV !== 'production'){
                        callback(err, result.css);
                    } else {
                        var minified = new CleanCSS().minify(result.css);
                        callback(err, minified.styles);
                    }

                });
            })

        });
    }
};
module.exports = routes;
