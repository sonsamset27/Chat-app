import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAaTwqbN0GMvf59sWq7wriIK2r-GemeA9g",
    authDomain: "chat-app-b30eb.firebaseapp.com",
    projectId: "chat-app-b30eb",
    storageBucket: "chat-app-b30eb.firebasestorage.app",
    messagingSenderId: "851460731719",
    appId: "1:851460731719:web:b9e53963d2c62ad07e9262",
    measurementId: "G-3L01RLWQJJ"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };
