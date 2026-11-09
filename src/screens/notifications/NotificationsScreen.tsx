import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

interface NotificationItem {
  id: string;
  type: 'message' | 'system' | 'reminder';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'message',
    title: 'Tin nhắn mới',
    body: 'Bạn có một tin nhắn mới từ người dùng trong danh bạ.',
    time: '10 phút trước',
    read: false,
  },
  {
    id: '2',
    type: 'system',
    title: 'Chào mừng bạn đến với ChatApp',
    body: 'Tài khoản của bạn đã được khởi tạo và kết nối thành công với Firebase Realtime Database.',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Nhắc nhở cập nhật hồ sơ',
    body: 'Đừng quên kiểm tra họ tên và trạng thái hoạt động trong phần Cài đặt.',
    time: 'Hôm qua',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Bảo mật tài khoản',
    body: 'Hệ thống đã cập nhật luật bảo mật Realtime Database mới nhất.',
    time: '2 ngày trước',
    read: true,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const displayedList = notifications.filter((item) => {
    if (filter === 'unread') {
      return !item.read;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'system':
        return '🛡️';
      case 'reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, !item.read && styles.itemUnread]}
      onPress={() => handleToggleRead(item.id)}
      activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Text style={styles.itemIcon}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.itemBody}>
        <View style={styles.titleRow}>
          <Text style={[styles.itemTitle, !item.read && styles.itemTitleBold]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
        <Text style={styles.itemDesc} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, filter === 'all' && styles.tabItemActive]}
          onPress={() => setFilter('all')}>
          <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>
            Tất cả ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, filter === 'unread' && styles.tabItemActive]}
          onPress={() => setFilter('unread')}>
          <Text style={[styles.tabText, filter === 'unread' && styles.tabTextActive]}>
            Chưa đọc ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={displayedList.length === 0 ? styles.emptyContainer : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
            <Text style={styles.emptyDesc}>Các thông báo hệ thống và tin nhắn sẽ xuất hiện ở đây</Text>
          </View>
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 13,
    color: '#0084FF',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  tabItemActive: {
    backgroundColor: '#0084FF',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingVertical: 6,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  itemUnread: {
    backgroundColor: '#F8FAFF',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 22,
  },
  itemBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  itemTitleBold: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  itemTime: {
    fontSize: 12,
    color: '#aaa',
  },
  itemDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0084FF',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 72,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
