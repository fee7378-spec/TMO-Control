import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, remove, update, query, orderByChild } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDYZ6rkVXqM_owmGpIGIkysngpw88sjtyk",
  authDomain: "tmo-control.firebaseapp.com",
  projectId: "tmo-control",
  storageBucket: "tmo-control.firebasestorage.app",
  messagingSenderId: "266940379379",
  appId: "1:266940379379:web:e575be115dbd827d954786",
  databaseURL: "https://tmo-control-default-rtdb.firebaseio.com" // or the correct one if needed, actually it defaults to the authDomain mostly but we should supply it
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const esteirasRef = ref(db, 'esteiras');
export const analistasRef = ref(db, 'analistas');
export const medicoesRef = ref(db, 'medicoes');

export { push, set, remove, update, ref, query, orderByChild };
