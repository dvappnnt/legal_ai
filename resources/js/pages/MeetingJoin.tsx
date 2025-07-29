import React, { useState } from "react";
import HmsMeetingPage from "./HmsMeetingPage"; // adjust path if needed

interface MeetingJoinProps {
  roomId: string;
}

const MeetingJoin: React.FC<MeetingJoinProps> = ({ roomId }) => {
  const [userName, setUserName] = useState("");
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h2 className="text-xl mb-4">Join Meeting</h2>
        <input
          type="text"
          className="mb-4 px-4 py-2 rounded text-black"
          placeholder="Enter your name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
        />
        <button
          className="px-6 py-2 bg-blue-700 text-white rounded"
          onClick={() => setJoined(true)}
          disabled={!userName.trim()}
        >
          Join Meeting
        </button>
      </div>
    );
  }

  return (
    <HmsMeetingPage
      userName={userName}
      roomCode={roomId}
      role="guest"
      onLeave={() => window.location.href = "/"}
    />
  );
};

export default MeetingJoin;
