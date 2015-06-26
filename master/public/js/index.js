var ClientPool = require('../../lib/clientPool');

global.jQuery = require('jquery');
var $ = jQuery;

var full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
global.socket = require('socket.io-client')(full);

var socketEvents = require('../../lib/socketEvents');
var clientPool;

var clientState = {
    PENDING: 'client-state-pending active',
    ON: 'client-state-on',
    OFF: 'client-state-off'
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

function setState($client, state) {
    var $state = $client.find('.client-state'),
        $formControl = $client.find('.form-control');
    if (state.toUpperCase() === 'PENDING') {

        $formControl.prop('disabled', true);

        return $state.addClass(clientState[state.toUpperCase()])

    }

    $formControl.prop('disabled', false);

    return $state.removeClass([clientState.PENDING, clientState.OFF, clientState.ON].join(' ')).addClass(clientState[state.toUpperCase()]);
}

function makeList(_clientPool) {
    var list = '';
    _clientPool.forEach(function (client) {
        list += '<li class="clients-list-item client" client="' + client.id + '"><a data-action="switch" href="" class="client-state btn"><i class="fa fa-3x fa-fw fa-power-off"></i></a><span><input class="form-control client-title" name="title" data-event="' + socketEvents.CLIENT_CHANGETITLE + '" type="text" value="' + client.id + '" /><input type="text" class="form-control client-url" data-event="' + socketEvents.CLIENT_CHANGEURL + '" name="url" value="' + client.url + '" /></span></li>'
    });

    $('.js-clients').append(list);
}


$(function () {
    if (!clientPool) {
        socket.emit(socketEvents.CLIENTS_GET);
    }

    socket.on(socketEvents.CLIENTS_LIST, function (clients) {
        clientPool = ClientPool.fromArray(clients);
        makeList(clientPool);
    });

    socket.on(socketEvents.CLIENT_PENDING, function (client) {
        setState(getClient(client), 'pending');
    });

    socket.on(socketEvents.CLIENT_UPDATE, function (data) {
        console.debug(arguments);

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
                        client: $client.attr('client'),
                        state: $clientState.hasClass(clientState.OFF)
                    });
                    break;
                case 'switch-all':
                    $('.client').each(function (client) {
                        var id = $(this).attr('client');
                        socket.emit(socketEvents.CLIENT_SWITCH, {
                            client: id,
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
                socket.emit($this.data('event'), {
                    client: $client.attr('client'),
                    url: value
                });

            }


        })


});
