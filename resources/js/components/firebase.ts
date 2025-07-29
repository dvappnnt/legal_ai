// firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // For Realtime Database

const firebaseConfig = {
    apiKey: "AIzaSyD95zbrIIGTp3H_zE68HSgpst9vSuvU-mU",
    authDomain: "ai-meeting-app-768fa.firebaseapp.com",
    projectId: "ai-meeting-app-768fa",
    storageBucket: "ai-meeting-app-768fa.firebasestorage.app",
    messagingSenderId: "171353050484",
    appId: "1:171353050484:web:b1bb96b2493158feeb7021",
    measurementId: "G-8D57QVQPFQ"
  };

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
