# KC IPTV Player — Comprehensive Fixes & Troubleshooting Guide

This document records all critical bugs diagnosed, their underlying root causes, and the exact fixes implemented across the **Android**, **LG webOS**, and **Samsung Tizen** platforms for KC IPTV Player. Refer to this document for troubleshooting playback, login, UI, or build issues.

---

## Table of Contents
1. [Android & WebView Engine Fixes](#1-android--webview-engine-fixes)
   - [Bug A1: Xtream Login Failure & Network Reset](#bug-a1-xtream-login-failure--network-timeout-reset)
   - [Bug A2: DNS Host Resolution Failure on Android Emulators](#bug-a2-dns-host-resolution-failure-on-android-emulators)
   - [Bug A3: Empty Stream URL on Xtream Live Playback](#bug-a3-empty-stream-url-on-xtream-live-playback)
   - [Bug A4: Missing Platform Stubs (`tizen-platform.js` and `libs-loader.js`)](#bug-a4-missing-platform-stubs-causing-silent-boot-freeze)
   - [Bug A5: Web Workers Blocked from `file://` in WebView](#bug-a5-web-workers-blocked-from-file-in-android-webview)
   - [Bug A6: Default Grey Play Button Placeholder](#bug-a6-default-grey-play-button-placeholder)
   - [Bug A7: Bottom Hint Bar Cluttering Screen](#bug-a7-bottom-hint-bar-cluttering-screen)
   - [Bug A8: CDN Script Dependency Offline Failure](#bug-a8-cdn-script-dependency-offline-failure)
   - [Feature A9: Fullscreen Swipe Channel Navigation](#feature-a9-fullscreen-touchswipe-channel-navigation)
   - [Build A10: Release Signing & Versioning](#build-a10-production-release-keystore-signing--version-bump)
2. [LG webOS TV Fixes](#2-lg-webos-tv-fixes)
   - [Bug W1: IPTV Server Connection Reset on HLS Segments (CORS)](#bug-w1-iptv-server-connection-reset-on-hls-segments-cors)
   - [Bug W2: Async Script Tag Race Condition](#bug-w2-async-script-tag-race-condition)
   - [Bug W3: Auth Resolution in `playStream()`](#bug-w3-auth-resolution-in-playstream)
   - [Bug W4: Infinite Error Reconnect Loop in Simulator](#bug-w4-infinite-error-reconnect-loop-in-simulator)
3. [Samsung Tizen TV Fixes](#3-samsung-tizen-tv-fixes)
   - [Bug T1: Remote Key Registration & Event Codes](#bug-t1-samsung-remote-key-registration)
   - [Bug T2: Picker List Centering & Translucent Panels](#bug-t2-picker-list-centering--translucent-panels)
   - [Bug T3: Signature & Build Packaging Failures](#bug-t3-unsigned-files-and-package-rejection)
4. [Security & Credentials Hygiene](#4-security--credentials-hygiene)

---

## 1. Android & WebView Engine Fixes

### Bug A1: Xtream Login Failure & Network Timeout / Reset
* **Symptom:** Entering valid Xtream credentials resulted in: `Giriş başarısız: Oynatma listesi yüklenemedi. (network)`. The categories and channels never populated even though credentials were 100% correct.
* **Root Cause:** In legacy `initProfile()`, when an Xtream profile was saved, the app attempted to convert it into a synthetic full M3U `/get.php?username=...&password=...&type=m3u_plus` URL and download the complete multi-gigabyte M3U playlist file over an XHR request into browser memory. The IPTV server timed out or reset the connection due to payload size, causing authentication to fail completely and poisoning `localStorage["kc_iptv_active_profile"]`.
* **Fix (`android/app/src/main/assets/main.js`):**
  1. Purged synthetic `/get.php` overrides from `localStorage` in `initProfile()`.
  2. Bypassed the monolithic `/get.php` download for Xtream accounts.
  3. Switched Xtream login to use native, lightweight JSON endpoints:
     - `player_api.php?action=get_live_categories`
     - `player_api.php?action=get_vod_categories`
     - `player_api.php?action=get_series_categories`
  4. Loaded stream lists on-demand per category rather than pre-fetching gigabytes of raw M3U text.

---

### Bug A2: DNS Host Resolution Failure on Android Emulators
* **Symptom:** Network requests failed with: `java.net.UnknownHostException: Unable to resolve host "neptunpro26.xyz": No address associated with hostname`.
* **Root Cause:** Android emulator instances using private DNS or cellular virtual interfaces frequently fail to resolve certain dynamic DNS/IPTV server hostnames via the system's default local DNS resolver.
* **Fix (`android/app/src/main/java/com/kciptv/player/MainActivity.kt`):**
  - Added a custom DNS fallback resolver in `ExternalPlayerInterface`:
    ```kotlin
    val fallbackIp = when (host.lowercase()) {
        "neptunpro26.xyz" -> "193.176.244.107"
        else -> null
    }
    ```
  - Re-routed requests through the resolved IP while preserving the mandatory `Host: neptunpro26.xyz:8080` HTTP header so virtual-host routing on the server succeeds.

---

### Bug A3: Empty Stream URL on Xtream Live Playback
* **Symptom:** VOD and Series played fine, but Live TV channels failed to load or start.
* **Root Cause:** In `main.js`, `playStream()` checked `currentAuth.server`. However, `currentAuth` was only set for direct M3U playlist logins (`provider === "m3u"`). When logged in via Xtream, credentials were stored in `xtreamAuth`, leaving `currentAuth` null and resolving `streamUrl` to `""`.
* **Fix (`android/app/src/main/assets/main.js`):**
  ```javascript
  const liveAuth = currentAuth || xtreamAuth;
  const streamUrl = directUrl || (liveAuth ? `${liveAuth.server.replace(/\/+$/, "")}/live/${liveAuth.username}/${liveAuth.password}/${streamId}.m3u8` : "");
  ```

---

### Bug A4: Missing Platform Stubs Causing Silent Boot Freeze
* **Symptom:** On initial launch on Android, the WebView page hung on a blank screen or failed to initialize `main.js`.
* **Root Cause:**
  1. `index.html` contained `<script src="tizen-platform.js">`, which did not exist in the Android assets folder, causing a 404 resource error that halted script execution.
  2. `playStream()` awaited `window.kcLibsReady` from `libs-loader.js`, which was also missing.
* **Fix (`android/app/src/main/assets/`):**
  - Created `tizen-platform.js` stub supplying safe no-op implementations of `window.tizen`, `window.webapis`, etc.
  - Created `libs-loader.js` stub setting `window.kcLibsReady = Promise.resolve()`.

---

### Bug A5: Web Workers Blocked from `file://` in Android WebView
* **Symptom:** Video player threw demuxing errors or stalled after loading the first video segment.
* **Root Cause:** In `main.js`, Hls.js was initialized with `{ enableWorker: true }`. Because Android assets run from `file:///android_asset/`, Chromium security policies block Web Workers from spawning via blob URLs from `file://`.
* **Fix (`android/app/src/main/assets/main.js`):**
  - Set `enableWorker: false` when creating `new Hls(...)`.
  - Added robust buffer and timeout configurations:
    ```javascript
    new Hls({
      enableWorker: false,
      lowLatencyMode: false,
      backBufferLength: 30,
      maxBufferLength: 30,
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 20000
    });
    ```

---

### Bug A6: Default Grey Play Button Placeholder
* **Symptom:** When no channel was playing or during initial stream buffering, Android WebView displayed an ugly grey circle with a black play triangle in the center of the video viewport.
* **Root Cause:** Android's internal `WebChromeClient` displays a default system video poster Bitmap if the HTML `<video>` tag does not define an explicit poster before video playback starts.
* **Fix (`MainActivity.kt`, `index.html`, `style.css`):**
  1. Overrode `getDefaultVideoPoster()` in `MainActivity.kt` to return a 1x1 transparent `Bitmap`:
     ```kotlin
     override fun getDefaultVideoPoster(): Bitmap? {
         return Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)
     }
     ```
  2. Added a 1x1 transparent PNG data-URI poster directly to `<video id="videoPlayer">` in `index.html`.
  3. Added CSS suppression in `style.css` for `-webkit-media-controls-overlay-play-button`.

---

### Bug A7: Bottom Hint Bar Cluttering Screen
* **Symptom:** An on-screen key legend / hint bar (`#hintBar`) remained permanently visible at the bottom of the screen, consuming valuable mobile vertical space.
* **Fix (`android/app/src/main/assets/style.css`):**
  - Set `.hint-bar { display: none !important; }`.

---

### Bug A8: CDN Script Dependency Offline Failure
* **Symptom:** App failed to play streams if launched without an active internet connection before the CDN script cached.
* **Root Cause:** Scripts `hls.js` and `mpegts.js` were loaded via external CDN links (`https://cdn.jsdelivr.net/...`).
* **Fix:** Bundled `hls.min.js` and `mpegts.min.js` directly into `android/app/src/main/assets/` and updated `<script src="...">` tags to load locally.

---

### Feature A9: Fullscreen Touch/Swipe Channel Navigation
* **Requirement:** Enable seamless swiping to change Live TV channels in fullscreen, matching modern mobile video experiences.
* **Implementation (`android/app/src/main/assets/main.js`):**
  - Implemented `changeLiveChannel(delta)` supporting cyclic next/previous channel switching.
  - Added `pointerdown` and `pointerup` event handlers on `#playerWrapper` active in fullscreen mode.
  - Supported both vertical swipes (swipe up = next, swipe down = previous) and horizontal swipes (swipe left = next, swipe right = previous) with a minimum 40px threshold.
  - Preserved tap-to-toggle OSD and tap-to-scrub in VOD playback.
  - Set `touch-action: none;` on `#playerWrapper` in `style.css` to prevent browser pull-to-refresh conflicts.

---

### Build A10: Production Release Keystore Signing & Version Bump
* **Requirement:** Generate a signed production release APK with updated version numbers.
* **Implementation:**
  - Bumped version to `1.2.12` (`versionCode = 1212`) in [`app/build.gradle.kts`](file:///Users/kamil/Desktop/KC-IPTV-Player/android/app/build.gradle.kts).
  - Created dedicated release keystore [`android/release.jks`](file:///Users/kamil/Desktop/KC-IPTV-Player/android/release.jks) with 10,000 days validity.
  - Stored credentials securely in [`android/keystore.properties`](file:///Users/kamil/Desktop/KC-IPTV-Player/android/keystore.properties).
  - Configured Gradle to enable both APK Signature Scheme v1 and v2.
  - Added keystores and property files to `.gitignore` to prevent secret leakage.

---

## 2. LG webOS TV Fixes

### Bug W1: IPTV Server Connection Reset on HLS Segments (CORS)
* **Symptom:** Live TV streams failed with immediate `ERR_CONNECTION_RESET` or network errors on webOS.
* **Root Cause:** IPTV servers often check incoming HTTP headers. When `Hls.js` requests `.ts` chunks via `fetch()` or `XMLHttpRequest`, Chromium/webOS attaches an `Origin: file://` or `Origin: http://localhost` header. Many IPTV providers intentionally drop TCP connections upon seeing an `Origin` header to block web browsers.
* **Fix (`webos/main.js`):**
  - **MPEG-TS Streams (`.ts`):** Fed directly to `mpegts.js` without converting to `.m3u8`.
  - **HLS Streams (`.m3u8`):** Implemented dual playback strategy:
    ```javascript
    function tryNative(url, onFail) {
      nativeFallbackPending = true;
      video.src = url;
      video.muted = true; // Satisfies TV autoplay policy
      video.play().then(() => {
        nativeFallbackPending = false;
        video.muted = false;
        video.volume = 1.0;
      }).catch(err => {
        nativeFallbackPending = false;
        video.removeAttribute("src");
        if (typeof onFail === "function") onFail();
      });
    }
    ```
    On a real LG TV, `<video src="...">` plays HLS natively without sending an `Origin` header, bypassing CORS resets. If native fails (e.g. in the desktop simulator), it falls back gracefully to `Hls.js`.

---

### Bug W2: Async Script Tag Race Condition
* **Symptom:** Sporadic `ReferenceError: Hls is not defined` or `mpegts is not defined` on cold boot.
* **Root Cause:** `<script async src="...">` in `webos/index.html` executed asynchronously after `main.js` had already begun initializing the player.
* **Fix (`webos/index.html`):** Removed `async` attributes from script tags.

---

### Bug W3: Auth Resolution in `playStream()`
* **Symptom:** `TypeError: Cannot read property 'server' of null` on Xtream login.
* **Fix (`webos/main.js`):**
  ```javascript
  const auth = xtreamAuth || currentAuth;
  const streamUrl = directUrl || (auth && auth.server ? `${auth.server.replace(/\/+$/, "")}/live/${auth.username}/${auth.password}/${streamId}.m3u8` : "");
  ```

---

### Bug W4: Infinite Error Reconnect Loop in Simulator
* **Symptom:** Testing in webOS simulator triggered hundreds of reconnect attempts per second.
* **Root Cause:** Native playback failure triggered `video.onerror`, which invoked `scheduleLiveReconnect()` before the Hls.js fallback could start.
* **Fix (`webos/main.js`):** Introduced `nativeFallbackPending` flag; ignored video error events while native fallback was being evaluated.

---

## 3. Samsung Tizen TV Fixes

### Bug T1: Samsung Remote Key Registration
* **Symptom:** Color buttons (Red, Green, Yellow, Blue) and Number buttons (0-9) had no effect on physical Samsung Smart TVs.
* **Root Cause:** Tizen Web applications require explicit registration with `tizen.tvinputdevice.registerKey(...)` for non-standard navigation keys.
* **Fix (`tizen/main.js`):** Registered `ColorF0Red`, `ColorF1Green`, `ColorF2Yellow`, `ColorF3Blue`, `0` through `9`, `ChannelUp`, `ChannelDown`.

---

### Bug T2: Picker List Centering & Translucent Panels
* **Symptom:** List navigation felt unpolished; cursor jumped erratically at list edges, and dark menus obscured channel video previews.
* **Fix (`tizen/style.css`):**
  - Centered picker list navigation: the selected item stays anchored in the vertical middle while the list scrolls smoothly behind it.
  - Added translucent frosted glass backdrop (`backdrop-filter: blur(16px); background: rgba(20, 18, 24, 0.75)`).
  - Added background presets (Aurora, Dark Space, Sunset) in Customization settings.

---

### Bug T3: Unsigned Files and Package Rejection
* **Symptom:** `tizen package` produced "unsigned file" errors or failed validation during TV installation.
* **Root Cause:** Leftover build metadata from Tizen Studio (`.buildResult/`, `.manifest.tmp`, old `author-signature.xml`) caused packaging collisions.
* **Fix:** Excluded build artifacts and signatures from source packaging and added them to `.gitignore`.

---

## 4. Security & Credentials Hygiene

### Never Commit Credentials or Keystores
- **Local Credentials:** `credentials.local.js` (used for development autofill) must **never** be included in release builds or git commits.
- **Android Keystore:** `release.jks` and `keystore.properties` contain private keys and passwords.
- **Enforcement (`.gitignore`):**
  ```gitignore
  *.keystore
  *.jks
  keystore.properties
  android/keystore.properties
  webos/credentials.local.js
  tizen/credentials.local.js
  android/**/credentials.local.js
  credentials.local.js
  ```
