import React, { useRef, useState } from 'react'
import { Button, Grid, Typography, TextField, Popper, Fade, Paper } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { usePeer } from '../context/PeerContext';
import { useHistory } from 'react-router-dom';

const SideBar = () => {
    const history = useHistory();
    const { createSenate, joinSenate } = usePeer();
    const joinSenateId = useRef('');

    const [showError, setShowError] = useState(null);
    const [popperOpen, setPopperOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    
    const handleSenateId = (e) => {
        setShowError(null);
        joinSenateId.current = e.target.value;
    };

    const chooseMedium = (e) => {
        setAnchorEl(e.currentTarget);
        setPopperOpen(prev => !prev);
    }

    const makeSenate = async(mediumOptions) => {
        try {
            const senateId = await createSenate(mediumOptions);
            history.push(`/senates/${senateId}`);            
        } catch (error) {
            console.log(error);
        }
    };

    const joinToSenate = () => {
        if(joinSenateId.current === ''){
            setShowError('Needs Senate ID');
            return;
        }
        const response = joinSenate(joinSenateId.current);
        response.then((result)=>{
            if(result === 'Joined Senate'){
                history.push(`/senates/${joinSenateId.current}`);
            }
            setShowError(result);
        });
    };

    return (
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
                
                {showError && <Alert severity="error">{showError}</Alert>}
                
                <TextField error={showError} style={{ marginTop: 10 }} variant="outlined" label="Senate ID" onChange={handleSenateId} fullWidth />
                <Button style={{ marginTop: 10 }} variant="contained" color="secondary" fullWidth onClick={joinToSenate}>
                    Join Senate
                </Button>
            </Grid>
        )
}

export default SideBar
