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
        let props = {
             onClick: this.onSwitchOff.bind(this)
        };
        if(!this.props.isActive){
            props['disabled']= true
        }
        return <div className="btn-group">
            <button type="button" {...props} data-type="off" className="btn btn-lg btn-size client-state-off"><i className="fa fa-lg fa-fw fa-power-off"></i></button>
            <button type="button" {...props} data-type="on" className="btn btn-lg btn-size client-state-on"><i className="fa fa-lg fa-fw fa-power-off"></i></button>
        </div>;
    }
}
