import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { ref, update, onValue } from 'firebase/database';
import { auth, database } from '../../services/firebase';
import { logoutUser } from '../../services/authService';

const getInitials = (name: string | null): string => {
  if (!name) {
    return '?';
  }
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

export default function SettingsScreen() {
  const user = auth.currentUser;
  const [locationStr, setLocationStr] = useState<string>('Chưa cập nhật');
  const [locating, setLocating] = useState<boolean>(false);

  // Load user location from Firebase
  useEffect(() => {
    if (!user) {
      return;
    }
    const locRef = ref(database, `users/${user.uid}/location`);
    const unsubscribe = onValue(locRef, (snap) => {
      const val = snap.val();
      if (val && val.latitude && val.longitude) {
        setLocationStr(`${val.latitude.toFixed(4)}, ${val.longitude.toFixed(4)}`);
      }
    });
    return unsubscribe;
  }, [user]);

  const handleUpdateLocation = () => {
    if (!user) {
      return;
    }
    setLocating(true);
    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await update(ref(database, `users/${user.uid}/location`), {
            latitude,
            longitude,
            updatedAt: Date.now(),
          });
          setLocationStr(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          Alert.alert('Thành công', 'Đã cập nhật vị trí của bạn lên Firebase.');
        } catch (err) {
          Alert.alert('Lỗi', 'Không thể lưu vị trí lên Firebase.');
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        Alert.alert(
          'Không thể lấy vị trí',
          'Vui lòng bật dịch vụ định vị (GPS) và cấp quyền cho ứng dụng.',
        );
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi ChatApp?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutUser();
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại');
          }
        },
      },
    ]);
  };

  const initials = getInitials(user?.displayName || null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>
            {user?.displayName || 'Người dùng'}
          </Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Đang hoạt động</Text>
          </View>
        </View>
      </View>

      {/* Account Info Section */}
      <View style={styles.section}>
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Tài khoản</Text>
          <Text style={styles.menuValue}>{user?.displayName || '-'}</Text>
        </View>
        <View style={styles.menuItemSeparator} />
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>📧</Text>
          <Text style={styles.menuText}>Email</Text>
          <Text style={styles.menuValue} numberOfLines={1}>
            {user?.email || '-'}
          </Text>
        </View>
        <View style={styles.menuItemSeparator} />
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>📍</Text>
          <Text style={styles.menuText}>Vị trí GPS</Text>
          <Text style={styles.menuValue} numberOfLines={1}>
            {locationStr}
          </Text>
        </View>
      </View>

      {/* Location Update Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleUpdateLocation}
          disabled={locating}
          activeOpacity={0.8}>
          {locating ? (
            <ActivityIndicator size="small" color="#0084FF" />
          ) : (
            <Text style={styles.locationButtonText}>📍  Cập nhật vị trí hiện tại</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪  Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>ChatApp v1.0.0 • Firebase Realtime</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C896',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#00C896',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  menuValue: {
    fontSize: 14,
    color: '#888',
    maxWidth: 160,
  },
  menuItemSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 46,
  },
  actionSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  locationButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0084FF',
  },
  locationButtonText: {
    color: '#0084FF',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF4757',
  },
  logoutText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    color: '#bbb',
  },
});
