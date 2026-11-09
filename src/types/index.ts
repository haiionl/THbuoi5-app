export interface User {
  uid: string;
  displayName: string;
  email: string;
  online: boolean;
  lastSeen: number;
  photoURL?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: number;
  lastSenderId: string;
  unreadCount: { [uid: string]: number };
}
