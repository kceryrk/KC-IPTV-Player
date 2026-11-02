# KC IPTV Player — LG webOS Platform Handover

**Platform:** LG Smart TV (webOS 4.0 through webOS 24+)  
**Location:** [`webos/`](file:///Users/kamil/Desktop/KC-IPTV-Player/webos)  
**Packaging:** webOS Package (`.ipk`)  
**Package ID:** `com.iptv.webosapp`  
**Current Release Line:** `1.2.45` (webOS port of the Tizen UI/feature changes: guide overlay, poster loading, OSD readability, rename dialog, settings tabs)

---

## 1. Overview & Architecture

The webOS client runs within LG's Chromium-based TV web application container. It relies on webOS application lifecycle events and webOS remote controller key codes.

```
webos/
├── appinfo.json           # webOS package configuration, app ID, version, icon
├── index.html             # Main webOS interface markup & script references
├── main.js                # Core playback, dual HLS/MPEG-TS strategy, remote key listeners
├── style.css              # 10-foot TV UI styles
├── icon.png               # App icon (130x130)
└── credentials.local.js   # Local developer credentials (gitignored, never package)
```

---

## 2. Key Features & Playback Architecture

### Dual Playback Strategy (Bypassing Server CORS Resets)
IPTV servers frequently reject stream requests containing an `Origin: file://` or `Origin: http://localhost` HTTP header by dropping the TCP connection (`ERR_CONNECTION_RESET`).
- **MPEG-TS Streams (`.ts`):** Routed directly to `mpegts.js` without converting to `.m3u8`.
- **HLS Streams (`.m3u8`):**
  - **Real TV Hardware:** Runs through `tryNative(url)`. The physical webOS TV media pipeline plays HLS natively via `<video src="...">` without attaching browser CORS headers, successfully bypassing server resets.
  - **Autoplay Handling:** Streams begin muted to satisfy TV autoplay policies and unmute automatically once playback starts:
    ```javascript
    function tryNative(url, onFail) {
      nativeFallbackPending = true;
      video.src = url;
      video.muted = true;
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
  - **Simulator Fallback:** If native playback throws a `DOMException` (expected in the desktop webOS Simulator which lacks native HLS decoding), it falls back seamlessly to `Hls.js`.

### Error Reconnect Loop Guard
- Added `nativeFallbackPending` flag to prevent `video.onerror` from firing rapid exponential backoff reconnection loops while native playback is actively evaluating fallback.

### Synchronous Script Loading
- Removed `async` from script tags in `webos/index.html` to eliminate race conditions where `main.js` executed before `Hls` or `mpegts` was available in `window`.

---

## 3. Known Issues & Future Roadmap

1. **Series Playback Support:**
   - Live TV and VOD Movies operate smoothly, but the series episode navigation and playback flow requires parity testing with the Android implementation.
2. **EPG Auto-Refresh:**
   - EPG data should refresh periodically while the OSD is visible to keep upcoming listings fresh.
3. **Secret Hygiene in Released Packages:**
   - Ensure `credentials.local.js` is never bundled into `.ipk` files for public releases.

---

## 4. Packaging & Installation

### Option 1: webOS CLI (`ares`)
```bash
# 1. Package folder into .ipk (ensure credentials.local.js is removed or excluded)
ares-package webos/ -o .

# 2. Install on TV
ares-install --device <device_name> com.iptv.webosapp_1.2.xx_all.ipk

# 3. Launch app
ares-launch --device <device_name> com.iptv.webosapp
```

### Option 2: webOS Dev Manager
- Connect to TV Developer Mode via webOS Dev Manager GUI.
- Drag and drop the `.ipk` package to install directly onto the TV.
