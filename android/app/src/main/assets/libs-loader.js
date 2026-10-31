(function () {
  var MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
  var LIBS = [
    { key: "hls", url: "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js" },
    { key: "mpegts", url: "https://cdn.jsdelivr.net/npm/mpegts.js@1.7.3/dist/mpegts.min.js" }
  ];

  function readCache(key) {
    try { return JSON.parse(window.localStorage.getItem("kc_lib_" + key) || "null"); } catch (e) { return null; }
  }

  function writeCache(key, entry) {
    try { window.localStorage.setItem("kc_lib_" + key, JSON.stringify(entry)); } catch (e) { /* storage full or unavailable */ }
  }

  function inject(text) {
    var script = document.createElement("script");
    script.textContent = text;
    document.head.appendChild(script);
  }

  function loadLib(lib) {
    var cached = readCache(lib.key);
    var cacheMatches = cached && cached.url === lib.url && typeof cached.text === "string";
    var fresh = cacheMatches && (Date.now() - cached.ts) < MAX_AGE_MS;

    if (fresh) {
      inject(cached.text);
      return Promise.resolve();
    }

    return fetch(lib.url)
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (text) {
        writeCache(lib.key, { url: lib.url, ts: Date.now(), text: text });
        inject(text);
      })
      .catch(function (error) {
        console.error("Library download failed", lib.key, error);
        if (cacheMatches) inject(cached.text);
      });
  }

  window.kcLibsReady = Promise.all(LIBS.map(loadLib));
})();
