function resolveCluster(options) {
    options = options || {};

    return function (service, next) {
        service.matchingCluster = service.txtRecord && service.txtRecord.cluster === options.cluster;

        next();
    };
}

module.exports = resolveCluster;
