var path = require('path');
var mkdirp = require('mkdirp');
var rootLogDir = (function (logPath) {
    mkdirp.sync(logPath);

    return logPath;
})(path.join(process.cwd(), 'logs'));

var winston = require('winston');

/**
 * @param  {String} filename
 * @return {winston.Logger}
 */
module.exports = function (filename) {
    return new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                timestamp: true
            }),
            new (winston.transports.File)({
                filename: path.join(rootLogDir, filename),
                zippedArchive: true,
                timestamp: true
            })
        ]
    });
};
