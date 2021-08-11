import React, { useEffect, useRef, useState } from 'react';
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
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndRoundedIcon from '@material-ui/icons/CallEndRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const Audio = ({ stream, muted }) => {
    const ref = useRef();

    useEffect(() => {
        ref.current.srcObject = stream;
    }, [stream]);

    return (
        <Audio
            ref={ref}
            muted={muted}
            controls
            autoPlay
        />
    );
};

const AudioPlayer = () => {
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [mediaDevices, setMediaDevices] = useState([]);
    const [currentMediaSource, setCurrentMediaSource] = useState({ audio: ''});
    const [newMediaSource, setNewMediaSource] = useState({ audio: '' });
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    
    const {
        setIsConnected,
        localStream,
        remoteStreams,
        toggleUserAudio,
        switchLocalMediaDevice
    } = usePeer();

    const getUserMediaDevices = async () => {
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
        if (localStream) {
            localStream.getTracks().forEach(track => {
                if (track.kind === 'audio') {
                    setCurrentMediaSource(prev => ({ ...prev, audio: track.getSettings().deviceId }));
                }
            })
        }
    }, [localStream])

    const hangup = () => {
        setIsConnected(false);
        window.location.reload();
    };

    const handleAudioToggle = () => {
        toggleUserAudio();

        setAudioEnabled(prev => !prev);
    };

    const handleMediaSwitch = () => {
        const newMediaSourceIds = { audioId: null, videoId: null };
        if (currentMediaSource.audio !== newMediaSource.audio && newMediaSource.audio !== '') {
            newMediaSourceIds.audioId = newMediaSource.audio;
        }

        switchLocalMediaDevice(newMediaSourceIds);
        setSettingsDialogOpen(false);
    };

    return (
        <Grid item container direction='column' style={{ height: '80vh' }} wrap='nowrap'>
            <Grid item container justify='center' >
                <Grid item xs={6} sm={3}>
                    <Audio
                        stream={localStream}
                        muted={true}
                    />
                </Grid>
                {
                    remoteStreams.map((stream, index) => {
                        if (stream.active)
                            return (
                                <Grid key={index} item xs={6} sm={3}>
                                    <Audio
                                        stream={stream}
                                        muted={false}
                                    />
                                </Grid>
                            )
                        else return null
                    })
                }
            </Grid>
            <Grid item xs></Grid>
            <Grid item container justify='center' >
                {/* <Grid item xs></Grid> */}
                <Grid item >
                    <Paper
                        style={{
                            paddingHorizontal: 10,
                            borderRadius: 20,
                        }}
                        elevation={5}
                    >
                        <IconButton onClick={() => handleAudioToggle()}>
                            {audioEnabled ? <MicIcon color="primary" /> : <MicOffIcon color="secondary" />}
                        </IconButton>
                        <IconButton onClick={hangup}>
                            {<CallEndRoundedIcon color="secondary" />}
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
                <DialogActions>
                    <Button variant="contained" onClick={() => { handleMediaSwitch() }} color="primary">
                        Save
                    </Button>
                    <Button variant="contained" onClick={() => { setNewMediaSource({ audio: '' }); setSettingsDialogOpen(false); }} color="secondary" autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default AudioPlayer
