import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCYfHs3ZtwJT5WYTA57ZEYShDiMhiVvZjQ",
    authDomain: "ai-interview-assistant-688e2.firebaseapp.com",
    projectId: "ai-interview-assistant-688e2",
    storageBucket: "ai-interview-assistant-688e2.firebasestorage.app",
    messagingSenderId: "350523464948",
    appId: "1:350523464948:web:8dd970d68d4a3f0a8812a1",
    measurementId: "G-5ZJLF205SR"
};


const app = initializeApp(firebaseConfig); 
const firestore = getFirestore(app);

export { app, firestore };