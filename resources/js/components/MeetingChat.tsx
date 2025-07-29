import React, { useEffect, useRef, useState } from "react";
import { db } from "./firebase"; // adjust the path as needed
import { ref, push, onChildAdded, off, DataSnapshot } from "firebase/database";

interface MeetingChatProps {
  roomId: string;
  userName: string;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: number;
}

// Helper for time display
function formatTime(ts: number) {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MeetingChat: React.FC<MeetingChatProps> = ({ roomId, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time subscription
  useEffect(() => {
    const chatRef = ref(db, `meetings/${roomId}/chat`);
    const handleNew = (snap: DataSnapshot) => {
      const val = snap.val();
      if (!val) return;
      setMessages((prev) => [
        ...prev,
        {
          id: snap.key || Math.random().toString(),
          user: val.user,
          text: val.text,
          time: val.time,
        },
      ]);
    };
    onChildAdded(chatRef, handleNew);
    return () => off(chatRef, "child_added", handleNew);
  }, [roomId]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const chatRef = ref(db, `meetings/${roomId}/chat`);
    await push(chatRef, {
      user: userName,
      text: text.trim(),
      time: Date.now(),
    });
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 bg-gray-900 rounded-t">
        {messages.map(msg => {
          const isMe = msg.user === userName;
          return (
            <div key={msg.id} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-lg px-4 py-2 shadow
                ${isMe
                  ? "bg-blue-600 text-white self-end"
                  : "bg-gray-700 text-gray-100 self-start"
                }`}>
                <div className="flex items-center mb-1">
                  <span className={`font-semibold text-xs ${isMe ? "text-blue-200" : "text-blue-400"}`}>
                    {msg.user}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">{formatTime(msg.time)}</span>
                </div>
                <div className="break-words">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>
      <form className="flex bg-gray-800 rounded-b" onSubmit={sendMessage}>
        <input
          className="flex-1 px-2 py-1 rounded text-white"
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          type="submit"
          className=" px-4 py-4 bg-[#7C7AE1] text-white rounded"
          disabled={!text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MeetingChat;
