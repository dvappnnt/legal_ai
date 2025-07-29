import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import VideoPreview from '../components/VideoPreview';
import MeetingForm from '../components/MeetingForm';

interface PreCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (options: {
    meetingId: string;
    userName: string;
    doNotConnectAudio: boolean;
    turnOffVideo: boolean;
    mirrorVideo: boolean;
    localStream: MediaStream | undefined;
  }) => void;
}

interface FormData {
  doNotConnectAudio: boolean;
  turnOffVideo: boolean;
  mirrorVideo: boolean;
}

const PreCallModal: React.FC<PreCallModalProps> = ({ isOpen, onClose, onJoin }) => {
  const [formData, setFormData] = useState<FormData>({
    doNotConnectAudio: false,
    turnOffVideo: false,
    mirrorVideo: false,
  });

  const localStreamRef = useRef<MediaStream | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const [userName, setUserName] = useState("");

  const handleFormChange = useCallback((newFormData: FormData) => {
    setFormData(newFormData);
  }, []);

  useEffect(() => {
    let stream: MediaStream;
    const getMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;

        stream.getAudioTracks().forEach(track => (track.enabled = !formData.doNotConnectAudio));
        stream.getVideoTracks().forEach(track => (track.enabled = !formData.turnOffVideo));
      } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Could not access camera/microphone. Please ensure permissions are granted.');
      }
    };

    if (isOpen) {
      getMedia();
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !formData.doNotConnectAudio;
      });
    }
  }, [formData.doNotConnectAudio]);

  useEffect(() => {
    if (localStreamRef.current && localStreamRef.current.getVideoTracks().length > 0) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !formData.turnOffVideo;
      });
    }
  }, [formData.turnOffVideo]);

  if (!isOpen) return null;

  const handleJoinClick = async (): Promise<void> => {
    setIsJoining(true);

    try {
      const meetingId = uuidv4();
      const userId = crypto.randomUUID();

      // Simulate meeting creation
      console.log(`Simulated meeting created with ID: ${meetingId}`);

      onJoin({
        meetingId,
        userName,
        ...formData,
        localStream: localStreamRef.current ?? undefined,
      });

      onClose();
    } catch (error) {
      console.error('Failed to start meeting:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#212121] flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create a Meeting</h2>

        <input
          className="w-full border px-3 py-2 rounded mb-4 text-[#212121]"
          placeholder="Your Name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          autoFocus
        />


        <VideoPreview
          localStream={localStreamRef.current}
          turnOffVideo={formData.turnOffVideo}
          isAudioMuted={formData.doNotConnectAudio}
          mirrorVideo={formData.mirrorVideo}
        />

        <MeetingForm
          onFormChange={handleFormChange}
          initialDoNotConnectAudio={formData.doNotConnectAudio}
          initialTurnOffVideo={formData.turnOffVideo}
          initialMirrorVideo={formData.mirrorVideo}
        />

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-150 ease-in-out"
            disabled={isJoining}
          >
            Cancel
          </button>
          <button
            onClick={handleJoinClick}
            className="px-6 py-2 bg-[#1B3C53] text-white rounded-md hover:bg-accent_blue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isJoining || !localStreamRef.current || !userName.trim()}
          >
            {isJoining ? 'Starting...' : 'Start Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreCallModal;
