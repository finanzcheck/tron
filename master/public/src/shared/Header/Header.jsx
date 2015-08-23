import React, {Component} from 'react';

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
        return <header className={this.classNames()}>
            <div className="heading">
                <h1 className="headline pull-left">{this.props.title}</h1>

                <div className="pull-right">{this.props.children}</div>
            </div>
        </header>;
    }
}

Header.defaultProps = {
    classNames: []
};
