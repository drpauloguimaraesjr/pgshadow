import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCoYR9RpccvrkxhWxtsBAmu-yKVmykn2Dw",
    authDomain: "pgshadow-c852b.firebaseapp.com",
    projectId: "pgshadow-c852b",
    storageBucket: "pgshadow-c852b.firebasestorage.app",
    messagingSenderId: "585316831922",
    appId: "1:585316831922:web:eb2944e871e45a378d6fab",
    measurementId: "G-NCYDSFWQR4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
