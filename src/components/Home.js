import React from 'react'
import { Grid, Container } from '@material-ui/core';
import { SideBar } from '.';

const Home = () => {
    return (
        <main>
            <div>
                <Container maxWidth="xl">
                    <Grid
                        container
                        direction="column"
                        align='center'
                        style={{ height: '80vh' }}
                        wrap='nowrap'
                        justify='center'
                    >
                        <Grid item >
                            <SideBar />
                        </Grid>
                    </Grid>
                </Container>
            </div>
        </main>
    )
}

export default Home
