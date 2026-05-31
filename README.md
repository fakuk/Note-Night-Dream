# ☽ Note Night Dream

A **secure, offline-first dream journal** for Android — built with React Native & Expo.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 PIN Lock | 4-digit PIN gate on every app start |
| 🌙 Dream Dashboard | Glassmorphism cards, live search, stats |
| ✍️ Dream Entry | Title, story, date, category (6 types) |
| ☁ Export Backup | Share a JSON backup via any app |
| 📂 Import Backup | Restore dreams from a JSON file |
| 🎨 Dark Cinematic UI | Neon blue, midnight blue, glowing accents |

---

## 🚀 Quick Start (Development / Expo Go)

### 1. Install prerequisites

```bash
# Node.js 18+ required
node -v

# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI (for APK builds)
npm install -g eas-cli
```

### 2. Clone / unzip this project

```bash
cd NoteNightDream
npm install
```

### 3. Run on Expo Go

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android) from the Google Play Store.

> ⚠️ `expo-document-picker` and `expo-file-system` work fully on real devices.
> On the Expo Go simulator some file-picker flows may be limited.

---

## 📦 Build an APK (for sideloading)

### Option A — EAS Cloud Build (recommended)

```bash
# 1. Log in / create free account at expo.dev
eas login

# 2. Configure your project (first time only)
eas build:configure

# 3. Build a preview APK
eas build --platform android --profile preview
```

EAS will give you a download link for the `.apk` in ~10 minutes.

### Option B — Local APK (requires Android SDK)

```bash
# Pre-build native files
npx expo prebuild --platform android

# Build with Gradle
cd android
./gradlew assembleRelease

# APK is at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📁 Project Structure

```
NoteNightDream/
├── App.js                          # Root: navigation + auth gate
├── app.json                        # Expo config
├── eas.json                        # EAS build profiles
├── package.json
└── src/
    ├── context/
    │   └── AppContext.js           # Global state (dreams, auth, PIN)
    ├── screens/
    │   ├── PinScreen.js            # 4-digit PIN lock / setup
    │   ├── DashboardScreen.js      # Dream list + FAB + stats
    │   ├── DreamEntryScreen.js     # Add / edit dream form
    │   └── SettingsScreen.js       # Export, Import, Change PIN
    ├── components/
    │   ├── DreamCard.js            # Glassmorphism dream card
    │   └── CategoryBadge.js        # Colored category pill
    └── utils/
        ├── storage.js              # AsyncStorage CRUD + backup
        └── theme.js                # Colors, fonts, shadows
```

---

## 🔄 Backup & Restore Format

The exported JSON looks like:

```json
{
  "version": 1,
  "exportedAt": "2025-01-15T22:30:00.000Z",
  "dreams": [
    {
      "id": "1705358200000",
      "title": "Flying over the city",
      "story": "I was soaring above...",
      "date": "2025-01-15",
      "category": "Lucid",
      "createdAt": "2025-01-15T22:00:00.000Z"
    }
  ]
}
```

Store this file in Google Drive, email it to yourself, or copy it to a computer — then **Import** it on any device running this app.

---

## 🎨 Dream Categories

| Category | Color | Meaning |
|---|---|---|
| Lucid | Neon Blue | You knew you were dreaming |
| Nightmare | Neon Red | Frightening or distressing |
| Recurring | Neon Purple | Dream you've had before |
| Vivid | Neon Mint | Unusually clear and detailed |
| Prophetic | Neon Gold | Felt meaningful or predictive |
| Other | Cool Grey | Everything else |

---

## 🛠 Tech Stack

- **React Native + Expo SDK 50**
- **@react-navigation/native-stack** — screen navigation
- **@react-native-async-storage/async-storage** — local persistence
- **expo-file-system** — write/read JSON files
- **expo-document-picker** — pick backup files from device
- **expo-sharing** — share/save exported files
- **react-native-safe-area-context** — notch-safe layouts

---

## 🔐 Security Notes

- The PIN is stored locally in AsyncStorage (on-device only, no cloud sync).
- For production, consider encrypting the PIN hash (e.g. with `expo-crypto`).
- The backup JSON is unencrypted — treat it like a private file.

---

*"Every dream is a door. Note Night Dream helps you remember where it leads."*
