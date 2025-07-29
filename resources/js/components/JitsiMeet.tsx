import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

interface JitsiMeetProps {
  roomName: string;
  displayName?: string;
}

const JitsiMeet: React.FC<JitsiMeetProps> = ({ roomName, displayName }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Jitsi script dynamically if not already loaded
    const existingScript = document.getElementById('jitsi-api');
    function initializeJitsi() {
      if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = "";
        const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName,
          parentNode: jitsiContainerRef.current,
          width: "100%",
          height: 600,
          userInfo: { displayName: displayName || "Guest" }
        });
        // Cleanup
        return () => api && api.dispose();
      }
    }
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.id = 'jitsi-api';
      script.async = true;
      script.onload = initializeJitsi;
      document.body.appendChild(script);
      return;
    }
    initializeJitsi();
    // eslint-disable-next-line
  }, [roomName, displayName]);

  return <div ref={jitsiContainerRef} style={{ minHeight: 600 }} />;
};

export default JitsiMeet;
