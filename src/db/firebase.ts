import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYZ6rkVXqM_owmGpIGIkysngpw88sjtyk",
  authDomain: "tmo-control.firebaseapp.com",
  projectId: "tmo-control",
  storageBucket: "tmo-control.firebasestorage.app",
  messagingSenderId: "266940379379",
  appId: "1:266940379379:web:e575be115dbd827d954786"
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });

export const esteirasCollection = collection(db, 'esteiras');
export const analistasCollection = collection(db, 'analistas');
export const medicoesCollection = collection(db, 'medicoes');

export { addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, getDoc };
