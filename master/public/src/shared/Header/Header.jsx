import React, {Component} from 'react';
import InputText from '../../Form/InputText.jsx';

export default class Header extends Component {
    constructor(props) {
        super(props);
    }

    /**
     *
     * @returns {string}
     */
    classNames() {
        return this.props.classNames.join(' ');
    }

    /**
     *
     * @returns {XML}
     */
    render() {
        let title = this.props.title;
        if(this.props.onChanged && typeof this.props.onChanged == 'function'){
            title = <InputText value={this.props.title} onChanged={this.props.onChanged}/>
        }


        return <header className={this.classNames()}>
            <div className="heading">
                <h1 className="headline pull-left">{title}</h1>

                <div className="pull-right">{this.props.children}</div>
            </div>
        </header>;
    }
}

Header.defaultProps = {
    classNames: []
};
