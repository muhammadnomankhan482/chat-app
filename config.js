// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore, setDoc,doc, query, collection, where, getDocs,  updateDoc,getDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDF3KpE7WBfJkg6uIywIEE-k01wq7oQIDc",
    authDomain: "chat-app-e7386.firebaseapp.com",
    projectId: "chat-app-e7386",
    storageBucket: "chat-app-e7386.firebasestorage.app",
    messagingSenderId: "1071577615022",
    appId: "1:1071577615022:web:37e344c435cb995d783b3f",
    measurementId: "G-L1WXTXS9WX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);


export {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    setDoc,
    db,
    doc, 
    signOut,
    query,
    collection,
    where,
    getDocs,
     updateDoc, arrayUnion, arrayRemove, getDoc
}