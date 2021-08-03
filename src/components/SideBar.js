import React, { useRef, useState } from 'react'
import { Button, Grid, Typography, TextField } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const SideBar = ({ children }) => {
    const { inSenate, createSenate, joinSenate } = usePeer();
    const [senateId, setSenateId] = useState();
    const joinSenateId = useRef();
    
    const handleSenateId = (e) => {
        joinSenateId.current = e.target.value;
    };

    const makeSenate = async() => {
        setSenateId(await createSenate());
    };

    const joinToSenate = () => {
        const response = joinSenate(joinSenateId.current);
        console.log(response);
    };

    return (
        <>
            {!inSenate ? (
                <Grid style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Grid style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        <Button 
                            style={{ margin: 10 }} 
                            variant="contained" 
                            color="primary"
                            fullWidth 
                            onClick={makeSenate}
                        >
                            Create Senate
                        </Button>
                    </Grid>
                    <TextField label="Senate ID" onChange={handleSenateId} fullWidth />
                    <Button style={{ margin: 10 }} variant="contained" color="primary" fullWidth onClick={joinToSenate}>
                        Join Senate
                    </Button>
                    {children}
                </Grid>
            ) : (
                <Grid style={{ flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h4">Share Senate ID{"\n"}</Typography>
                    <Typography gutterBottom variant="h6">{senateId}</Typography>
                </Grid>
            )}
        </>        
    )
}

export default SideBar
