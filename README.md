# KC IPTV Player

A modern, high-performance IPTV & VOD player designed for Smart TVs, mobile phones, and tablets. It supports **LG webOS**, **Samsung Tizen**, and **Android** devices with a shared responsive web-core and native platform integrations.

| Platform | Status | Current Version | Target Format | Handover & Details |
|----------|--------|-----------------|---------------|-------------------|
| **Android** | Released & Active | **`1.2.12`** | Signed `.apk` | [`android/HANDOVER.md`](android/HANDOVER.md) |
| **LG webOS TV** | Released | **`1.2.44`** | Packaged `.ipk` | [`webos/HANDOVER.md`](webos/HANDOVER.md) |
| **Samsung Tizen TV** | Working (Tizen 6.0+) | **`1.2.x`** | Packaged `.wgt` | [`tizen/HANDOVER.md`](tizen/HANDOVER.md) |

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

### 1. Android Installation
Download the pre-built signed APK from GitHub Releases or the repository root:
- Direct APK: [`android/KCIPTVPLAYER.apk`](android/KCIPTVPLAYER.apk) (version `1.2.12`)
- Install via ADB:
  ```bash
  adb install -r android/KCIPTVPLAYER.apk
  ```
- Or build from source with Gradle:
  ```bash
  cd android
  ./gradlew :app:assembleRelease
  ```

### 2. LG webOS TV Installation
Download the latest `.ipk` package from GitHub Releases (`com.iptv.webosapp_1.2.xx_all.ipk`).

**Using webOS Dev Manager (Recommended):**
1. Enable Developer Mode on your LG TV.
2. Connect webOS Dev Manager on your PC to the TV's IP.
3. Install the `.ipk` package using the GUI installer.

**Using webOS CLI (`ares`):**
```bash
ares-install --device <your_tv_ip> com.iptv.webosapp_1.2.44_all.ipk
```

### 3. Samsung Tizen TV Installation
1. Install Tizen Studio with the Samsung TV Extension.
2. Enable Developer Mode on your Samsung TV (`Apps` -> `12345` -> Host PC IP).
3. Connect and package:
   ```bash
   sdb connect <tv_ip>:26101
   tizen package -t wgt -s <your_cert_profile> -- tizen/
   tizen install -n <generated_wgt_file>.wgt -t <target_tv_id>
   tizen run -p kcipplayer.KCIPTVPlayer -t <target_tv_id>
   ```

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
