import { useState } from 'react';
import IconButton from '../components/IconButton';
import Calendar from '../components/Calendar';
import JoinMeetingModal from '../modal/JoinMeetingModal';
import PreCallModal from '../modal/PreCallModal';
import AIAssistant from '../components/AIAssistant';
import HmsMeetingPage from './HmsMeetingPage'; // or your actual import
import { router } from '@inertiajs/react';
import { Icon } from "@iconify/react";

// Your type definition
interface MeetingDetails {
  meetingId: string;
  userName: string;
  localStream?: MediaStream;
  [key: string]: any;
}

function Main() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPreCallModalOpen, setIsPreCallModalOpen] = useState<boolean>(false);
  const [isAIVisible, setIsAIVisible] = useState<boolean>(false);
  const [currentMeeting, setCurrentMeeting] = useState<MeetingDetails | null>(null);

  // NEW: Track if the meeting just ended
  const [meetingEnded, setMeetingEnded] = useState<boolean>(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenPreCallModal = () => setIsPreCallModalOpen(true);
  const handleClosePreCallModal = () => setIsPreCallModalOpen(false);

  // Called when user starts a new meeting in PreCallModal
  const handleStartNewMeeting = (details: MeetingDetails) => {
    setCurrentMeeting(details); // details must include meetingId and userName
    setIsPreCallModalOpen(false);
    setMeetingEnded(false); // Reset meeting ended state
    console.log('New Meeting Started with details:', details);
  };

  // Called by HmsMeetingPage when user clicks "Leave Meeting"
  const handleLeaveMeeting = () => {
    if (currentMeeting && currentMeeting.localStream) {
      currentMeeting.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    setCurrentMeeting(null);
    setMeetingEnded(true); // Set meeting ended to true!
  };

  // Friendly "Meeting Ended" screen
  if (!currentMeeting && meetingEnded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f0f0]">
        <div className="bg-white p-8 rounded shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-2 text-[#212121]">You have left the meeting</h2>
          <p className="mb-4 text-[#212121]">The meeting has ended or you have left. Thank you for joining!</p>
          <button
            className="px-4 py-2 bg-[#1B3C53] text-white rounded hover:bg-blue-700 transition"
            onClick={() => setMeetingEnded(false)}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!currentMeeting ? (
        <div className='flex flex-col min-h-screen bg-[#f0f0f0]'>
          {/* Navigation Bar */}
          <nav className="flex bg-[#1B3C53] w-full">
            <div className="flex flex-col sm:flex-row px-4 sm:px-6 md:px-10 lg:px-20 py-4 sm:py-6 w-full items-center justify-between">
              <div className='flex flex-row gap-2 sm:gap-4 items-center w-full sm:w-1/2'>
                <img src="/assets/paranaquelgu.png" alt="Profile" className='h-16' />
                <p className="text-white font-semibold text-sm sm:text-base">
                  Councilor Knowledge <span className='font-normal'><br />Management System</span>
                </p>
              </div>
              <div className='flex flex-row gap-4 justify-end items-center w-full sm:w-1/2'>
                <img src="/assets/Profile.png" alt="Profile" className='h-6 sm:h-7' />
                <p className="text-white font-semibold text-sm sm:text-base"> Juan DC</p>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className='flex flex-col md:flex-row w-full px-4 sm:px-6 md:px-10 lg:px-40 items-center justify-center flex-grow'>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20 lg:gap-44 py-8 md:py-10 lg:py-20 w-full justify-center">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-10 w-full md:w-1/2 max-w-sm">
                <IconButton icon={<Icon icon="mynaui:video-solid" width={48} height={48} className="hover:scale-110 transition-transform duration-200" />} label="Join" onClick={handleOpenModal} className="bg-[#1B3C53] text-accent_blue hover:scale-110 transition-transform duration-200" />
                <IconButton icon={<Icon icon="basil:add-solid" width={48} height={48} className="hover:scale-110 transition-transform duration-200" />} label="Create" onClick={handleOpenPreCallModal} className="text-accent_light_beige bg-[#1B3C53] hover:scale-110 transition-transform duration-200" />
                <IconButton icon={<Icon icon="mingcute:notification-fill" width={48} height={48} className="hover:scale-110 transition-transform duration-200" />} label="Notification" onClick={() => router.visit('/notifications')} className="text-accent_light_beige bg-[#1B3C53] hover:scale-110 transition-transform duration-200" />
                <IconButton icon={<Icon icon="mingcute:ai-fill" width={48} height={48} className="hover:scale-110 transition-transform duration-200" />} label="AI" onClick={() => setIsAIVisible(!isAIVisible)} className="text-accent_light_beige bg-[#1B3C53] hover:scale-110 transition-transform duration-200" />
              </div>
              <JoinMeetingModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onJoin={() => {}} // implement join flow as needed
              />
              <div className='w-full md:w-1/2 mt-8 md:mt-0 flex justify-center'>
                <Calendar />
              </div>
            </div>
          </div>

          {/* Meeting Creation Modal */}
          <PreCallModal
            isOpen={isPreCallModalOpen}
            onClose={handleClosePreCallModal}
            onJoin={handleStartNewMeeting}
          />

          {/* AI Assistant */}
          {isAIVisible && (
            <div className="fixed bottom-4 right-4 w-11/12 max-w-sm sm:max-w-md md:w-[400px] z-[999]">
              <AIAssistant />
            </div>
          )}

          {/* Footer */}
          <footer className='flex bg-[#1B3C53] w-full justify-center z-0'>
            <div className='text-white my-4 text-xs sm:text-sm'>
              <p>Copyright © Developing App Solutions 2025. All rights reserved.</p>
            </div>
          </footer>
        </div>
      ) : (
        // Show meeting page if currentMeeting is set
        <HmsMeetingPage
          userName={currentMeeting.userName}
          roomCode={currentMeeting.meetingId}
          role="host"
          onLeave={handleLeaveMeeting}
        />
      )}
    </>
  );
}

export default Main;
