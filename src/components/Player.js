import React, { useEffect } from 'react'
import { VideoPlayer, AudioPlayer } from '.';
import { usePeer } from '../context/PeerContext';

const Player = () => {
    const { inSenate } = usePeer();

    return (
        <>
        {    
            inSenate && (inSenate.video ? <VideoPlayer /> : <AudioPlayer />)
        }
        </>
    )
}

export default Player
