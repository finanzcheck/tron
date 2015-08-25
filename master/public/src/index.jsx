import React from 'react';
import App from './App/App.jsx';

let reactElement = document.querySelector('[data-reactid]');

React.render(<App title="Clients" roles=""></App>, reactElement);
