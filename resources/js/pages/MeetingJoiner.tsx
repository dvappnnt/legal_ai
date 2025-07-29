import React, { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "../components/firebase"; // Adjust the import path if needed

interface MeetingJoinerProps {
  meetingId: string;
  onApproved: (userName: string) => void;
}

const MeetingJoiner: React.FC<MeetingJoinerProps> = ({ meetingId, onApproved }) => {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string>(() => {
    // Use persistent ID per device (can be improved for real auth)
    let id = localStorage.getItem("meeting_user_id");
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("meeting_user_id", id);
    }
    return id;
  });
  const [status, setStatus] = useState<"idle" | "waiting" | "accepted" | "rejected">("idle");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "waiting") {
      // Listen for host approval
      const statusRef = ref(db, `meeting_requests/${meetingId}/${userId}/status`);
      const unsubscribe = onValue(statusRef, (snap) => {
        const val = snap.val();
        if (val === "accepted") {
          setStatus("accepted");
          onApproved(name);
        } else if (val === "rejected") {
          setStatus("rejected");
        }
      });
      return () => unsubscribe();
    }
  }, [status, meetingId, userId, name, onApproved]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await set(ref(db, `meeting_requests/${meetingId}/${userId}`), {
      name,
      status: "pending",
      requestedAt: Date.now(),
    });
    setStatus("waiting");
    setLoading(false);
  };

  if (status === "accepted") return null; // Let parent show the meeting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1B3C53]">
      {status === "idle" && (
        <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 w-80 flex flex-col gap-4 text-[#212121]">
          <h2 className="text-xl font-semibold mb-2">Enter your name to join the meeting</h2>
          <input
            className="border rounded px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Your name"
            autoFocus
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2" disabled={loading || !name}>
            {loading ? "Requesting..." : "Request to Join"}
          </button>
        </form>
      )}
      {status === "waiting" && (
        <div className="bg-white rounded shadow p-6 w-80 text-center">
          <div className="text-lg font-medium mb-2 text-[#212121]">Waiting for host approval...</div>
          <div className="text-gray-500">Please wait, the host will let you in soon.</div>
        </div>
      )}
      {status === "rejected" && (
        <div className="bg-white rounded shadow p-6 w-80 text-center">
          <div className="text-lg font-bold text-red-500 mb-2">Not admitted</div>
          <div className="text-gray-500">The host rejected your request to join.</div>
        </div>
      )}
    </div>
  );
};

export default MeetingJoiner;
