// Firebase Config for rmbd-hub - REAL CONFIG with Singapore URL!
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDBfA6ydhJ-P9630RdSgoNykEhrmZB8bYI",
  authDomain: "rmbd-hub.firebaseapp.com",
  databaseURL: "https://rmbd-hub-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rmbd-hub",
  storageBucket: "rmbd-hub.firebasestorage.app",
  messagingSenderId: "910946223345",
  appId: "1:910946223345:web:eba6f11e076610ec9fd550",
  measurementId: "G-CXQNN1WY8N"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, onValue };
export default app;
