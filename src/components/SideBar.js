import React, { useRef, useState } from 'react'
import { Button, Grid, Typography, TextField } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const SideBar = ({ children }) => {
    const { createSenate, joinSenate, hangup } = usePeer();
    const [senateId, setSenateId] = useState();
    const joinSenateId = useRef();
    
    const handleSenateId = (e) => {
        joinSenateId.current = e.target.value;
    };

    const makeSenate = async() => {
        setSenateId(await createSenate());
    };

    const joinToSenate = () => {
        joinSenate(joinSenateId.current);
    };

    const disconnect = () => {
        hangup();
    };

    return (
        <Grid style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography gutterBottom variant="h6">Make a call</Typography>
            <Grid style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={makeSenate}>
                    Create Senate
                </Button>
                <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={disconnect}>
                    Hangup
                </Button>
            </Grid>
            {
                senateId && <Typography gutterBottom variant="h6">{senateId}</Typography>
            }
            <TextField label="Senate ID" onChange={handleSenateId} fullWidth />
            <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={joinToSenate}>
                Join Senate
            </Button>
            {children}
        </Grid>
    )
}

export default SideBar
