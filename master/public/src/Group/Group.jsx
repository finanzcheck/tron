import React, {Component} from 'react';

import Socket from '../shared/Socket.js';
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
            Socket.emitSwitchClient(client, value);
        })
    }

    onPanicButtonChanged(value) {
        this.props.clients.forEach((client)=> {
            Socket.emitChangeClientPanicState(client, !this.state.paniceState)
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
