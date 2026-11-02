(function () {
  var inputDevice = (window.tizen && window.tizen.tvinputdevice) || (window.webapis && window.webapis.tvinputdevice);
  if (!inputDevice || typeof inputDevice.registerKey !== "function") return;

  ["MediaPlayPause", "MediaPlay", "MediaPause", "MediaFastForward", "MediaRewind", "ChannelUp", "ChannelDown", "Guide",
    "ColorF0Red", "ColorF1Green", "ColorF2Yellow", "ColorF3Blue",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].forEach(function (keyName) {
    try {
      inputDevice.registerKey(keyName);
    } catch (error) {}
  });
})();