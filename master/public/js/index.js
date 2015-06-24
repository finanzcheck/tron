var ClientPool = require('../../lib/clientPool');

global.jQuery = require('jquery');
var $ = jQuery;

var full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
global.socket = require('socket.io-client')(full);

var socketEvents = require('../../lib/socketEvents');
var clientPool;

var clientState = {
    PENDING: 'client-state-pending',
    ON: 'client-state-on',
    OFF: 'client-state-off'
};

function getClientFromAction($action) {
    return $action.parents('.client').first();
}

function setState($client, state) {
    console.debug($client, clientState[state.toUpperCase()], state);
    return $client.find('.client-state').removeClass([clientState.PENDING, clientState.OFF, clientState.ON].join(' ')).addClass(clientState[state.toUpperCase()]);
}

function makeList(_clientPool) {
    var list = '';
    _clientPool.forEach(function (client) {
        list += '<li class="clients-list-item client" id="' + client.id + '"><a data-action="switch" href="" class="client-state fa fa-2x fa-fw"></a><span><b>' + client.id + '</b><a href="" data-action="url">' + client.url + '</a></span></li>'
    });

    $('.js-clients').append(list);
}


$(function () {
    if (!clientPool) {
        socket.emit(socketEvents.CLIENTS_GET);
    }

    socket.on(socketEvents.CLIENTS_LIST, function (clients) {
        clientPool = ClientPool.fromArray($.makeArray(clients));
        makeList(clientPool);
    });

    socket.on(socketEvents.CLIENT_PENDING, function (client) {
        console.debug('is-pending');
        setState($('#' + client), 'pending');
    });

    socket.on(socketEvents.CLIENT_UPDATE, function (data) {
        console.debug(data);
        var $client = $('#' + data.id);
        setState($client, data.state ? 'on' : 'off');
    });

    $('.clients').on('click', '[data-action]', function (event) {
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
                console.debug($client[0].id, $clientState.hasClass(clientState.OFF));
                socket.emit(socketEvents.CLIENT_SWITCH, {
                    client: $client[0].id,
                    state: $clientState.hasClass(clientState.OFF)
                });
                break;
        }

    })


});
