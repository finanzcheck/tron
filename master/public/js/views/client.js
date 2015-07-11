
var hogan = require("hogan");

var str =
'<li class="clients-list-item client" client="{{id}}">\
    <a data-action="switch" href="" class="client-state {{state}} btn"><i class="fa fa-3x fa-fw fa-power-off"></i></a>\
    <span>\
        <input class="form-control client-title" {{#settings}}disabled{{/settings}} name="title" data-event="client:changetitle" data-id="{{id}}" value="{{title}}" type="text">\
        <input class="form-control client-url" {{#settings}}disabled{{/settings}} data-event="client:changeurl" data-id="{{id}}" name="url" value="{{url}}" type="url">\
    </span>\
    <span class="client-id">{{id}}</span>\
</li>';

var template = hogan.compile(str);

module.exports = function (data) {
    return template.render(data);
};

module.exports.template = template;
