import React, {Component} from 'react';

export default class ButtonSwitch extends Component {
    constructor(props) {
        super(props);
    }

    onPreventDefault(event) {
        event.preventDefault();
    }

    onSwitchOff(event) {
        event.preventDefault();
        this.props.onChangedState(false);
    }

    onSwitchOn(event) {
        event.preventDefault();
        this.props.onChangedState(true);
    }

    /**
     *
     * @returns {XML}
     */
    render() {
        if (!this.props.isActive) {
            return <div className="btn-group">
                <button type="button" disabled data-type="off" onClick={this.onPreventDefault.bind(this)} className="btn btn-lg btn-size client-state-off"><i className="fa fa-lg fa-fw fa-power-off"></i></button>
                <button type="button" disabled data-type="on" onClick={this.onPreventDefault.bind(this)} className="btn btn-lg btn-size client-state-on"><i className="fa fa-lg fa-fw fa-power-off"></i></button>
            </div>;
        }


        return <div className="btn-group">
            <button type="button" data-type="off" onClick={this.onSwitchOff.bind(this)} className="btn btn-lg btn-size client-state-off"><i className="fa fa-lg fa-fw fa-power-off"></i></button>
            <button type="button" data-type="on" onClick={this.onSwitchOn.bind(this)} className="btn btn-lg btn-size client-state-on"><i className="fa fa-lg fa-fw fa-power-off"></i></button>
        </div>;
    }
}
