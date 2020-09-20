import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App';
import { AppState } from './states/AppState';

const appState = new AppState();

ReactDOM.render(
  <React.StrictMode>
    <App state={appState} />
  </React.StrictMode>,
  document.getElementById('root')
);