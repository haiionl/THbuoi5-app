import { ref, onValue, off } from 'firebase/database';
import { database } from './firebase';
import { User } from '../types';

export const subscribeToUsers = (
  currentUserId: string,
  callback: (users: User[]) => void,
) => {
  const usersRef = ref(database, 'users');
  const unsubscribe = onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const users: User[] = (Object.values(data) as User[]).filter(
      (u: User) => u.uid !== currentUserId,
    );
    callback(users);
  });

  return unsubscribe;
};
