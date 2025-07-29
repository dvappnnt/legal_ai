import React, { useState, useEffect } from 'react';

interface MeetingFormProps {
  onFormChange: (options: {
    doNotConnectAudio: boolean;
    turnOffVideo: boolean;
    mirrorVideo: boolean;
  }) => void;
  initialDoNotConnectAudio?: boolean;
  initialTurnOffVideo?: boolean;
  initialMirrorVideo?: boolean;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ onFormChange, initialDoNotConnectAudio, initialTurnOffVideo, initialMirrorVideo }) => {
  const [doNotConnectAudio, setDoNotConnectAudio] = useState<boolean>(initialDoNotConnectAudio || false);
  const [turnOffVideo, setTurnOffVideo] = useState<boolean>(initialTurnOffVideo || false);
  const [mirrorVideo, setMirrorVideo] = useState<boolean>(initialMirrorVideo || false);

  useEffect(() => {
    onFormChange({ doNotConnectAudio, turnOffVideo, mirrorVideo });
  }, [doNotConnectAudio, turnOffVideo, onFormChange, mirrorVideo]);

  return (
    <>
      <div className="mb-3 flex items-center">
        <input
          type="checkbox"
          id="do-not-connect-audio"
          className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          checked={doNotConnectAudio}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoNotConnectAudio(e.target.checked)}
        />
        <label htmlFor="do-not-connect-audio" className="ml-2 text-gray-700 text-sm cursor-pointer">
          Do not connect audio
        </label>
      </div>

      <div className="mb-3 flex items-center">
        <input
          type="checkbox"
          id="turn-off-video"
          className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          checked={turnOffVideo}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTurnOffVideo(e.target.checked)}
        />
        <label htmlFor="turn-off-video" className="ml-2 text-gray-700 text-sm cursor-pointer">
          Turn off Video
        </label>
      </div>
    </>
  );
};

export default MeetingForm; 