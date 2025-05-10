import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {

    apiKey: "AIzaSyAEsuLASAFM1ZERvjhW5k4B0DIXzwT17Ww",
  
    authDomain: "student-portal-b5711.firebaseapp.com",
  
    projectId: "student-portal-b5711",
  
    storageBucket: "student-portal-b5711.firebasestorage.app",
  
    messagingSenderId: "908656339553",
  
    appId: "1:908656339553:web:d4be9ac202b2dc3fa0d820",
  
    measurementId: "G-574Z516YWP"
};
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);