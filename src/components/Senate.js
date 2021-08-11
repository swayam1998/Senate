import React, { useEffect } from 'react'
import { Grid, Container } from '@material-ui/core';
import { VideoPlayer, AudioPlayer } from '.';
import { usePeer } from '../context/PeerContext';
import { useHistory, useParams } from 'react-router-dom';

const Senate = () => {
    const { inSenate, joinSenate } = usePeer();
    const { senateId } = useParams();
    const history = useHistory();

    useEffect(() => {
        if(!inSenate){
            console.log("SenateId : ", senateId);
            const response = joinSenate(senateId);
            response.then((result) => {
                console.log(result);
                if (result === 'Senate ID doesnt exist'){
                    history.push('/');
                }
                // setShowError(result);
            });
        }
    }, [inSenate, history, joinSenate, senateId])

    return inSenate && (
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
                        <Grid item container>
                            {
                                inSenate.video ? <VideoPlayer /> : <AudioPlayer />
                            }
                        </Grid>
                    </Grid>
                </Container>
            </div>
        </main>
    )
}

export default Senate
