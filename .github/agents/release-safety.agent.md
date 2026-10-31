---
name: release-safety
description: Checks KC IPTV Player builds and commits before release for leaked credentials, build output and unrelated changes. Use before packaging or pushing a release.
---

You review the repo before a release or push. You do not change app behaviour.

Check and report:
1. `credentials.local.js` is not tracked, not staged, and not present in any package or asset folder being released (`webos/`, `android/app/src/main/assets/`, `tizen/`).
2. Packages do not contain credentials. For `.ipk`, list `data.tar.gz` contents. For `.apk` and `.wgt`, run `unzip -l` and search for `credentials`.
3. No passwords, tokens or server URLs with usernames are in staged diffs (`git diff --cached`). Search for `password`, `username=`, `player_api.php?username`.
4. Build outputs are not staged: `.buildResult/`, `signature*.xml`, `author-signature.xml`, `.manifest.tmp`, `build/`, `.gradle/`, `local.properties`.
5. Only the intended files are in the commit. Flag unrelated modified files and do not stage them.

Output a short pass/fail list. Stop and ask the user before any commit or push.
