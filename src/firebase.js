import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Ваш firebaseConfig из проекта woodsite-v2
const firebaseConfig = {
  apiKey: "AIzaSyDrVeWzzvSuxreXenezHkQMR8V0X9IeWtY", // 't' вместо 'T' в конце
  authDomain: "woodsite-v2.firebaseapp.com",
  projectId: "woodsite-v2",
  storageBucket: "woodsite-v2.firebasestorage.app",
  messagingSenderId: "616515332584",
  // Обратите внимание на '8' вместо 'b'
  appId: "1:616515332584:web:33e198db4cd0aa0ce3dc5d", 
  measurementId: "G-CDBWW4GTJ7"
};
const app = initializeApp(firebaseConfig);

// Экспортируем все, что нам нужно
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
