var hogan = require("hogan");

var str =
    '<div class="heading"> \
         <h1 class="pull-left headline"><span>{{title}}</span><input class="form-control client-title" {{#settings}}disabled{{/settings}} {{#isUndefined}}disabled{{/isUndefined}} name="title" data-event="group:changetitle" data-id="{{id}}" value="{{title}}" type="text"></h1> \
         <div class="pull-right">\
                 <div class="config config-main">\
                     {{#editable}}<button type="button" class="btn btn-sm btn-default btn-new-group js-add-group" data-target="#collapse-{{id}}" aria-expanded="false" aria-controls="collapse-{{id}}"><i class="fa fa-fw fa-lg fa-plus"></i></button>{{/editable}}\
                     {{#editable}}<button type="button" class="btn btn-sm btn-default btn-clients-arrange js-clients-arrange" data-target="#collapse-{{id}}" aria-expanded="false" aria-controls="collapse-{{id}}"><i class="fa fa-fw fa-lg fa-arrows"></i></button>{{/editable}}\
                     <button type="button" class="btn btn-sm btn-default {{^settings}}active{{/settings}} btn-settings js-settings"><i class="fa fa-fw fa-lg fa-cogs"></i></button>\
                 </div>\
                 <div class="config config-group">\
                     {{#editable}}<button type="button" class="btn btn-sm btn-default {{#arrangeClients}}active{{/arrangeClients}} btn-group-settings js-group-settings" data-target="#collapse-{{id}}" aria-expanded="false" aria-controls="collapse-{{id}}"><i class="fa fa-fw fa-lg fa-cog"></i></button>{{/editable}}\
                 </div>\
             <div class="btn-group">\
                 <button type="button" {{^up}}disabled{{/up}} data-action="switch-all" data-type="off" class="btn btn-lg btn-size client-state-off"><i class="fa fa-lg fa-fw fa-power-off"></i></button>\
                 <button type="button" {{^up}}disabled{{/up}} data-action="switch-all" data-type="on" class="btn btn-lg btn-size client-state-on"><i class="fa fa-lg fa-fw fa-power-off"></i></button>\
             </div>\
             <button type="button" data-action="switch-panic" data-type="{{#panicState}}on{{/panicState}}{{^panicState}}off{{/panicState}}" class="btn btn-lg btn-default btn-size panic-state {{#panicState}}active{{/panicState}}"><i class="fa fa-lg fa-fw fa-exclamation-triangle"></i></button>\
         </div>\
    </div>\
   {{^noSettings}}<div class="clients-settings-wrapper collapse" id="collapse-{{id}}">\
        <div class="clients-settings">\
        <form class="js-form-settings">\
          <div class="form-group">\
            <label for="inputEmail3" class="control-label">Panic-Url</label>\
              <input type="url" class="form-control" name="panicUrl" value="{{panicUrl}}" placeholder="Panic-Url">\
          </div>\
          <fieldset>\
          <legend>Scheduler</legend>\
          <div class="form-group  has-success">\
              {{#schedules.on}}<div class="input-group">\
        <label for="scheduleOn{{@index}}" class="input-group-addon"><i class="fa fa-lg fa-power-off"></i></label>\
        <input type="cron" name="on" value="{{.}}" class="form-control" id="scheduleOn{{@index}}">\
        <span class="input-group-addon js-remove-schedule"><i class="fa fa-lg fa-minus"></i></span>\
      </div>{{/schedules.on}} \
              <div class="input-group">\
        <label for="scheduleOn" class="input-group-addon schedule-item schedule-item-on"><i class="fa fa-lg fa-power-off"></i></label>\
        <input type="cron" name="on" class="form-control" id="scheduleOn">\
        <span class="input-group-addon js-add-schedule"><i class="fa fa-lg fa-plus"></i></span>\
      </div>\
          </div>\
          <div class="form-group  has-error">\
             {{#schedules.off}}<div class="input-group">\
        <label for="scheduleOff{{@index}}" class="input-group-addon"><i class="fa fa-lg fa-power-off"></i></label>\
        <input type="cron" name="off" value="{{.}}" class="form-control" id="scheduleOff{{@index}}">\
         <span class="input-group-addon js-remove-schedule"><i class="fa fa-lg fa-minus"></i></span>\
     </div>{{/schedules.off}} \
              <div class="input-group">\
        <label for="scheduleOff" class="input-group-addon schedule-item schedule-item-on"><i class="fa fa-lg fa-power-off"></i></label>\
        <input type="cron" name="off" class="form-control" id="scheduleOff">\
         <span class="input-group-addon js-add-schedule"><i class="fa fa-lg fa-plus"></i></span>\
      </div>\
          </div>\
          </fieldset>\
          <div class="pull-right">\
              <button type="submit" class="btn btn-primary"><i class="fa fa-fw fa-lg fa-refresh"></i> <b>Save</b></button>\
          </div>\
          <input type="hidden" name="id" value="{{id}}">\
        </form>\
         </div>\
     </div>{{/noSettings}}';

var template = hogan.compile(str);

module.exports = function (data) {
    return template.render(data);
};

module.exports.template = template;
