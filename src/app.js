import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';
import AppRouter from './routers/AppRouter';
import './styles/style.scss';


const jsx = (
    <AppRouter />
);

ReactDOM.render(jsx, document.getElementById('app'));
