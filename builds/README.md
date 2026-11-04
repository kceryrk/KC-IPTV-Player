# KC IPTV Player — Builds

This folder holds the packaged app files for release and install. Only the files named below are tracked in Git. Everything else here is ignored.

## Rules

1. **Naming:** every tracked build includes its version in the file name:
   - Samsung Tizen: `KCIPTVPlayer-tizen-<version>.wgt`, for example `KCIPTVPlayer-tizen-1.2.58.wgt`
   - LG webOS: `KCIPTVPlayer-webos-<version>.ipk`, for example `KCIPTVPlayer-webos-1.2.58.ipk`
   - Android: `KCIPTVPlayer-android-<version>.apk`, for example `KCIPTVPlayer-android-1.2.58.apk` (the signed release build, copied from `android/app/build/outputs/apk/release/app-release.apk`)
2. **Only versioned builds are tracked.** Files without a version in their name, and `.ipk` files that don't match the webOS naming above, are ignored by [.gitignore](../.gitignore).
3. **No credentials:** only store builds that don't include `credentials.local.js`. Packages built with credentials are for private testing and must not go into a release.
4. **Keep the 5 most recent versions.** Delete older versioned builds, and any file without a version in its name.
5. **Naming for the build step:** the webOS tool writes `com.iptv.webosapp_<version>_all.ipk`. Rename it to `KCIPTVPlayer-webos-<version>.ipk` when you copy it here.

## Install on a webOS TV (LG)

Packages install over the existing app, and the app keeps its saved data.

1. Register the TV once, then fetch its device key from the Developer Mode app on the TV:
   ```bash
   ares-setup-device --add lg-tv --info "host:<tv_ip>,port:9922,username:prisoner"
   ares-novacom --getkey -d lg-tv
   ```
2. Install the package from this folder:
   ```bash
   ares-install --device lg-tv builds/KCIPTVPlayer-webos-<version>.ipk
   ```
3. Launch it:
   ```bash
   ares-launch --device lg-tv com.iptv.webosapp
   ```

You can also drag and drop the `.ipk` onto the TV's Developer Mode app.

## Install on a Samsung TV (Tizen)

1. Enable Developer Mode on the TV (Apps, then `12345`, then set the host PC IP).
2. Connect to the TV:
   ```bash
   sdb connect <tv_ip>:26101
   ```
3. Install the package. The `--` separates the file name from the folder that contains it:
   ```bash
   tizen install -n KCIPTVPlayer-tizen-<version>.wgt -s <tv_ip>:26101 -- builds
   ```
4. Launch it:
   ```bash
   tizen run -p kcipplayer.KCIPTVPlayer -s <tv_ip>:26101
   ```

**Warning:** `tizen uninstall -p kcipplayer.KCIPTVPlayer` deletes the saved login, favourites and settings. Use the install step above to update the app instead.

For Tizen build steps and troubleshooting, see [Tizen README.md](../tizen/Tizen%20README.md). For webOS build steps, see [README.md](../README.md).
