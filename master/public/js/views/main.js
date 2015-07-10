var hogan = require("hogan");

var str =
    '<div class="clients-groups js-groups">\
        {{#groups}}\
            {{> group}}\
        {{/groups}}\
    </div>\
    <header class="clients-main">\
        {{> heading}}\
    </header>\
    <div class="clients-groups-toggle"><a class="btn btn-default" href="#clients"><i class="fa fa-cog"></i> Details</a></div>';

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
