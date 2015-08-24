import React, {Component} from 'react';
import Socket from '../shared/Socket.js';
import InputText from '../Form/InputText.jsx';

const STATE_UNKNON = 'client-state client-state-undefined disabled btn';
const STATE_OFF = 'client-state client-state-off btn';
const STATE_ON = 'client-state client-state-on btn';
const STATE_PENDING = 'client-state client-state-pending btn active';

const STATE = [
    STATE_UNKNON, STATE_OFF, STATE_ON, STATE_PENDING
];

export default class Client extends Component {
    constructor(props) {
        super(props);

        this.state = {
            client: !props.up ? STATE_UNKNON : props.state ? STATE_ON : STATE_OFF
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            client: !nextProps.up ? STATE_UNKNON : nextProps.state ? STATE_ON : STATE_OFF
        });
    }

    onChangeState(event) {
        event.preventDefault();

        this.setState({
            client: STATE_PENDING
        });

        Socket.emitSwitchClient(this.props, !this.props.state);
    }

    render() {
        return <section className="client clients-list-item">
            <a href="#" onClick={this.onChangeState.bind(this)} className={this.state.client}>
                <i className="fa fa-3x fa-fw fa-power-off"></i>
            </a>
            <span>
                <InputText className="client-title" value={this.props.title} />

                <span className="client-url">{this.props.url}</span>
            </span>
            <span className="client-id">{this.props.id}</span>
        </section>;
    }
}
