import React, { useRef, useState } from 'react'
import { Button, Grid, Typography, TextField } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const SideBar = ({ children }) => {
    const { call, answer } = usePeer();
    const [callId, setCallId] = useState();
    const idToCall = useRef();
    
    const makeCall = async() => {
        setCallId(await call());
    };
    
    const answerCall = () => {
        answer(idToCall.current);
    };

    const handleIdText = (e) => {
        idToCall.current = e.target.value;
    }

    return (
        <Grid style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography gutterBottom variant="h6">Make a call</Typography>
            <Grid style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={makeCall}>
                    Call
                </Button>
                <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={console.log("hangup call")}>
                    Hangup
                </Button>
            </Grid>
            {
                callId && <Typography gutterBottom variant="h6">{callId}</Typography>
            }
            <TextField label="ID to answer" onChange={handleIdText} fullWidth />
            <Button style={{ margin: 10}} variant="contained" color="primary" fullWidth onClick={answerCall}>
                Answer
            </Button>
            {children}
        </Grid>
    )
}

export default SideBar
