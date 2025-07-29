import React, { useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface VideoPreviewProps {
  localStream?: MediaStream | null;
  turnOffVideo?: boolean;
  isAudioMuted?: boolean;
  mirrorVideo?: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ localStream, turnOffVideo, isAudioMuted, mirrorVideo }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="mb-6 flex justify-center">
      <div className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shadow-md flex items-center justify-center relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${mirrorVideo ? 'scale-x-[-1]' : ''}`}
        ></video>
        {turnOffVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 text-white text-sm">
            Video Off
          </div>
        )}
        {isAudioMuted && (
          <div className="absolute bottom-2 right-2 p-1 flex items-center justify-center">
            <Icon icon="vaadin:mute" className=" text-red-600  h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;