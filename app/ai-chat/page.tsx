"use client"
import { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, getDoc, collection } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAsXLYcobuugRsStnk2-O6Adeneytm55E4",
    authDomain: "ai-interview-assistant-35a63.firebaseapp.com",
    projectId: "ai-interview-assistant-35a63",
    storageBucket: "ai-interview-assistant-35a63.firebasestorage.app",
    messagingSenderId: "391251524701",
    appId: "1:391251524701:web:c23efb95de8c3de53521b4",
    measurementId: "G-T1H496TVLW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function VideoChat() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [callId, setCallId] = useState("");
  const [summary, setSummary] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize streams and media devices
  useEffect(() => {
    // Initialize remoteStream
    setRemoteStream(new MediaStream());

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      });
  }, []);

  const handleICECandidate = async (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate && callId) {
      const callDoc = doc(db, "calls", callId);
      const candidatesCollection = doc(db, "calls", callId, "candidates", Date.now().toString());
      await setDoc(candidatesCollection, { candidate: event.candidate.toJSON() });
    }
  };

  // Set up peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();
    pc.onicecandidate = handleICECandidate;
    
    pc.ontrack = (event) => {
      if (remoteStream) {
        const track = event.track;
        const streams = event.streams[0];
        
        // Only add the track if it's not already in the stream
        if (!remoteStream.getTracks().includes(track)) {
          remoteStream.addTrack(track);
          setRemoteStream(new MediaStream(remoteStream.getTracks()));
        }
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      }
    };

    localStream?.getTracks().forEach(track => pc.addTrack(track, localStream));
    setPeerConnection(pc);
  };

  // Firebase signaling
  const createCall = async () => {
    createPeerConnection();
    const offer = await peerConnection?.createOffer();
    await peerConnection?.setLocalDescription(offer);
    
    const callDoc = doc(db, "calls", Date.now().toString());
    setCallId(callDoc.id);
    await setDoc(callDoc, { offer });
    
    // Listen for the remote answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (peerConnection && data?.answer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(collection(db, "calls", callDoc.id, "candidates"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data().candidate);
          peerConnection?.addIceCandidate(candidate);
        }
      });
    });
  };

  const joinCall = async () => {
    createPeerConnection();
    const callDoc = doc(db, "calls", callId);
    const offer = (await getDoc(callDoc)).data()?.offer;
    
    await peerConnection?.setRemoteDescription(offer);
    const answer = await peerConnection?.createAnswer();
    await peerConnection?.setLocalDescription(answer);
    await setDoc(callDoc, { answer }, { merge: true });

    // Listen for remote ICE candidates
    onSnapshot(collection(db, "calls", callId, "candidates"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data().candidate);
          peerConnection?.addIceCandidate(candidate);
        }
      });
    });
  };

  // OpenAI Integration
  const summarizeConversation = async () => {
    if (!localStream || !remoteStream) return;

    // Check if audio tracks exist
    const localAudioTrack = localStream.getAudioTracks()[0];
    const remoteAudioTrack = remoteStream.getAudioTracks()[0];

    if (!localAudioTrack || !remoteAudioTrack) {
      console.error("Audio tracks not available");
      return;
    }

    // Mix audio streams
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const destination = audioContext.createMediaStreamDestination();
    const localSource = audioContext.createMediaStreamSource(
      new MediaStream([localAudioTrack])
    );
    const remoteSource = audioContext.createMediaStreamSource(
      new MediaStream([remoteAudioTrack])
    );

    localSource.connect(destination);
    remoteSource.connect(destination);

    // Create OpenAI peer connection
    const openaiPC = new RTCPeerConnection();
    
    // Ensure destination stream has audio tracks
    const destinationTrack = destination.stream.getAudioTracks()[0];
    if (destinationTrack) {
      openaiPC.addTrack(destinationTrack);
    } else {
      console.error("No audio track in destination stream");
      return;
    }

    const dc = openaiPC.createDataChannel("events");
    dc.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "conversation.summary") {
        setSummary(data.text);
      }
    };

    // Establish OpenAI connection
    const offer = await openaiPC.createOffer();
    await openaiPC.setLocalDescription(offer);

    const tokenRes = await fetch("/api/session");
    const { client_secret } = await tokenRes.json();
    
    const response = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview", {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${client_secret.value}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = await response.text();
    await openaiPC.setRemoteDescription({ type: "answer", sdp: answer });

    // Request summary
    dc.send(JSON.stringify({
      type: "response.create",
      response: {
        modalities: ["text"],
        summary: true
      }
    }));
  };

  return (
    <div>
      <div>
        <video ref={localVideoRef} autoPlay muted />
        <video ref={remoteVideoRef} autoPlay />
      </div>
      
      <div>
        <input value={callId} onChange={(e) => setCallId(e.target.value)} />
        <button onClick={createCall}>Create Call</button>
        <button onClick={joinCall}>Join Call</button>
        <button onClick={summarizeConversation}>Get Summary</button>
      </div>

      {summary && <div className="summary">{summary}</div>}
    </div>
  );
}