# KC IPTV Player

[![Support on Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/kaecr)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

A modern, high-performance IPTV & VOD player designed for Smart TVs, mobile phones, and tablets. Built with a shared responsive web-core and native platform integrations across **Android**, **LG webOS**, and **Samsung Tizen**.

| Platform | Status | Current Version | Target Package | Handover & Architecture |
|----------|--------|-----------------|----------------|------------------------|
| **Android** | Released & Active | **`1.2.59`** | Signed `.apk` | [`android/HANDOVER.md`](android/HANDOVER.md) |
| **LG webOS TV** | Released | **`1.2.58`** | Packaged `.ipk` | [`webos/WebOSHANDOVER.md`](webos/WebOSHANDOVER.md) |
| **Samsung Tizen TV** | Working (Tizen 6.0+) | **`1.2.58`** | Packaged `.wgt` | [`tizen/Tizen HANDOVER.md`](<tizen/Tizen HANDOVER.md>) |

<p align="center">
  <img src="https://raw.githubusercontent.com/kceryrk/KC-IPTV-Player/main/tizen/icon.png" alt="KC IPTV Player icon" width="160" />
</p>

---

## ⚡ Quick Shortcuts & References

- 📦 **Prebuilt Packages:** [`builds/`](builds/) (Versioned release packages ready for sideloading & install)
- 📜 **Builds Rules & Sideload Guide:** [`builds/README.md`](builds/README.md)
- 📱 **Android Handover:** [`android/HANDOVER.md`](android/HANDOVER.md)
- 📺 **LG webOS Handover:** [`webos/WebOSHANDOVER.md`](webos/WebOSHANDOVER.md)
- 📺 **Samsung Tizen Handover:** [`tizen/Tizen HANDOVER.md`](<tizen/Tizen HANDOVER.md>)
- 🛠️ **Fixes & Troubleshooting Archive:** [`FIX_IPTV.md`](FIX_IPTV.md)
- ⚖️ **License (GPL-3.0):** [`LICENSE`](LICENSE)

---

## Highlights & Features

- **Multi-Source Support:** Full Xtream Codes API (Live, VOD, Series) and raw M3U / M3U_PLUS playlist compatibility.
- **Material You & Modern Theming:** Material 3 dark surface palette with rounded cards, liquid glass pill OSD styling, custom theme presets (Aurora, Dark Space, Sunset), and fluid navigation lenses.
- **Smart Category Filtering:** Automatic grouped sub-category filtering for multi-year series and duplicate named categories.
- **Fullscreen Gestures & Dynamic Channel Switching (Mobile/Tablet):**
  - **Swipe Left / Right:** Dynamic channel preview showing next channel logo, chevron indicator, and breathing AI glow effect with 1/8th swipe-to-switch animation.
  - **Swipe Down from Top:** Smooth animated transition to interactive Picture-in-Picture (PiP).
  - **Double-Tap Left / Right:** Configurable seek backward/forward (default 10s) with animated tap ripples.
  - **Swipe Up from Bottom:** Cleanly toggles playback OSD.
- **Advanced VOD Player Controls:**
  - Precision interactive timeline scrubbing with live preview tooltip, buffered range indicator, and head-leading gradient loader.
  - Center Play/Pause button on OSD wake.
  - VOD settings panel (3 dots) with audio track selector (original vs dubbed), subtitle track & sizing, aspect ratio toggles (Fit, Fill, Stretch, Zoom), and playback speed presets (0.5x to 2x).
  - External video player fallback launcher.
- **10-Foot Smart TV Navigation:**
  - Remote color button shortcuts (Yellow = Favorite, Red = Reorder, Green = Search, Blue = Mode).
  - Quick numeric channel zapping with on-screen buffer.
  - Smooth centered-picker lists (selected item remains anchored at center).
- **Playback Engine Resilience:**
  - Dual playback engine: hardware-native decode with seamless Hls.js & MPEG-TS (mpegts.js) fallback.
  - Offline-bundled streaming libraries (`hls.min.js`, `mpegts.min.js`) — zero external CDN dependencies at runtime.
  - Custom DNS fallback resolver for emulators and private DNS networks.
  - Transparent video poster (no default grey placeholder during stream buffers).
- **Internationalization (i18n):** Multi-language UI support for English, Turkish, Dutch, and French (`en`, `tr`, `nl`, `fr`).

---

## Remote Control & Key Shortcuts Reference

### 📺 Smart TV (Tizen / webOS / Android TV)

| Key / Button | Action |
|--------------|--------|
| `Arrow Keys (Up/Down/Left/Right)` | Navigate UI elements, scroll channel/VOD grids |
| `Enter / OK` | Play channel / VOD, select item, confirm action |
| `Back / Return` | Dismiss modal, exit fullscreen player, return to previous view |
| `Play / Pause / Stop` | Control stream playback |
| `Channel Up / Down` | Instant next / previous channel |
| `0 - 9 (Number keys)` | Direct channel number zapping overlay |
| `Yellow Button` | Toggle favorite status on current channel |
| `Red Button` | Toggle playlist channel reorder mode |
| `Green Button` | Open search dialog |
| `Blue Button` | Toggle aspect ratio / view mode |

### 📱 Touch Gestures (Mobile / Tablet)

| Gesture | Context | Action |
|---------|---------|--------|
| `Tap Video` | Fullscreen Player | Toggle OSD controls & playback status |
| `Double-Tap Left (1/3rd)` | Fullscreen VOD | Rewind 10s (adjustable in Settings) |
| `Double-Tap Right (1/3rd)` | Fullscreen VOD | Fast-forward 10s (adjustable in Settings) |
| `Swipe Left / Right` | Fullscreen Live TV | Dynamic channel switcher with logo preview |
| `Swipe Down from Top` | Fullscreen Player | Enter floating Picture-in-Picture (PiP) mode |
| `Swipe Up from Bottom` | Fullscreen Live TV | Reveal OSD pill controls |
| `Drag Floating PiP Down` | Picture-in-Picture | Close / dismiss PiP player |
| `Tap Floating PiP` | Picture-in-Picture | Restore player to fullscreen |

---

## Installation & Setup

Prebuilt versioned packages are stored in the [`builds/`](builds/) directory or can be built from source using the steps below.

### Clone the Repository
```bash
git clone https://github.com/kceryrk/KC-IPTV-Player.git
cd KC-IPTV-Player
```

---

### 1. Android (Phone, Tablet & Android TV)

**Prerequisites:**
- JDK 17+ (Android Studio bundled JBR works).
- Android SDK with platform 37 (`compileSdk = 37`).
- Android device with USB debugging enabled.

**Build and Install:**
```bash
cd android
./gradlew assembleRelease       # Windows: gradlew.bat assembleRelease
```
The signed APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

Install directly via `adb`:
```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

> [!TIP]
> Signed release builds are automatically copied to [`builds/KCIPTVPlayer-android-<version>.apk`](builds/) for release tracking.

---

### 2. LG webOS TV

**Prerequisites:**
- Node.js & npm.
- webOS TV CLI:
  ```bash
  npm install -g @webos-tools/cli
  ```
- **Developer Mode** enabled on the TV via the LG Developer Mode app.

**Device Setup & Install:**
1. Add TV target:
   ```bash
   ares-setup-device --add lg-tv --info "host:<tv_ip>,port:9922,username:prisoner"
   ares-novacom --getkey -d lg-tv
   ```
2. Package and install:
   ```bash
   ares-package webos -o dist
   ares-install --device lg-tv dist/com.iptv.webosapp_1.2.58_all.ipk
   ares-launch --device lg-tv com.iptv.webosapp
   ```
*(Or install the prebuilt `.ipk` from [`builds/KCIPTVPlayer-webos-1.2.58.ipk`](builds/KCIPTVPlayer-webos-1.2.58.ipk)).*

---

### 3. Samsung Tizen TV

**Prerequisites:**
- [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download) with TV Extensions installed.
- Developer Mode enabled on the TV (`Apps` &rarr; `12345` &rarr; toggle on &rarr; PC IP).

**Connect and Install:**
1. Connect via SDB:
   ```bash
   sdb connect <tv_ip>:26101
   ```
2. Package and install:
   ```bash
   tizen package -t wgt -s <your_cert_profile> -o dist -- tizen/
   tizen install -n dist/<generated_file>.wgt -t <target_tv_id>
   tizen run -p kcipplayer.KCIPTVPlayer -t <target_tv_id>
   ```
*(Or install the prebuilt `.wgt` from [`builds/KCIPTVPlayer-tizen-1.2.58.wgt`](builds/KCIPTVPlayer-tizen-1.2.58.wgt)).*

---

## Login & Local Credentials

KC IPTV Player supports:
1. **Xtream Codes API:** Server URL, Username, and Password (Live, VOD, and Series).
2. **M3U Playlist URL:** Direct playlist URL with M3U_PLUS tag parsing.

### Development Autofill
To test locally without entering credentials manually, create `credentials.local.js` in the respective platform assets folder (`android/app/src/main/assets/credentials.local.js`, `webos/credentials.local.js`, or `tizen/credentials.local.js`):
```javascript
window.KC_DEFAULT_LOGIN = {
  type: "xtream",
  server: "http://your-server.com:8080",
  username: "your_username",
  password: "your_password"
};
```
> [!IMPORTANT]
> `credentials.local.js`, `*.keystore`, and `keystore.properties` are ignored by Git. Never commit credentials to source control.

---

## License & Notice

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See [LICENSE](LICENSE) for the full text.

*This software is provided without warranty. It does not include or host any IPTV content, playlists, or streams; users must provide their own sanctioned streaming sources. All brand names, logos, and trademarks belong to their respective owners.*
