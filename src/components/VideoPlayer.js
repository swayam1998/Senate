import React, { useEffect, useRef, useState} from 'react';
import { usePeer } from '../context/PeerContext';


import { Grid, Paper, Typography, IconButton } from '@material-ui/core';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

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
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const { localStream, remoteStreams, toggleUserVideo, toggleUserAudio } = usePeer();

    const handleVideoToggle = () => {
        toggleUserVideo();

        setVideoEnabled(prev => !prev);
    };

    const handleAudioToggle = () => {
        toggleUserAudio();

        setAudioEnabled(prev => !prev);
    };
    
    return (
        <Grid container style={{ flexDirection: 'column' }}>
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
                        else return null
                    })
                }
            </Grid>
            <Grid container style={{ justifyContent: 'center' }}>
                <Grid style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                    <IconButton onClick={() => handleVideoToggle()}>
                        { videoEnabled ? <VideocamIcon color="primary"/> : <VideocamOffIcon color="secondary"/> }
                    </IconButton>
                    <IconButton onClick={() => handleAudioToggle()}>
                        { audioEnabled ? <MicIcon color="primary"/> : <MicOffIcon color="secondary"/> }
                    </IconButton>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default VideoPlayer
