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

const Audio = ({ stream, muted }) => {
    const ref = useRef();

    useEffect(() => {
        ref.current.srcObject = stream;
    }, [stream]);

    return (
        <video
            playsInline
            ref={ref}
            muted={muted}
            controls
            autoPlay
        />
    );
};

const AudioPlayer = () => {
    const {
        setIsConnected,
        localStream,
        remoteStreams
    } = usePeer();

    return (
        <Grid item container justify='center' >
            <Grid item xs={6} sm={3}>
                <Audio
                    stream={localStream}
                    muted={true}
                // height={200}
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
    )
}

export default AudioPlayer
