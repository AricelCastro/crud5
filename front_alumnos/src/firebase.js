
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"


const firebaseConfig = {
  apiKey: "AIzaSyAGoLg3EjfI6IXy7H5DRKgPzx3osmP9vr8",
  authDomain: "registro-a3b4a.firebaseapp.com",
  projectId: "registro-a3b4a",
  storageBucket: "registro-a3b4a.firebasestorage.app",
  messagingSenderId: "165715388209",
  appId: "1:165715388209:web:3765060692f9a5efcc7210",
  measurementId: "G-4XJ82F9ZE1"
}


const app = initializeApp(firebaseConfig)


const analytics = getAnalytics(app)


export const db = getFirestore(app)