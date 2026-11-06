# KC IPTV Player — Android Platform Handover

**Platform:** Android (Phone, Tablet & Android TV)  
**Location:** [`android/`](file:///Users/kamil/Desktop/KC-IPTV-Player/android)  
**Current Version:** `1.2.59` (versionCode `1259`)  
**Package:** `com.kciptv.player`  
**Primary Shell:** Kotlin Native Activity (`MainActivity.kt`) hosting an optimized Chromium `WebView`

---

## 1. Architecture & Component Structure

The Android client runs a hybrid architecture pairing a high-performance native Android container with a modern HTML5/CSS3/JavaScript single-page app bundled inside the APK assets.

```
android/
├── app/
│   ├── build.gradle.kts           # AGP 9.5.0, compileSdk 37, minSdk 24, signingConfigs
│   └── src/main/
│       ├── AndroidManifest.xml    # Permissions (INTERNET, ACCESS_NETWORK_STATE)
│       ├── java/.../MainActivity.kt # WebView setup, JS bridges, DNS fallback, Back dispatcher
│       └── assets/
│           ├── index.html         # Application viewport, player markup, settings modal
│           ├── main.js            # Core IPTV business logic, Xtream/M3U parsers, gestures
│           ├── style.css          # Material You design system, responsive mobile layout
│           ├── hls.min.js         # Offline-bundled HLS streaming engine (v1.5.13)
│           ├── mpegts.min.js      # Offline-bundled MPEG-TS streaming engine (v1.7.3)
│           ├── libs-loader.js     # Promise resolution stub for local libraries
│           └── tizen-platform.js  # Safe no-op stubs for TV platform APIs
├── release.jks                    # Dedicated production release keystore (gitignored)
├── keystore.properties            # Keystore credentials & alias config (gitignored)
└── KCIPTVPLAYER.apk               # Latest pre-built release APK
```

---

## 2. Key Features Implemented

### Material You (Material 3) UI & Mobile Scaling
- **Design Tokens:** Material 3 dark surface palette (`#141218` background, `#1d1b20` card container, `#6750a4` accent, `#d0bcff` highlight).
- **Mobile Viewport Optimization:** Scaled root font size and headers (`44px`), tightened navigation lists and channel grid spacing to eliminate oversized TV scaling on phone screens.
- **Classic TV Theme:** Maintained as an optional toggle under *Settings -> Theme & Customization*.

### Back Button & Modal Integration
- Native back button interactions are captured in [`MainActivity.kt`](file:///Users/kamil/Desktop/KC-IPTV-Player/android/app/src/main/java/com/kciptv/player/MainActivity.kt) using Android's `OnBackPressedCallback`.
- Calls `window.handleAppBack()` in JavaScript to cleanly close open menus, settings overlays, and fullscreen video before falling back to exit.

### Device Form-Factor Recognition (TV, Tablet & Mobile Phone)
- **Native Device Detection (`MainActivity.detectDeviceType`):**
  - **TV:** Identified via `UI_MODE_TYPE_TELEVISION`, `FEATURE_LEANBACK`, `FEATURE_TELEVISION`, or lack of touchscreen hardware. Locks to landscape.
  - **Tablet:** Identified on non-TV touchscreen devices when `smallestScreenWidthDp >= 600` or large screen layout with diagonal screen size >= 6.8". Rotates freely (`SCREEN_ORIENTATION_SENSOR`).
  - **Mobile Phone:** Portable touch device with `smallestScreenWidthDp < 600`. Defaults to portrait orientation, rotating to landscape during fullscreen video.
- **Dedicated Tablet Mode:**
  - Preserves touch-first gestures and navigation while scaling card grids dynamically (4 columns portrait, 6 columns landscape).
  - Side-by-side Live TV layout in landscape orientation (channels on the left, video preview on the right).
  - Floating pill navigation bar and centered modal dialogs for tablet ergonomics.
  - JavaScript bridge APIs: `getDeviceType()`, `isTabletDevice()`, `isTvDevice()`, `isMobileDevice()`, `isPhoneDevice()`, `getDeviceLayout()`, and `setDeviceLayout()`.

### Fullscreen Touch & Swipe Gestures
- Added pointer and touch listeners on `#playerWrapper` in fullscreen Live TV mode.
- **Vertical Swipe:** Swipe Up = Next Channel, Swipe Down = Previous Channel.
- **Horizontal Swipe:** Swipe Left = Next Channel, Swipe Right = Previous Channel.
- **Tap Interaction:** Toggles OSD banner or scrubs during VOD playback without interrupting swipe gestures.
- Disabled pull-to-refresh conflicts with `touch-action: none;`.

### Stream Playback & Offline Independence
- Bundled `hls.min.js` and `mpegts.min.js` into local assets, preventing initial cold-start delays or offline startup failures from CDN dependencies.
- Configured Hls.js with `enableWorker: false` to avoid Android WebView blob URL Worker blocking on `file://`.
- Removed default grey play button placeholder by overriding `WebChromeClient.getDefaultVideoPoster()`.
- Removed bottom on-screen hint bar (`.hint-bar { display: none !important; }`).

### DNS Fallback & Emulator Resilience
- Configured a fallback DNS resolution mechanism inside `MainActivity.kt` with virtual host mapping (`neptunpro26.xyz` -> `193.176.244.107`) to bypass private DNS/emulator resolution drops.

---

## 3. Known Issues & Future Roadmap

1. **EPG Timezone Discrepancies:**
   - EPG timestamps currently assume local device time or Turkey time (UTC+3). Needs universal timezone normalization (e.g. converting start/end timestamps to local target time).
2. **EPG Auto-Refresh:**
   - EPG is currently fetched when the channel starts. Needs an interval timer (e.g. every 60s) while the OSD is visible so "Now / Next" does not display ended programs.
3. **Audio Codec Compatibility (VOD / Movies / Series):**
   - Certain IPTV VOD streams encoded in AC3, EAC3, or DTS audio cannot be decoded natively by Android WebView's Chromium audio engine.
   - *Future Solution:* Integrate Android's native `Media3 / ExoPlayer` via `ExternalPlayerInterface` for streams reporting missing audio.
4. **Credentials Protection in Public Builds:**
   - Always verify that `credentials.local.js` is absent from `android/app/src/main/assets/` before generating public/distributable builds.

---

## 4. Build, Signing & Deployment

### Generating a Signed Release APK
The project uses `keystore.properties` and `release.jks` in the root `android/` directory:

```bash
cd android
./gradlew :app:assembleRelease
```

Output location:
`android/app/build/outputs/apk/release/app-release.apk` (and mirrored to `android/KCIPTVPLAYER.apk`).

### Verifying Signatures
```bash
apksigner verify --verbose --print-certs app/build/outputs/apk/release/app-release.apk
```

### Installing onto Connected Devices / Emulators
```bash
adb install -r KCIPTVPLAYER.apk
```
