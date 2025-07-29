import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../components/firebase";

interface Request {
  name: string;
  status: string;
  requestedAt: number;
}

interface MeetingWaitingRoomProps {
  meetingId: string;
}

const MeetingWaitingRoom: React.FC<MeetingWaitingRoomProps> = ({ meetingId }) => {
  const [requests, setRequests] = useState<{ [id: string]: Request }>({});

  useEffect(() => {
    const reqRef = ref(db, `meeting_requests/${meetingId}`);
    const unsub = onValue(reqRef, (snap) => {
      setRequests(snap.val() || {});
    });
    return () => unsub();
  }, [meetingId]);

  const handleAccept = (userId: string) => {
    update(ref(db, `meeting_requests/${meetingId}/${userId}`), { status: "accepted" });
  };

  const handleReject = (userId: string) => {
    update(ref(db, `meeting_requests/${meetingId}/${userId}`), { status: "rejected" });
  };

  return (
    <div className="p-4 bg-white rounded w-96">
      <h3 className="font-bold mb-4 text-[#212121]">Waiting Room</h3>
      {Object.entries(requests)
        .filter(([_, req]) => req.status === "pending")
        .map(([id, req]) => (
          <div key={id} className="flex items-center justify-between mb-2 border-b pb-2">
            <div>
              <span className="font-medium text-gray-700">{req.name}</span>
              <span className="text-xs text-gray-500 ml-2">{new Date(req.requestedAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAccept(id)} className="px-2 py-1 bg-green-600 text-white rounded">Accept</button>
              <button onClick={() => handleReject(id)} className="px-2 py-1 bg-red-500 text-white rounded">Reject</button>
            </div>
          </div>
        ))}
      {Object.values(requests).filter(req => req.status === "pending").length === 0 && (
        <div className="text-gray-500 text-sm">No pending requests</div>
      )}
    </div>
  );
};

export default MeetingWaitingRoom;
