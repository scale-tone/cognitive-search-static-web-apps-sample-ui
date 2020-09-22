import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App';
import { AppState } from './states/AppState';

ReactDOM.render(
    <React.StrictMode>
        <App state={new AppState()} />
    </React.StrictMode>,
    document.getElementById('root')
);