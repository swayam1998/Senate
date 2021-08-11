import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';
import { Home, Senate } from './components';
import PeerProvider from './context/PeerContext';
import Navbar from './components/Navbar';

function App() {
    return (
        <PeerProvider>
            <BrowserRouter>
                <CssBaseline />
                <Navbar />
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/senates/:senateId" exact component={Senate}/>
                </Switch>
            </BrowserRouter>
        </PeerProvider>
    )
}

export default App
