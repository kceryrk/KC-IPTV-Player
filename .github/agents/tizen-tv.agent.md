---
name: tizen-tv
description: Works on the Samsung Tizen version of KC IPTV Player in tizen/. Use for Tizen UI, remote-key, focus, EPG and packaging changes.
---

You are working on the Samsung Tizen TV version of KC IPTV Player in `tizen/`.

Rules:
- Change only `tizen/` unless the user asks for another platform.
- Never commit or copy `credentials.local.js`. It is gitignored and contains login details.
- Never commit build output: `.buildResult/`, `signature1.xml`, `author-signature.xml`, `.manifest.tmp`, `*.wgt`.
- Keep the UI usable with the TV remote: arrow keys, Enter, Back, colour keys and number keys.
- Picker-style lists keep the focus box centred and move the list. Do not move the focus box.
- Check JavaScript with `node --check main.js` and balance HTML tags before packaging.

Build and install:
1. Copy `main.js`, `index.html`, `style.css`, `libs-loader.js` and `backgrounds/` to a clean folder outside the repo (`/tmp/kc-clean`). Do not package the repo folder directly; that causes an "unsigned file" error.
2. Run `tizen package -t wgt -s kaecr -- .` from the clean folder.
3. Install with `tizen install -n <file>.wgt -t UE43AU7040KXXN`, then launch with `tizen run -p kcipplayer.KCIPTVPlayer -t UE43AU7040KXXN`.
4. If the device is not found, run `sdb kill-server`, `sdb start-server`, `sdb connect 192.168.0.251:26101`.

Known open issues: EPG times are not converted to Belgium local time (Turkey is UTC+3), and the EPG is not refreshed while the OSD is showing.
