import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { firestore } from '../firebase/config';

const PeerContext = createContext();

export const usePeer = () => useContext(PeerContext);

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

// Global State

const PeerProvider = ({ children }) => {
    const pc = new RTCPeerConnection(servers);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const callerVideo = useRef();
    const calleeVideo = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            setLocalStream(stream);
            setRemoteStream(new MediaStream());
        })

    }, []);

    if(localStream){
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });
    
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });

        };

        callerVideo.current.srcObject = localStream;
        calleeVideo.current.srcObject = remoteStream;
    }

    const call = async() => {
        const callDoc = firestore.collection('calls').doc();
        const offerCandidate = callDoc.collection('offerCandidate');
        const answerCandidate = callDoc.collection('answerCandidate');

        pc.onicecandidate = (event) => {
            event.candidate && offerCandidate.add(event.candidate.toJSON());
        };

        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await callDoc.set({ offer });

        // Listen for remote answer
        callDoc.onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.setRemoteDescription(answerDescription);
            }
        });

        // When answered, add candidate to peer connection
        answerCandidate.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    const candidate = new RTCIceCandidate(data);
                    pc.addIceCandidate(candidate);
                }
            });
        });
        return callDoc.id;
    };

    const answer = async( docId ) => {
        const callDoc = firestore.collection('calls').doc(docId);
        const answerCandidate = callDoc.collection('answerCandidate');
        const offerCandidate = callDoc.collection('offerCandidate');

        pc.onicecandidate = (event) => {
            event.candidate && answerCandidate.add(event.candidate.toJSON());
        };

        const callData = (await callDoc.get()).data();
        const offerDescription = callData.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };

        await callDoc.update({ answer });

        offerCandidate.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    pc.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
    };

    const hangup = () => {
        
    }

    const value = {
        call,
        answer,
        callerVideo,
        calleeVideo,
    };

    return (
        <PeerContext.Provider value={value}>
            {children}
        </PeerContext.Provider>
    )
}

export default PeerProvider;