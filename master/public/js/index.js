global.jQuery = require('jquery');
var $ = jQuery;

require('bootstrap/js/transition');
require('bootstrap/js/collapse');


var CronJob = require('cron').CronJob;

var full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
global.socket = require('socket.io-client')(full);

var socketEvents = require('../../lib/socketEvents');

var clientState = require('./lib/clientState');
var Group = require('./model/group');

window.showSettings = true;
var clientPool;

var doc = window.document.documentElement;

function getClient(str) {
    return $('[client="' + str + '"]');
}

function getClientFromAction($action) {
    return $action.parents('.client').first();
}

function clientTogglePending($client, isPending) {
    var $state = $client.find('.client-state'),
        $formControl = $client.find('.form-control');
    if (isPending) {
        $formControl.prop('disabled', true);

        return $state.addClass(clientState.PENDING)
    }
    $formControl.prop('disabled', false);
    return $state.removeClass([clientState.PENDING].join(' '));
}

function setState($client, state) {
    if (state.toUpperCase() === 'PENDING') {
        clientTogglePending($client, true);
    }
    return clientTogglePending($client, false).removeClass([clientState.OFF, clientState.ON, clientState.UNDEFINED].join(' ')).addClass(clientState[state.toUpperCase()]);
}


function makeHTML(clientPool) {
    var headline = 'Clients';

    var defaultGroup = new Group({
        id: "undefined",
        title: 'New Clients',
        isDefault: true
    }, clientPool.clients);

    var groups = [defaultGroup].concat(clientPool.groups.map(function (group) {
        return new Group(group, clientPool.clients);
    }));

    var html = require('./views/main')({
            id: 'all',
            title: headline,
            settings: window.showSettings,
            editable: !window.showSettings,
            groups: groups,
            up: groups.reduce(function (carry, group) {
                return carry || !!group.up;
            }, false),
            panicState: clientPool.clients.filter(function (client) {
                return !!client.panicState;
            }).length == clientPool.clients.length
        })
        ;

    $('.js-clients').empty().append(html);
}

function toggleShowSettings() {
    $(doc)
        .toggleClass('show-settings', !window.showSettings)
        .toggleClass('hidden-settings', window.showSettings);
}

function showClients() {
    var show = location.hash.indexOf('clients') > -1;
    $(doc)
        .toggleClass('show-clients', show)
        .toggleClass('hidden-clients', !show);

    $('.js-groups')
        .toggleClass('visible', show)
        .toggleClass('hidden', !show);
}

var validate = {
    url: function (value) {
        return value.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/) !== null;
    },
    cron: function (value) {
        try {
            new CronJob(value, function () {
            });

            return true;
        } catch (ex) {
            return false;
        }
    }
};


$.fn.findGroup = function () {
    return this.parents('.clients').first();
};

