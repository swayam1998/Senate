import React, { useRef, useState } from 'react'
import { Button, Grid, Typography, TextField } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const SideBar = () => {
    const { inSenate, createSenate, joinSenate } = usePeer();
    const joinSenateId = useRef();
    
    const handleSenateId = (e) => {
        joinSenateId.current = e.target.value;
    };

    const makeSenate = async() => {
        await createSenate();
    };

    const joinToSenate = () => {
        const response = joinSenate(joinSenateId.current);
        console.log(response);
    };

    return !inSenate ? (
                <Grid item xs={5} sm={4} md={3} lg={2}>
                    <Button 
                        style={{ marginBottom: 10 }} 
                        variant="contained" 
                        color="primary"
                        fullWidth 
                        onClick={makeSenate}
                    >
                        Create Senate
                    </Button>
                    <Typography>or</Typography>
                    <TextField variant="outlined" label="Senate ID" onChange={handleSenateId} fullWidth />
                    <Button style={{ marginTop: 10 }} variant="contained" color="secondary" fullWidth onClick={joinToSenate}>
                        Join Senate
                    </Button>
                </Grid>
            ) : null
}

export default SideBar
