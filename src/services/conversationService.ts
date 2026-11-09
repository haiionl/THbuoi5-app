import { ref, onValue, off } from 'firebase/database';
import { database } from './firebase';

export interface ConversationData {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserOnline: boolean;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export const subscribeToConversations = (
  currentUserId: string,
  callback: (conversations: ConversationData[]) => void,
) => {
  const convsRef = ref(database, 'conversations');
  const usersRef = ref(database, 'users');

  let usersData: Record<string, any> = {};
  let convsData: Record<string, any> = {};

  const updateCallback = () => {
    const result: ConversationData[] = [];

    Object.entries(convsData).forEach(([id, conv]: [string, any]) => {
      const participants = conv.participants || {};
      if (!participants[currentUserId]) {
        return;
      }

      const otherUserId = Object.keys(participants).find(
        (uid) => uid !== currentUserId,
      );
      if (!otherUserId) {
        return;
      }

      const otherUser = usersData[otherUserId];
      if (!otherUser) {
        return;
      }

      result.push({
        id,
        otherUserId,
        otherUserName: otherUser.displayName || 'Unknown',
        otherUserOnline: otherUser.online || false,
        lastMessage: conv.lastMessage || '',
        lastMessageTime: conv.lastMessageTime || 0,
        unreadCount:
          (conv.unreadCount && conv.unreadCount[currentUserId]) || 0,
      });
    });

    result.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    callback(result);
  };

  const unsubUsers = onValue(usersRef, (snapshot) => {
    usersData = snapshot.val() || {};
    updateCallback();
  });

  const unsubConvs = onValue(convsRef, (snapshot) => {
    convsData = snapshot.val() || {};
    updateCallback();
  });

  return () => {
    unsubUsers();
    unsubConvs();
  };
};
