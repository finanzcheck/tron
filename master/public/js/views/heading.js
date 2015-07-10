var hogan = require("hogan");

var str =
    '<div class="heading"> \
         <h1 class="pull-left">{{headline}}</h1> \
         <div class="pull-right">\
             <div class="btn-group">\
                 <button type="button" data-action="switch-all" data-type="off" class="btn btn-lg btn-size client-state-off"><i class="fa fa-lg fa-fw fa-power-off"></i></button>\
                 <button type="button" data-action="switch-all" data-type="on" class="btn btn-lg btn-size client-state-on"><i class="fa fa-lg fa-fw fa-power-off"></i></button>\
             </div>\
             <button type="button" class="btn btn-lg btn-size btn-default js-button-changeurl-all" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample"><i class="fa fa-fw fa-lg fa-terminal"></i> <b>Change Url</b></button>\
         </div>\
     </div>\
     <div class="clients-heading-url-wrapper collapse" id="collapseExample">\
         <div class="clients-heading-url"><input class="form-control" data-event="client:changeurl-all" name="url" value="" type="url"></div>\
     </div>';

var template = hogan.compile(str);

module.exports = function (data) {
    return template.render(data);
};

module.exports.template = template;
