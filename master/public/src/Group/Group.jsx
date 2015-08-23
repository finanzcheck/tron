import React, {Component} from 'react';

import socket from '../shared/Socket.js';
import SocketEvents from '../shared/SocketEvents.js';

import Header from './GroupHeader.jsx';
import Client from '../Client/Client.jsx';
import ButtonSwitch from '../shared/Button/ButtonSwitch.jsx';
import PanicButton from '../shared/Button/PanicButton.jsx';

export default class Group extends Component {
    constructor(props) {
        super(props);
    }

    onButtonSwitchChanged(value) {
        this.props.clients.forEach((client)=> {
            socket.emit(SocketEvents.CLIENT_SWITCH, {
                id: client.id,
                state: value
            });
        })
    }

    onPanicButtonChanged(value) {
        this.props.clients.forEach((client)=> {
            socket.emit(SocketEvents.CLIENT_CHANGEPANICSTATE, {
                id: client.id,
                panicState: value
            });
        })
    }

    render() {


        return <section className="panel panel-default clients clients-group">
            <Header title={this.props.title}>
                <ButtonSwitch onChangedState={this.onButtonSwitchChanged.bind(this)} isActive={this.props.clients.reduce((carry, client)=> {
                return carry || !!client.up;
            }, false)}/>
                <PanicButton panicState={this.props.panicState} onChangedState={this.onPanicButtonChanged.bind(this)}/>
            </Header>

            <div className="panel-body">
                {this.props.clients.map((client)=> {
                    return <Client key={client.id} {...client}/>
                })}
            </div>
        </section>
    }
}
