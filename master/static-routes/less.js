var fs = require('fs');
var path = require('path');
var less = require('less');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer-core');
var CleanCSS = require('clean-css');

var routes = {
    '/dist/css/style.css': function factory(callback) {
        fs.readFile(path.join(__dirname, '/../public/stylesheets/style.less'), 'utf8', function (err, lessContent) {
            less.render(lessContent, {sourceMap: {sourceMapFileInline: process.env.NODE_ENV === 'development'}, paths: [path.join(__dirname, '/../public/stylesheets/')]}, function (err, output) {

                postcss([autoprefixer]).process(output.css).then(function (result) {
                    result.warnings().forEach(function (warn) {
                        console.warn(warn.toString());
                    });

                    if(process.env.NODE_ENV === 'development'){
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
