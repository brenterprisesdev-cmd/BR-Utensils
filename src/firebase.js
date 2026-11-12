import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

const firebaseConfig = {

  apiKey: "AIzaSyCdK2SWqXjUFDQ916RDRTxhUu6lic5_9Vk",

  authDomain: "br-utensils.firebaseapp.com",

  projectId: "br-utensils",

  storageBucket: "br-utensils.firebasestorage.app",

  messagingSenderId: "592129004094",

  appId: "1:592129004094:web:28c59985e5f756e612376f",

  measurementId: "G-THVM6KBBC6"

};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = initializeFirestore(app, {}, 'default')

export default app