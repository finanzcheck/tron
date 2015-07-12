global.jQuery = require('jquery');
var $ = jQuery;

require('bootstrap/js/transition');
require('bootstrap/js/collapse');


var full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
global.socket = require('socket.io-client')(full);

var socketEvents = require('../../lib/socketEvents');

var clientState = require('./lib/clientState');
var Group = require('./model/group');

var showSettings = true;
var clientPool;


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
    var groupView = require('./views/group');

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
            settings: showSettings,
            editable: !showSettings,
            groups: groups,
            up: groups.reduce(function (carry, group) {
                return carry || !!group.up;
            }, false)
        })
        ;

    $('.js-clients').empty().append(html);
}

function showClients() {
    var show = location.hash.indexOf('clients') > -1;
    $('.js-groups')
        .toggleClass('visible', show)
        .toggleClass('hidden', !show);
}


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
            showSettings = !showSettings;
            makeHTML(clientPool);
            showClients();
        })
        .on('click', '[data-action]', function (event) {
            if (!showSettings) {
                return;
            }
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
                    $(event.target).parents('.clients').first().find('.client').not('[disabled]').each(function (client) {
                        var id = $(this).attr('client');
                        socket.emit(socketEvents.CLIENT_SWITCH, {
                            id: id,
                            state: $this.data('type') == 'on'
                        });
                    });
                    break;
            }

            $this.blur();

        })
        .on('focus blur keyup', '.form-control', function (event) {
            var $this = $(this);
            var value = this.value;

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
                    var isValideUrl = value.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/) !== null;
                    $this.toggleClass('has-error', !isValideUrl);
                    if (!isValideUrl) {
                        alert("Please enter valid URL!");
                        $this.focus();
                        return;
                    }
                }

                $this.addClass('has-changed');

                if ($this.data('event') == 'client:changeurl-all') {
                    $(event.target).parents('.clients').first().find('input[data-event="' + socketEvents.CLIENT_CHANGEURL + '"]').each(function () {
                        this.value = value;
                        $(this).trigger('blur');
                    });

                    $(event.target).parents('.clients').first().find('.js-button-changeurl-all').trigger('click');

                } else {
                    var data = {id: $this.data('id')};
                    data[this.name] = value;
                    socket.emit($this.data('event'), data);
                }

            }

        })
        .on('show.bs.collapse hidden.bs.collapse', function (event) {
            $(event.target).parents('.clients').first().find('.js-button-changeurl-all').filter('[data-target="#' + event.target.id + '"]').toggleClass('active', event.type == 'show');
        });
});
