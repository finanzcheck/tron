import React, {Component} from 'react';
import Socket from '../shared/Socket.js';

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
        Socket.receiveClientsList((pool)=> {
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
        Socket.onConnect(()=> {
            this.setState({connected: true});
            Socket.emitGetClients();
        });

        // recieve disconnect state
        Socket.onDisconnect(()=> {
            this.setState({connected: false});
        });
    }

    onButtonSwitchChanged(value) {
        this.state.clients.forEach((client)=> {
            Socket.emitSwitchClient(client, value);
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
