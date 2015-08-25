import React, {Component} from 'react';
import InputText from './InputText.jsx';

export default class InputUrl extends InputText {

    /**
     *
     * @param value
     */
    validate(value) {
        super.validate(value);
        if(value.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/) == null){
            throw Error('The URL is not valid');
        }
    }
}


InputUrl.defaultProps = {
    type: 'url',
    placeholder: 'Please insert Url'
};

