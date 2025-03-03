// app/room/[roomId]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { firestore } from "../../../lib/firebase";
import {
    collection,
    doc,
    setDoc,
    addDoc,
    updateDoc,
    onSnapshot,
    getDoc,
    deleteDoc,
} from "firebase/firestore";
import RealtimeAssistancePanel from "@/components/AssistancePanel/RealtimeAssistance/RealtimeAssistancePanel";
import VideoChat from "@/components/VideoChat/VideoChat";
import NotesPanel from "@/components/AssistancePanel/IntervieweeAssistance/NotesPanel";
import InstructionsDialog from "@/components/InstructionsDialog";

// Use a basic STUN server configuration (you can add TURN servers if needed)
const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    iceCandidatePoolSize: 10,
};

export default function RoomPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const roomId = params.roomId as string;
    const isCaller = searchParams.get("caller") === "true";
    const [showInstructions, setShowInstructions] = useState(true);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peerJoined, setPeerJoined] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('waiting');

    const [remoteAudioStream, setRemoteAudioStream] = useState<MediaStream | null>(null)

    const remoteDescriptionSet = useRef(false);

    // Add this new ref to store pending ICE candidates
    const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);

    // Add a ref to track if the component is mounted
    const isMounted = useRef(true);
    // Add a ref to track if we're in the process of setting up the connection
    const isSettingUp = useRef(false);

    // Call Init
    useEffect(() => {
        // Set mounted flag
        isMounted.current = true;

        async function init() {
            // Prevent multiple simultaneous setup attempts
            if (isSettingUp.current) {
                console.log('Setup already in progress, skipping');
                return;
            }

            isSettingUp.current = true;
            console.log('Initializing WebRTC connection...', { isCaller });

            try {
                // Create the RTCPeerConnection first
                const pc = new RTCPeerConnection(configuration);
                pcRef.current = pc;
                console.log('RTCPeerConnection created');

                // Set up remote video stream handling first
                pc.ontrack = (event) => {
                    console.log('Received remote track:', event.track.kind);
                    if (remoteVideoRef.current && event.streams[0]) {
                        console.log('Setting remote stream');

                        if(event.track.kind === "audio") {
                            const ms = new MediaStream();
                            ms.addTrack(event.track);
                            setRemoteAudioStream(ms);
                        }

                        
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                

                // Get local media stream
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                        // TODO: test if this is worth having
                        // audio: {
                        //     echoCancellation: true,
                        //     noiseSuppression: true,
                        //     autoGainControl: true
                        // },
                    });
                    console.log('Local stream obtained successfully');

                    // Check if component is still mounted and connection is still open
                    if (!isMounted.current || pc.connectionState === 'closed') {
                        console.log('Component unmounted or connection closed during setup');
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }

                    // Add tracks to peer connection
                    stream.getTracks().forEach((track) => {
                        console.log('Adding track to peer connection:', track.kind);
                        if (pc.connectionState !== 'closed') {
                            pc.addTrack(track, stream);
                        } else {
                            console.error('Cannot add track - connection is closed');
                        }
                    });

                    // Set local video
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                    setLocalStream(stream);
                    
                } catch (err) {
                    console.error('Error accessing media devices:', err);
                    return;
                }

                // Set up connection state logging
                pc.oniceconnectionstatechange = () => {
                    console.log('ICE connection state:', pc.iceConnectionState);
                    if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                        setPeerJoined(true);
                        setConnectionStatus('connected');
                    } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
                        setPeerJoined(false);
                        setConnectionStatus('disconnected');
                    } else if (pc.iceConnectionState === 'checking') {
                        setConnectionStatus('connecting');
                    }
                };

                pc.onconnectionstatechange = () => {
                    console.log('Connection state:', pc.connectionState);
                    if (pc.connectionState === 'connected') {
                        setPeerJoined(true);
                        setConnectionStatus('connected');
                    } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                        setPeerJoined(false);
                        setConnectionStatus('disconnected');
                    } else if (pc.connectionState === 'connecting') {
                        setConnectionStatus('connecting');
                    }
                };

                pc.onsignalingstatechange = () => {
                    console.log('Signaling state:', pc.signalingState);
                };

                // Set up Firestore signaling collections
                const roomRef = doc(firestore, "rooms", roomId);
                const callerCandidatesCollection = collection(roomRef, "callerCandidates");
                const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

                // Helper function to handle ICE candidates
                const handleCandidate = async (candidate: RTCIceCandidate) => {
                    console.log('Handling ICE candidate', candidate.candidate?.substring(0, 50) + '...');
                    if (pc.remoteDescription) {
                        console.log('Remote description set, adding ICE candidate immediately');
                        try {
                            await pc.addIceCandidate(candidate);
                            console.log('ICE candidate added successfully');
                        } catch (err) {
                            console.error('Error adding ICE candidate:', err);
                        }
                    } else {
                        console.log('Remote description not set, queuing ICE candidate');
                        pendingCandidatesRef.current.push(candidate);
                    }
                };

                // When ICE candidates are generated, save them to Firestore
                pc.onicecandidate = async (event) => {
                    if (event.candidate) {
                        console.log('New ICE candidate generated:', event.candidate.candidate?.substring(0, 50) + '...');
                        const jsonCandidate = event.candidate.toJSON();
                        try {
                            if (isCaller) {
                                await addDoc(callerCandidatesCollection, jsonCandidate);
                            } else {
                                await addDoc(calleeCandidatesCollection, jsonCandidate);
                            }
                            console.log('ICE candidate saved to Firestore');
                        } catch (err) {
                            console.error('Error saving ICE candidate:', err);
                        }
                    }
                };

                if (isCaller) {
                    console.log('Starting caller flow');
                    // Create a new room document in Firestore
                    await setDoc(roomRef, {});

                    // Create an offer
                    const offer = await pc.createOffer();
                    console.log('Created offer:', offer.type);
                    await pc.setLocalDescription(offer);

                    // Save the offer to Firestore
                    await updateDoc(roomRef, {
                        offer: { type: offer.type, sdp: offer.sdp },
                    });
                    console.log('Offer saved to Firestore');

                    // Listen for remote answer
                    onSnapshot(roomRef, async (snapshot) => {
                        const data = snapshot.data();
                        if (!remoteDescriptionSet.current && data?.answer) {
                            console.log('Received answer from callee');
                            remoteDescriptionSet.current = true;
                            const answerDescription = new RTCSessionDescription(data.answer);
                            await pc.setRemoteDescription(answerDescription);

                            // Process any pending candidates
                            console.log(`Processing ${pendingCandidatesRef.current.length} pending candidates`);
                            for (const candidate of pendingCandidatesRef.current) {
                                await pc.addIceCandidate(candidate);
                            }
                            pendingCandidatesRef.current = [];
                        }
                    });

                    // Listen for callee's ICE candidates
                    onSnapshot(calleeCandidatesCollection, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                console.log('Received ICE candidate from callee');
                                const candidate = new RTCIceCandidate(change.doc.data());
                                handleCandidate(candidate);
                            }
                        });
                    });
                } else {
                    console.log('Starting callee flow');
                    const roomSnapshot = await getDoc(roomRef);
                    if (!roomSnapshot.exists()) {
                        console.error('Room does not exist');
                        alert("Room does not exist.");
                        router.push("/");
                        return;
                    }

                    // Listen for caller's ICE candidates first
                    onSnapshot(collection(roomRef, "callerCandidates"), (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                console.log('Received ICE candidate from caller');
                                const candidate = new RTCIceCandidate(change.doc.data());
                                handleCandidate(candidate);
                            }
                        });
                    });

                    // Get and set the offer
                    const roomData = roomSnapshot.data();
                    const offer = roomData?.offer;
                    if (!offer) {
                        console.error('No offer found in room');
                        return;
                    }

                    try {
                        console.log('Setting remote description (offer)');
                        await pc.setRemoteDescription(new RTCSessionDescription(offer));
                        console.log('Remote description set successfully');

                        // Process any pending candidates
                        const pendingCandidates = pendingCandidatesRef.current;
                        console.log(`Processing ${pendingCandidates.length} pending candidates`);
                        for (const candidate of pendingCandidates) {
                            try {
                                await pc.addIceCandidate(candidate);
                                console.log('Processed pending candidate successfully');
                            } catch (err) {
                                console.error('Error processing pending candidate:', err);
                            }
                        }
                        pendingCandidatesRef.current = [];

                        // Create and set answer
                        const answer = await pc.createAnswer();
                        console.log('Created answer');
                        await pc.setLocalDescription(answer);
                        console.log('Local description (answer) set');

                        await updateDoc(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });
                        console.log('Answer saved to Firestore');
                    } catch (err) {
                        console.error('Error in callee negotiation:', err);
                    }
                }
            } catch (err) {
                console.error('Error in init:', err);
            } finally {
                isSettingUp.current = false;
            }
        }

        init();

        return () => {
            console.log('Cleaning up WebRTC connection');
            isMounted.current = false;

            if (pcRef.current) {
                // Remove all tracks before closing
                if (localStream) {
                    localStream.getTracks().forEach(track => {
                        const senders = pcRef.current?.getSenders() || [];
                        const sender = senders.find(s => s.track === track);
                        if (sender) {
                            pcRef.current?.removeTrack(sender);
                        }
                    });
                }
                pcRef.current.close();
                pcRef.current = null;
            }

            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [roomId, isCaller, router]);

    const handleEndCall = async () => {
        // Clean up WebRTC connection
        if (pcRef.current) {
            // Remove all tracks before closing
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    const senders = pcRef.current?.getSenders() || [];
                    const sender = senders.find(s => s.track === track);
                    if (sender) {
                        pcRef.current?.removeTrack(sender);
                    }
                });
            }
            pcRef.current.close();
            pcRef.current = null;
        }

        // Stop local stream tracks
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }

        // Clean up room in Firestore
        try {
            const roomRef = doc(firestore, "rooms", roomId);
            await deleteDoc(roomRef);
        } catch (error) {
            console.error("Error cleaning up room:", error);
        }

        // Navigate to post-interview page
        router.push("/post-interview");
    };

    return (
        <div className="p-4 h-screen flex items-center gap-8">
            <InstructionsDialog 
                isOpen={showInstructions} 
                onClose={() => setShowInstructions(false)} 
            />
            <div className="w-1/2 h-[90vh]">
                <VideoChat 
                    localVideoRef={localVideoRef} 
                    remoteVideoRef={remoteVideoRef}
                    peerJoined={peerJoined}
                    connectionStatus={connectionStatus}
                    isCaller={isCaller}
                    roomId={roomId}
                    onEndCall={handleEndCall}
                    peerConnection={pcRef.current}
                />
            </div>

            <div className="w-1/2 h-[90vh]">
                {
                    isCaller ?
                        <RealtimeAssistancePanel 
                            localStream={localStream} 
                            remoteAudioStream={remoteAudioStream} 
                            onShowInstructions={() => setShowInstructions(true)}
                        /> 
                        :
                        <NotesPanel />
                }
            </div>
        </div>
    );
}