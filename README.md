# ChatApp - Ứng dụng Chat 1-1 Realtime với Firebase

## Bài Thực Hành 5 - Phát triển ứng dụng di động

Ứng dụng chat 1-1 realtime được xây dựng bằng React Native CLI và Firebase, hỗ trợ đăng ký/đăng nhập, danh bạ, chat realtime với trạng thái online/offline.

---

## 📋 Tính năng

### 1. Đăng ký / Đăng nhập
- Đăng ký với họ tên, email, mật khẩu (tối thiểu 6 ký tự), nhập lại mật khẩu
- Đăng nhập bằng Firebase Authentication (Email/Password)
- Hiển thị lỗi khi sai tài khoản hoặc mật khẩu
- Đăng xuất ở màn hình Cài đặt → quay về Đăng nhập

### 2. Danh bạ
- Danh sách người dùng đã đăng ký (không gồm bản thân)
- Trạng thái online/offline cập nhật realtime
- Ô tìm kiếm theo tên
- Nhấn vào người để mở Chat

### 3. Chat 1-1
- Gửi/nhận tin nhắn realtime (không cần tải lại)
- Tin của mình bên phải (xanh), tin người kia bên trái (trắng)
- Mỗi tin nhắn có thời gian
- Không cho gửi tin rỗng
- Tự cuộn xuống tin mới nhất
- Header hiển thị tên và trạng thái online

### 4. Màn hình Home
- Danh sách cuộc trò chuyện: avatar, tên, tin nhắn cuối, thời gian
- Cuộc trò chuyện mới nhất trên cùng
- Badge số tin chưa đọc (tăng realtime, về 0 khi mở)

### 5. Màn hình Thông báo
- Placeholder (giữ từ Bài 4)

### 6. Cài đặt
- Hiển thị thông tin tài khoản
- Nút đăng xuất

---

## 🛠️ Cấu hình Firebase

### Bước 1: Tạo Firebase Project
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Nhấn **Add project** → đặt tên project → tạo

### Bước 2: Bật Authentication
1. Vào **Authentication** → **Sign-in method**
2. Bật **Email/Password** → Save

### Bước 3: Tạo Realtime Database
1. Vào **Realtime Database** → **Create Database**
2. Chọn vùng (ví dụ: `asia-southeast1`)
3. Bắt đầu ở **Test mode** (sau đó thay bằng rules bên dưới)

### Bước 4: Áp dụng Database Rules
Vào **Realtime Database** → **Rules** → paste nội dung từ file `firebase-rules.json`:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".write": "$uid === auth.uid"
      }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null && ($chatId.contains(auth.uid))",
        ".write": "auth != null && ($chatId.contains(auth.uid))"
      }
    },
    "conversations": {
      ".read": "auth != null",
      "$chatId": {
        ".write": "auth != null && ($chatId.contains(auth.uid))"
      }
    }
  }
}
```

### Bước 5: Lấy Firebase Config
1. Vào **Project Settings** (⚙️) → **General**
2. Ở phần **Your apps** → nhấn **Add app** → chọn **Web** (</>) → đặt tên → Register
3. Copy `firebaseConfig` và điền vào file `src/services/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js >= 22
- JDK 17
- Android Studio + Android SDK
- Emulator hoặc thiết bị Android

### Các bước

```bash
# 1. Cài đặt dependencies
cd E:\app\THbuoi5
npm install

# 2. Chạy Metro bundler
npm start

# 3. Chạy trên Android (terminal mới)
npm run android
```

### Nếu gặp lỗi build

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## 📁 Cấu trúc dự án

```
THbuoi5/
├── android/                        # Native Android project
├── src/
│   ├── services/                   # Firebase services
│   │   ├── firebase.ts             # Firebase config & init
│   │   ├── authService.ts          # Login, Register, Logout, Presence
│   │   ├── userService.ts          # User list subscription
│   │   ├── chatService.ts          # Messages send/receive
│   │   └── conversationService.ts  # Conversations subscription
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx     # Đăng nhập
│   │   │   └── RegisterScreen.tsx  # Đăng ký
│   │   ├── home/
│   │   │   └── HomeScreen.tsx      # Danh sách cuộc trò chuyện
│   │   ├── contacts/
│   │   │   └── ContactsScreen.tsx  # Danh bạ + search
│   │   ├── chat/
│   │   │   └── ChatScreen.tsx      # Màn hình chat
│   │   ├── notifications/
│   │   │   └── NotificationsScreen.tsx  # Placeholder
│   │   └── settings/
│   │       └── SettingsScreen.tsx   # Cài đặt + Đăng xuất
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Navigation setup
│   ├── hooks/
│   │   └── useAuth.ts             # Auth state hook
│   └── types/
│       └── index.ts               # TypeScript interfaces
├── App.tsx                         # Root component
├── index.js                        # Entry point
├── firebase-rules.json             # Database security rules
├── package.json
└── README.md
```

---

## 🔧 Yêu cầu kỹ thuật

| Yêu cầu | Thực hiện |
|----------|-----------|
| React Native CLI (không Expo) | ✅ |
| React Navigation (Bottom Tab + Stack) | ✅ |
| Firebase JS SDK (auth, database) | ✅ |
| Code Firebase trong `src/services/` | ✅ |
| Hủy listener trong cleanup useEffect | ✅ |
| TypeScript | ✅ |
| Màn hình Thông báo giữ từ Bài 4 | ✅ |

---

## 📊 Luồng dữ liệu

```
Màn hình (Screen)
    ↕ 
useEffect + useState
    ↕
Service (src/services/)
    ↕
Firebase SDK (onValue / set / push / update)
    ↕
Firebase Realtime Database (Cloud)
```

- **Đọc dữ liệu**: Screen → useEffect gọi `subscribe*()` → `onValue()` lắng nghe → callback cập nhật state → UI render lại
- **Ghi dữ liệu**: Screen → gọi `sendMessage()` / `loginUser()` → `set()` / `push()` / `update()` → Firebase → trigger `onValue` cho tất cả client
- **Cleanup**: `useEffect return` → gọi `off()` để hủy listener → tránh memory leak và tin nhắn lặp

---

## 📝 Ghi chú

- File `src/services/firebase.ts` cần được điền thông tin Firebase config thực tế trước khi chạy
- Ứng dụng sử dụng Firebase Realtime Database (không phải Firestore)
- Trạng thái online/offline dùng `.info/connected` và `onDisconnect` của Firebase
- Mã nguồn không bao gồm: `node_modules/`, `android/build/`, `ios/Pods/`
