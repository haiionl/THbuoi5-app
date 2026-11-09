import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../../services/firebase';
import { subscribeToUsers } from '../../services/userService';
import { User } from '../../types';
import { ContactsStackParamList } from '../../navigation/AppNavigator';

type ContactsScreenProps = {
  navigation: NativeStackNavigationProp<ContactsStackParamList, 'ContactsScreen'>;
};

const getInitials = (name: string): string => {
  if (!name) {
    return '?';
  }
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const AVATAR_COLORS = [
  '#0084FF', '#FF6B35', '#6C63FF', '#00C896',
  '#FF4757', '#FFA502', '#2ED573', '#FF6B9D',
];
const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function ContactsScreen({ navigation }: ContactsScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const unsubscribe = subscribeToUsers(currentUser.uid, (u) => setUsers(u));
    return unsubscribe;
  }, [currentUser]);

  const filteredUsers = users.filter((u) =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenChat = (user: User) => {
    navigation.navigate('Chat', {
      otherUserId: user.uid,
      otherUserName: user.displayName,
    });
  };

  const renderItem = ({ item }: { item: User }) => {
    const initials = getInitials(item.displayName);
    const avatarColor = getAvatarColor(item.displayName);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleOpenChat(item)}
        activeOpacity={0.7}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                item.online ? styles.statusDotOnline : styles.statusDotOffline,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                item.online ? styles.statusTextOnline : styles.statusTextOffline,
              ]}>
              {item.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>

        {/* Chat icon */}
        <Text style={styles.chatIcon}>→</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh bạ</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Tìm kiếm theo tên..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Users count */}
      <Text style={styles.usersCount}>
        {filteredUsers.length} người dùng
      </Text>

      {/* List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        contentContainerStyle={
          filteredUsers.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  usersCount: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: '#00C896',
  },
  statusDotOffline: {
    backgroundColor: '#ccc',
  },
  statusText: {
    fontSize: 13,
  },
  statusTextOnline: {
    color: '#00C896',
  },
  statusTextOffline: {
    color: '#aaa',
  },
  chatIcon: {
    fontSize: 18,
    color: '#ccc',
    paddingLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 78,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#888',
  },
});
