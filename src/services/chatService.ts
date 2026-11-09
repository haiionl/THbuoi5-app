import { ref, push, set, onValue, off, update } from 'firebase/database';
import { database } from './firebase';
import { Message } from '../types';

export const getChatId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_');
};

const getUnreadCount = async (chatId: string, userId: string): Promise<number> => {
  return new Promise((resolve) => {
    const unreadRef = ref(database, `conversations/${chatId}/unreadCount/${userId}`);
    onValue(
      unreadRef,
      (snap) => {
        resolve(snap.val() || 0);
      },
      { onlyOnce: true },
    );
  });
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string,
) => {
  const chatId = getChatId(senderId, receiverId);
  const messagesRef = ref(database, `messages/${chatId}`);
  const newMessageRef = push(messagesRef);

  const message = {
    senderId,
    text,
    timestamp: Date.now(),
    read: false,
  };

  await set(newMessageRef, message);

  // Update conversation
  const convRef = ref(database, `conversations/${chatId}`);
  const currentUnread = await getUnreadCount(chatId, receiverId);
  await update(convRef, {
    participants: { [senderId]: true, [receiverId]: true },
    lastMessage: text,
    lastMessageTime: Date.now(),
    lastSenderId: senderId,
    [`unreadCount/${receiverId}`]: currentUnread + 1,
  });
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void,
) => {
  const messagesRef = ref(database, `messages/${chatId}`);
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const messages: Message[] = Object.entries(data)
      .map(([id, msg]) => ({
        id,
        ...(msg as Omit<Message, 'id'>),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });

  return unsubscribe;
};

export const markMessagesAsRead = async (chatId: string, userId: string) => {
  await update(ref(database, `conversations/${chatId}`), {
    [`unreadCount/${userId}`]: 0,
  });
};
