var hogan = require("hogan");
var viewHeading = require("./heading");

var str =
    '<section class="panel panel-default clients clients-group">\
            <header class="panel-heading">\
                {{> heading}}\
            </header>\
            <div class="panel-body">\
                <ul class="clients-list">\
                {{#clients}}\
                    {{> client}}\
                {{/clients}}\
                </ul>\
            </div>\
        </section>';

var template = hogan.compile(str);
var partial = {
    heading: require('./heading').template,
    client: require('./client').template
};

module.exports = function (data) {
    return template.render(data, partial);
};

module.exports.template = template;

