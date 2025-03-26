import React from 'react';
import Road from './components/Road';
import './App.css';

function App() {
    return (
        <div className='app'>
            <h1>Симуляция дорожного движения</h1>
            <Road />
        </div>
    );
}

export default App;
