global.jQuery = require('jquery');
var $ = jQuery;

require('bootstrap/js/transition');
require('bootstrap/js/collapse');
require('bootstrap/js/modal');

var full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
global.socket = require('socket.io-client')(full);

var socketEvents = require('../../lib/socketEvents');

var clientState = {
    PENDING: 'client-state-pending active',
    ON: 'client-state-on',
    OFF: 'client-state-off',
    ERROR: 'client-state-error',
    UNDEFINED: 'client-state-undefined disabled'
};

function getClient(str) {
    return $('[client="' + str + '"]');
}

function getClientFromAction($action) {
    return $action.parents('.client').first();
}

function clientIsPending($client) {
    return $client.find('.client-state').hasClass(clientState.PENDING);
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

function makeList(clientPool) {
    var list = '';
    clientPool.forEach(function (client) {

        var state = client.state == undefined ? 'undefined' : client.state ? 'on' : 'off';
        list += '<li class="clients-list-item client" client="' + client.id + '"><a data-action="switch" href="" class="client-state ' + clientState[(state + '').toUpperCase()] + ' btn"><i class="fa fa-3x fa-fw fa-power-off"></i></a><span><input class="form-control client-title js-client-title" name="title" data-event="' + socketEvents.CLIENT_CHANGETITLE + '" type="text" value="' + client.title + '" /><input type="text" class="form-control client-url js-client-url" data-event="' + socketEvents.CLIENT_CHANGEURL + '" name="url" value="' + client.url + '" /></span><span class="client-id">' + client.id + '</span></li>'
    });

    $('.js-clients').empty().append(list);
}


$(function () {
    var $waiting = $('.clients-waiting');

    socket.on('connect', function () {
        socket.emit(socketEvents.CLIENTS_GET);
    });

    socket.on('disconnect', function () {
        $waiting.toggleClass('active', true);
    });

    //socket.on('reconnect_attempt', function () {
    //    console.debug('socket reconnect_attempt');
    //});
    //
    //socket.on('reconnecting', function () {
    //    console.debug('socket reconnecting');
    //});

    socket.on(socketEvents.CLIENTS_LIST, function (clients) {
        $waiting.toggleClass('active', clients.length <= 0);
        if (!clients.length) {
            // polling clients
            setTimeout(function () {
                socket.emit(socketEvents.CLIENTS_GET);
            }, 1000)
        }

        makeList(clients);
    });

    socket.on(socketEvents.CLIENT_PENDING, function (client) {
        setState(getClient(client), 'pending');
    });

    socket.on(socketEvents.CLIENT_UPDATE, function (data) {
        var $client = getClient(data.id);
        var isPending = clientIsPending($client);
        for (var k in data) {
            if (data.hasOwnProperty(k)) {
                switch (k) {
                    case 'state':
                        setState($client, data.state == undefined ? 'undefined' : data.state ? 'on' : 'off');
                        isPending = false;
                        break;
                    default:
                        var $inp = $client.find('.js-client-' + k);
                        if ($inp.length) {
                            $inp.val(data[k]);
                            isPending = false;
                        }
                }
            }
        }
        clientTogglePending($client, isPending);
    });

    socket.on(socketEvents.ERROR, function (data) {
        var $client = getClient(data.id);
        setState($client, data.state ? 'on' : 'off');
    });

    $(document.body)
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
                    $('.client').each(function (client) {
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
            var $client = getClientFromAction($this);
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

                if ($this.data('event') == 'client:changeurl-all') {
                    $(event.target).parents('.clients').first().find('input[data-event="' + socketEvents.CLIENT_CHANGEURL + '"]').each(function () {
                        this.value = value;
                        $(this).trigger('blur');
                    });

                    $(event.target).parents('.clients').first().find('.js-button-changeurl-all').trigger('click');

                } else {
                    var data = {id: $client.attr('client')};
                    data[this.name] = value;
                    socket.emit($this.data('event'), data);
                }

            }


        })
        .on('show.bs.collapse hidden.bs.collapse', function (event) {
            $(event.target).parents('.clients').first().find('.js-button-changeurl-all').filter('[data-target="#' + event.target.id + '"]').toggleClass('active', event.type == 'show');
        });


});
