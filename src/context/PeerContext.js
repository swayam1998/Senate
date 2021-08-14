import React, { createContext, useContext, useState } from 'react';
import { firestore } from '../firebase/config';
import firebase from 'firebase';
import { nanoid } from 'nanoid';

const PeerContext = createContext();

export const usePeer = () => useContext(PeerContext);

const PeerProvider = ({ children }) => {
    const [peerConnections, setPeerConnections] = useState([]);
    const [inSenate, setInSenate] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState([]);

    // creates and sets up a peer connection and adds it in peerConnections array
    const createCall = async(callCollection, mediumOptions) => {
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
            const userStream = await navigator.mediaDevices.getUserMedia(mediumOptions);
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
                    setRemoteStreams(prevState => [...prevState, remoteStream]);
                    setIsConnected(true);
                    createCall(callCollection, mediumOptions);
                    break;
                case "disconnected":
                    setRemoteStreams(prevState => prevState.filter((stream) => stream !== remoteStream));
                    remoteStream.getTracks().forEach(track => track.stop());

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

        peerConnection.getSenders().forEach(sender => sender.track.stop());
        peerConnection.getReceivers().forEach(receiver => receiver.track.stop());

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

    const createSenate = async(mediumOptions) => {
        const senateUid = nanoid();
        const userUid = nanoid();

        const senateDoc = firestore.collection('senates').doc(senateUid);
        const userCallCollection = senateDoc.collection(userUid);
        
        //should return a promise confirming the call has been created
        createCall(userCallCollection, mediumOptions);

        senateDoc.set({
            mediumOptions: mediumOptions
        }, {merge:true});

        setInSenate({senateId: senateDoc.id, ...mediumOptions });
        return senateDoc.id;
    };

    const joinSenate = async(senateId) => {
        const localUserUid = nanoid();

        const senateDoc = firestore.collection('senates').doc(senateId);
        
        const senateSnapshot = await senateDoc.get();
        if(!senateSnapshot.exists){
            return "Senate ID doesnt exist";
        }

        const mediumOptions = senateSnapshot.data().mediumOptions;

        setInSenate({ senateId: senateDoc.id, ...mediumOptions });

        for (var key of Object.keys(senateSnapshot.data())) {
            if(key === 'mediumOptions'){
                continue;
            }
            const userUid = key;
            const callUid = senateSnapshot.data()[key];
            
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
                const userStream = await navigator.mediaDevices.getUserMedia(mediumOptions);
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
                    case "failed":
                        senateDoc.update({
                            [userUid]: firebase.firestore.FieldValue.delete()
                        }, { merge: true }).then((result) => console.log("failed, doc deleted: ", result));
                        break;
                    case "connected":
                        setRemoteStreams(prevState => [...prevState, remoteStream]);
                        setIsConnected(true);
                        break;
                    case "disconnected":
                        setRemoteStreams(prevState => prevState.filter((stream) => stream !== remoteStream));

                        senateDoc.update({
                            [userUid]: firebase.firestore.FieldValue.delete()
                        }, { merge: true }).then((result) => console.log("disconnected, doc deleted: ", result));

                        closeCall(peerConnection);
                        break;
                
                    default:
                        break;
                }
            }
            setPeerConnections(prevState => [...prevState, peerConnection]);
        }

        createCall(senateDoc.collection(localUserUid), mediumOptions);
        return "Joined Senate";
    }

    const exitSenate = () => {
        for(let peerConnection of peerConnections){
            closeCall(peerConnection);
        }
        setPeerConnections([]);
        setInSenate(null);
        setIsConnected(false);
        setLocalStream(null);
        setRemoteStreams([]);
    };

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
                                if(localStream.getAudioTracks()[0].id !== newAudioTrack.id){
                                    let newStream = new MediaStream();
                                    localStream.getTracks().forEach(track => {
                                        if(track.kind === 'audio'){
                                            newStream.addTrack(newAudioTrack);
                                        }else{
                                            newStream.addTrack(track);
                                        }
                                    })
                                    setLocalStream(newStream);
                                }
                            });
                        }
                        if (sender.track.kind === "video" && newVideoTrack) {
                            sender.replaceTrack(newVideoTrack)
                            .then(() => {
                                if (localStream.getVideoTracks()[0].id !== newVideoTrack.id) {
                                    let newStream = new MediaStream();
                                    localStream.getTracks().forEach(track => {
                                        if (track.kind === 'video') {
                                            newStream.addTrack(newVideoTrack); 
                                        } else {
                                            newStream.addTrack(track);
                                        }
                                    })
                                    setLocalStream(newStream);
                                }
                            });
                        }
                    });
                }
            }
        }
    };

    // const changeTracks = (track) => {
        //function to replace track in every rtpsender
    // }

    const startScreenShare = async() => {
        const screenStream = await navigator.mediaDevices.getDisplayMedia();
        const screenTrack = screenStream.getTracks()[0];

        const prevVideoTrack = localStream.getTracks().filter(track => track.kind === 'video' ? track : null)[0];
        for (let peerConnection of peerConnections) {
            let senderList = peerConnection.getSenders();
            if (senderList) {
                senderList.forEach(sender => {
                    if (sender.track.kind === "video") {
                        sender.replaceTrack(screenTrack)
                            .then(() => {
                                if (localStream.getVideoTracks()[0].id !== screenTrack.id) {
                                    let newStream = new MediaStream();
                                    localStream.getTracks().forEach(track => {
                                        if (track.kind === 'video') {
                                            newStream.addTrack(screenTrack);
                                        } else {
                                            newStream.addTrack(track);
                                        }
                                    })
                                    setLocalStream(newStream);
                                }
                            });
                    }
                });
            }
        }

        screenTrack.onended = (event) => {
            for (let peerConnection of peerConnections) {
                let senderList = peerConnection.getSenders();
                if (senderList) {
                    senderList.forEach(sender => {
                        if (sender.track.kind === "video") {
                            sender.replaceTrack(prevVideoTrack)
                                .then(() => {
                                    let newStream = new MediaStream();
                                    localStream.getTracks().forEach(track => {
                                        if (track.kind === 'video') {
                                            newStream.addTrack(prevVideoTrack);
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
        };
        
    }

    const value = {
        isConnected,
        inSenate,
        setInSenate,
        setIsConnected,
        localStream,
        remoteStreams,
        createSenate,
        joinSenate,
        exitSenate,
        toggleUserVideo,
        toggleUserAudio,
        switchLocalMediaDevice,
        startScreenShare
    };

    return (
        <PeerContext.Provider value={value}>
            {children}
        </PeerContext.Provider>
    )
}

export default PeerProvider;    