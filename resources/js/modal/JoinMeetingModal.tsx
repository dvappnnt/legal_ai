import React, { useState } from 'react';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (options: {
    meetingId: string;
    username: string;
    doNotConnectAudio: boolean;
    turnOffVideo: boolean;
  }) => void;
}

const JoinMeetingModal: React.FC<JoinMeetingModalProps> = ({ isOpen, onClose, onJoin }) => {
  const [meetingId, setMeetingId] = useState<string>('');
  const [username, setUsername] = useState<string>('Juan Dela Cruz');
  const [doNotConnectAudio, setDoNotConnectAudio] = useState<boolean>(false);
  const [turnOffVideo, setTurnOffVideo] = useState<boolean>(false);

  if (!isOpen) {
    return null;
  }

  const handleJoinClick = (): void => {
    onJoin({ meetingId, username, doNotConnectAudio, turnOffVideo });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Modal Title */}
        <h2 className="text-2xl font-semibold text-accent_blue mb-6 text-center">Join a Meeting</h2>

        {/* Meeting ID Input */}
        <div className="mb-4">
          <label htmlFor="meeting-id" className="block text-gray-700 text-sm font-medium mb-2">
            Meeting ID:
          </label>
          <input
            type="text"
            id="meeting-id"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent_blue"
            placeholder="XXXX-XXXX-XXXX"
            value={meetingId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMeetingId(e.target.value)}
          />
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
            Username:
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent_blue"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />
        </div>

        {/* Checkbox: Do not connect audio */}
        <div className="mb-3 flex items-center">
          <input
            type="checkbox"
            id="do-not-connect-audio"
            className="form-checkbox h-4 w-4 text-accent_blue rounded focus:ring-accent_blue"
            checked={doNotConnectAudio}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoNotConnectAudio(e.target.checked)}
          />
          <label htmlFor="do-not-connect-audio" className="ml-2 text-gray-700 text-sm">
            Do not connect audio
          </label>
        </div>

        {/* Checkbox: Turn off Video */}
        <div className="mb-8 flex items-center">
          <input
            type="checkbox"
            id="turn-off-video"
            className="form-checkbox h-4 w-4 text-accent_blue rounded focus:ring-accent_blue"
            checked={turnOffVideo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTurnOffVideo(e.target.checked)}
          />
          <label htmlFor="turn-off-video" className="ml-2 text-gray-700 text-sm">
            Turn off Video
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          {/* Join Button */}
          <button
            onClick={handleJoinClick}
            className="px-6 py-2 bg-accent_light_blue text-white rounded-md hover:bg-accent_blue focus:outline-none focus:ring-2 focus:ring-accent_blue focus:ring-offset-2"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinMeetingModal;