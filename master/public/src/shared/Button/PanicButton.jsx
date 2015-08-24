import React, {Component} from 'react';

export default class ButtonPanic extends Component {
    constructor(props) {
        super(props);

        this.state = {
            paniceState: !!props.panicState
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            paniceState: nextProps.panicState
        });
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

        return <button type="button" data-type={(this.state.panicState) ? 'on' : 'off'} className={'btn btn-lg btn-default btn-size panic-state' + ((this.props.panicState) ? ' active' : '')} onClick={this.onChangedState.bind(this)}><i className="fa fa-lg fa-fw fa-exclamation-triangle"></i></button>;
    }
}
