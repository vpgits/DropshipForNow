// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAGoRJrlWD-b9gLHV79u6Dzhr8tz5SlG8M",
    authDomain: "startup-97f6f.firebaseapp.com",
    projectId: "startup-97f6f",
    storageBucket: "startup-97f6f.appspot.com",
    messagingSenderId: "604798753344",
    appId: "1:604798753344:web:7d0c93cb51d7f305c35da5",
    measurementId: "G-ZHDZL9VT68"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider()

export { auth, db , googleProvider};