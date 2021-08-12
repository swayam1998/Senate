import React, { useEffect, useRef, useState} from 'react';
import { usePeer } from '../context/PeerContext';
import { 
    Grid, 
    Paper, 
    Typography, 
    IconButton, 
    Button,
    Dialog, 
    DialogActions, 
    Select,
    MenuItem
} from '@material-ui/core';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndRoundedIcon from '@material-ui/icons/CallEndRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PresentToAllIcon from '@material-ui/icons/PresentToAll';
import { useHistory } from 'react-router-dom';

const Video = ({ stream, muted, width = '100%', height }) => {
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
            // style={{objectFit:'contain'}}
            autoPlay  
        />
    );
};

const VideoPlayer = () => {
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [selectedStream, setSelectedStream] = useState(null);
    const [mediaDevices, setMediaDevices] = useState([]);
    const [currentMediaSource, setCurrentMediaSource] = useState({ audio: '', video: '' });
    const [newMediaSource, setNewMediaSource] = useState({ audio: '', video: '' });
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    
    const {
        setInSenate,
        setIsConnected,
        localStream,
        remoteStreams, 
        toggleUserVideo, 
        toggleUserAudio,
        switchLocalMediaDevice,
        startScreenShare,
        exitSenate
    } = usePeer();
    const history = useHistory();

    const getUserMediaDevices = async() => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setMediaDevices(devices);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getUserMediaDevices();
    }, [])

    useEffect(() => {
        if(localStream){
            localStream.getTracks().forEach(track => {
                if(track.kind === 'audio'){
                    setCurrentMediaSource(prev => ({ ...prev, audio: track.getSettings().deviceId }));
                } else if (track.kind === 'video') {
                    setCurrentMediaSource(prev => ({ ...prev, video: track.getSettings().deviceId }));
                }
            })
        }
    }, [localStream])

    const handleVideoToggle = () => {
        toggleUserVideo();

        setVideoEnabled(prev => !prev);
    };

    const handleAudioToggle = () => {
        toggleUserAudio();

        setAudioEnabled(prev => !prev);
    };

    const hangup = () => {
        history.push('/');
        window.location.reload();
    };

    const handleMediaSwitch = () => {
        const newMediaSourceIds = {audioId: null, videoId: null};
        if (currentMediaSource.audio !== newMediaSource.audio && newMediaSource.audio !== '' ){
            newMediaSourceIds.audioId = newMediaSource.audio;
        }
        if (currentMediaSource.video !== newMediaSource.video && newMediaSource.video !== ''){
            newMediaSourceIds.videoId = newMediaSource.video;
        }
        switchLocalMediaDevice(newMediaSourceIds);
        setSettingsDialogOpen(false);
    };

    const handlePresentScreen = () => {
        startScreenShare();
    };
    
    return (
        <Grid item container direction='column' style={{ height: '80vh' }} wrap='nowrap'>
            {!selectedStream ? (
                <Grid item container justify='center' >
                    <Grid item xs={6} sm={3}>
                        <Button onClick={() => setSelectedStream(localStream)}>
                            <Video 
                                stream={localStream} 
                                muted={true}
                                // height={200}
                            />
                        </Button>
                    </Grid>
                    { 
                        remoteStreams.map((stream, index) => {
                            if(stream.active)
                                return (
                                    <Grid key={index} item xs={6} sm={3}>
                                        <Button  onClick={() => setSelectedStream(stream)}>
                                            <Video 
                                                stream={stream} 
                                                muted={false}
                                            />
                                        </Button>
                                    </Grid>
                                )
                            else return null
                        })
                    }
                </Grid>
            ) : (
                <Grid item container justify='center'>
                    <Grid item sm={6}>
                        <Video
                            stream={selectedStream}
                            muted={selectedStream === localStream ? true : false}
                        />
                    </Grid>
                    <Grid item sm={6} container direction='column'>
                        All streams
                    </Grid>
                </Grid>
            )}

            <Grid item xs></Grid>
            <Grid item container justify='center' >
                {/* <Grid item xs></Grid> */}
                <Grid item >
                    <Paper 
                        style={{
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
                        <IconButton onClick={() => handlePresentScreen(true)}>
                            {<PresentToAllIcon color="primary" />}
                        </IconButton>
                        <IconButton onClick={hangup}>
                            { <CallEndRoundedIcon color="secondary"  />}
                        </IconButton>
                        <IconButton onClick={() => setSettingsDialogOpen(true)}>
                            {<MoreVertIcon color="primary" />}
                        </IconButton>
                    </Paper>
                </Grid>
                {/* <Grid item xs></Grid> */}
            </Grid>
            
            <Dialog
                open={settingsDialogOpen}
                onClose={() => setSettingsDialogOpen(false)}
            >
                <Typography>Audio Source</Typography>
                <Select
                    label='Audio Source'
                    variant='outlined'
                    defaultValue={currentMediaSource.audio}
                    onChange={(event) => setNewMediaSource(prev => ({ ...prev, audio: event.target.value }))}
                >
                    {mediaDevices && mediaDevices.map((device, index) => {
                        if (device.kind === 'audioinput') {
                            return (
                                <MenuItem key={index} value={device.deviceId}>{device.label}</MenuItem >
                            )
                        } else
                            return null;
                    })}
                </Select>
                <Typography>Video Source</Typography>
                <Select
                    label='Video Source'
                    variant='outlined'
                    defaultValue={currentMediaSource.video}
                    onChange={(event) => setNewMediaSource(prev => ({ ...prev, video: event.target.value }))}
                >
                    {mediaDevices && mediaDevices.map((device, index) => {
                        if (device.kind === 'videoinput') {
                            return (
                                <MenuItem key={index} value={device.deviceId}>{device.label}</MenuItem >
                            )
                        } else
                            return null;
                    })}
                </Select>
                <DialogActions>
                    <Button variant="contained" onClick={() => { handleMediaSwitch() }} color="primary">
                        Save
                    </Button>
                    <Button variant="contained" onClick={() => { setNewMediaSource({ audio: '', video: '' }); setSettingsDialogOpen(false); }} color="secondary" autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default VideoPlayer
