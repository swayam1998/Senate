import React from 'react';
import { AppBar, Grid, Typography, Container } from '@material-ui/core';
import { VideoPlayer, SideBar } from './components';
import PeerProvider from './context/PeerContext';

function App() {
    return (
        <PeerProvider>
            <AppBar position="static" style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div>
                        <Typography variant='h2'>Senate</Typography>
                    </div>
                    <div>
                        <Typography>Every Voice Heard</Typography>
                    </div>
                </div>
            </AppBar>
            <Container maxWidth="xl">
                <Grid direction="column" xs={12} style={{ height:'100vh', }}>
                    <div style={{ borderWidth:1, borderColor:'black'}}>
                        <Grid  style={{ }}>
                            <VideoPlayer />
                        </Grid>
                        <Grid justifyContent='flex-end' style={{  }}>
                            <SideBar>
                                {/* <Notifications/> */}
                            </SideBar>
                        </Grid>
                    </div>
                </Grid>
            </Container>
        </PeerProvider>
    )
}

export default App
