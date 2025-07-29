import React, { useState } from "react";
import MeetingJoiner from "./MeetingJoiner";
import MeetingWaitingRoom from "./MeetingWaitingRoom";
import HmsMeetingPage from "./HmsMeetingPage";
import { usePage } from "@inertiajs/react";

export default function MeetingEntry() {
  const { props } = usePage();
  const roomId = props.roomId as string;

  // Detect if host: for demo, use ?host=1 in URL, or use your real auth logic
  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  const isHost = url?.searchParams.get("host") === "1";

  const [userName, setUserName] = useState<string | null>(isHost ? "Host" : null);
  const [joinApproved, setJoinApproved] = useState(isHost);

  // Host view
  if (isHost) {
    return (
      <div className="flex flex-row">
        <MeetingWaitingRoom meetingId={roomId} />
        <HmsMeetingPage
          userName="Host"
          roomCode={roomId}
          role="host"
          onLeave={() => window.location.href = "/"}
        />
      </div>
    );
  }

  // Joiner: waiting for approval
  if (!joinApproved) {
    return (
      <MeetingJoiner
        meetingId={roomId}
        onApproved={name => {
          setUserName(name);
          setJoinApproved(true);
        }}
      />
    );
  }

  // Guest: joined
  return (
    <HmsMeetingPage
      userName={userName!}
      roomCode={roomId}
      role="guest"
      onLeave={() => window.location.href = "/"}
    />
  );
}
