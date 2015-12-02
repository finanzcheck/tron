var hogan = require("hogan.js");

var str =
    '<header class="clients-main">\
        <a href="#" class="btn btn-link btn-sm btn-back-main"><i class="fa fa-fw fa-arrow-left"></i></a> \
        {{> heading}}\
    </header>\
    <div class="clients-groups js-groups">\
        {{#groups}}\
            {{> group}}\
        {{/groups}}\
    </div>\
    <div class="clients-groups-toggle"><a class="btn btn-sm btn-link" href="#clients">Details<i class="fa fa-fw fa-arrow-right"></i></a></div>';

var template = hogan.compile(str);
var partial = {
    heading: require('./heading').template,
    group: require('./group').template,
    client: require('./client').template
};

module.exports = function (data) {
    return template.render(data, partial);
};

module.exports.template = template;
