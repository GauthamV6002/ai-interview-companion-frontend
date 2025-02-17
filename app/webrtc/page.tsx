"use client"
// frontend/app/components/VideoChat.tsx
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Socket, io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, Sparkle, Cross, X, Send, MessageCircleQuestion } from 'lucide-react';

interface User {
  id: string;
  stream?: MediaStream;
  peer?: Peer.Instance;
}

const VideoChat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const myVideo = useRef<HTMLVideoElement>(null);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);

  const peerConnection = useRef<RTCPeerConnection>(null);

  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const toggleAudio = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Create a peer connection
  const createPeer = (userId: string, stream: MediaStream, initiator: boolean) => {
    console.log(`Creating ${initiator ? 'initiator' : 'receiver'} peer for user:`, userId);

    const peer = new Peer({
      initiator,
      stream: stream,
      trickle: false
    });

    peer.on('signal', (data) => {
      console.log('Sending signal to:', userId);
      socket?.emit('signal', { to: userId, signal: data });
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received stream from:', userId);
      setUsers((prev) => {
        const newUsers = new Map(prev);
        newUsers.set(userId, { ...newUsers.get(userId)!, stream: remoteStream });
        return newUsers;
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error with user', userId, ':', err);
    });

    return peer;
  };

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing socket connection...');
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection...');
      newSocket.close();
    };
  }, []);

  // Initialize media stream
  useEffect(() => {
    if (!socket) return;

    console.log('Requesting media stream...');
    console.log(navigator);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log('Got media stream');
        setMyStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
        socket.emit('ready');
      })
      .catch(err => {
        console.error('Failed to get media stream:', err);
      });

    return () => {
      myStream?.getTracks().forEach(track => track.stop());
    };
  }, [socket]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !myStream) return;

    socket.on('me', (id) => {
      console.log('Received my ID:', id);
      setMyId(id);
    });

    socket.on('users', (userIds: string[]) => {
      console.log('Received user list:', userIds);
      userIds.forEach(userId => {
        if (userId !== myId && !users.has(userId)) {
          console.log('Creating initiator peer for existing user:', userId);
          const peer = createPeer(userId, myStream, true);
          setUsers((prev) => {
            const newUsers = new Map(prev);
            newUsers.set(userId, { id: userId, peer });
            return newUsers;
          });
        }
      });
    });

    socket.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
      if (userId !== myId && !users.has(userId)) {
        console.log('Creating receiver peer for new user:', userId);
        const peer = createPeer(userId, myStream, false);
        setUsers((prev) => {
          const newUsers = new Map(prev);
          newUsers.set(userId, { id: userId, peer });
          return newUsers;
        });
      }
    });

    socket.on('signal', ({ from, signal }: { from: string; signal: Peer.SignalData }) => {
      console.log('Received signal from:', from);
      const user = users.get(from);
      if (user?.peer) {
        console.log('Signaling existing peer for user:', from);
        user.peer.signal(signal);
      }
    });

    socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      const user = users.get(userId);
      if (user?.peer) {
        user.peer.destroy();
      }
      setUsers((prev) => {
        const newUsers = new Map(prev);
        newUsers.delete(userId);
        return newUsers;
      });
    });

    return () => {
      socket.off('me');
      socket.off('users');
      socket.off('user-joined');
      socket.off('signal');
      socket.off('user-left');
    };
  }, [socket, myStream, myId, users]);

  async function startSession() {
    // Get an ephemeral key from the Fastify server
    const tokenResponse = await fetch("/api/session", {
      mode: 'cors',
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
    const data = await tokenResponse.json();
    console.log(data)
    const EPHEMERAL_KEY = data.client_secret.value;
    console.log(EPHEMERAL_KEY);


    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    // audioElement.current = document.createElement("audio");
    // audioElement.current.autoplay = true;
    // pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
        "Access-Control-Allow-Origin": "*", // Allow all origins
      },
    });

    const answer: RTCSessionDescriptionInit = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;

    console.log('OPEN SESSION');
  }

  function generateTextResponse() {
    const message = {
      type: "response.create",
      event_id: crypto.randomUUID(),
      response: {
        modalities: ["text"],
        "max_output_tokens": 128,
      },
    }

    if (dataChannel) {
      dataChannel.send(JSON.stringify(message));
    }
  }


  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;

    console.log('CLOSE DATA CHANNEL');
  }

  function setSessionConfig() {

    const message = {
      type: "session.update",
      session: {
        turn_detection: {
          type: "server_vad",
          create_response: false
        }
      },
      event_id: crypto.randomUUID()
    }

    if (dataChannel) {
      dataChannel.send(JSON.stringify(message));
      console.log('SEND SET DATA CONFIG MESSAGE', message);
      // setEvents((prev) => [message, ...prev]);
    }
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        if (JSON.parse(e.data).type === "input_audio_buffer.committed") {
          console.log("respond!");
          // TODO: set delay so it doesn't go off again, use a setTimeout on useState
          // generateTextResponse();
        }
        // setEvents((prev) => [JSON.parse(e.data), ...prev]);
        console.log("EVENT", JSON.parse(e.data));
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
        console.log("from open thing", dataChannel.readyState);
        setSessionConfig();
      });

    }
  }, [dataChannel]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="relative">
          <video
            ref={myVideo}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg bg-gray-900"
          />
          <p className="absolute bottom-2 left-2 bg-black/50 text-white px-2 rounded">
            You ({myId})
          </p>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <p className="text-white">Camera Off</p>
            </div>
          )}
        </div>
        {Array.from(users.entries()).map(([userId, user]) => (
          user.stream && (
            <div key={userId} className="relative">
              <video
                autoPlay
                playsInline
                className="w-full rounded-lg bg-gray-900"
                ref={(ref) => {
                  if (ref) ref.srcObject = user.stream!;
                }}
              />
              <p className="absolute bottom-2 left-2 bg-black/50 text-white px-2 rounded">
                User {userId}
              </p>
            </div>
          )
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${isAudioEnabled ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
              } hover:opacity-80 transition-opacity`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoEnabled ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
              } hover:opacity-80 transition-opacity`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
          {
            !isSessionActive ?
              <button
                onClick={startSession}
                className={`p-3 rounded-full bg-green-100 text-green-600 hover:opacity-80 transition-opacity`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                <Sparkle size={24} />
              </button>
              :
              <button
                onClick={stopSession}
                className={`p-3 rounded-full bg-red-100 text-red-600 hover:opacity-80 transition-opacity`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                <X size={24} />
              </button>
          }

          <button
            onClick={generateTextResponse}
            className={`p-3 rounded-full bg-blue-100 text-blue-600 hover:opacity-80 transition-opacity`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            <MessageCircleQuestion size={24} />
          </button>
        </div>


      </div>
    </div>
  );
};

export default VideoChat