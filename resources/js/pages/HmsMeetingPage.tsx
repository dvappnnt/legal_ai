import React, { useEffect, useRef, useState } from "react";
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectPeers,
  selectLocalPeer,
  selectTrackByID
} from "@100mslive/react-sdk";

import MeetingWaitingRoom from "./MeetingWaitingRoom";
import { ref, onValue } from "firebase/database";
import { db } from "../components/firebase"; 
import MeetingChat from "../components/MeetingChat";
import AIAssistant from "./LegalAi";

// ============ TOKEN  ==============
async function getToken(userName: string, roomCode: string, role: string) {
  const roomId = "688797e8a5ba8326e6eb5358";
  const endpoint = "https://prod-in2.100ms.live/hmsapi/mslserp-sam-videoconf-2331.app.100ms.live/";
  const res = await fetch(endpoint + "api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userName || "user_" + Math.floor(Math.random() * 10000),
      role,
      room_id: roomId // room id galing sa 100ms
    }),
  });
  const data = await res.json();
  console.log("100ms token response", data);
  return data.token;
}

function useJoinRequestNotification(meetingId: string, isHost: boolean) {
    const [showModal, setShowModal] = useState(false);
    const lastPendingCount = useRef(0);

    useEffect(() => {
        if (!isHost) return;
        const waitRef = ref(db, `meeting_requests/${meetingId}`);
        return onValue(waitRef, (snap) => {
        let count = 0;
        snap.forEach(child => {
            if (child.val().status === "pending") count++;
        });
        // Open modal if there's a new pending joiner (always on increase)
        if (count > lastPendingCount.current) setShowModal(true);
        // Auto-close modal if there are zero pending
        if (count === 0) setShowModal(false);
        lastPendingCount.current = count;
        });
    }, [meetingId, isHost]);
    return [showModal, setShowModal] as const;
}

interface MeetingUIProps {
  userName: string;
  roomCode: string;
  role: string;
  onLeave: () => void;
}

