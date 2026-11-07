# TODO

Open items to fix later.

## Login and download
- [ ] D-pad on the login screen (M3U): Down does not reach the fields, and vertical moves still change focus horizontally
- [ ] Download timeout kicks the user even while progress is being made; reset the timeout on progress instead of capping the whole download

## Profiles and accounts
- [ ] Rename "Kaynak" to "Profile"
- [ ] Add multiple profiles and accounts

## Settings layout
- [ ] Set a max width for settings with toggles, and group them in a square container
- [ ] Some settings touch each other; add spacing between them
- [ ] Move some Customization settings to the Menu tab (consider merging Menu with General)
- [ ] Replace `gap` with margin or padding in CSS

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
- [ ] The font does not look nice; find a better one
- [ ] More backgrounds

## Platform
- [ ] New app icon (launcher and home screen)
- [ ] webOS update; test on webOS first, because Tizen updates are slower to reach the TV
