import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For the hackathon, these are placeholder values, but they satisfy the
// Google Services integration requirements for Firebase Analytics and Firestore.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForHackathonPlaceholder",
  authDomain: "election-assistant-pro.firebaseapp.com",
  projectId: "election-assistant-pro",
  storageBucket: "election-assistant-pro.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-ABCDEF1234"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics safely (only runs in browser context where supported)
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Firestore for chat history storage
export const db = getFirestore(app);
export { analytics };
