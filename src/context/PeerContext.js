import React, { createContext, useContext, useState } from 'react';
import { firestore } from '../firebase/config';
import firebase from 'firebase';
import { nanoid } from 'nanoid';

const PeerContext = createContext();

export const usePeer = () => useContext(PeerContext);

const PeerProvider = ({ children }) => {
    const [peerConnections, setPeerConnections] = useState([]);
    const [inSenate, setInSenate] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [localStream, setLocalStream] = useState();
    const [remoteStreams, setRemoteStreams] = useState([]);

    // creates and sets up a peer connection and adds it in peerConnections array
    const createCall = async(callCollection) => {
        const callUid = nanoid();
        const userUid = callCollection.id;
        var remoteUserUid = null;

        const callDoc = callCollection.doc(callUid);
        const offerCandidateCollection = callDoc.collection('offerCandidates');
        const answerCandidateCollection = callDoc.collection('answerCandidates');

        const peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
                },
            ],
            iceCandidatePoolSize: 10,
        });

        //refactor and get local stream once
        const remoteStream = new MediaStream();

        if(!localStream){
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(userStream);

            userStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, userStream);
            });
        }else {
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });
        }
        
        peerConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };

        setRemoteStreams(prevState => [...prevState, remoteStream]);        

        peerConnection.onicecandidate = (event) => {
            // console.log("ICE create: ", event)
            event.candidate && offerCandidateCollection.add(event.candidate.toJSON());;
        }

        const offerDescription = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offerDescription);

        const offer = {
            userUid: userUid,
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await callDoc.set({ offer });

        peerConnection.onnegotiationneeded = () => {console.log("negotiation needed")};

        callDoc.onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data?.answer) {
                remoteUserUid = data.answer.userUid;
                const answerDescription = new RTCSessionDescription(data.answer);
                peerConnection.setRemoteDescription(answerDescription);
            }
        });

        answerCandidateCollection.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    const candidate = new RTCIceCandidate(data);
                    peerConnection.addIceCandidate(candidate);
                }
            });
        });

        peerConnection.onconnectionstatechange = (event) => {
            switch (peerConnection.connectionState) {
                case "connected":
                    createCall(callCollection);
                    setIsConnected(true);
                    break;
                case "disconnected":
                    setRemoteStreams(prevState => prevState.filter((stream) => stream !== remoteStream));

                    //check whether remote user is present in senate document
                    callCollection.parent.update({
                        [remoteUserUid]: firebase.firestore.FieldValue.delete()
                    }, { merge: true });

                    closeCall(peerConnection);
                    break;            
                default:
                    break;
            }
        }

        callCollection.parent.set({
            [userUid] : callUid
        }, {merge: true});

        setPeerConnections(prevState => [...prevState, peerConnection]);
    };

    const closeCall = (peerConnection) => {
        setPeerConnections(prevState => prevState.filter( pc => pc !== peerConnection));
        
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.onsignalingstatechange = null;
        peerConnection.onicegatheringstatechange = null;
        peerConnection.onnotificationneeded = null;

        // peerConnection.getTransceivers().forEach(transceiver => {
        //     console.log(transceiver);
        //     transceiver.stop();
        // });

        peerConnection.close();
        peerConnection = null;
    };

    const createSenate = async() => {
        const senateUid = nanoid();
        const userUid = nanoid();

        const senateDoc = firestore.collection('senates').doc(senateUid);
        const userCallCollection = senateDoc.collection(userUid);
        
        createCall(userCallCollection);
        setInSenate(senateDoc.id);
        return senateDoc.id;
    };

    const joinSenate = async(senateId) => {
        const localUserUid = nanoid();

        const senateDoc = firestore.collection('senates').doc(senateId);
        if(!senateDoc){
            return "Senate ID doesn't exist";
        }
        
        setInSenate(senateId);
        const senateSnapshot = await senateDoc.get();
        const remoteUsers = Object.entries(senateSnapshot.data()).map(e => ({ [e[0]]: e[1] }));

        for (const user of remoteUsers) {
            // console.log(user);
            const userUid = (Object.keys(user))[0];
            const callUid = (Object.values(user))[0];

            if(callUid === 'Disconnected')
                continue;
            
            const callDoc = senateDoc.collection(userUid).doc(callUid);
            const answerCandidateCollection = callDoc.collection('answerCandidates');
            const offerCandidateCollection = callDoc.collection('offerCandidates');

            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
                    },
                ],
                iceCandidatePoolSize: 10,
            });

            
            const remoteStream = new MediaStream();            
            if(!localStream){
                const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(userStream);
    
                userStream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, userStream);
                });
            }else {
                localStream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, localStream);
                });
            }

            peerConnection.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
                });
            };

            setRemoteStreams(prevState => [...prevState, remoteStream]);

            peerConnection.onicecandidate = (event) => {
                // console.log("ICE join: ",event);
                event.candidate && answerCandidateCollection.add(event.candidate.toJSON());
            };

            const callData = (await callDoc.get()).data();
            const offerDescription = callData.offer;
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

            const answerDescription = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answerDescription);

            const answer = {
                userUid: localUserUid,
                type: answerDescription.type,
                sdp: answerDescription.sdp
            };

            await callDoc.update({ answer });

            offerCandidateCollection.onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if(change.type === 'added'){
                        let data = change.doc.data();
                        peerConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });

            peerConnection.onconnectionstatechange = (event) => {
                switch (peerConnection.connectionState) {
                    case "connected":
                        setIsConnected(true);
                        break;
                    case "disconnected":
                        setRemoteStreams(prevState => prevState.filter((stream) => stream !== remoteStream));

                        senateDoc.update({
                            [userUid]: firebase.firestore.FieldValue.delete()
                        }, { merge: true });

                        closeCall(peerConnection);
                        break;
                
                    default:
                        break;
                }
            }
            setPeerConnections(prevState => [...prevState, peerConnection]);
        }

        createCall(senateDoc.collection(localUserUid));
        return "Joined Senate"
    }

    const hangup = () => {
        console.log(peerConnections);
    }

    const toggleUserVideo = () => {
        for(let peerConnection of peerConnections){

            let senderList = peerConnection.getSenders();
            if(senderList){
                senderList.forEach( sender => {
                    if(sender.track.kind === "video"){
                        sender.track.enabled = !sender.track.enabled;
                    }
                });
            }
        }
    };

    const toggleUserAudio = () => {
        for(let peerConnection of peerConnections){

            let senderList = peerConnection.getSenders();
            if(senderList){
                senderList.forEach( sender => {
                    if(sender.track.kind === "audio"){
                        sender.track.enabled = !sender.track.enabled;
                    }
                });
            }
        }
    };

    const switchLocalMediaDevice = async({ audioId , videoId }) => {
        let newAudioTrack = null;
        let newVideoTrack = null;
        if(audioId){
            let newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: audioId } })
            newAudioTrack= newStream.getTracks()[0];
        }
        if(videoId){
            let newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: videoId } })
            newVideoTrack = newStream.getTracks()[0];
        }

        if(newAudioTrack || newVideoTrack){
            for (let peerConnection of peerConnections) {
                let senderList = peerConnection.getSenders();
                if (senderList) {
                    senderList.forEach(sender => {
                        if (sender.track.kind === "audio" && newAudioTrack) {
                            sender.replaceTrack(newAudioTrack)
                            .then(() => {
                                let newStream = new MediaStream();
                                localStream.getTracks().forEach(track => {
                                    if(track.kind === 'audio'){
                                        newStream.addTrack(newAudioTrack);
                                    }else{
                                        newStream.addTrack(track);
                                    }
                                })
                                setLocalStream(newStream);
                            });
                        }
                        if (sender.track.kind === "video" && newVideoTrack) {
                            sender.replaceTrack(newVideoTrack)
                            .then(() => {
                                let newStream = new MediaStream();
                                localStream.getTracks().forEach(track => {
                                    if (track.kind === 'video') {
                                        newStream.addTrack(newVideoTrack);
                                    } else {
                                        newStream.addTrack(track);
                                    }
                                })
                                setLocalStream(newStream);
                            });
                        }
                    });
                }
            }
        }
    };

    const value = {
        isConnected,
        inSenate,
        setIsConnected,
        localStream,
        remoteStreams,
        createSenate,
        joinSenate,
        hangup,
        toggleUserVideo,
        toggleUserAudio,
        switchLocalMediaDevice
    };

    return (
        <PeerContext.Provider value={value}>
            {children}
        </PeerContext.Provider>
    )
}

export default PeerProvider;    