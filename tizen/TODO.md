# Tizen TODO

Open items to fix later.

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

## Menus and animation
- [x] ~~Animate between menus (collapse and expand)~~
- [x] ~~Prioritize animation over loading~~
- [x] ~~Remove the scrollbar on the right of list column menus~~
- [x] ~~Add a separator between items~~
- [x] ~~Separator line between settings sections, with the section title centred~~
- [x] ~~Settings: the gap between items does not work on TVs~~
- [x] ~~Settings: make the SVG icons sit above the title and make them bigger~~
- [x] ~~Settings: the selected item is a plain white box; it should follow the parent's style~~
- [x] ~~Settings: not everything is pill shaped, and most controls are small; add a UI scale setting~~
- [x] ~~Text input boxes: pill shaped~~
- [x] ~~Add a setting to disable animation~~

## Hint bar
- [x] ~~Pill-shaped hints~~
- [x] ~~Fill colour for the coloured buttons~~

## Rename
- [ ] Holding OK does not start rename, and there is no hint for it

## Sound
- [x] ~~Tick sound is too quiet to hear; raise the volume~~
- [x] ~~Add a general navigation sound for moving through buttons~~

## Posters and categories
- [x] ~~When a poster image is too heavy, navigation stops loading; keep navigation responsive while large images load~~
- [x] ~~Large poster lists lag more the bigger they are; skip layout and paint for off-screen cards~~
- [x] ~~Stop live TV playback when entering Movies or Series~~
- [ ] Movie and series region tags show a "V" and "S" prefix (for example "VTR" and "STR"); remove the prefix
- [ ] Remove the "Diziler" tag from categories
- [ ] Full-screen poster selection only: posters are picked full-screen, and the menus only select categories
- [ ] Movies and series region opens at ALL; consider defaulting to a real region to keep the grid smaller
- [ ] Consider full-screen poster navigation with infinite scrolling, horizontally and vertically (hard)

## Regions and favourites
- [x] ~~Favourite regions use a heart in a different colour; make them match the channel favourite style (star). The channel style is preferred.~~

## Wheel
- [ ] Mac-style zoom while scrolling through the wheel list
- [ ] Reorder stack moves when the list moves; it should stay static
- [ ] List scrolls too fast while moving a channel; slow it down

## Fonts and look
- [ ] The font does not look nice; find a better one
- [ ] More backgrounds

## Platform
- [ ] New app icon (launcher and home screen)
- [ ] webOS update
