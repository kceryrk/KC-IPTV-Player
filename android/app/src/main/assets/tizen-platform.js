// Tizen API stub for Android WebView compatibility
window.tizen = window.tizen || {
  application: {
    getCurrentApplication: function () {
      return {
        exit: function () {
          console.log("tizen.application.exit() called");
        }
      };
    }
  }
};

window.webapis = window.webapis || {
  avplay: {
    open: function () {},
    close: function () {},
    prepare: function () {},
    prepareAsync: function (success) { if (success) success(); },
    play: function () {},
    stop: function () {},
    pause: function () {},
    seekTo: function () {},
    getState: function () { return "NONE"; },
    setDisplayRect: function () {},
    setListener: function () {}
  }
};
