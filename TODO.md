# TODO

Open items to fix later.

## Login and download
- [ ] D-pad on the login screen (M3U): Down does not reach the fields, and vertical moves still change focus horizontally
- [ ] Download timeout kicks the user even while progress is being made; reset the timeout on progress instead of capping the whole download

## Profiles and accounts
- [ ] Rename "Kaynak" to "Profile"
- [ ] Add multiple profiles and accounts

## Settings layout & Material You Redesign
- [x] Set a max width for settings with toggles, and group them in a square container (Material You cards)
- [x] Some settings touch each other; add spacing between them (Margins and card hierarchy)
- [x] Move some Customization settings to the Menu tab (Merged Menu with General, moved Clock format to General)
- [x] Replace `gap` with margin or padding in CSS (Chromium 53 compatibility)
- [x] Stremio-dock visual match for settings sidebar with soft radial fade curtain
- [x] Slim 110px sidebar dock with focused floating pill overlapping settings page
- [x] Focused tab vertically centered at 50% screen height
- [x] Tab icons enlarged to 44px, text hidden by default and shown only when focused
- [x] Pressing OK (Enter) on sidebar tab shifts focus into right pane settings items rather than closing settings
- [x] Arrow keys (Left/Right) in settings strictly trapped to prevent leaking to Aero Radial menu
- [x] Settings page vertical D-pad scrolling with 60px padding
- [x] Dynamic theme colors (Primary / Secondary) reflected on settings tabs and Material You glass cards
- [x] Addons tab placed directly next to Source in settings
- [x] Background wallpaper visibility with user-adjustable tint slider (10% - 95%)

## Guide (EPG)
- [ ] EPG and OSD blur
- [ ] Channel name column is too narrow; make it wider
- [ ] Long channel names scroll to the right after 1 second, in a loop
- [ ] Localize the date in the guide
- [ ] Navigation: load the description after the focus move, not before (prioritize navigation over loading)
- [ ] Make the main menu EPG better
- [ ] OSD overlaps the EPG when in the main menu

## Live TV OSD
- [ ] Quality labels: HD, FHD and 4K, each with its own colour
- [ ] Style the labels like GitHub-style default labels, next to the channel name
- [ ] Smaller label font, with enough space from the channel name

## Rename
- [ ] Holding OK does not start rename, and there is no hint for it

## Posters and categories
- [ ] Movie and series region tags show a "V" and "S" prefix (for example "VTR" and "STR"); remove the prefix
- [ ] Remove the "Diziler" tag from categories
- [ ] Full-screen poster selection only: posters are picked full-screen, and the menus only select categories
- [ ] Movies and series region opens at ALL; consider defaulting to a real region to keep the grid smaller
- [ ] Consider full-screen poster navigation with infinite scrolling, horizontally and vertically (hard)

## Wheel
- [ ] Mac-style zoom while scrolling through the wheel list
- [ ] Reorder stack moves when the list moves; it should stay static
- [ ] List scrolls too fast while moving a channel; slow it down

## Fonts and look
- [x] The font does not look nice; find a better one (Outfit font integrated)
- [x] More backgrounds (Aurora, Ocean, Sunset, Midnight presets + custom background URL + background tint slider)

## Platform
- [x] New app icon (launcher and home screen) - Added full-bleed iconColor and alpha transparent white TV icons
- [x] webOS update; test on webOS first, because Tizen updates are slower to reach the TV (tested & verified on webOS 4.5 LG TV)
