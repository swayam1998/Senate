import React, { useRef, useState } from 'react'
import { Button, Grid, Typography, TextField } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const SideBar = ({ children }) => {
    const { call, answer, createSenate, joinSenate, hangup } = usePeer();
    const [callId, setCallId] = useState();
    const [senateId, setSenateId] = useState();
    const joinSenateId = useRef();
    const idToCall = useRef();
    
    const makeCall = async() => {
        setCallId(await call());
    };
    
    const answerCall = () => {
        answer(idToCall.current);
    };

    const joinToSenate = () => {
        joinSenate(joinSenateId.current);
    }

    const handleSenateId = (e) => {
        joinSenateId.current = e.target.value;
    }

    const handleIdText = (e) => {
        idToCall.current = e.target.value;
    }

    const makeSenate = async() => {
        setSenateId(await createSenate());
    }

    const disconnect = () => {
        hangup();
    }

    return (
        <Grid style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography gutterBottom variant="h6">Make a call</Typography>
            <Grid style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={makeCall}>
                    Call
                </Button>
                <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={makeSenate}>
                    Create Senate
                </Button>
                <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={disconnect}>
                    Hangup
                </Button>
            </Grid>
            {
                callId && <Typography gutterBottom variant="h6">{callId}</Typography>
            }
            {
                senateId && <Typography gutterBottom variant="h6">{senateId}</Typography>
            }
            <TextField label="ID to answer" onChange={handleIdText} fullWidth />
            <Button style={{ margin: 10}} variant="contained" color="primary" fullWidth onClick={answerCall}>
                Answer
            </Button>
            <TextField label="Senate ID" onChange={handleSenateId} fullWidth />
            <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={joinToSenate}>
                Join Senate
            </Button>
            {children}
        </Grid>
    )
}

export default SideBar
