import React, { useEffect, useRef } from 'react';
import { Grid, Paper, Typography } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const Video = ({ stream }) => {
    const ref = useRef();

    useEffect(() => {
        ref.current.srcObject = stream;
    }, [stream]);

    return (
        <video playsInline muted ref={ref} autoPlay style={{ width: 500 }} />
    );
};

const VideoPlayer = () => {
    const { localStreams, remoteStreams } = usePeer();

    useEffect(() => {
        console.log("localStreams:", localStreams);
        console.log("remoteStreams:", remoteStreams);

    }, [localStreams, remoteStreams])

    return (
        <Grid container style={{ justifyContent: 'center' }}>
            <Paper style={{ padding: 10, margin: 10 }}>
                <Grid>
                    <Typography>Caller</Typography>
                    <Video stream={localStreams[0]} />
                    {/* <video playsInline muted ref={ localVideo }  autoPlay style={{ width: 500}} /> */}
                </Grid>
            </Paper>
            { 
                remoteStreams.map((stream, index) => (
                    <Paper key={index} style={{ padding: 10, margin: 10 }}>
                        <Grid>
                            <Video stream={stream} />
                        </Grid>
                    </Paper>
                ))
            }
        </Grid>
    )
}

export default VideoPlayer
