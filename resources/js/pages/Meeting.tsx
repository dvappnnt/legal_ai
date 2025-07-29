import React, { useState } from "react";
import MeetingChat from "@/components/MeetingChat";
import JitsiMeet from "@/components/JitsiMeet";

const Meeting: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [entered, setEntered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) setEntered(true);
  };

  if (!entered) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
          <input
            className="border px-4 py-2 mb-4 w-full rounded"
            placeholder="Your name"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            autoFocus
          />
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded font-semibold"
            type="submit"
          >
            Join Meeting
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left: Meeting Chat */}
      <div className="w-1/5 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 font-semibold text-gray-700 border-b border-gray-200">
          Meeting Chat
        </div>
        <div className="flex-1">
          <MeetingChat roomId="sammy-room" userName={userName} />
        </div>
      </div>

      {/* Center: Jitsi */}
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <JitsiMeet roomName="sammy-room" displayName={userName} />
      </div>

      {/* Right: AI Chat (future) */}
      <div className="w-1/5 bg-gray-50 border-l border-gray-200 flex flex-col">
        <div className="p-4 font-semibold text-gray-700 border-b border-gray-200">
          AI Chat (coming soon)
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-gray-400 italic">AI chat will be here...</div>
        </div>
      </div>
    </div>
  );
};
export default Meeting;
