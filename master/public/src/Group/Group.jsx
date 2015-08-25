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

        this.state = {
            paniceState: this.updateStateFromClients(props, 'panicState'),
            buttonSwitchIsActive: this.updateStateFromClients(props, 'up')
        };

    }

    updateStateFromClients(from, which) {
        return from.clients.reduce((carry, client)=> {
            return carry || !!client[which];
        }, false)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            paniceState: this.updateStateFromClients(nextProps, 'panicState'),
            buttonSwitchIsActive: this.updateStateFromClients(nextProps, 'up')
        });
    }

    onButtonSwitchChanged(value) {
        this.props.clients.forEach((client)=> {
            Socket.emitSwitchClient(client, value);
        })
    }

    onPanicButtonChanged(value) {

        this.props.clients.forEach((client)=> {
            Socket.emitClientPanicState(client, !this.state.paniceState)
        })
    }

    handleChangedTitle(title){
        Socket.emitGroupTitle(this.props, title);
    }

    render() {

        console.debug(this.state);

        return <section className="panel panel-default clients clients-group">
            <Header title={this.props.title} onChanged={this.handleChangedTitle.bind(this)}>
                <ButtonSwitch onChangedState={this.onButtonSwitchChanged.bind(this)} isActive={this.state.buttonSwitchIsActive}/>
                <PanicButton panicState={this.state.panicState} onChangedState={this.onPanicButtonChanged.bind(this)}/>
            </Header>

            <div className="panel-body">
                {this.props.clients.map((client)=> {
                    return <Client key={client.id} {...client}/>
                })}
            </div>
        </section>
    }
}
