import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { firestore } from '../firebase/config';
import { nanoid } from 'nanoid';

const PeerContext = createContext();

export const usePeer = () => useContext(PeerContext);

const PeerProvider = ({ children }) => {
    var peerConnections = [];
    var localStreams = [];
    var remoteStreams = [];
    
    const callerVideo = useRef();
    const calleeVideo = useRef();
    // const pc = new RTCPeerConnection({
    //     iceServers: [
    //         {
    //             urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    //         },
    //     ],
    //     iceCandidatePoolSize: 10,
    // });
    // const [localStream, setLocalStream] = useState(null);
    // const [remoteStream, setRemoteStream] = useState(null);


    // useEffect(() => {
    //     navigator.mediaDevices.getUserMedia({ video: false, audio: true })
    //     .then((stream) => {
    //         setLocalStream(stream);
    //         setRemoteStream(new MediaStream());
    //     })

    // }, []);

    
    // if(localStream){
    //     localStream.getTracks().forEach((track) => {
    //         pc.addTrack(track, localStream);
    //     });
        
    //     pc.ontrack = (event) => {
    //         event.streams[0].getTracks().forEach((track) => {
    //             remoteStream.addTrack(track);
    //         });

    //     };
        
    //     callerVideo.current.srcObject = localStream;
    //     calleeVideo.current.srcObject = remoteStream;
    // }

    const handleOnIceCandidate = (event, offerCollection) => {
        console.log(event);
        event.candidate && offerCollection.add(event.candidate.toJSON());
    };

    const handleOnNegotiationNeeded = async (peerConnection, userDoc) => {
        try {
            const offerDescription = await peerConnection.createOffer();
            // if (peerConnection.signalingState !== "stable") {
            //     return;
            // }
            await peerConnection.setLocalDescription(offerDescription);

            const offer = {
                sdp: offerDescription.sdp,
                type: offerDescription.type,
            };

            await userDoc.set({ offer });

        } catch (error) {
            console.log(error);
        }
    };

    // creates and sets up a peer connection and adds it in peerConnections array
    const createCall = async(callCollection) => {
        const callUid = nanoid();

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

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        const remoteStream = new MediaStream();

        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };

        localStreams.push(localStream);
        remoteStreams.push(remoteStream);

        peerConnection.onicecandidate = (event) => {
            console.log("ICE create: ", event)
            event.candidate && offerCandidateCollection.add(event.candidate.toJSON());;
        }

        const offerDescription = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await callDoc.set({ offer });

        callDoc.onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data?.answer) {
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
                    break;
            
                default:
                    break;
            }
        }

        const userUid = callCollection.id;
        callCollection.parent.set({
            [userUid] : callUid
        }, {merge: true});

        peerConnections.push(peerConnection);
    }


    const createSenate = async() => {
        const senateUid = nanoid();
        const userUid = nanoid();

        const senateDoc = firestore.collection('senates').doc(senateUid);
        const userCallCollection = senateDoc.collection(userUid);
        
        createCall(userCallCollection);

        return senateDoc.id;
    };

    const joinSenate = async(senateId) => {
        const userUid = nanoid();

        const senateDoc = firestore.collection('senates').doc(senateId);
        const senateSnapshot = await senateDoc.get();
        console.log("Using flat map", [senateSnapshot.data()].flatMap(x => [x]));
        const remoteUsers = Object.entries(senateSnapshot.data()).map(e => ({ [e[0]]: e[1] }));
        console.log(remoteUsers);

        for (const user of remoteUsers) {
            console.log(user);
            const userUid = (Object.keys(user))[0];
            const callUid = (Object.values(user))[0];
            console.log(userUid, " : ", callUid);
            
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

            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            const remoteStream = new MediaStream();

            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
                });
            };

            localStreams.push(localStream);
            remoteStreams.push(remoteStream);

            peerConnection.onicecandidate = (event) => {
                console.log("ICE join: ",event);
                event.candidate && answerCandidateCollection.add(event.candidate.toJSON());
            };

            const callData = (await callDoc.get()).data();
            const offerDescription = callData.offer;
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

            const answerDescription = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answerDescription);

            const answer = {
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

            peerConnections.push(peerConnection);
        }

        createCall(senateDoc.collection(userUid));
    }

    // const call = async() => {
    //     const callDoc = firestore.collection('calls').doc();
    //     const offerCandidate = callDoc.collection('offerCandidate');
    //     const answerCandidate = callDoc.collection('answerCandidate');

    //     pc.onicecandidate = (event) => {
    //         event.candidate && offerCandidate.add(event.candidate.toJSON());
    //     };

    //     const offerDescription = await pc.createOffer();
    //     await pc.setLocalDescription(offerDescription);

    //     const offer = {
    //         sdp: offerDescription.sdp,
    //         type: offerDescription.type,
    //     };

    //     await callDoc.set({ offer });

    //     // Listen for remote answer
    //     callDoc.onSnapshot((snapshot) => {
    //         const data = snapshot.data();
    //         if (!pc.currentRemoteDescription && data?.answer) {
    //             const answerDescription = new RTCSessionDescription(data.answer);
    //             pc.setRemoteDescription(answerDescription);
    //         }
    //     });

    //     // When answered, add candidate to peer connection
    //     answerCandidate.onSnapshot((snapshot) => {
    //         snapshot.docChanges().forEach((change) => {
    //             if (change.type === 'added') {
    //                 let data = change.doc.data();
    //                 const candidate = new RTCIceCandidate(data);
    //                 pc.addIceCandidate(candidate);
    //             }
    //         });
    //     });
    //     return callDoc.id;
    // };

    // const answer = async( docId ) => {
    //     const callDoc = firestore.collection('calls').doc(docId);
    //     const answerCandidate = callDoc.collection('answerCandidate');
    //     const offerCandidate = callDoc.collection('offerCandidate');

    //     pc.onicecandidate = (event) => {
    //         event.candidate && answerCandidate.add(event.candidate.toJSON());
    //     };

    //     const callData = (await callDoc.get()).data();
    //     const offerDescription = callData.offer;
    //     await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    //     const answerDescription = await pc.createAnswer();
    //     await pc.setLocalDescription(answerDescription);

    //     const answer = {
    //         type: answerDescription.type,
    //         sdp: answerDescription.sdp,
    //     };

    //     await callDoc.update({ answer });

    //     offerCandidate.onSnapshot((snapshot) => {
    //         snapshot.docChanges().forEach((change) => {
    //             if (change.type === 'added') {
    //                 let data = change.doc.data();
    //                 pc.addIceCandidate(new RTCIceCandidate(data));
    //             }
    //         });
    //     });
    // };

    const hangup = () => {
        console.log(peerConnections);
    }

    const value = {
        callerVideo,
        calleeVideo,
        createSenate,
        joinSenate,
        hangup
    };

    return (
        <PeerContext.Provider value={value}>
            {children}
        </PeerContext.Provider>
    )
}

export default PeerProvider;