/**
 * KC IPTV Player - Stremio Addon Protocol Engine
 * Ultra-lightweight, zero-dependency, ES5-compatible Stremio Addon Protocol v3 client.
 * Designed specifically for low-power Smart TVs (LG webOS / Samsung Tizen).
 */
(function(window) {
  "use strict";

  var STORAGE_KEY = "iptv_stremio_addons";
  var TIMEOUT_MS = 6500;

  var DEFAULT_ADDONS = [
    {
      transportUrl: "https://v3-cinemeta.strem.io/manifest.json",
      manifest: {
        id: "com.linvo.cinemeta",
        name: "Cinemeta",
        description: "Official IMDb & TMDB metadata provider",
        resources: ["catalog", "meta"],
        types: ["movie", "series"],
        catalogs: [
          { type: "movie", id: "top", name: "Popular Movies" },
          { type: "series", id: "top", name: "Popular Series" }
        ]
      },
      isCore: true,
      enabled: true
    }
  ];

  var LEGAL_ADDONS_CATALOG = [
    {
      id: "org.stremio.opensubtitlesv3",
      name: "OpenSubtitles v3",
      badge: "Official · Legal",
      description: "Official multi-language subtitle provider for movies and series from OpenSubtitles.org.",
      transportUrl: "https://opensubtitles-v3.strem.io/manifest.json",
      types: ["movie", "series"]
    },
    {
      id: "org.stremio.watchhub",
      name: "WatchHub",
      badge: "Official · Legal",
      description: "Aggregator guide to watch movies & series on legal services (Netflix, HBO, Prime, Disney+, etc.).",
      transportUrl: "https://watchhub.strem.io/manifest.json",
      types: ["movie", "series"]
    },
    {
      id: "org.stremio.pubdomainmovies",
      name: "Public Domain Movies",
      badge: "Official · Legal",
      description: "Over 500+ historical, copyright-free public domain classic movies.",
      transportUrl: "https://caching.stremio.net/publicdomainmovies.now.sh/manifest.json",
      types: ["movie"]
    },
    {
      id: "community.anime.kitsu",
      name: "Anime Kitsu",
      badge: "Community · Legal",
      description: "Kitsu.io anime database with trending charts, top airing rankings, and metadata.",
      transportUrl: "https://anime-kitsu.strem.fun/manifest.json",
      types: ["anime", "series", "movie"]
    }
  ];

  function xhrGet(url, timeoutMs, callback) {
    var xhr = new XMLHttpRequest();
    var completed = false;
    xhr.open("GET", url, true);
    xhr.timeout = timeoutMs || TIMEOUT_MS;
    xhr.onreadystatechange = function() {
      if (completed) return;
      if (xhr.readyState === 4) {
        completed = true;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var data = JSON.parse(xhr.responseText);
            callback(null, data);
          } catch (e) {
            callback(e);
          }
        } else {
          var shortUrl = url.length > 40 ? url.substring(0, 36) + "..." : url;
          callback(new Error("HTTP " + (xhr.status || 0) + " (" + shortUrl + ")"));
        }
      }
    };
    xhr.ontimeout = function() {
      if (completed) return;
      completed = true;
      callback(new Error("Connection timed out (server took too long)"));
    };
    xhr.onerror = function(err) {
      if (completed) return;
      completed = true;
      callback(new Error("Network connection error"));
    };
    xhr.send();
  }

  function StremioEngine() {
    this.addons = this.loadAddons();
    this.refreshManifests();
  }

  StremioEngine.prototype.refreshManifests = function() {
    var self = this;
    for (var i = 0; i < self.addons.length; i++) {
      if (!self.addons[i].isCore) {
        (function(addon) {
          xhrGet(addon.transportUrl, TIMEOUT_MS, function(err, manifest) {
            if (!err && manifest && manifest.id) {
              addon.manifest = manifest;
              self.saveAddons();
            }
          });
        })(self.addons[i]);
      }
    }
  };

  StremioEngine.prototype.loadAddons = function() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADDONS));
        return DEFAULT_ADDONS.slice();
      }
      var list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list;
      }
    } catch (e) {
      console.warn("Failed to parse stremio addons from storage", e);
    }
    return DEFAULT_ADDONS.slice();
  };

  StremioEngine.prototype.saveAddons = function() {
    try {
      var str = JSON.stringify(this.addons);
      localStorage.setItem(STORAGE_KEY, str);
      localStorage.setItem("stremio_addons", str);
    } catch (e) {
      console.warn("Failed to save stremio addons", e);
    }
  };

  StremioEngine.prototype.getAddons = function() {
    return this.addons;
  };

  StremioEngine.prototype.getLegalCatalog = function() {
    return LEGAL_ADDONS_CATALOG;
  };

  StremioEngine.prototype.isInstalled = function(transportUrl) {
    if (!transportUrl) return false;
    for (var i = 0; i < this.addons.length; i++) {
      if (this.addons[i].transportUrl === transportUrl) {
        return true;
      }
    }
    return false;
  };

  StremioEngine.prototype.installAddon = function(manifestUrl, callback) {
    var self = this;
    if (!manifestUrl || typeof manifestUrl !== "string") {
      if (callback) callback(new Error("Invalid URL"));
      return;
    }
    manifestUrl = manifestUrl.trim();
    if (manifestUrl.indexOf("stremio://") === 0) {
      manifestUrl = "https://" + manifestUrl.substring(10);
    }
    if (!/\/manifest\.json$/i.test(manifestUrl)) {
      manifestUrl = manifestUrl.replace(/\/+$/, "") + "/manifest.json";
    }

    // Check if already installed
    for (var i = 0; i < self.addons.length; i++) {
      if (self.addons[i].transportUrl === manifestUrl) {
        if (callback) callback(new Error("Addon already installed"));
        return;
      }
    }

    // Check known catalog fallback
    var fallbackManifest = null;
    for (var k = 0; k < LEGAL_ADDONS_CATALOG.length; k++) {
      if (LEGAL_ADDONS_CATALOG[k].transportUrl === manifestUrl && LEGAL_ADDONS_CATALOG[k].manifest) {
        fallbackManifest = LEGAL_ADDONS_CATALOG[k].manifest;
        break;
      }
    }

    xhrGet(manifestUrl, 10000, function(err, manifest) {
      if (err || !manifest || !manifest.id || !manifest.name) {
        if (fallbackManifest) {
          manifest = fallbackManifest;
        } else {
          if (callback) callback(err || new Error("Invalid Stremio manifest"));
          return;
        }
      }
      var addon = {
        transportUrl: manifestUrl,
        manifest: manifest,
        enabled: true,
        isCore: false
      };
      self.addons.push(addon);
      self.saveAddons();
      if (callback) callback(null, addon);
    });
  };

  StremioEngine.prototype.removeAddon = function(transportUrl) {
    this.addons = this.addons.filter(function(a) {
      return a.transportUrl !== transportUrl && !a.isCore;
    });
    this.saveAddons();
  };

  StremioEngine.prototype.hasStreamAddons = function() {
    for (var i = 0; i < this.addons.length; i++) {
      var a = this.addons[i];
      if (a.enabled && a.manifest && a.manifest.resources) {
        for (var j = 0; j < a.manifest.resources.length; j++) {
          var r = a.manifest.resources[j];
          var rName = typeof r === "string" ? r : (r && r.name);
          if (rName === "stream") {
            return true;
          }
        }
      }
    }
    return false;
  };

  /**
   * Search Cinemeta to get an IMDb ID for a movie or series title
   */
  StremioEngine.prototype.searchImdbId = function(title, type, callback) {
    if (!title) {
      callback(null, null);
      return;
    }
    var clean = title
      .replace(/^\[[^\]]*\]\s*/g, "")
      .replace(/\s*\([^)]*\)$/g, "")
      .replace(/\b(1080p|720p|4k|2160p|uhd|fhd|hevc|x264|x265)\b/gi, "")
      .trim();

    var searchUrl = "https://v3-cinemeta.strem.io/catalog/" + (type === "series" ? "series" : "movie") +
      "/top/search=" + encodeURIComponent(clean) + ".json";

    xhrGet(searchUrl, TIMEOUT_MS, function(err, data) {
      if (err || !data || !Array.isArray(data.metas) || data.metas.length === 0) {
        callback(null, null);
        return;
      }
      var first = data.metas[0];
      callback(null, first.imdb_id || first.id);
    });
  };

  /**
   * Get category entries for all installed addons.
   */
  StremioEngine.prototype.getCategories = function(type) {
    var cType = type;
    if (type === "vod") cType = "movie";
    if (type === "live") cType = "tv";
    var cats = [];

    // 1. Any custom user-installed addon that provides catalogs
    for (var i = 0; i < this.addons.length; i++) {
      var a = this.addons[i];
      if (a.enabled && !a.isCore && a.manifest && Array.isArray(a.manifest.catalogs)) {
        for (var j = 0; j < a.manifest.catalogs.length; j++) {
          var c = a.manifest.catalogs[j];
          var matchType = false;
          if (cType === "movie" && c.type === "movie") matchType = true;
          else if (cType === "series" && c.type === "series") matchType = true;
          else if ((cType === "tv" || cType === "live") && (c.type === "tv" || c.type === "channel" || c.type === "events" || c.type === "live")) matchType = true;

          if (matchType) {
            cats.push({
              category_id: "stremio:" + encodeURIComponent(a.transportUrl) + ":" + encodeURIComponent(c.id) + ":" + encodeURIComponent(c.type),
              category_name: "⭐ " + (c.name || a.manifest.name),
              addonTransportUrl: a.transportUrl,
              catalogId: c.id,
              catalogType: c.type,
              isStremioCatalog: true
            });
          }
        }
      }
    }

    // 2. Default Cinemeta catalogs (for movies & series)
    if (cType === "movie" || cType === "series") {
      cats.push({
        category_id: "stremio:cinemeta:top:" + cType,
        category_name: "⭐ Stremio (" + (cType === "series" ? "Popular Series" : "Popular Movies") + ")",
        addonTransportUrl: "https://v3-cinemeta.strem.io/manifest.json",
        catalogId: "top",
        catalogType: cType,
        isStremioCatalog: true
      });
    }

    return cats;
  };

  /**
   * Fetch catalog items from a specific addon manifest URL
   */
  StremioEngine.prototype.fetchAddonCatalog = function(transportUrl, catalogType, catalogId, extraOrCb, callback) {
    var cb = typeof extraOrCb === "function" ? extraOrCb : callback;
    var extra = typeof extraOrCb === "string" ? extraOrCb : "";
    var cType = catalogType || "movie";
    if (cType === "vod") cType = "movie";
    if (cType === "live") cType = "tv";
    var url;
    var extraPart = extra ? "/" + encodeURIComponent(extra) : "";
    if (transportUrl === "cinemeta" || transportUrl === "https://v3-cinemeta.strem.io/manifest.json") {
      url = "https://cinemeta-catalogs.strem.io/top/catalog/" + cType + "/top" + extraPart + ".json";
    } else {
      var baseUrl = transportUrl.replace(/\/manifest\.json$/i, "");
      url = baseUrl + "/catalog/" + encodeURIComponent(cType) + "/" + encodeURIComponent(catalogId) + extraPart + ".json";
    }
    xhrGet(url, TIMEOUT_MS, function(err, data) {
      if (err || !data || !Array.isArray(data.metas)) {
        cb([]);
        return;
      }
      var list = [];
      for (var i = 0; i < data.metas.length; i++) {
        var m = data.metas[i];
        if (!m || !m.id) continue;
        list.push({
          stream_id: m.id,
          imdb_id: m.id,
          name: m.name || m.title || "Untitled",
          stream_icon: m.poster || m.logo || m.banner || m.thumbnail || m.background || "",
          backdrop: m.background || m.banner || (m.id && String(m.id).indexOf("tt") === 0 ? ("https://images.metahub.space/background/medium/" + m.id + "/img") : "") || m.poster || "",
          rating: m.imdbRating || "",
          year: m.releaseInfo || m.year || "",
          plot: m.description || "",
          isStremio: true,
          addonUrl: transportUrl
        });
      }
      cb(list);
    });
  };

  /**
   * Fetch series metadata (seasons and episodes)
   */
  StremioEngine.prototype.getSeriesMeta = function(id, addonUrl, callback) {
    var self = this;
    if (addonUrl) {
      var baseUrl = addonUrl.replace(/\/manifest\.json$/i, "");
      var url = baseUrl + "/meta/series/" + encodeURIComponent(id) + ".json";
      xhrGet(url, TIMEOUT_MS, function(err, data) {
        if (!err && data && data.meta && Array.isArray(data.meta.videos) && data.meta.videos.length > 0) {
          callback(data.meta);
        } else {
          self.getSeriesMeta(id, null, callback);
        }
      });
      return;
    }
    var cinemetaUrl = "https://v3-cinemeta.strem.io/meta/series/" + encodeURIComponent(id) + ".json";
    xhrGet(cinemetaUrl, TIMEOUT_MS, function(err, data) {
      if (err || !data || !data.meta) {
        callback(null);
        return;
      }
      callback(data.meta);
    });
  };

  /**
   * Query all installed stream addons in parallel
   */
  StremioEngine.prototype.getStreams = function(type, id, callback) {
    var self = this;
    var streamAddons = [];
    for (var i = 0; i < self.addons.length; i++) {
      var a = self.addons[i];
      if (!a.enabled || !a.manifest || !a.manifest.resources) continue;
      var hasStream = false;
      for (var j = 0; j < a.manifest.resources.length; j++) {
        var r = a.manifest.resources[j];
        var rName = typeof r === "string" ? r : (r && r.name);
        if (rName === "stream") {
          hasStream = true;
          break;
        }
      }
      if (hasStream) {
        streamAddons.push(a);
      }
    }

    if (streamAddons.length === 0) {
      callback([]);
      return;
    }

    var results = [];
    var pending = streamAddons.length;

    function finishOne() {
      pending--;
      if (pending <= 0) {
        // Sort results: Free / direct playable streams FIRST, then by quality (4K > 1080p > 720p).
        results.sort(function(a, b) {
          var freeA = a.requiresDebrid ? 0 : 1;
          var freeB = b.requiresDebrid ? 0 : 1;
          if (freeA !== freeB) {
            return freeB - freeA;
          }

          var qOrder = { "4K": 4, "1080p": 3, "720p": 2, "HD": 2, "SD": 1 };
          var scoreA = qOrder[a.quality] || 0;
          var scoreB = qOrder[b.quality] || 0;
          return scoreB - scoreA;
        });
        // Allow up to top 25 items so user has full choices with smooth scrolling
        callback(results.slice(0, 25));
      }
    }

    for (var k = 0; k < streamAddons.length; k++) {
      (function(addon) {
        var baseUrl = addon.transportUrl.replace(/\/manifest\.json$/i, "");
        var streamUrl = baseUrl + "/stream/" + encodeURIComponent(type) + "/" + encodeURIComponent(id) + ".json";

        xhrGet(streamUrl, TIMEOUT_MS, function(err, data) {
          if (!err && data && Array.isArray(data.streams)) {
            for (var sIdx = 0; sIdx < data.streams.length; sIdx++) {
              var s = data.streams[sIdx];
              if (!s || (!s.url && !s.infoHash)) continue;

              var rawTitle = s.title || s.name || "";
              var quality = "HD";
              if (/\b(4k|2160p|uhd)\b/i.test(rawTitle)) quality = "4K";
              else if (/\b(1080p|fhd)\b/i.test(rawTitle)) quality = "1080p";
              else if (/\b(720p|hd)\b/i.test(rawTitle)) quality = "720p";
              else if (/\b(480p|sd)\b/i.test(rawTitle)) quality = "SD";

              var sizeMatch = rawTitle.match(/💾\s*([\d\.]+\s*(?:GB|MB))/i) || rawTitle.match(/\b([\d\.]+\s*(?:GB|MB))\b/i);
              var sizeStr = sizeMatch ? sizeMatch[1] : "";

              var cleanDesc = rawTitle
                .replace(/^[\r\n\s]+|[\r\n\s]+$/g, "")
                .split("\n")[0];

              results.push({
                addonName: addon.manifest.name || "Addon",
                title: cleanDesc || s.name || "Stream",
                url: s.url || "",
                infoHash: s.infoHash || "",
                requiresDebrid: !s.url && !!s.infoHash,
                quality: quality,
                size: sizeStr,
                details: rawTitle
              });
            }
          }
          finishOne();
        });
      })(streamAddons[k]);
    }
  };

  var engineInstance = new StremioEngine();
  window.StremioEngine = engineInstance;
  window.stremioEngine = engineInstance;
})(window);
