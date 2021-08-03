import React from 'react'
import { AppBar, Grid, Typography, Container, CssBaseline } from '@material-ui/core';
import { usePeer } from '../context/PeerContext';

const Navbar = () => {
    const { inSenate } = usePeer();

    return (
        <AppBar position="static" >
            <Grid container alignItems='center'>
                <Grid item xs></Grid>
                <Grid item xs={12} sm align='center'>
                    <Typography variant='h3'>Senate</Typography>
                    <Typography>Every Voice Heard</Typography>
                </Grid>
                <Grid item xs={12} sm align='center'>
                    {inSenate ? (
                        <>
                            <Typography variant='h5'>Senate ID</Typography>
                            <Typography>{inSenate}</Typography>
                        </>
                    ) : null}
                </Grid>
            </Grid>
        </AppBar>
    )
}

export default Navbar
