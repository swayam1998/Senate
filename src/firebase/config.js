import firebase from 'firebase';

const app = firebase.initializeApp({
    apiKey: "AIzaSyBOm2m10wgptwrC4ZcrsRcWnkfxq8es5Gk",
    authDomain: "senate-c67b5.firebaseapp.com",
    projectId: "senate-c67b5",
    storageBucket: "senate-c67b5.appspot.com",
    messagingSenderId: "566424162508",
    appId: "1:566424162508:web:a0bfbb8403a2fba2747269"
});

export const firestore = firebase.firestore();
export default app;