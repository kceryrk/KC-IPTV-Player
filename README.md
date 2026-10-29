# KC IPTV Player

A modern IPTV player for browsing live TV, movies and series on smart TVs. It runs on **LG webOS** and **Samsung Tizen** TVs, with an **Android** version available in releases.

| Platform | Status | Where to find it |
|----------|--------|------------------|
| LG webOS TV | Released (`.ipk`) | [`webos/`](webos/) and GitHub Releases |
| Samsung Tizen TV | Working on Tizen 6.0 TVs (tested on a 2021 AU-series) | [`tizen/`](tizen/) |
| Android | Released (`.apk`) | [`android/`](android/) and GitHub Releases |

<p align="center">
  <img src="https://raw.githubusercontent.com/kceryrk/KC-IPTV-Player/main/webos/icon.png" alt="KC IPTV Player icon" width="180" />
</p>

## Overview

KC IPTV Player is a lightweight IPTV app built for webOS devices. It gives users a TV-friendly interface for:

- live channel browsing
- favorites management
- channel zapping by number
- program info display
- region/category filtering
- fullscreen playback experience

## Features

- Live TV channel list
- Xtream API
- Favorite channel toggle with star button (yellow button)
- Favorite channel reordering (red button)
- Quick channel zap by number support
- Live EPG information display
- Channel logo support
- Movies and Series have poster support with grid navigation
- Fullscreen playback mode
- Region and category filtering
- Multi-language support
- webOS packaging support via .ipk
- Open full screen automatically in favorites and ready for zapping through channels like cable TV
- Samsung Tizen remote support: color buttons, number keys and Page Up/Down
- Page up and down buttons supported!

## Login

Log in with an Xtream Codes account, an M3U playlist URL, or both. Xtream logins also provide categories, which the app uses for region and category filtering.

To avoid typing credentials on every start, create a `credentials.local.js` file in the platform folder with your own details. It sets `window.KC_DEFAULT_LOGIN` (for example `server`, `username`, `password`, and an optional `m3uUrl`). These files are listed in `.gitignore` and must never be committed.

- webOS: `webos/credentials.local.js`
- Tizen: `tizen/credentials.local.js`

## Download the latest release

Download the latest packaged .ipk for webOS here, apk also available:

- GitHub Releases: https://github.com/kceryrk/KC-IPTV-Player/releases

You can also find the packaged app in the release assets as:

- `com.iptv.webosapp_1.2.xx_all.ipk`

## Installation on Samsung Tizen TV

The Tizen version lives in [`tizen/`](tizen/). The short version:

1. Install Tizen Studio with the TV Extension and create a Samsung TV certificate profile.
2. Enable Developer Mode on your Samsung TV and connect it to the same network as your computer.
3. Import the `tizen/` folder as a Tizen Web Application, using the TV-Samsung profile.
4. Run it on the TV with **Run As → Tizen Web Application**.

See [`tizen/README.md`](tizen/README.md) for details.

## Installation on webOS TV

### Option 1: Install using webOS Dev Manager or Developer Mode

1. Enable Developer Mode on your LG webOS TV.
2. Connect the TV to the same network as your computer.
3. Install the LG webOS Dev Manager or use the webOS command tools.
4. Transfer the `.ipk` file to the TV.
5. Install it from the TV or the dev tool.

### Option 2: Install via command line

If you are using the webOS CLI tools, run:

```bash
ares-install --device your_tv_ip KCIPTVPLAYER_1.2.11.ipk
```

Replace `your_tv_ip` with the IP address of your LG TV.
Check LG Developer website for more information.

### Option 3: Install using a USB drive (not confirmed)

1. Copy the `.ipk` file to a USB stick.
2. Plug the USB stick into the LG TV.
3. Open the file manager on the TV.
4. Select the `.ipk` file.
5. Confirm installation.

## Known limitations

- Android: sometimes no audio for movies and series.
- webOS: difficulty implementing series playback.
- Tizen: playback uses the standard HTML video path. Stream format support can differ from webOS, and Samsung AVPlay integration is not yet implemented.

## Notes

This project is intended for:

- private backup
- GitHub version history
- webOS app packaging
- future release updates

## Version

- Current version: 1.2.11

## License

This project is for personal/private use and is not currently published under a public license.

## Support

For installation issues or release updates, please use the GitHub Releases page and project issues tracker.
