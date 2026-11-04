# KC IPTV Player

[![Support on Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/kaecr)

A modern, high-performance IPTV & VOD player designed for Smart TVs, mobile phones, and tablets. It supports **LG webOS**, **Samsung Tizen**, and **Android** devices with a shared responsive web-core and native platform integrations.

| Platform | Status | Current Version | Target Format | Handover & Details |
|----------|--------|-----------------|---------------|-------------------|
| **Android** | Released & Active | **`1.2.45`** | Signed `.apk` | [`android/HANDOVER.md`](android/HANDOVER.md) |
| **LG webOS TV** | Released | **`1.2.58`** | Packaged `.ipk` | [`webos/HANDOVER.md`](webos/HANDOVER.md) |
| **Samsung Tizen TV** | Working (Tizen 6.0+) | **`1.2.58`** | Packaged `.wgt` | [`tizen/HANDOVER.md`](tizen/HANDOVER.md) |

<p align="center">
  <img src="https://raw.githubusercontent.com/kceryrk/KC-IPTV-Player/main/webos/icon.png" alt="KC IPTV Player icon" width="160" />
</p>

---

## Highlights & Features

- **Multi-Source Support:** Full Xtream Codes API (Live, VOD, Series) and raw M3U / M3U_PLUS playlist compatibility.
- **Material You & Modern Theming:** Material 3 dark surface palette with rounded cards, fluid touch states, and customizable presets (Aurora, Dark Space, Sunset).
- **Fullscreen Swipe Gestures (Mobile/Tablet):**
  - Swipe **Up / Left**: Next Channel.
  - Swipe **Down / Right**: Previous Channel.
  - Tap: Toggle OSD playback banner & VOD timeline scrub.
- **10-Foot Smart TV Navigation:**
  - Remote color button shortcuts (Yellow = Favorite, Red = Reorder, Green = Search, Blue = Mode).
  - Quick numeric channel zapping with on-screen buffer.
  - Smooth centered-picker lists (selected item remains anchored at center).
- **Playback Engine Resilience:**
  - Dual playback engine: hardware-native decode with seamless Hls.js & MPEG-TS (mpegts.js) fallback.
  - Offline-bundled streaming libraries (`hls.min.js`, `mpegts.min.js`) — zero external CDN dependencies at runtime.
  - Custom DNS fallback resolver for emulators and private DNS networks.
  - Transparent video poster (no default grey placeholder during stream buffers).
- **Favorites & Categories:** Region and category filtering with local storage favorites management.
- **Back Button & Gesture Integration:** Native back key handlers to cleanly dismiss modals, settings, and fullscreen playback.

---

## Platform Documentation & Handovers

Each platform includes dedicated handover and technical architecture documentation:
- 📱 **Android:** [`android/HANDOVER.md`](android/HANDOVER.md)
- 📺 **Samsung Tizen TV:** [`tizen/HANDOVER.md`](tizen/HANDOVER.md)
- 📺 **LG webOS TV:** [`webos/HANDOVER.md`](webos/HANDOVER.md)
- 🛠️ **Fixes & Troubleshooting Guide:** [`FIX_IPTV.md`](FIX_IPTV.md) — Comprehensive technical breakdown of all resolved bugs, network timeouts, CORS handling, and build configurations.

---

## Installation & Setup

Each platform can be installed from a prebuilt package or built from source. The source steps below are the reference; prebuilt packages come from GitHub Releases.

### Get the source (all platforms)
```bash
git clone https://github.com/kceryrk/KC-IPTV-Player.git
cd KC-IPTV-Player
```
Optional: create a `credentials.local.js` for the platform you're building (see [Login & Local Credentials](#login--local-credentials)). It is ignored by Git.

### 1. Android

**Prerequisites**
- JDK 17 or newer (Android Studio's bundled JBR works).
- Android SDK with platform 37 (`compileSdk = 37`). Install it from Android Studio's SDK Manager, or point `ANDROID_HOME` at your SDK.
- A device with USB debugging enabled and `adb` on your `PATH`.

**Steps**
1. Build the release APK. The Gradle wrapper downloads Gradle 9.8.2 for you:
   ```bash
   cd android
   ./gradlew :app:assembleRelease      # Windows: gradlew.bat :app:assembleRelease
   ```
2. The APK is written to `android/app/build/outputs/apk/release/app-release.apk`.
3. Install it on the device, replacing the existing app:
   ```bash
   adb install -r app/build/outputs/apk/release/app-release.apk
   ```

**Signing (optional)**
- Without `android/keystore.properties`, the release build is signed with the debug key. That is fine for sideloading on your own device.
- For a stable release key, create `android/keystore.properties` with `storeFile`, `storePassword`, `keyAlias`, and `keyPassword`, and place the `.jks` file in `android/`. Both files are ignored by Git.
- Android only updates an app when the signing key matches, so keep using the same key for every build.

### 2. LG webOS TV

**Prerequisites**
- Node.js with npm.
- The webOS TV CLI (`ares`):
  ```bash
  npm install -g @webos-tools/cli
  ```
- Developer Mode enabled on the TV. Install the **Developer Mode** app from the LG Content Store, sign in, and turn on Dev Mode and Key Server. Note the TV's IP address.

**One-time device setup**
1. Register the TV as a device named `lg-tv`:
   ```bash
   ares-setup-device --add lg-tv --info "host:<tv_ip>,port:9922,username:prisoner"
   ```
2. Fetch the device key. The passphrase is shown in the Developer Mode app on the TV:
   ```bash
   ares-novacom --getkey -d lg-tv
   ```

**Steps**
1. From the repository root, package the `webos/` folder:
   ```bash
   ares-package webos -o dist
   ```
   This creates `dist/com.iptv.webosapp_<version>_all.ipk`.
2. Install it. This replaces the existing app and keeps its data, so you don't need to uninstall first:
   ```bash
   ares-install --device lg-tv dist/com.iptv.webosapp_1.2.58_all.ipk
   ```
3. Launch it:
   ```bash
   ares-launch --device lg-tv com.iptv.webosapp
   ```

To skip the build, use the `.ipk` from GitHub Releases with the same `ares-install` command.

### 3. Samsung Tizen TV

**Prerequisites**
- [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download) with the **TV Extensions** package installed from the Package Manager. The `tizen` and `sdb` CLIs are in `<tizen-studio>/tools/`.
- A Samsung certificate profile created in Tizen Studio's Certificate Manager. For a TV, you need an author certificate and a distributor certificate that includes your TV's DUID.
- Developer Mode on the TV: open `Apps`, enter `12345`, switch Developer Mode on, and enter your PC's IP address.

**Steps**
1. Connect to the TV from your PC:
   ```bash
   sdb connect <tv_ip>:26101
   sdb devices
   ```
2. From the repository root, package the `tizen/` folder as a `.wgt` file:
   ```bash
   tizen package -t wgt -s <your_cert_profile> -o dist -- tizen/
   ```
3. Install the generated `.wgt` from `dist/` on the TV:
   ```bash
   tizen install -n dist/<generated_file>.wgt -t <target_tv_id>
   ```
4. Launch the app:
   ```bash
   tizen run -p kcipplayer.KCIPTVPlayer -t <target_tv_id>
   ```

`<target_tv_id>` is the TV's name as listed in Tizen Studio's Device Manager.

---

## Login & Local Credentials

KC IPTV Player supports:
1. **Xtream Codes API:** Server URL, Username, and Password (fetches Live, VOD, and Series categories via JSON API).
2. **M3U Playlist URL:** Direct playlist link with optional EPG integration.

### Development Autofill
To avoid entering credentials during development, create a local file named `credentials.local.js` in the respective platform folder (`android/app/src/main/assets/credentials.local.js`, `webos/credentials.local.js`, or `tizen/credentials.local.js`):
```javascript
window.KC_DEFAULT_LOGIN = {
  type: "xtream",
  server: "http://your-server.com:8080",
  username: "your_username",
  password: "your_password"
};
```
> [!IMPORTANT]
> `credentials.local.js`, `*.keystore`, and `keystore.properties` are listed in `.gitignore`. Never commit them or bundle them into public release packages.

---

## Releases & Downloads

Find packaged releases for all platforms on GitHub:
- **GitHub Releases:** https://github.com/kceryrk/KC-IPTV-Player/releases

---

## License & Notice

This project is maintained for personal and private backup use. All brand names, stream formats, and logos are property of their respective owners.
