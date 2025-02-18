import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAsXLYcobuugRsStnk2-O6Adeneytm55E4",
    authDomain: "ai-interview-assistant-35a63.firebaseapp.com",
    projectId: "ai-interview-assistant-35a63",
    storageBucket: "ai-interview-assistant-35a63.firebasestorage.app",
    messagingSenderId: "391251524701",
    appId: "1:391251524701:web:c23efb95de8c3de53521b4",
    measurementId: "G-T1H496TVLW"
};


const app = initializeApp(firebaseConfig); 
const firestore = getFirestore(app);

export { app, firestore };