const MeetingUI: React.FC<MeetingUIProps> = ({ userName, roomCode, role, onLeave }) => {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const audioTrack = useHMSStore(localPeer?.audioTrack ? selectTrackByID(localPeer.audioTrack) : () => undefined);
  const videoTrack = useHMSStore(localPeer?.videoTrack ? selectTrackByID(localPeer.videoTrack) : () => undefined);

  const isHost = role === "host";
  const [waitingRoomOpen, setWaitingRoomOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(true);

  const [showToast, setShowToast] = useJoinRequestNotification(roomCode, isHost);
  const [showModal, setShowModal] = useJoinRequestNotification(roomCode, isHost);

  useEffect(() => {
    if (showModal) setWaitingRoomOpen(true);
  }, [showModal]);

  useEffect(() => {
    if (!showModal && waitingRoomOpen === true) {
      
      const timer = setTimeout(() => setWaitingRoomOpen(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showModal, waitingRoomOpen]);

  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 6000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  // Join on mount
  useEffect(() => {
    if (!isConnected) {
      getToken(userName, roomCode, role).then(token => {
        hmsActions.join({ userName, authToken: token });
      });
    }
    return () => { hmsActions.leave(); };
    
  }, []);

  useEffect(() => {
    setIsAudioOn(audioTrack?.enabled ?? true);
    setIsVideoOn(videoTrack?.enabled ?? true);
  }, [audioTrack, videoTrack]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen text-lg bg-gray-900 text-white">
        Connecting...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-400/50">
        {/* Modern Waiting Room Modal*/}
        {waitingRoomOpen && isHost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-al">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-8 relative animate-fade-in">
            <button
                onClick={() => setWaitingRoomOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                aria-label="Close"
            >&times;</button>
            <div className="flex flex-col items-center">
                <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">Waiting Room</h3>
                </div>
                <p className="mb-6 text-gray-600 text-center">
                Joiners are requesting to enter the meeting.<br/>
                <span className="text-blue-600 font-medium">Approve or reject below.</span>
                </p>
                <MeetingWaitingRoom meetingId={roomCode} />
            </div>
            </div>
        </div>
        )}
      {/* Chat Sidebar */}
      {showChat && (
        <div className="w-[280px] min-w-[200px] max-w-[340px] bg-gray-900 border-r border-gray-800 flex flex-col z-10 relative">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
            <span className="font-semibold text-white">Meeting Chat</span>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">☰</button>
          </div>
          <MeetingChat roomId={roomCode} userName={userName} />
        </div>
      )}
      {/* Show chat toggle if hidden */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="absolute left-0 top-10 z-20 bg-gray-800 text-white rounded-r px-2 py-1 opacity-70 hover:opacity-100"
        >☰</button>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="h-14 bg-gray-800 flex items-center px-6 justify-between">
          <span className="font-bold text-white">
            Meeting — Room ID: {roomCode}
          </span>
          {isHost && (
            <button
                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 relative"
                onClick={() => setWaitingRoomOpen(true)}
            >
                View Waiting Room
            </button>
            )}
        </div>

        {/* Video Grid */}
        <div className="flex-1 flex items-center justify-center bg-gray-950 overflow-hidden">
          <div className="flex items-center justify-center w-full h-full">
            {peers.length > 0 ? (
              peers.map(peer =>
                <div key={peer.id} className="w-72 h-56 bg-black rounded flex flex-col items-center justify-center border border-gray-700 mx-2">
                  <video
                    autoPlay
                    playsInline
                    muted={peer.isLocal}
                    ref={ref => {
                      if (ref && peer.videoTrack) {
                        hmsActions.attachVideo(peer.videoTrack, ref);
                      }
                    }}
                    className="rounded mb-2 w-full h-44 object-cover"
                  />
                  <div className="text-center text-sm text-white">{peer.name} {peer.isLocal ? "(You)" : ""}</div>
                </div>
              )
            ) : (
              <div className="text-gray-500 text-lg">Waiting for participants...</div>
            )}
          </div>
          {/* Participants Bar */}
            <div className="h-[80px] bg-gray-900 border-t border-gray-800 flex items-center px-4 overflow-x-auto space-x-4 fixed bottom-0 z-20">
            {peers.map(peer => (
                <div
                key={peer.id}
                className="flex flex-col items-center"
                >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {peer.name?.slice(0,2).toUpperCase()}
                </div>
                <span className="text-xs text-white mt-1">{peer.name}{peer.isLocal ? " (You)" : ""}</span>
                </div>
            ))}
            </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-[90px] left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {/* SHARE BUTTON */}
          {isHost && (
            <button
            className="bg-[#2D69A4] px-4 py-2 rounded text-white flex items-center"
            onClick={() => {
              const link = `${window.location.origin}/meeting/${roomCode}`;
              navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h.01M12 15h.01M9 12h.01M9 6v6h6V6M4 18v2a2 2 0 002 2h12a2 2 0 002-2v-2"></path>
            </svg>
            {copied ? "Copied!" : "Share"}
          </button>
          )}
          <button
            className={`px-4 py-2 rounded ${isAudioOn ? "bg-[#17BA48]" : "bg-gray-600"} text-white`}
            onClick={() => {
              hmsActions.setLocalAudioEnabled(!isAudioOn);
              setIsAudioOn(!isAudioOn);
            }}
          >
            {isAudioOn ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mic-fill" viewBox="0 0 16 16">
            <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
            <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mic-mute-fill" viewBox="0 0 16 16">
            <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4 4 0 0 0 12 8V7a.5.5 0 0 1 1 0zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a5 5 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4m3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3"/>
            <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607m-7.84-9.253 12 12 .708-.708-12-12z"/>
            </svg>}
          </button>
          <button
            className={`px-4 py-2 rounded ${isVideoOn ? "bg-[#17BA48]" : "bg-gray-600"} text-white`}
            onClick={() => {
              hmsActions.setLocalVideoEnabled(!isVideoOn);
              setIsVideoOn(!isVideoOn);
            }}
          >
            {isVideoOn ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-camera-video" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"/>
            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-camera-video-off" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.961 12.365a2 2 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518zM1.428 4.18A1 1 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634zM15 11.73l-3.5-1.555v-4.35L15 4.269zm-4.407 3.56-10-14 .814-.58 10 14z"/>
            </svg>}
          </button>
          <button
            className="bg-red-600 px-4 py-2 rounded text-white"
            onClick={() => {
              hmsActions.leave();
              onLeave();
            }}
          >
            Leave Meeting
          </button>
        </div>
      </div>

        <div className="w-[340px] min-w-[220px] max-w-[400px] bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <span className="font-semibold">AI Assistant</span>
          </div>
          <AIAssistant /> 
        </div>
    </div>
  );
};

interface HmsMeetingPageProps {
  userName: string;
  roomCode: string;
  role: string;
  onLeave: () => void;
}

const HmsMeetingPage: React.FC<HmsMeetingPageProps> = ({ userName, roomCode, role, onLeave }) => {
  return (
    <HMSRoomProvider>
      <MeetingUI userName={userName} roomCode={roomCode} role={role} onLeave={onLeave} />
    </HMSRoomProvider>
  );
};

export default HmsMeetingPage;
