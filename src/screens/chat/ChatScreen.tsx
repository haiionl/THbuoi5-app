import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ref, onValue } from 'firebase/database';
import Geolocation from '@react-native-community/geolocation';
import { auth, database } from '../../services/firebase';
import {
  getChatId,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
} from '../../services/chatService';
import { Message } from '../../types';
import { HomeStackParamList } from '../../navigation/AppNavigator';

type ChatRouteProp = RouteProp<HomeStackParamList, 'Chat'>;

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'Chat'>>();
  const { otherUserId, otherUserName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const currentUser = auth.currentUser;
  const chatId = currentUser ? getChatId(currentUser.uid, otherUserId) : '';

  // Set navigation header
  useEffect(() => {
    navigation.setOptions({
      title: otherUserName,
      headerStyle: { backgroundColor: '#fff' },
      headerTintColor: '#0084FF',
      headerTitleStyle: { color: '#1a1a1a', fontWeight: '600' },
    });
  }, [navigation, otherUserName]);

  // Subscribe to other user's online status
  useEffect(() => {
    const statusRef = ref(database, `users/${otherUserId}/online`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      setOtherUserOnline(snapshot.val() === true);
    });
    return unsubscribe;
  }, [otherUserId]);

  // Subscribe to messages
  useEffect(() => {
    if (!chatId) {
      return;
    }
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
    });
    return unsubscribe;
  }, [chatId]);

  // Mark as read on mount
  useEffect(() => {
    if (!chatId || !currentUser) {
      return;
    }
    markMessagesAsRead(chatId, currentUser.uid).catch(() => {});
  }, [chatId, currentUser]);

  // Update header subtitle with online status
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1a1a1a' }}>
            {otherUserName}
          </Text>
          <Text style={{ fontSize: 12, color: otherUserOnline ? '#00C896' : '#aaa' }}>
            {otherUserOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
        </View>
      ),
    });
  }, [navigation, otherUserName, otherUserOnline]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !currentUser || sending) {
      return;
    }
    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      await sendMessage(currentUser.uid, otherUserId, text);
    } catch (err) {
      setInputText(text);
    } finally {
      setSending(false);
    }
  }, [inputText, currentUser, otherUserId, sending]);

  const handleSendLocation = useCallback(() => {
    if (!currentUser || sending) {
      return;
    }
    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const locationText = `📍 Vị trí: https://maps.google.com/?q=${latitude},${longitude}`;
        try {
          await sendMessage(currentUser.uid, otherUserId, locationText);
        } catch (err) {
          Alert.alert('Lỗi', 'Không thể gửi vị trí. Vui lòng thử lại.');
        }
      },
      (error) => {
        Alert.alert(
          'Không thể lấy vị trí',
          'Vui lòng bật định vị GPS và cấp quyền truy cập vị trí cho ứng dụng.',
        );
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  }, [currentUser, otherUserId, sending]);

  const handleOpenUrl = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUser?.uid;
    const isLocation = item.text.startsWith('📍') && item.text.includes('maps.google.com');
    const urlMatch = item.text.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : null;

    return (
      <View
        style={[
          styles.messageRow,
          isMyMessage ? styles.messageRowRight : styles.messageRowLeft,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myBubble : styles.theirBubble,
          ]}>
          {isLocation && url ? (
            <TouchableOpacity onPress={() => handleOpenUrl(url)} activeOpacity={0.8}>
              <Text
                style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.theirMessageText,
                  styles.linkText,
                ]}>
                {item.text}
              </Text>
              <Text
                style={[
                  styles.openMapText,
                  isMyMessage ? styles.openMapTextMine : styles.openMapTextTheirs,
                ]}>
                🗺️ Nhấn để mở Google Maps
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.theirMessageText,
              ]}>
              {item.text}
            </Text>
          )}
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
            ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const reversedMessages = [...messages].reverse();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={reversedMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleSendLocation}
          activeOpacity={0.8}>
          <Text style={styles.locationButtonText}>📍</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#aaa"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          activeOpacity={0.8}>
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageRow: {
    marginVertical: 3,
    flexDirection: 'row',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: '#0084FF',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.75)',
  },
  theirMessageTime: {
    color: '#aaa',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  openMapText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  openMapTextMine: {
    color: '#E0E7FF',
  },
  openMapTextTheirs: {
    color: '#0084FF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  locationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 1,
  },
  locationButtonText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
});
