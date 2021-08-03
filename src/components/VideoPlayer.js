import React, { useEffect, useRef, useState} from 'react';
import { usePeer } from '../context/PeerContext';


import { Grid, Paper, Typography, IconButton, Button } from '@material-ui/core';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndRoundedIcon from '@material-ui/icons/CallEndRounded';

const Video = ({ stream, muted, width, height }) => {
    const ref = useRef();

    useEffect(() => {
        ref.current.srcObject = stream;
    }, [stream]);

    return (
        <video 
            playsInline 
            ref={ref} 
            muted={muted} 
            width={width} 
            height={height} 
            autoPlay  
        />
    );
};

const VideoPlayer = () => {
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [selectedStream, setSelectedStream] = useState(null);
    
    const { inSenate, setIsConnected, localStream, remoteStreams, toggleUserVideo, toggleUserAudio } = usePeer();

    const handleVideoToggle = () => {
        toggleUserVideo();

        setVideoEnabled(prev => !prev);
    };

    const handleAudioToggle = () => {
        toggleUserAudio();

        setAudioEnabled(prev => !prev);
    };

    const hangup = () => {
        setIsConnected(false);
        window.location.reload();
    }
    
    return (
        <Grid style={{ display: 'flex', margin: 10, flexDirection: 'column' }}>
            <Grid style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button onClick={() => setSelectedStream(localStream)}>
                    <Video 
                        stream={localStream} 
                        muted={true}
                        width="300px"
                        height="300px"                                    
                    />
                </Button>
                { 
                    remoteStreams.map((stream, index) => {
                        if(stream.active)
                            return (
                                <Button onClick={() => setSelectedStream(stream)}>
                                    <Video stream={stream} muted={false} />
                                </Button>
                            )
                        else return null
                    })
                }
            </Grid>

            {inSenate && (
            <Grid container style={{ justifyContent: 'center' }}>
                <Paper 
                    style={{
                        display: 'flex', 
                        flexDirection: 'row', 
                        justifyContent: 'center',
                        paddingHorizontal: 10,
                        borderRadius:20,
                    }}
                    elevation={5}
                >
                    <IconButton onClick={() => handleVideoToggle()}>
                        { videoEnabled ? <VideocamIcon color="primary"/> : <VideocamOffIcon color="secondary"/> }
                    </IconButton>
                    <IconButton onClick={() => handleAudioToggle()}>
                        { audioEnabled ? <MicIcon color="primary"/> : <MicOffIcon color="secondary"/> }
                    </IconButton>
                    <IconButton onClick={hangup}>
                        { <CallEndRoundedIcon color="secondary"  />}
                    </IconButton>
                </Paper>
            </Grid>
            )}
        </Grid>
    )
}

export default VideoPlayer
