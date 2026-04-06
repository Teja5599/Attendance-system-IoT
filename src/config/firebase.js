import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase config is valid (at least apiKey or projectId)
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app;
let database;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.error(
    "⚠️ FIREBASE CONFIG MISSING ⚠️\n" +
    "Please create a .env file based on .env.example with your Firebase credentials."
  );
  // Create a dummy database object to prevent imports from crashing
  database = {
    ref: () => { throw new Error("Firebase is not configured. Please add your .env file."); }
  };
}

export { database, isConfigValid };
