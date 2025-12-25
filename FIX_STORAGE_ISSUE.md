# 🔧 Fix Android Emulator Storage Issue

## Problem
The app built successfully but can't install because the emulator doesn't have enough storage space.

**Error**: `Requested internal only, but not enough space`

---

## ✅ Solution 1: Free Up Space on Emulator (Quick Fix)

### Option A: Uninstall Unused Apps via ADB
```bash
# List all installed packages
adb shell pm list packages

# Uninstall specific apps (replace com.example.app with actual package name)
adb shell pm uninstall com.example.app

# Or uninstall multiple test apps
adb shell pm list packages | grep test | cut -d: -f2 | xargs -n1 adb shell pm uninstall
```

### Option B: Clear App Data and Cache
```bash
# Clear all app caches
adb shell pm trim-caches 500M

# Or clear specific app data
adb shell pm clear com.android.chrome
```

### Option C: Use Emulator Settings
1. Open Android Studio
2. Go to **Tools > Device Manager**
3. Click the **▶️ Play** button next to your emulator
4. Once emulator opens, go to **Settings > Storage**
5. Clear cache and delete unused apps

---

## ✅ Solution 2: Increase Emulator Storage (Recommended)

### Steps:
1. **Close the emulator** if it's running

2. **Open Android Studio**
   - Go to **Tools > Device Manager**

3. **Edit Emulator**:
   - Find **Pixel_6a_API_30**
   - Click the **✏️ Edit** (pencil) icon

4. **Increase Storage**:
   - Click **Show Advanced Settings**
   - Find **Internal Storage**
   - Change from current value to **4096 MB** (4GB) or more
   - Click **Finish**

5. **Cold Boot** (Important!):
   - Click the **▼** dropdown next to Play button
   - Select **Cold Boot Now**
   - This will recreate the emulator with new storage

6. **Try Installing Again**:
   ```bash
   npm run android
   ```

---

## ✅ Solution 3: Create New Emulator with More Storage

1. **Open Android Studio**
2. **Device Manager > Create Device**
3. **Select Device**: Choose any device (e.g., Pixel 6)
4. **System Image**: Select API 30 or higher
5. **AVD Configuration**:
   - Click **Show Advanced Settings**
   - Set **Internal Storage**: **4096 MB** (4GB)
   - Set **SD Card**: **512 MB** (optional)
6. **Finish** and start the new emulator
7. **Run app**:
   ```bash
   npm run android
   ```

---

## ✅ Solution 4: Install APK Manually (Workaround)

If you just want to test the app without fixing storage:

```bash
# The APK is already built at:
# android/app/build/outputs/apk/debug/app-debug.apk

# Install manually (this might work if there's just a bit more space needed)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Or try installing to external storage (if available)
adb install -s android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ Solution 5: Use Physical Device

If you have a physical Android device:

1. **Enable Developer Options** on your phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings > Developer Options > USB Debugging

3. **Connect via USB**:
   ```bash
   # Check if device is connected
   adb devices
   
   # Run app
   npm run android
   ```

---

## 🎯 Quick Commands

### Check Current Storage
```bash
adb shell df -h
```

### Free Up Space
```bash
# Clear caches
adb shell pm trim-caches 1000M

# List large apps
adb shell dumpsys package | grep -A 1 "Package \["
```

### Reinstall After Freeing Space
```bash
npm run android
```

---

## 📊 Recommended Settings

For smooth development, your emulator should have:
- **Internal Storage**: 4GB minimum (8GB recommended)
- **RAM**: 2GB minimum (4GB recommended)
- **VM Heap**: 512MB

---

## ✅ After Fixing Storage

Once you've increased storage or freed up space:

1. **Cold boot the emulator** (important!)
2. **Run the app**:
   ```bash
   npm run android
   ```

The app should install successfully! 🎉

---

**Note**: The APK is already built and ready at `android/app/build/outputs/apk/debug/app-debug.apk` (421MB). You just need enough space to install it.




