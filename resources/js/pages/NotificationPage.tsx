import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

import NoNotifImage from '../assets/NoNotif.png';

function NotificationPage() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([
        { id: 1, message: '📅 You have a meeting at 3:00 PM today.', time: '15 mins ago' },
        { id: 2, message: '🔔 New AI summary is available from your last meeting.', time: '1 hour ago' },
        { id: 3, message: '🧠 AI Assistant has a new suggestion for your team sync.', time: '2 hours ago' },
    ]);

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    // You can use useEffect to simulate fetching data
    // useEffect(() => {
    //     // In a real app, fetch data from Firestore here
    //     // For example:
    //     // const fetchNotifications = async () => {
    //     //     const q = query(collection(db, `artifacts/${__app_id}/users/${userId}/notifications`), orderBy('createdAt', 'desc'));
    //     //     const unsubscribe = onSnapshot(q, (snapshot) => {
    //     //         const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //     //         setNotifications(fetchedNotifications);
    //     //     });
    //     //     return () => unsubscribe(); // Cleanup listener
    //     // };
    //     // fetchNotifications();
    // }, []);


    return (
        <div className="flex flex-col min-h-screen bg-gray-100">

            <nav className="flex bg-[#1B3C53] w-full">
                <div className="flex flex-col sm:flex-row px-4 sm:px-6 md:px-10 lg:px-20 py-4 sm:py-6 w-full items-center justify-between">
                    <div className='flex flex-row gap-2 sm:gap-4 items-center w-full sm:w-1/2'  >
                        <img src="src/assets/paranaquelgu.png" alt="Profile" className='h-16' />
                        <p className="text-white font-semibold text-sm sm:text-base"> Councilor Knowledge <span className='font-normal'><br />Management System</span></p>
                    </div>
                    <div className='flex flex-row gap-4 justify-end items-center w-full sm:w-1/2'>
                        <img src="/assets/Profile.png" alt="Profile" className='h-6 sm:h-7' />
                        <p className="text-white font-semibold text-sm sm:text-base"> Juan DC</p>
                    </div>
                </div>
            </nav>

            <button

                onClick={() => navigate('/')}

                className="flex items-center gap-2 text-white bg-accent_blue hover:underline rounded-full px-2 py-2 m-4 w-10"

            >

                <Icon icon="mdi:arrow-left" width="24" height="24" />

            </button>

            {/* Main content */}
            <main className="flex-grow px-4 sm:px-6 md:px-10 lg:px-40 py-8 md:py-10 lg:py-20">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3C53] mb-6 text-center sm:text-left">Notifications</h1>

                <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                    {notifications.length > 0 ? (
                        <div>
                            {notifications.map((notif, index) => (
                                <div key={notif.id} className={`py-3 ${index < notifications.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <p className="text-gray-800 font-medium text-sm sm:text-base">{notif.message}</p>
                                    <p className="text-gray-500 text-xs sm:text-sm">{notif.time}</p>
                                </div>
                            ))}
                            <div className="mt-4 text-right">
                                <button
                                    onClick={clearAllNotifications}
                                    className="text-red-500 hover:text-red-700 text-sm sm:text-base"
                                >
                                    Clear All Notifications
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                            <img src={NoNotifImage} alt="No Notifications" className="w-48 h-48 sm:w-64 sm:h-64 object-contain mb-4" /> {/* Responsive image size */}
                            <p className="text-lg sm:text-xl font-medium">No new notifications</p>
                            <p className="text-sm sm:text-base text-center mt-2">You're all caught up!</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="flex bg-[#1B3C53] w-full justify-center">
                <div className="text-white my-4 text-xs sm:text-sm">
                    <p>Copyright © Developing App Solutions 2025. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default NotificationPage;
