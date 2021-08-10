import React, { useRef, useState } from 'react'
import { Button, Grid, Typography, TextField, Popper, Fade, Paper } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const SideBar = () => {
    const { inSenate, createSenate, joinSenate } = usePeer();
    const joinSenateId = useRef();

    const [popperOpen, setPopperOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    
    const handleSenateId = (e) => {
        joinSenateId.current = e.target.value;
    };

    const chooseMedium = (e) => {
        setAnchorEl(e.currentTarget);
        setPopperOpen(prev => !prev);
    }

    const makeSenate = async(mediumOptions) => {
        await createSenate(mediumOptions);
    };

    const joinToSenate = () => {
        const response = joinSenate(joinSenateId.current);
    };

    return !inSenate ? (
                <Grid item xs={5} sm={4} md={3} lg={2}>
                    <Button 
                        style={{ marginBottom: 10 }} 
                        variant="contained" 
                        color="primary"
                        fullWidth 
                        onClick={chooseMedium}
                    >
                        Create Senate
                    </Button>
                    <Popper open={popperOpen} anchorEl={anchorEl} placement='right' transition
                        style={{marginLeft: 5 }}    
                    >
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                                <Paper style={{ backgroundColor: '#fff0'}}>
                                    <Grid container direction='column'>
                                        <Grid item>
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                style={{ marginBottom: 5 }}
                                                onClick={() => {makeSenate({video: true, audio: true}); setPopperOpen(false);}} 
                                            >Video Chat</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => { makeSenate({ video: false, audio: true }); setPopperOpen(false); }}
                                            >Audio Chat</Button>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Fade>
                        )}
                    </Popper>

                    <Typography>or</Typography>
                    <TextField variant="outlined" label="Senate ID" onChange={handleSenateId} fullWidth />
                    <Button style={{ marginTop: 10 }} variant="contained" color="secondary" fullWidth onClick={joinToSenate}>
                        Join Senate
                    </Button>
                </Grid>
            ) : null
}

export default SideBar
