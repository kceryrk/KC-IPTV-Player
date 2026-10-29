# Samsung Tizen TV

This folder is the Samsung TV build of KC IPTV Player. It targets Tizen 6.0 TVs, including the 2021 AU-series, and keeps Samsung packaging and remote-key setup separate from webOS and Android.

## Build and install

1. Install Tizen Studio with the TV Extension and create a Samsung TV certificate profile.
2. Import this folder as a Tizen Web Application, using the TV-Samsung profile.
3. Build a `.wgt` package and install it on a TV with Developer Mode enabled.

The app currently uses the existing HTML video playback path. Stream format support can differ from webOS; Samsung AVPlay integration and on-device playback testing remain follow-up work.

Create `credentials.local.js` in this folder for local development credentials. It is ignored by Git.