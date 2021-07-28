import React, { useEffect, useRef, useState } from 'react';
import { Grid, Paper, Typography } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const Video = ({ stream, muted }) => {
    const ref = useRef();

    useEffect(() => {
        ref.current.srcObject = stream;
    }, [stream]);

    return (
        <video playsInline ref={ref} muted={muted} autoPlay style={{ width: 500 }} />
    );
};

const VideoPlayer = () => {
    const { localStream, remoteStreams } = usePeer();
    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current += 1;
        console.log(renderCount.current);
    });

    return (
        <Grid container style={{ justifyContent: 'center' }}>
            <Paper style={{ padding: 10, margin: 10 }}>
                <Grid>
                    <Typography>Caller</Typography>
                    <Video stream={localStream} muted={true} />
                </Grid>
            </Paper>
            { 
                remoteStreams.map((stream, index) => {
                    if(stream.active)
                        return (
                            <Paper key={index} style={{ padding: 10, margin: 10 }}>
                                <Grid>
                                    <Typography>Callee: {index+1}</Typography>
                                    <Video stream={stream} muted={false} />
                                </Grid>
                            </Paper>
                        )
                    else return null;
                })
            }
        </Grid>
    )
}

export default VideoPlayer