$(function () {
    var $waiting = $('.clients-waiting');

    window.addEventListener('hashchange', showClients, false);

    socket.on('connect', function () {
        socket.emit(socketEvents.CLIENTS_GET);
    });

    socket.on('disconnect', function () {
        $waiting.toggleClass('active', true);
    });

    socket.on(socketEvents.CLIENTS_LIST, function (cpool) {
        clientPool = cpool;
        $waiting.toggleClass('active', clientPool.groups.length <= 0 && clientPool.clients.length <= 0);

        makeHTML(clientPool);
        toggleShowSettings();

        showClients();
    });

    socket.on(socketEvents.CLIENT_PENDING, function (client) {
        setState(getClient(client), 'pending');
    });

    socket.on(socketEvents.ERROR, function (data) {
        var $client = getClient(data.id);
        setState($client, data.state ? 'on' : 'off');
    });

    $(document.body)
        .on('click', '.js-settings', function (event) {
            window.showSettings = !window.showSettings;
            makeHTML(clientPool);
            toggleShowSettings();
            showClients();
        })
        .on('click', '.js-add-group', function (event) {

            $waiting.toggleClass('active', true);
            socket.emit(socketEvents.GROUP_ADD);
        })
        .on('click', '.js-group-settings', function (event) {
            $($(this).data('target')).collapse('toggle');
            $(this).toggleClass('active');
        })
        .on('click', '.js-add-schedule', function (event) {
            var $inputGroup = $(this).parents('.input-group').first();
            var $inputGroupClone = $inputGroup.clone(true);
            $inputGroupClone
                .find('.js-add-schedule').toggleClass('js-add-schedule js-remove-schedule')
                .find('i').toggleClass('fa-plus fa-minus');
            $inputGroup.before($inputGroupClone);
        })
        .on('click', '.js-remove-schedule', function (event) {
            $(this).parents('.input-group').first().remove();
        })
        .on('submit', '.js-form-settings', function (event) {
            event.preventDefault();
            event.stopPropagation();

            var $clients = $(event.target).parents('.clients').first().find('.client');
            var panicUrl,
                submitValues = {
                    id: null,
                    panicUrl: null,
                    schedules: {
                        on: [],
                        off: []
                    }
                };

            $(this).serializeArray().forEach(function (item) {
                if (item.value.trim().length > 0) {

                    switch (item.name) {
                        case 'id':
                            submitValues.id = item.value;
                            break;
                        case 'panicUrl':
                            panicUrl = item.panicUrl;
                            break;
                        case 'on':
                            submitValues.schedules.on.push(item.value);
                            break;
                        case 'off':
                            submitValues.schedules.off.push(item.value);
                            break;
                    }
                }
            });

            $clients.each(function ($client) {
                var data = {id: $client.data('id')};
                data['panicUrl'] = panicUrl;
                socket.emit(socketEvents.CLIENT_CHANGEPANICURL, data);
            });

            socket.emit(socketEvents.GROUP_CHANGESCHEDULES, submitValues);
        })
        .on('click', '[data-action]', function (event) {
            event.preventDefault();
            event.stopPropagation();

            var $this = $(this);
            var $client = getClientFromAction($this);
            var $clientState = $client.find('.client-state');

            if ($clientState.hasClass(clientState.PENDING)) {
                return;
            }

            switch ($this.data('action')) {
                case 'switch':
                    socket.emit(socketEvents.CLIENT_SWITCH, {
                        id: $client.attr('client'),
                        state: $clientState.hasClass(clientState.OFF)
                    });
                    break;
                case 'switch-all':
                    $(event.target).findGroup().find('.client').not('[disabled]').each(function (client) {
                        var id = $(this).attr('client');
                        socket.emit(socketEvents.CLIENT_SWITCH, {
                            id: id,
                            state: $this.data('type') == 'on'
                        });
                    });
                    break;
                case 'switch-panic':
                    $(event.target).parents('.clients').first().find('.client').each(function (client) {
                        var id = $(this).attr('client');
                        console.debug($this, this);
                        socket.emit(socketEvents.CLIENT_CHANGEPANICSTATE, {
                            id: id,
                            panicState: $this.data('type') == 'off'
                        });
                    });
                    break;
            }

            $this.blur();

        })
        .on('focus blur keyup', '.form-control', function (event) {
            var self = this;
            var $this = $(this);
            var value = this.value;
            var emit = function (eventName, data) {
                eventName = eventName || $this.data('event');
                data = (typeof data === 'undefined') ? {} : data;
                data = $.extend(data, {id: $this.data('id')});
                data[self.name] = value;
            };

            if (event.type == 'keyup') {
                if (event.keyCode == 13) {
                    $this.blur();
                }

            } else if (event.type == 'focusin') {
                $this.data('value', this.value);
            } else {
                if ($this.data('value') == this.value) {
                    $this.data('value', '');
                    return;
                }

                if (this.type == 'url') {
                    var isValideUrl = validate.url(value);
                    $this.toggleClass('has-error', !isValideUrl);
                    if (!isValideUrl) {
                        alert("Please enter valid URL!");
                        $this.focus();
                        return;
                    }
                }

                if ($this.attr('type') == 'cron') {
                    if (!validate.cron(value)) {
                        alert("Please enter valid Schedule!");
                        $this.focus();
                        return;
                    }
                }

                $this.addClass('has-changed');

                if ($this.data('event') == 'client:changeurl-all') {
                    $(event.target).findGroup().find('input[data-event="' + socketEvents.CLIENT_CHANGEURL + '"]').each(function () {
                        this.value = value;
                        $(this).trigger('blur');
                    });

                    $(event.target).findGroup().find('.js-button-changeurl-all').trigger('click');

                } else {
                    emit();
                }
            }
        })
        .on('show.bs.collapse hidden.bs.collapse', function (event) {
            $(event.target).parents('.clients').first().find('.js-button-changeurl-all').filter('[data-target="#' + event.target.id + '"]').toggleClass('active', event.type == 'show');
        });

    /* drap and drop */

    var dragDrop = require('./lib/dragdrop');
    dragDrop.on(dragDrop.CLIENT_MOVED, function (client, group) {
        socket.emit(socketEvents.CLIENT_MOVED, {
            id: $(client).attr('client'),
            group: $(group).attr('group')
        });
    })

});
