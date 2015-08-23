import React, {Component} from 'react';
import socket from '../shared/Socket.js';

import SocketEvents from '../shared/SocketEvents.js';
import Header from '../shared/Header/Header.jsx';
import Group from '../Group/Group.jsx';
import ButtonSwitch from '../shared/Button/ButtonSwitch.jsx';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clients: [],
            groups: [],
            connected: false
        };

        // recieve client list
        socket.on(SocketEvents.CLIENTS_LIST, (pool)=> {
            console.debug(pool);
            this.setState({
                clients: pool.clients,
                groups: pool.groups
                    .map((group)=> {
                        group.clients = pool.clients.filter((client)=> {
                            return group.id == (client.group || 'undefined');
                        });
                        return group;
                    })
                    .filter((group)=> {
                        return group.clients.length > 0;
                    })
            });
        });

        // recieve connect state
        socket.on('connect', ()=> {
            this.setState({connected: true});
            socket.emit(SocketEvents.CLIENTS_GET);
        });

        // recieve disconnect state
        socket.on('disconnect', ()=> {
            this.setState({connected: false});
        });
    }

    onButtonSwitchChanged(value) {
        this.state.clients.forEach((client)=> {
            socket.emit(SocketEvents.CLIENT_SWITCH, {
                id: client.id,
                state: value
            });
        })
    }

    render() {
        if (!this.state.connected) {
            return <div>Not connected</div>;
        } else if (this.state.connected && this.state.groups.length) {
            let groups = this.state.groups
                .map((group)=> {
                    return <Group key={group.id} {...group}/>
                });
            return <section className="clients">
                <Header title={this.props.title}>
                    <ButtonSwitch onChangedState={this.onButtonSwitchChanged.bind(this)} isActive={this.state.clients.reduce((carry, client)=> {
                        return carry || !!client.up;
                    }, false)}/>
                </Header>

                <div>{groups}</div>
            </section>;
        } else {
            return <div>Connect!</div>;
        }
    }
}
