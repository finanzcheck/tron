import React, {Component} from 'react';

export default class InputText extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            isInput: false,
            hasUpdate: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
            hasUpdate: false
        });
    }

    handleChange(event) {
        //console.log(event);
    }

    handleBlur(event) {
        let value = React.findDOMNode(this.refs.inputText).value;
        this.setState({
            isInput: false,
            hasUpdate: true
        })
    }

    onClick(event) {
        this.setState({
            isInput: true
        }, ()=> {
            let domEle = React.findDOMNode(this.refs.inputText);
            domEle.focus();
            domEle.readOnly = false;
        })
    }

    render() {
        if (this.state.isInput) {
            return <input
                ref="inputText"
                type="text"
                className={'form-control ' + this.props.className }
                defaultValue={this.state.value}
                onChange={this.handleChange.bind(this)}
                onBlur={this.handleBlur.bind(this)}
                />
        }

        return <span
            className={this.props.className}
            style={{display:'block'}}
            onClick={this.onClick.bind(this)}
            >{this.state.value}
        </span>
    }
}
