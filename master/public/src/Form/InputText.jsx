import React, {Component} from 'react';
import Empty from '../shared/Empty.jsx';

export default class InputText extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: (typeof props.value === 'string') ? props.value : '',
            isInput: false,
            isPending: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
            isPending: false
        });
    }

    handleValidation(value) {
        try {
            this.validate(value);
            this.setState({
                error: false
            })
        } catch (ex) {
            this.setState({
                error: ex.message
            });
            throw ex;
        }
    }

    /**
     *
     * @param value
     * @returns {boolean}
     * @throws Error
     */
    validate(value) {
        if (value == '') {
            throw Error('Field can\'t be empty');
        }
        return true;
    }

    /**
     *
     * @returns {string}
     */
    getClassNames(...classes) {
        let classNames = [this.props.className, 'can-pending'].concat(classes);
        if (this.state.isPending) {
            classNames.push('is-pending');
        }

        return classNames.join(' ');
    }

    handleBlur(event) {
        let domEle = React.findDOMNode(this.refs.inputText);
        let value = domEle.value;
        let isPending = this.state.value !== value;

        try {
            this.handleValidation(value);
            this.setState({
                isInput: false,
                value: value,
                isPending: isPending
            });
            if (isPending) {
                this.props.onChanged(value);
            }
        } catch (ex) {
            domEle.focus();
        }
    }

    handleClick(event) {
        if (!this.state.isPending) {
            this.setState({
                isInput: true
            }, ()=> {
                let domEle = React.findDOMNode(this.refs.inputText);
                domEle.focus();
                domEle.readOnly = false;
            })
        }
    }

    handleKeyup(event) {
        let domEle = React.findDOMNode(this.refs.inputText);
        if (event.keyCode == 13) {
            domEle.blur();
        } else if (event.keyCode == 27) {
            domEle.value = this.state.value;
            domEle.blur();
        } else {

            try {
                this.handleValidation(domEle.value);
            } catch (ex) {

            }
        }
    }

    render() {
        if (this.state.isInput) {
            let inputError = Empty;
            let hasError = this.state.error && this.state.error != '';
            if (this.state.error && this.state.error != '') {
                inputError = <label>{this.state.error}</label>
            }

            return <span className={this.getClassNames('form-group', (hasError)? 'has-error' : '')}>
                <input
                    ref="inputText"
                    type={this.props.type}
                    className="form-control"
                    defaultValue={this.state.value}
                    onBlur={this.handleBlur.bind(this)}
                    onKeyUp={this.handleKeyup.bind(this)}
                    />{inputError}
            </span>
        }

        let value = (typeof this.state.value === 'string' && this.state.value !== '') ? this.state.value : <em>{this.props.placeholder}</em>;

        return <span
            className={this.getClassNames()}
            style={{display:'block'}}
            onClick={this.handleClick.bind(this)}
            >{value}
        </span>
    }
}


InputText.defaultProps = {
    type: 'text',
    placeholder: 'Please insert Text'
};

