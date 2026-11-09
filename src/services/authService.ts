import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { ref, set, onDisconnect, onValue } from 'firebase/database';
import { auth, database } from './firebase';

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  // Lưu thông tin user vào Realtime Database
  await set(ref(database, `users/${user.uid}`), {
    uid: user.uid,
    displayName,
    email,
    online: true,
    lastSeen: Date.now(),
    photoURL: null,
  });

  // Setup presence
  setupPresence(user.uid);

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Set online
  await set(ref(database, `users/${user.uid}/online`), true);
  await set(ref(database, `users/${user.uid}/lastSeen`), Date.now());

  // Setup presence
  setupPresence(user.uid);

  return user;
};

export const logoutUser = async () => {
  const user = auth.currentUser;
  if (user) {
    await set(ref(database, `users/${user.uid}/online`), false);
    await set(ref(database, `users/${user.uid}/lastSeen`), Date.now());
  }
  await signOut(auth);
};

export const setupPresence = (uid: string) => {
  const connectedRef = ref(database, '.info/connected');

  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      set(ref(database, `users/${uid}/online`), true);
      onDisconnect(ref(database, `users/${uid}/online`)).set(false);
      onDisconnect(ref(database, `users/${uid}/lastSeen`)).set(Date.now());
    }
  });
};
