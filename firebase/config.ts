// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDya53gxokhk_xZyY4Ww_0RvmdZP8ToeoE",
  authDomain: "acunova-inventory.firebaseapp.com",
  databaseURL: "https://acunova-inventory-default-rtdb.firebaseio.com",
  projectId: "acunova-inventory",
  storageBucket: "acunova-inventory.appspot.com",
  messagingSenderId: "386769790481",
  appId: "1:386769790481:web:28fa24e5037439f187f3b0",
  measurementId: "G-ZY02H7P020"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
getAnalytics(app);

// Initialize Firestore and export it for use in services
export const db = getFirestore(app);
