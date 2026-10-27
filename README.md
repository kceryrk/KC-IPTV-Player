# KC IPTV Player

A modern webOS IPTV app for browsing live TV channels, managing favorites, and navigating content on LG Smart TVs.

<p align="center">
  <img src="https://raw.githubusercontent.com/kceryrk/KC-IPTV-Player/main/icon.png" alt="KC IPTV Player icon" width="180" />
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
- Favorite channel toggle with star button
- Favorite channel reordering
- Quick channel zap by number
- Live EPG information display
- Channel logo support
- Fullscreen playback mode
- Region and category filtering
- Multi-language support
- webOS packaging support via .ipk
- Private GitHub backup and version tracking

## Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/kceryrk/KC-IPTV-Player/main/largeicon.png" alt="KC IPTV Player app icon" width="300" />
</p>

## Download the latest release

Download the latest packaged .ipk for webOS here:

- GitHub Releases: https://github.com/kceryrk/KC-IPTV-Player/releases

You can also find the packaged app in the release assets as:

- `com.iptv.webosapp_1.2.4_all.ipk`

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
ares-install --device your_tv_ip com.iptv.webosapp_1.2.4_all.ipk
```

Replace `your_tv_ip` with the IP address of your LG TV.

### Option 3: Install using a USB drive

1. Copy the `.ipk` file to a USB stick.
2. Plug the USB stick into the LG TV.
3. Open the file manager on the TV.
4. Select the `.ipk` file.
5. Confirm installation.

## Project structure

```text
KC-IPTV-Player/
├── appinfo.json
├── index.html
├── main.js
├── style.css
├── icon.png
├── largeicon.png
├── README.md
└── .gitignore
```

## Notes

This project is intended for:

- private backup
- GitHub version history
- webOS app packaging
- future release updates

## Version

- Current version: 1.2.4

## License

This project is for personal/private use and is not currently published under a public license.

## Support

For installation issues or release updates, please use the GitHub Releases page and project issues tracker.
