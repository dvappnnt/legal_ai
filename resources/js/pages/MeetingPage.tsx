    import React, { useState, useEffect, useRef } from 'react';
    import { Icon } from '@iconify/react';

    const MeetingPage = ({
      meetingId = 'abc123',
      localStream,
      userName,
      onLeaveMeeting,
      initialSettings = {},
    }: {
      meetingId: string;
      localStream: any;
      userName: string;
      onLeaveMeeting: () => void;
      initialSettings: any;
    }) => {
      const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
      const videoRef = useRef<HTMLVideoElement | null>(null);

      useEffect(() => {
        if (videoRef.current && localStream) {
          videoRef.current.srcObject = localStream as MediaStream;
        }
      }, [localStream]);

      useEffect(() => {
        // Remove localStreamRef logic, as we now rely on the prop
        return () => {
          if (localStream) {
            localStream.getTracks().forEach((track: any) => track.stop());
          }
        };
      }, [localStream]);

      const handleLeave = () => {
        setShowLeaveConfirm(true);
      };

      const confirmLeave = () => {
        if (typeof onLeaveMeeting === 'function') {
          onLeaveMeeting();
        }
      };

      return (
        <>
          {showLeaveConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white text-black p-6 rounded-md shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Leave Meeting?</h2>
                <p className="mb-4">Are you sure you want to leave the meeting?</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLeave}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col min-h-screen bg-gray-900 text-white font-inter">
            {/* NAVBAR (Settings removed) */}
            <nav className="flex bg-[#1B3C53] w-full">
              <div className="flex px-20 py-6 w-full">
                <div className="flex flex-row gap-4 items-center">
                  <img src="/assets/Profile.png" alt="Profile" className="h-7" />
                  <p className="text-white font-semibold">Juan DC</p>
                </div>
              </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 overflow-hidden">

            {/* LEAVE BUTTON */}
            <div className="flex justify-end w-full p-4">
              <button
                onClick={handleLeave}
                title="Leave Meeting"
                className="w-22 h-22 text-red-600 hover:bg-red-700 hover:text-white rounded-full flex items-center justify-center"
              >
                <Icon icon="mdi:cross-circle" width="28" height="28" />
              </button>
            </div>
              <h1 className="text-3xl font-bold mb-6">Meeting in Progress</h1>

              <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8 w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">Your Video</h2>
                <div className="relative w-full h-80 bg-black rounded-md overflow-hidden mb-4 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <p className="text-lg text-center mb-4">
                  Meeting ID:{' '}
                  <span className="font-mono bg-gray-700 px-3 py-1 rounded-md text-yellow-300">
                    {meetingId}
                  </span>
                </p>
                <p className="text-sm text-gray-400 text-center">
                  Share this ID with others to invite them to the meeting.
                </p>
              </div>

              {/* PARTICIPANTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mb-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-700 rounded-lg shadow-md p-4 flex items-center justify-center h-48 text-gray-400"
                  >
                    Waiting for Participant {i}
                  </div>
                ))}
              </div>
            </main>

            {/* FOOTER */}
            <footer className="flex bg-[#1B3C53] w-full justify-center">
              <div className="text-white my-4">
                <p>Copyright © Developing App Solutions 2025. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </>
      );
    };

    export default MeetingPage;
