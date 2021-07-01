import React from 'react';
import { Grid, Paper, Typography } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const VideoPlayer = () => {
    const { callerVideo, calleeVideo } = usePeer();
    return (
        <Grid container style={{ justifyContent: 'center' }}>
            <Paper style={{ padding: 10, margin: 10 }}>
                <Grid>
                    <Typography>Caller</Typography>
                    <video playsInline muted ref={callerVideo} autoPlay style={{ width: 500}} />
                </Grid>
            </Paper>
            <Paper style={{ padding: 10, margin: 10 }}>
                <Grid>
                    <Typography>Calleee</Typography>
                    <video playsInline muted ref={calleeVideo} autoPlay style={{ width: 500 }} />
                </Grid>
            </Paper>
        </Grid>
    )
}

export default VideoPlayer
