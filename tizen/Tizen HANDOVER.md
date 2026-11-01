# KC IPTV Player — Samsung Tizen Platform Handover

**Platform:** Samsung Smart TV (Tizen 6.0+, tested on 2021 AU-series AU7040)  
**Location:** [`tizen/`](file:///Users/kamil/Desktop/KC-IPTV-Player/tizen)  
**Packaging:** Tizen Web Application (`.wgt`)  
**Target Architecture:** Tizen Web Engine (Blink/Chromium runtime)

---

## 1. Overview & Architecture

The Samsung Tizen version provides a 10-foot TV experience optimized for the Samsung Smart Remote and standard infrared remote controls.

```
tizen/
├── config.xml             # Tizen application manifest, privileges, and resolution (1920x1080)
├── index.html             # Main TV interface markup and script references
├── main.js                # Remote key handlers, Xtream/M3U playlist logic, OSD
├── style.css              # 10-foot TV UI, centered picker lists, translucent panels
├── icon.png               # Application icon
└── credentials.local.js   # Local developer autofill (gitignored, never package)
```

---

## 2. Key Features Implemented

### Samsung Remote Control Key Handling
- Explicit registration with `tizen.tvinputdevice.registerKey`:
  - **Color Keys:** Yellow = Toggle Favorite, Red = Reorder Favorites, Green = Search, Blue = Mode switch.
  - **Numeric Keys (0–9):** Quick channel zapping by number with on-screen buffer overlay.
  - **Channel Keys:** Page Up / Channel Up and Page Down / Channel Down for fast paging.
  - **Navigation:** D-Pad navigation with smart autofocus.

### Centered Picker Navigation & Translucent Aesthetics
- **Centered Focus:** Picker lists keep the active row on the centre line of their column (`centerInList` in `main.js`), the same line as the collapsed MODLAR / BÖLGE / KATEGORİLER labels. Padding is set from the `.col-nav` centre, so the focus box lines up with the collapsed labels. Items scroll behind it, reducing visual jumpiness on large TV screens.
- **Translucent Glass Panels:** Background presets (Aurora, Dark Space, Sunset) paired with `backdrop-filter: blur(16px)` allow stream video to remain partially visible behind menus.
- **Left-Aligned OSD:** Transparent channel logo display with program title and now/next EPG timeline.

### Settings Page, Login & Playback Fixes (latest round)
- **Layout gap between top bar and menu**
  - *Cause:* `index.html` had an unclosed highlight-colour `<section>` and a stray `</div>` / `<div>` in the clock pane. `</header>` closed too late, so `.tv-grid` ended up inside the header.
  - *Fix:* Tags balanced. `setElementFocus` uses `focus({preventScroll:true})`, and `scrollIntoView` was removed from `moveFocusByDirection`.
  - *Status:* Confirmed on TV.
- **Up from Canlı TV with no favourites did nothing**
  - *Cause:* The hidden Favourites tab was still in `#modusList`, so the Up loop stopped on it.
  - *Fix:* Up skips `.hidden` items. If nothing is above, focus moves to `settingsButton`.
  - *Status:* Not yet confirmed on TV.
- **Settings D-pad dead ends**
  - *Cause:* Down from the login form referenced an undefined `next` variable. Down from `settingsButton` had no target when there were no favourites.
  - *Fix:* Login-form Down uses `fields[idx + step]`. Down from `settingsButton` returns to the first visible mode item.
  - *Status:* Not yet confirmed on TV.
- **URL field opened the keyboard on focus**
  - *Cause:* Text inputs were focusable and editable as soon as they got focus.
  - *Fix:* Inputs in `#settingsPage` are `readOnly` until OK. OK sets `readOnly=false` and refocuses. Blur restores read-only. Set up by `armTextInputs()` from `initProfile()`.
  - *Status:* Not yet confirmed on TV.
- **Tab labels showed raw keys (`generalTab`, `playbackTab`, `profileTab`)**
  - *Cause:* Keys were missing from the translation table.
  - *Fix:* Added to en and tr. **nl and fr are still missing**, so `t()` falls back to English.
- **Login took 10–15 s before "logged in" showed**
  - *Cause:* The state changed only after categories and the full playlist had loaded.
  - *Fix:* `loginXtream` sets "logged-in" right after the account check, then loads categories with a progress bar (`setLoginProgress`, `hideLoginProgress`). `requestText(url, timeout, onProgress)` reports download progress. The M3U path shows 10% → download (MB) → 75% parsing → hide. Progress is shown in two places with the same `.login-progress` markup: a strip under the settings header (`.settings-progress`), and a fixed bar above the hint bar on the main screen (`.app-progress`). `setLoginProgress` and `hideLoginProgress` update every `.login-progress` element.
  - *Status:* Not yet confirmed on TV.
- **No default playlist after Xtream login**
  - *Cause:* Xtream login did not create an M3U profile, so M3U autologin had nothing to load.
  - *Fix:* `ensureDefaultXtreamPlaylist()` saves the generated M3U as profile "Xtream" when none exist. `initProfile` falls back to it when there is no `iptv_profile`.
  - *Status:* Not yet confirmed on TV.
- **Login fields disappeared after login**
  - *Cause:* `toggleLoginPanel` hid `#loginForm` once the state was logged-in.
  - *Fix:* The form stays visible in the Source tab.
  - *Status:* Not yet confirmed on TV.
- **Fullscreen started automatically after login and buttons stopped working**
  - *Cause:* `activeerFitScreen()` ran after login autoplay (`initProfile` fastStart and the M3U success path). Focus was left in the hidden channel panel.
  - *Fix:* Removed the automatic calls. Channel selection still goes fullscreen.
  - *Status:* Not yet confirmed. The root cause of the "buttons stop working" issue is unconfirmed.
- **Loader too small and choppy**
  - *Cause:* 80×48 px with an eased cubic-bezier animation.
  - *Fix:* Replaced with a lighter line loader in `#playerLoading` (`.trail-loader`, `.trail-line`). It is an SVG figure-eight (aaroniker/MzoXaZ shape) drawn as 10 stacked strokes. Each stroke's dash and gap sum to the 100-unit `pathLength`, so the animation loops without a jump. The stroke gets thinner toward the tail (0.8 → 4.2 px, thickest at the head) and the period is 2.4 s. Colours are set in `applyThemeConfig` (`main.js`) as `--trail-0`…`--trail-9`, blended from `--accent` to `--highlight`. Menus and text use `var(--accent)` / `var(--highlight)` (and the `-rgb` forms), never hardcoded red or gold, so the Settings colour swatches change the whole UI, including the loader. The keyframes use literal values because `var()` and `calc()` inside `@keyframes` are unreliable on Chromium 69. The earlier dot-based loader was too heavy for the TV. The goo-filter variant is not used.
  - *Status:* Not yet confirmed on TV.
- **Channels spun forever with no error**
  - *Cause:* `#playerLoading` only hid on `playing`/`canplay`. Errors were never shown.
  - *Fix:* `reportPlaybackError(reason)` shows a toast and logs. `startPlaybackTimeout()` runs for 20 s, hides the spinner, and shows the last reason. `mediaErrorReason` maps video error codes. MPEG-TS, HLS, `play()` rejections, and missing `window.mpegts` / `window.Hls` are reported. New keys: `streamFailed`, `streamTimedOut`, `streamNoData` (en/tr).
  - *Status:* Not yet confirmed on TV. The toast text will show the real reason.

---

## 3. Known Issues & Future Roadmap

1. **Native Samsung AVPlay Integration:**
   - Currently uses standard HTML5 `<video>` element. While compatible with many streams, some broadcast MPEG-TS formats benefit from native hardware decoders via `webapis.avplay`.
   - *Roadmap:* Wire `window.webapis.avplay.open()`, `prepare()`, `setDisplayRect()`, and `play()` when stream requires native hardware decode.
2. **EPG Timezone Alignment (open):**
   - *Problem:* Programme times differ between channels. The provider runs on Turkey time (UTC+3) and the user is in Belgium (UTC+1/+2), a 2 h gap in winter and 1 h in summer.
   - *Cause:* `clock()` in `main.js` converts `start_timestamp` to local time, but falls back to the raw `start`/`end` text when it is missing.
   - *Plan:* Confirm the provider timezone from a real `get_short_epg` response, then convert all programme times to Belgium local time. Also refresh now/next while the OSD is open and skip listings that have ended.
3. **Playback Reliability (open):**
   - *Problem:* Live channels often fail to start. The loader keeps spinning or shows a black screen.
   - *Likely cause:* `libs-loader.js` loads hls.js and mpegts.js from `cdn.jsdelivr.net`. If the CDN is unreachable and nothing is cached, `window.mpegts` / `window.Hls` are undefined, so `.ts` streams fall back to `.m3u8` and fail. Unconfirmed.
   - *Next:* Read the toast reason on TV. Then decide whether to self-host the libraries or change the stream URL logic.
4. **M3U Autologin (open):**
   - *Problem:* M3U profile autologin did not work on TV. The M3U profile list on the TV was empty, so M3U had never succeeded there.
   - *Likely cause:* The TV-side download or parse of a ~24 MB playlist (about 23 s on the Mac) may be timing out or failing. Unconfirmed.
   - *Next:* Read the progress and error toast after pressing Giriş yap with M3U.
5. **Fullscreen Exit (open):**
   - *Problem:* Exit fullscreen does not work with any key. The buttons stopped responding after the first fullscreen.
   - *Cause:* Exit is handled in the `isFitScreen` branch of the keydown handler (Left/Enter/Back: 10009/461/27). No code path that swallows Back has been found yet.
6. **Settings Translations (open):**
   - Dutch and French lack `generalTab`, `playbackTab`, `profileTab`, `progressCategories`, `progressPlaylist`, `progressParsing`, `streamFailed`, `streamTimedOut`, `streamNoData`. Falls back to English.
7. **Favorites Persistence Across Reinstalls:**
   - Favorites are stored in `localStorage` and lost during clean updates. Can be persisted via Tizen filesystem APIs if required.
8. **Build Packaging Hygiene:**
   - Unwanted build artifacts (`.buildResult/`, `.manifest.tmp`, `author-signature.xml`, `signature1.xml`) must remain excluded from packaging to prevent "unsigned file" packaging rejections.
9. **Leftover CSS:**
   - `.settings-panel` rules in `style.css` are unused since the full settings page replaced the dropdown.

---

## 4. Packaging, Installation & Debugging

### Prerequisites
- Tizen Studio with TV Extension installed.
- Samsung TV Certificate Profile created in Certificate Manager.
- Samsung TV set to **Developer Mode** (Apps -> `12345` -> Host PC IP set).

### Connection & Packaging Commands
```bash
# 1. Connect SDB to TV
sdb kill-server
sdb start-server
sdb connect <tv_ip>:26101

# 2. Package into .wgt (ensure credentials.local.js is excluded)
tizen package -t wgt -s <your_cert_profile> -- .

# 3. Install onto TV
tizen install -n <generated_file>.wgt -t <target_device_id>

# 4. Launch application
tizen run -p kcipplayer.KCIPTVPlayer -t <target_device_id>
```
