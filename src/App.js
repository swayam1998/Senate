import React from 'react';
import { AppBar, Grid, Typography, Container, CssBaseline } from '@material-ui/core';
import { VideoPlayer, SideBar } from './components';
import PeerProvider from './context/PeerContext';
import Navbar from './components/Navbar';

function App() {
    return (
        <PeerProvider>
            <CssBaseline />
            <Navbar />
            <main>
                <div>
                    <Container maxWidth="xl">
                        <Grid 
                            container 
                            direction="column" 
                            align='center'
                            style={{ height: '80vh' }}
                            wrap='nowrap'
                            justify='center'
                        >
                            <Grid item container>
                                <VideoPlayer />
                            </Grid>
                            <Grid item >
                                <SideBar/>
                            </Grid>
                        </Grid>
                    </Container>
                </div>
            </main>
        </PeerProvider>
    )
}

export default App
