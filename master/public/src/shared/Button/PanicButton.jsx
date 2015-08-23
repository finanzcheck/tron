import React, {Component} from 'react';

export default class ButtonSwitch extends Component {
    constructor(props) {
        super(props);
    }

    onChangedState(event) {
        event.preventDefault();
        this.props.onChangedState(!this.props.panicState);
    }

    /**
     *
     * @returns {XML}
     */
    render() {
        console.log(this.props.panicState);

        return <button type="button" data-type={(this.props.panicState) ? 'on' : 'off'} className={'btn btn-lg btn-default btn-size panic-state' + ((this.props.panicState) ? ' active' : '')} onClick={this.onChangedState.bind(this)}><i className="fa fa-lg fa-fw fa-exclamation-triangle"></i></button>;
    }
}
