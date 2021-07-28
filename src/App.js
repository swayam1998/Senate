import React from 'react';
import { AppBar, Grid, Typography, Container } from '@material-ui/core';
import { VideoPlayer, SideBar, Notifications } from './components';
import PeerProvider from './context/PeerContext';

function App() {
    return (
        <PeerProvider>
            <Container maxWidth="xl" >
                <Grid item>
                    <AppBar position="static" style={{ display: 'flex', justifyContent: 'center', borderRadius: 15, }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <div>
                                <Typography variant='h2'>Senate</Typography>
                            </div>
                            <div>
                                <Typography>Every Voice Heard</Typography>
                            </div>
                        </div>
                    </AppBar>
                </Grid>
                <Grid item style={{ margin: 10, display: 'flex', justifyContent: 'center'}}>
                    <VideoPlayer/>
                </Grid>
                <Grid item style={{ margin: 10, display: 'flex', justifyContent: 'center' }}>
                    <SideBar>
                        {/* <Notifications/> */}
                    </SideBar>
                </Grid>
            </Container>
        </PeerProvider>
    )
}

export default App
