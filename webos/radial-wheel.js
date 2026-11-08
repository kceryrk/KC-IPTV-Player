/**
 * AeroTV Radial Wheel Navigation Engine
 * Zero-dependency, 100% ES5 / Chromium 53 compatible for LG webOS Smart TVs.
 */
(function(window) {
  "use strict";

  // Radial geometry: tighter angleStep for rounder, closer appearance
  var ARC_SETTINGS = [
    { radius: 560, angleStep: 6.8 }, // Tier 0: Modus
    { radius: 640, angleStep: 6.2 }, // Tier 1: Regions
    { radius: 720, angleStep: 5.8 }, // Tier 2: Categories
    { radius: 820, angleStep: 5.2 }  // Tier 3: Channels / Content
  ];

  var SERIES_ARC_SETTINGS = [
    { radius: 640, angleStep: 6.5 }, // Seasons
    { radius: 800, angleStep: 5.4 }  // Episodes
  ];

  var state = {
    enabled: true,
    isOpen: false, // Default CLOSED on startup
    activeTier: 3,
    isMoveMode: false,
    moveStack: [], // Picked-up channel IDs for reordering
    moveOriginIndex: 0,
    selected: {
      modeIndex: 0, // 0: Favorites on startup!
      regionIndex: 0,
      categoryIndex: 0,
      channelIndex: 0
    },
    seriesPicker: {
      active: false,
      series: null,
      seasons: [],
      seasonIndex: 0,
      episodeIndex: 0,
      activeCol: 0 // 0 = season, 1 = episode
    }
  };

  var previewTimer = null;

  // Web Audio Context for synthesized sound feedback (zero external files)
  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      } catch (e) {}
    }
    return audioCtx;
  }

  function playTick() {
    try {
      var ctx = getAudioCtx();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  function playStep() {
    try {
      var ctx = getAudioCtx();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  function playChime() {
    try {
      var ctx = getAudioCtx();
      if (!ctx) return;
      var now = ctx.currentTime;
      var freqs = [523.25, 659.25, 783.99, 1046.5];
      for (var i = 0; i < freqs.length; i++) {
        (function(freq, delay) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.12, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.25);
        })(freqs[i], i * 0.06);
      }
    } catch (e) {}
  }

  // COLORED SVG ICONS FOR MODES
  var SVG_ICONS = {
    favorites: '<svg class="r-icon-svg" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    live: '<svg class="r-icon-svg" viewBox="0 0 24 24" fill="#38bdf8"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>',
    vod: '<svg class="r-icon-svg" viewBox="0 0 24 24" fill="#c084fc"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
    series: '<svg class="r-icon-svg" viewBox="0 0 24 24" fill="#fb923c"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>',
    stremio: '<svg class="r-icon-svg" viewBox="0 0 24 24" fill="#a78bfa"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
    settings: '<svg class="r-icon-svg" viewBox="0 0 24 24" fill="#94a3b8"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
    folder: '<svg class="r-icon-svg" viewBox="0 0 24 24" fill="#38bdf8"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
  };

  // COLORED SVG FLAGS FOR REGIONS (All 250+ country SVG flags supported)
  var FLAG_ALIASES = { UK: "gb", EN: "gb", EL: "gr" };
  var GLOBE_SVG = '<svg class="r-flag-svg" viewBox="0 0 24 24" fill="#38bdf8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';

  function getFlagHtml(code) {
    if (!code || code === "ALL") return GLOBE_SVG;
    var iso = (FLAG_ALIASES[code] || code).toLowerCase();
    if (iso.length === 2) {
      return '<img src="flags/' + iso + '.svg" class="r-flag-svg" alt="" onerror="this.outerHTML=\'' + GLOBE_SVG.replace(/"/g, '&quot;') + '\';">';
    }
    return GLOBE_SVG;
  }

  // Filter country codes, recurring prefixes, bracket tags, etc.
  function formatTitle(name) {
    if (!name) return "";
    if (window.kcCleanTitle && typeof window.kcCleanTitle === "function") {
      return window.kcCleanTitle(name, ["HD", "FHD", "UHD", "4K"]);
    }
    return String(name)
      .replace(/^\[[^\]]*\]\s*/, "")
      .replace(/^\([A-Za-z0-9-]+\)\s*/, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/^[A-Z0-9]{2,5}\s*[:|-]\s*/i, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  // Dynamic font sizing for long series/episode titles so they never clip
  function getTitleStyle(titleText, isFocused) {
    if (!titleText) return "";
    var len = titleText.length;
    if (isFocused) {
      if (len > 35) {
        return ' style="font-size: 1.35rem !important;"';
      } else if (len > 24) {
        return ' style="font-size: 1.55rem !important;"';
      }
    } else {
      if (len > 35) {
        return ' style="font-size: 1.10rem !important;"';
      }
    }
    return "";
  }

  // DATA PROVIDERS (Linked directly to KC IPTV Player data)
  var MODES = [
    { id: "favorites", title: "Favoriler", iconKey: "favorites" },
    { id: "live", title: "Canlı TV", iconKey: "live" },
    { id: "vod", title: "Filmler", iconKey: "vod" },
    { id: "series", title: "Diziler", iconKey: "series" },
    { id: "stremio", title: "Stremio", iconKey: "stremio" },
    { id: "settings", title: "Ayarlar", iconKey: "settings" }
  ];

  function getRegionsList() {
    if (window.kcGetRegions && typeof window.kcGetRegions === "function") {
      var r = window.kcGetRegions();
      if (r && r.length) return r;
    }
    return ["ALL"];
  }

  function getCategoriesList() {
    if (window.kcGetCategories && typeof window.kcGetCategories === "function") {
      var regs = getRegionsList();
      var activeReg = regs[state.selected.regionIndex % regs.length] || "ALL";
      var cats = window.kcGetCategories(activeReg);
      if (cats && cats.length) return cats;
    }
    return [{ category_id: "all", category_name: "Tüm Kanallar" }];
  }

  function getChannelsList() {
    if (window.kcGetChannels && typeof window.kcGetChannels === "function") {
      var chs = window.kcGetChannels();
      if (chs && chs.length) return chs;
    }
    return [];
  }

  function getTierData(tierIndex) {
    if (tierIndex === 0) return MODES;
    if (tierIndex === 1) return getRegionsList();
    if (tierIndex === 2) return getCategoriesList();
    if (tierIndex === 3) return getChannelsList();
    return [];
  }

  function getTierActiveIndex(tierIndex) {
    if (tierIndex === 0) return state.selected.modeIndex;
    if (tierIndex === 1) return state.selected.regionIndex;
    if (tierIndex === 2) return state.selected.categoryIndex;
    if (tierIndex === 3) return state.selected.channelIndex;
    return 0;
  }

  function updateColumnVisibility() {
    if (state.seriesPicker.active) return;
    var modeObj = MODES[state.selected.modeIndex] || MODES[0];
    var isFav = (modeObj.id === "favorites");
    var isSpecial = (modeObj.id === "settings" || modeObj.id === "stremio");
    var col1 = document.getElementById("radialCol-1");
    var col2 = document.getElementById("radialCol-2");
    var col3 = document.getElementById("radialCol-3");
    if (col1) col1.style.display = (isFav || isSpecial) ? "none" : "";
    if (col2) col2.style.display = (isFav || isSpecial) ? "none" : "";
    if (col3) col3.style.display = isSpecial ? "none" : "";

    var sc0 = document.getElementById("radialSeriesCol-0");
    var sc1 = document.getElementById("radialSeriesCol-1");
    if (sc0) { sc0.classList.add("hidden"); sc0.style.display = "none"; }
    if (sc1) { sc1.classList.add("hidden"); sc1.style.display = "none"; }
  }

  // Update Right VOD Poster Backdrop
  function updateVodPosterBackdrop(itemData, isVodOrSeries) {
    var backdropEl = document.getElementById("radialVodPosterBackdrop");
    var imgEl = document.getElementById("radialVodPosterImg");
    var titleEl = document.getElementById("radialVodPosterTitle");
    var metaEl = document.getElementById("radialVodPosterMeta");
    if (!backdropEl || !imgEl) return;

    if (!isVodOrSeries || !itemData || !state.isOpen) {
      backdropEl.classList.add("hidden");
      return;
    }

    var posterUrl = itemData.cover || itemData.stream_icon || itemData.poster || "";
    if (posterUrl) {
      imgEl.src = posterUrl;
      imgEl.style.display = "block";
    } else {
      imgEl.style.display = "none";
    }

    if (titleEl) titleEl.textContent = formatTitle(itemData.name || itemData.title || "Film / Dizi");
    if (metaEl) {
      var ext = itemData.container_extension ? itemData.container_extension.toUpperCase() : "HD";
      var year = itemData.release_date || itemData.year || "";
      metaEl.textContent = year ? (year + " • " + ext) : (ext + " • 1080p");
    }

    backdropEl.classList.remove("hidden");
  }

  // RENDER RADIAL TIER (Infinite Window, Modulo Wrapping, ZERO Gaps)
  function renderRadialTier(tierIndex) {
    var track = document.getElementById("radialTrack-" + tierIndex);
    if (!track) return;
    track.innerHTML = "";
    var geom = ARC_SETTINGS[tierIndex];

    var list = getTierData(tierIndex);
    var total = list.length;
    if (total === 0) {
      var emptyEl = document.createElement("div");
      emptyEl.className = "radial-wheel-item is-focused";
      emptyEl.style.webkitTransform = emptyEl.style.transform = "translate3d(0, 0, 0)";
      emptyEl.style.opacity = "0.7";
      emptyEl.innerHTML = '<div class="radial-card-box col-box-' + tierIndex + '" style="justify-content:center;"><span class="radial-card-title">Yükleniyor...</span></div>';
      track.appendChild(emptyEl);
      return;
    }

    var activeIdx = getTierActiveIndex(tierIndex);
    var normalizedFocus = ((activeIdx % total) + total) % total;

    // Fill entire column vertically [-7 to +7 = 15 visible items]
    var visibleRange = 7;
    var curModus = window.kcGetModus ? window.kcGetModus() : "live";
    var isVodOrSeries = (curModus === "vod" || curModus === "series");
    var isFavMode = (MODES[state.selected.modeIndex].id === "favorites");

    var isCurrentActiveCol = (tierIndex === state.activeTier);
    var focusedItemData = null;

    for (var offset = -visibleRange; offset <= visibleRange; offset++) {
      var itemIndex = ((normalizedFocus + offset) % total + total) % total;
      var itemData = list[itemIndex];
      var isCenter = (offset === 0);
      var isActiveFocused = (isCenter && isCurrentActiveCol);
      var isParentSelected = (isCenter && !isCurrentActiveCol);
      if (isCenter) focusedItemData = itemData;

      var angleDeg = offset * geom.angleStep;
      var angleRad = (angleDeg * Math.PI) / 180;
      var y = Math.sin(angleRad) * geom.radius;
      var x = (Math.cos(angleRad) - 1) * (geom.radius * 0.35);

      var absOffset = Math.abs(offset);
      var scale = (absOffset === 0) ? 1.0 : Math.max(0.78, 1 - absOffset * 0.038);
      var opacity = isActiveFocused ? 1.0 : (isParentSelected ? 0.95 : Math.max(0.18, 1 - absOffset * 0.12));

      var itemEl = document.createElement("div");
      var itemClass = "radial-wheel-item";
      if (isActiveFocused) {
        itemClass += " is-active-focused";
      } else if (isParentSelected) {
        itemClass += " is-parent-selected";
      }
      itemEl.className = itemClass;

      var transformStr = "translate3d(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px, 0px) rotate(" + (angleDeg * 0.45).toFixed(1) + "deg) scale(" + scale.toFixed(2) + ")";
      itemEl.style.webkitTransform = transformStr;
      itemEl.style.transform = transformStr;
      itemEl.style.opacity = opacity;
      itemEl.style.zIndex = isActiveFocused ? "50" : (isParentSelected ? "45" : String(40 - absOffset));

      // Build card HTML
      if (tierIndex === 0) {
        var svgIcon = SVG_ICONS[itemData.iconKey] || SVG_ICONS.live;
        itemEl.innerHTML = 
          '<div class="radial-card-box col-box-0">' +
            '<span class="r-icon">' + svgIcon + '</span>' +
            '<span class="radial-card-title">' + itemData.title + '</span>' +
          '</div>';
      } else if (tierIndex === 1) {
        var flagHtml = getFlagHtml(itemData);
        itemEl.innerHTML = 
          '<div class="radial-card-box col-box-1">' +
            flagHtml +
            '<span class="radial-card-title">' + itemData + '</span>' +
          '</div>';
      } else if (tierIndex === 2) {
        var catName = formatTitle(itemData.category_name || itemData.name || "Kategori");
        itemEl.innerHTML = 
          '<div class="radial-card-box col-box-2">' +
            '<span class="r-icon">' + SVG_ICONS.folder + '</span>' +
            '<span class="radial-card-title">' + catName + '</span>' +
          '</div>';
      } else if (tierIndex === 3) {
        if (state.isMoveMode && isFavMode) {
          var stackIds = state.moveStack;
          var allFavs = list;
          var remaining = allFavs.filter(function(c) {
            return stackIds.indexOf(String(c.stream_id)) === -1;
          });

          if (isCenter) {
            // THE CENTER HELD STACK
            var stackTopId = stackIds[stackIds.length - 1];
            var topCh = allFavs.find(function(c) { return String(c.stream_id) === String(stackTopId); }) || allFavs[0];
            var topName = formatTitle(topCh ? (topCh.name || topCh.title) : "Kanal");
            var layersHtml = "";
            if (stackIds.length > 2) layersHtml += '<div class="radial-stack-layer-2"></div>';
            if (stackIds.length > 1) layersHtml += '<div class="radial-stack-layer-1"></div>';

            itemEl.innerHTML = 
              '<div class="radial-card-box col-box-3 radial-move-stack-card">' +
                layersHtml +
                '<div class="radial-fav-num" style="color:#f87171 !important;">⇕ ' + (state.selected.channelIndex + 1) + '</div>' +
                '<span class="radial-card-title"' + getTitleStyle(topName, true) + '>' + topName + '</span>' +
                '<span class="radial-move-badge">TAŞINIYOR (' + stackIds.length + ' kanal)</span>' +
              '</div>';
          } else if (remaining.length > 0) {
            var rIdx = 0;
            if (offset > 0) {
              rIdx = ((state.selected.channelIndex + (offset - 1)) % remaining.length + remaining.length) % remaining.length;
            } else {
              rIdx = ((state.selected.channelIndex + offset) % remaining.length + remaining.length) % remaining.length;
            }
            var remCh = remaining[rIdx];
            var remName = formatTitle(remCh ? (remCh.name || remCh.title) : "Kanal");
            var isPickTarget = (offset === 1);
            if (isPickTarget) {
              itemEl.className += " radial-pick-target";
            }
            var addBadge = isPickTarget ? '<span class="radial-add-badge">+ OK ile ekle</span>' : '';
            var calcNum = (offset < 0) ? (rIdx + 1) : (rIdx + 1 + stackIds.length);

            itemEl.innerHTML = 
              '<div class="radial-card-box col-box-3">' +
                '<div class="radial-fav-num">#' + calcNum + '</div>' +
                '<span class="radial-card-title"' + getTitleStyle(remName, false) + '>' + remName + '</span>' +
                addBadge +
              '</div>';
          } else {
            itemEl.innerHTML = '';
          }
        } else {
          var chName = formatTitle(itemData.name || itemData.title || "Kanal");
          var titleStyle = getTitleStyle(chName, isActiveFocused);

          if (isVodOrSeries) {
            // VOD / Series: Title ONLY in card, poster is displayed on the right!
            itemEl.innerHTML = 
              '<div class="radial-card-box col-box-3">' +
                '<span class="radial-card-title"' + titleStyle + '>' + chName + '</span>' +
              '</div>';
          } else {
            // Live TV / Favorites: Channel name only (+ big number for favorites)
            var favNumHtml = isFavMode ? '<div class="radial-fav-num">#' + (itemIndex + 1) + '</div>' : '';

            // FLOATING CHANNEL LOGO: Placed OUTSIDE card on the right, 2x bigger, NO TV label
            var floatingLogoHtml = (isActiveFocused && itemData.stream_icon)
              ? '<div class="radial-ch-floating-logo"><img src="' + itemData.stream_icon + '" class="radial-ch-floating-img" onerror="this.parentElement.style.display=\'none\';"></div>'
              : '';

            itemEl.innerHTML = 
              '<div class="radial-card-box col-box-3">' +
                favNumHtml +
                '<span class="radial-card-title"' + titleStyle + '>' + chName + '</span>' +
              '</div>' +
              floatingLogoHtml;
          }
        }
      }

      (function(idxOff, tIdx) {
        itemEl.addEventListener("click", function(e) {
          e.stopPropagation();
          state.activeTier = tIdx;
          if (idxOff !== 0) {
            rotateRadialWheel(tIdx, idxOff);
          } else {
            handleTierConfirm(tIdx);
          }
        });
      })(offset, tierIndex);

      track.appendChild(itemEl);
    }

    if (tierIndex === 3) {
      updateVodPosterBackdrop(focusedItemData, isVodOrSeries);
    }

    updateFocusPill();
  }

  function handleTierConfirm(tIdx) {
    if (tIdx === 0) {
      applyTierPreview(0);
    } else if (tIdx === 3) {
      if (state.isMoveMode) {
        pickUpNextToMoveStack();
      } else {
        var curModus = window.kcGetModus ? window.kcGetModus() : "live";
        if (curModus === "series") {
          openSeriesPickerForFocused();
        } else {
          tuneInChannel();
        }
      }
    } else {
      stepRadialTier(1);
    }
  }

  function renderAllTiers() {
    updateColumnVisibility();
    var modeObj = MODES[state.selected.modeIndex] || MODES[0];
    var isFav = (modeObj.id === "favorites");
    var isSpecial = (modeObj.id === "settings" || modeObj.id === "stremio");
    for (var i = 0; i < 4; i++) {
      if ((isFav && (i === 1 || i === 2)) || (isSpecial && i > 0)) continue;
      renderRadialTier(i);
      var col = document.getElementById("radialCol-" + i);
      if (col) {
        var isCurrent = (i === state.activeTier);
        col.style.filter = isCurrent ? "brightness(1.15)" : "brightness(0.75)";
      }
    }
    updateFocusPill();
  }

  function updateFocusPill() {
    var pill = document.getElementById("radialFocusPill");
    if (!pill) return;
    if (state.seriesPicker.active) {
      var sColId = state.seriesPicker.activeCol === 0 ? "radialSeriesCol-0" : "radialSeriesCol-1";
      var sCol = document.getElementById(sColId);
      if (sCol && sCol.offsetParent !== null) {
        var r = sCol.getBoundingClientRect();
        pill.style.left = (r.left - 4) + "px";
        pill.style.width = (r.width + 8) + "px";
      }
      return;
    }
    var activeCol = document.getElementById("radialCol-" + state.activeTier);
    if (activeCol && activeCol.offsetParent !== null) {
      var rect = activeCol.getBoundingClientRect();
      pill.style.left = (rect.left - 4) + "px";
      pill.style.width = (rect.width + 8) + "px";
    }
  }

  // 500ms Debounce Preview for Next Tiers (Tier 1 & Tier 2)
  function scheduleTierPreview(tierIndex) {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(function() {
      applyTierPreview(tierIndex);
    }, 500);
  }

  function applyTierPreview(tierIndex) {
    if (tierIndex === 0) {
      var chosenMode = MODES[state.selected.modeIndex].id;
      if (chosenMode === "settings") {
        closeOverlay();
        if (window.kcOpenSettings && typeof window.kcOpenSettings === "function") {
          window.kcOpenSettings();
        }
        return;
      }
      if (chosenMode === "stremio") {
        closeOverlay();
        if (window.kcOpenStremio && typeof window.kcOpenStremio === "function") {
          window.kcOpenStremio();
        }
        return;
      }
      if (window.kcSwitchModus && typeof window.kcSwitchModus === "function") {
        window.kcSwitchModus(chosenMode);
      }
      state.selected.regionIndex = 0;
      state.selected.categoryIndex = 0;
      state.selected.channelIndex = 0;
      updateColumnVisibility();
      renderAllTiers();
      // Step to next column on OK
      if (chosenMode === "favorites") {
        state.activeTier = 3;
      } else {
        state.activeTier = 1;
      }
      renderAllTiers();
      playStep();
    } else if (tierIndex === 1) {
      var regs = getRegionsList();
      var chosenReg = regs[state.selected.regionIndex % regs.length] || "ALL";
      if (window.kcSetRegion && typeof window.kcSetRegion === "function") {
        window.kcSetRegion(chosenReg);
      }
      if (state.activeTier < 2) {
        state.selected.categoryIndex = 0;
      }
      if (state.activeTier < 3) {
        state.selected.channelIndex = 0;
      }
      renderRadialTier(2);
      renderRadialTier(3);
    } else if (tierIndex === 2) {
      var cats = getCategoriesList();
      var chosenCat = cats[state.selected.categoryIndex % cats.length];
      if (window.kcSetCategory && typeof window.kcSetCategory === "function" && chosenCat) {
        window.kcSetCategory(chosenCat.category_id);
      }
      if (state.activeTier < 3) {
        state.selected.channelIndex = 0;
      }
      renderRadialTier(3);
    }
  }

  // SERIES PICKER IMPLEMENTATION (Seasons wheel + Episodes wheel)
  function openSeriesPickerForFocused() {
    var channels = getChannelsList();
    if (!channels || !channels.length) return;
    var total = channels.length;
    var chIdx = ((state.selected.channelIndex % total) + total) % total;
    var target = channels[chIdx];
    if (!target) return;

    var seriesId = target.series_id || target.stream_id || target.id;
    if (!seriesId) {
      tuneInChannel();
      return;
    }

    if (window.kcShowToast) window.kcShowToast("Bölümler yükleniyor...");

    if (window.kcFetchSeriesInfo && typeof window.kcFetchSeriesInfo === "function") {
      window.kcFetchSeriesInfo(seriesId).then(function(data) {
        if (!data || !data.seasons || !data.seasons.length) {
          if (window.kcShowToast) window.kcShowToast("Bölüm bulunamadı");
          return;
        }
        state.seriesPicker.active = true;
        state.seriesPicker.series = target;
        state.seriesPicker.seasons = data.seasons;
        state.seriesPicker.seasonIndex = 0;
        state.seriesPicker.episodeIndex = 0;
        state.seriesPicker.activeCol = 0; // Start focused on Seasons

        // Hide regular columns 1, 2, 3 so only Column 0 (Modes) stays visible
        var c1 = document.getElementById("radialCol-1");
        var c2 = document.getElementById("radialCol-2");
        var c3 = document.getElementById("radialCol-3");
        if (c1) c1.style.display = "none";
        if (c2) c2.style.display = "none";
        if (c3) c3.style.display = "none";

        // Show series picker columns 0 & 1
        var sc0 = document.getElementById("radialSeriesCol-0");
        var sc1 = document.getElementById("radialSeriesCol-1");
        if (sc0) { sc0.classList.remove("hidden"); sc0.style.display = ""; }
        if (sc1) { sc1.classList.remove("hidden"); sc1.style.display = ""; }

        renderSeriesPicker();
        updateVodPosterBackdrop(target, true);
        playStep();
      }).catch(function(err) {
        console.error("Failed to load series info:", err);
        if (window.kcShowToast) window.kcShowToast("Dizi bilgisi alınamadı");
      });
    } else {
      tuneInChannel();
    }
  }

  function exitSeriesPicker() {
    state.seriesPicker.active = false;
    var sc0 = document.getElementById("radialSeriesCol-0");
    var sc1 = document.getElementById("radialSeriesCol-1");
    if (sc0) { sc0.classList.add("hidden"); sc0.style.display = "none"; }
    if (sc1) { sc1.classList.add("hidden"); sc1.style.display = "none"; }

    updateColumnVisibility();
    renderAllTiers();
    playStep();
  }

  function renderSeriesPicker() {
    renderSeriesCol(0); // Seasons
    renderSeriesCol(1); // Episodes

    var col0 = document.getElementById("radialSeriesCol-0");
    var col1 = document.getElementById("radialSeriesCol-1");
    if (col0) col0.style.filter = state.seriesPicker.activeCol === 0 ? "brightness(1.15)" : "brightness(0.75)";
    if (col1) col1.style.filter = state.seriesPicker.activeCol === 1 ? "brightness(1.15)" : "brightness(0.75)";

    updateFocusPill();
  }

  function renderSeriesCol(colIdx) {
    var track = document.getElementById("radialSeriesTrack-" + colIdx);
    if (!track) return;
    track.innerHTML = "";

    var geom = SERIES_ARC_SETTINGS[colIdx];
    var isSeasonCol = (colIdx === 0);
    var isCurrentActive = (state.seriesPicker.activeCol === colIdx);

    var seasons = state.seriesPicker.seasons || [];
    if (!seasons.length) return;

    var curSeason = seasons[state.seriesPicker.seasonIndex % seasons.length];
    var episodes = (curSeason && curSeason.episodes) ? curSeason.episodes : [];

    var list = isSeasonCol ? seasons : episodes;
    var total = list.length;
    if (total === 0) {
      var emptyEl = document.createElement("div");
      emptyEl.className = "radial-wheel-item is-focused";
      emptyEl.innerHTML = '<div class="radial-card-box ' + (isSeasonCol ? 'col-box-season' : 'col-box-episode') + '"><span class="radial-card-title">Bölüm yok</span></div>';
      track.appendChild(emptyEl);
      return;
    }

    var activeIdx = isSeasonCol ? state.seriesPicker.seasonIndex : state.seriesPicker.episodeIndex;
    var normalizedFocus = ((activeIdx % total) + total) % total;
    var visibleRange = 7;

    for (var offset = -visibleRange; offset <= visibleRange; offset++) {
      var itemIndex = ((normalizedFocus + offset) % total + total) % total;
      var itemData = list[itemIndex];
      var isCenter = (offset === 0);
      var isActiveFocused = (isCenter && isCurrentActive);
      var isParentSelected = (isCenter && !isCurrentActive);

      var angleDeg = offset * geom.angleStep;
      var angleRad = (angleDeg * Math.PI) / 180;
      var y = Math.sin(angleRad) * geom.radius;
      var x = (Math.cos(angleRad) - 1) * (geom.radius * 0.35);

      var absOffset = Math.abs(offset);
      var scale = (absOffset === 0) ? 1.0 : Math.max(0.78, 1 - absOffset * 0.038);
      var opacity = isActiveFocused ? 1.0 : (isParentSelected ? 0.95 : Math.max(0.18, 1 - absOffset * 0.12));

      var itemEl = document.createElement("div");
      var itemClass = "radial-wheel-item";
      if (isActiveFocused) {
        itemClass += " is-active-focused";
      } else if (isParentSelected) {
        itemClass += " is-parent-selected";
      }
      itemEl.className = itemClass;

      var transformStr = "translate3d(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px, 0px) rotate(" + (angleDeg * 0.45).toFixed(1) + "deg) scale(" + scale.toFixed(2) + ")";
      itemEl.style.webkitTransform = transformStr;
      itemEl.style.transform = transformStr;
      itemEl.style.opacity = opacity;
      itemEl.style.zIndex = isActiveFocused ? "50" : (isParentSelected ? "45" : String(40 - absOffset));

      var titleText = "";
      var boxClass = isSeasonCol ? "col-box-season" : "col-box-episode";
      if (isSeasonCol) {
        titleText = itemData.name || ("Sezon " + itemData.number);
      } else {
        titleText = formatTitle(itemData.title) || ("Bölüm " + itemData.episode_num);
      }
      var epTitleStyle = getTitleStyle(titleText, isActiveFocused);

      itemEl.innerHTML = 
        '<div class="radial-card-box ' + boxClass + '">' +
          '<span class="radial-card-title"' + epTitleStyle + '>' + titleText + '</span>' +
        '</div>';

      (function(idxOff, cI) {
        itemEl.addEventListener("click", function(e) {
          e.stopPropagation();
          state.seriesPicker.activeCol = cI;
          if (idxOff !== 0) {
            rotateSeriesPicker(cI, idxOff);
          } else {
            if (cI === 0) {
              state.seriesPicker.activeCol = 1;
              renderSeriesPicker();
              playStep();
            } else {
              playSelectedEpisode();
            }
          }
        });
      })(offset, colIdx);

      track.appendChild(itemEl);
    }
  }

  function rotateSeriesPicker(colIdx, direction) {
    if (colIdx === 0) {
      var sTotal = state.seriesPicker.seasons.length;
      if (sTotal === 0) return;
      state.seriesPicker.seasonIndex = ((state.seriesPicker.seasonIndex + direction) % sTotal + sTotal) % sTotal;
      state.seriesPicker.episodeIndex = 0;
      renderSeriesPicker();
    } else {
      var curSeason = state.seriesPicker.seasons[state.seriesPicker.seasonIndex];
      var epTotal = (curSeason && curSeason.episodes) ? curSeason.episodes.length : 0;
      if (epTotal === 0) return;
      state.seriesPicker.episodeIndex = ((state.seriesPicker.episodeIndex + direction) % epTotal + epTotal) % epTotal;
      renderSeriesCol(1);
    }
    playTick();
  }

  function playSelectedEpisode() {
    var curSeason = state.seriesPicker.seasons[state.seriesPicker.seasonIndex];
    if (!curSeason || !curSeason.episodes || !curSeason.episodes.length) return;
    var epTotal = curSeason.episodes.length;
    var epIdx = ((state.seriesPicker.episodeIndex % epTotal) + epTotal) % epTotal;
    var ep = curSeason.episodes[epIdx];
    if (ep && window.kcPlaySeriesEpisode) {
      playChime();
      closeOverlay();
      window.kcPlaySeriesEpisode(ep.id, ep.title, ep.container_extension);
    }
  }

  // Pick up channel below into reorder stack
  function pickUpNextToMoveStack() {
    var allFavs = getChannelsList();
    if (!allFavs || !allFavs.length) return;
    var remaining = allFavs.filter(function(ch) {
      return state.moveStack.indexOf(String(ch.stream_id)) === -1;
    });
    if (!remaining.length) return;
    var target = remaining[state.selected.channelIndex % remaining.length];
    if (target) {
      state.moveStack.push(String(target.stream_id));
      if (window.kcShowToast) {
        window.kcShowToast(state.moveStack.length + " kanal seçildi");
      }
      playStep();
      renderRadialTier(3);
    }
  }

  // ROTATION WITH CIRCULAR LOOPING (NO GAPS!)
  function rotateRadialWheel(tierIndex, direction) {
    var list = getTierData(tierIndex);
    var total = list.length;
    if (total === 0) return;

    if (tierIndex === 3 && state.isMoveMode) {
      var allFavs = getChannelsList();
      var remaining = allFavs.filter(function(ch) {
        return state.moveStack.indexOf(String(ch.stream_id)) === -1;
      });
      if (remaining.length > 0) {
        state.selected.channelIndex = ((state.selected.channelIndex + direction) % remaining.length + remaining.length) % remaining.length;
        renderRadialTier(3);
        playTick();
      }
      return;
    }

    if (tierIndex === 0) {
      // User: "1st column only open on an ok button press instead of opening automatically"
      state.selected.modeIndex = ((state.selected.modeIndex + direction) % total + total) % total;
      renderRadialTier(0);
      updateColumnVisibility();
    } else if (tierIndex === 1) {
      state.selected.regionIndex = ((state.selected.regionIndex + direction) % total + total) % total;
      renderRadialTier(1);
      scheduleTierPreview(1);
    } else if (tierIndex === 2) {
      state.selected.categoryIndex = ((state.selected.categoryIndex + direction) % total + total) % total;
      renderRadialTier(2);
      scheduleTierPreview(2);
    } else if (tierIndex === 3) {
      state.selected.channelIndex = ((state.selected.channelIndex + direction) % total + total) % total;
      renderRadialTier(3);
    }

    playTick();
  }

  function stepRadialTier(direction) {
    if (previewTimer) {
      clearTimeout(previewTimer);
      previewTimer = null;
    }
    var modeObj = MODES[state.selected.modeIndex] || MODES[0];
    var isFav = (modeObj.id === "favorites");

    if (direction > 0) {
      if (state.activeTier === 0) {
        applyTierPreview(0);
        return;
      } else if (state.activeTier === 1) {
        applyTierPreview(1);
        state.activeTier = 2;
        renderAllTiers();
        playStep();
        return;
      } else if (state.activeTier === 2) {
        applyTierPreview(2);
        state.activeTier = 3;
        renderAllTiers();
        playStep();
        return;
      }
    }

    var nextTier = state.activeTier;
    if (isFav) {
      if (direction > 0) nextTier = 3;
      else nextTier = 0;
    } else {
      nextTier = Math.max(0, Math.min(3, state.activeTier + direction));
    }
    if (nextTier !== state.activeTier) {
      state.activeTier = nextTier;
      renderAllTiers();
      playStep();
    }
  }

  function tuneInChannel() {
    var channels = getChannelsList();
    if (!channels || !channels.length) return;
    var total = channels.length;
    var chIdx = ((state.selected.channelIndex % total) + total) % total;
    var target = channels[chIdx];
    if (!target) return;

    var curPlayingId = window.kcGetCurrentPlayingStreamId ? window.kcGetCurrentPlayingStreamId() : null;
    if (curPlayingId && String(target.stream_id) === String(curPlayingId)) {
      // User: "Pressing ok on an already playing channel should close the menu and go fullscreen"
      closeOverlay();
      return;
    }

    if (window.kcPlayStream && typeof window.kcPlayStream === "function") {
      playChime();
      var pUrl = target.cover || target.stream_icon || target.poster || "";
      window.kcPlayStream(target.stream_id, target.name || target.title, pUrl, chIdx, target.url, target.container_extension);
      setTimeout(function() {
        closeOverlay();
      }, 400);
    }
  }

  function openOverlay() {
    var menu = document.getElementById("radialOverlayMenu");
    if (!menu) return;
    state.isOpen = true;
    document.body.classList.add("radial-active");
    menu.classList.remove("hidden");
    if (window.kcCurrentStreamIndex !== undefined && window.kcCurrentStreamIndex >= 0) {
      state.selected.channelIndex = window.kcCurrentStreamIndex;
    }
    state.activeTier = 3;
    renderAllTiers();
  }

  function closeOverlay() {
    var menu = document.getElementById("radialOverlayMenu");
    if (!menu) return;
    state.isOpen = false;
    menu.classList.add("hidden");
    var backdropEl = document.getElementById("radialVodPosterBackdrop");
    if (backdropEl) backdropEl.classList.add("hidden");

    if (state.seriesPicker.active) {
      exitSeriesPicker();
    }
    if (window.kcActivateFitScreen && typeof window.kcActivateFitScreen === "function") {
      window.kcActivateFitScreen();
    }
  }

  function toggleOverlay() {
    if (state.isOpen) closeOverlay();
    else openOverlay();
  }

  // KEYBOARD & D-PAD HANDLER (Returns true if key was handled)
  function handleKey(e, key) {
    var gOverlay = document.getElementById("guideOverlay");
    if (gOverlay && !gOverlay.classList.contains("hidden")) {
      return false;
    }
    var setPage = document.getElementById("settingsPage");
    if (setPage && !setPage.classList.contains("hidden")) {
      return false;
    }
    if (!state.isOpen) return false;

    var isUp = key === 38 || e.key === "ArrowUp";
    var isDown = key === 40 || e.key === "ArrowDown";
    var isLeft = key === 37 || e.key === "ArrowLeft";
    var isRight = key === 39 || e.key === "ArrowRight";
    var isEnter = key === 13 || e.key === "Enter";
    var isBack = key === 10009 || key === 461 || key === 27 || e.key === "Back" || e.key === "Escape";

    var isPageUp = key === 33 || e.key === "PageUp" || key === 427 || e.key === "ChannelUp";
    var isPageDown = key === 34 || e.key === "PageDown" || key === 428 || e.key === "ChannelDown";

    var isYellow = key === 405 || e.key === "F3" || e.key === "Yellow";
    var isRed = key === 403 || e.key === "F1" || e.key === "Red";
    var isGuideKey = key === 458 || e.key === "Guide";

    // Handle Series Picker Mode if active
    if (state.seriesPicker.active) {
      if (isPageUp) {
        e.preventDefault();
        rotateSeriesPicker(state.seriesPicker.activeCol, -5);
        return true;
      }
      if (isPageDown) {
        e.preventDefault();
        rotateSeriesPicker(state.seriesPicker.activeCol, 5);
        return true;
      }
      if (isUp) {
        e.preventDefault();
        rotateSeriesPicker(state.seriesPicker.activeCol, -1);
        return true;
      }
      if (isDown) {
        e.preventDefault();
        rotateSeriesPicker(state.seriesPicker.activeCol, 1);
        return true;
      }
      if (isRight) {
        e.preventDefault();
        if (state.seriesPicker.activeCol === 0) {
          state.seriesPicker.activeCol = 1;
          renderSeriesPicker();
          playStep();
        } else if (state.seriesPicker.activeCol === 1) {
          closeOverlay();
        }
        return true;
      }
      if (isLeft) {
        e.preventDefault();
        if (state.seriesPicker.activeCol === 1) {
          state.seriesPicker.activeCol = 0;
          renderSeriesPicker();
          playStep();
        } else {
          exitSeriesPicker();
        }
        return true;
      }
      if (isEnter) {
        e.preventDefault();
        if (state.seriesPicker.activeCol === 0) {
          state.seriesPicker.activeCol = 1;
          renderSeriesPicker();
          playStep();
        } else {
          playSelectedEpisode();
        }
        return true;
      }
      if (isBack || e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (state.seriesPicker.activeCol === 1) {
          state.seriesPicker.activeCol = 0;
          renderSeriesPicker();
          playStep();
        } else {
          exitSeriesPicker();
        }
        return true;
      }
      return true;
    }

    // Channel Up / Page Up: Jump 5 backwards/up with loop
    if (isPageUp) {
      e.preventDefault();
      rotateRadialWheel(state.activeTier, -5);
      return true;
    }

    // Channel Down / Page Down: Jump 5 forwards/down with loop
    if (isPageDown) {
      e.preventDefault();
      rotateRadialWheel(state.activeTier, 5);
      return true;
    }

    // Arrow Up: 1 item backwards with loop
    if (isUp) {
      e.preventDefault();
      rotateRadialWheel(state.activeTier, -1);
      return true;
    }

    // Arrow Down: 1 item forwards with loop
    if (isDown) {
      e.preventDefault();
      rotateRadialWheel(state.activeTier, 1);
      return true;
    }

    // Arrow Left: step tier to left
    if (isLeft) {
      e.preventDefault();
      stepRadialTier(-1);
      return true;
    }

    // Arrow Right: step tier to right (DO NOT OPEN EPG WHILE WHEEL IS VISIBLE!)
    if (isRight) {
      e.preventDefault();
      if (state.activeTier === 3) {
        if (!state.isMoveMode) {
          closeOverlay();
        }
        return true;
      } else {
        stepRadialTier(1);
      }
      return true;
    }

    // Enter / OK:
    if (isEnter) {
      e.preventDefault();
      handleTierConfirm(state.activeTier);
      return true;
    }

    // Yellow key: Toggle favorite
    if (isYellow) {
      e.preventDefault();
      var channels = getChannelsList();
      if (channels && channels.length) {
        var curIdx = ((state.selected.channelIndex % channels.length) + channels.length) % channels.length;
        var sId = channels[curIdx].stream_id;
        if (window.kcToggleFavorite && typeof window.kcToggleFavorite === "function") {
          window.kcToggleFavorite(sId);
          renderRadialTier(3);
        }
      }
      return true;
    }

    // Red key: Toggle Reorder / Move Mode in Favorites
    if (isRed) {
      e.preventDefault();
      if (MODES[state.selected.modeIndex].id === "favorites") {
        var chs = getChannelsList();
        if (!chs || !chs.length) return true;

        if (!state.isMoveMode) {
          // ENTER REORDER MODE on currently focused channel
          state.isMoveMode = true;
          var curCh = chs[state.selected.channelIndex % chs.length];
          state.moveStack = [String(curCh.stream_id)];
          state.moveOriginIndex = state.selected.channelIndex;
          if (window.kcShowToast) {
            window.kcShowToast("TAŞIMA: OK ile alt kanalı ekle, ▲/▼ ile taşı, KIRMIZI ile bırak");
          }
          renderRadialTier(3);
        } else {
          // COMMIT REORDER where it is now!
          if (window.kcCommitMoveStack && typeof window.kcCommitMoveStack === "function") {
            window.kcCommitMoveStack(state.moveStack, state.selected.channelIndex);
          }
          state.isMoveMode = false;
          state.moveStack = [];
          if (window.kcShowToast) {
            window.kcShowToast("Sıralama kaydedildi");
          }
          renderRadialTier(3);
        }
      }
      return true;
    }

    // Guide key: Open EPG Guide overlay (closes radial wheel)
    if (isGuideKey) {
      e.preventDefault();
      closeOverlay();
      if (window.kcOpenGuide && typeof window.kcOpenGuide === "function") {
        window.kcOpenGuide();
      }
      return true;
    }

    // Back / M key:
    if (isBack || e.key === "m" || e.key === "M") {
      e.preventDefault();
      if (state.isMoveMode) {
        // Cancel move mode
        state.isMoveMode = false;
        state.moveStack = [];
        if (window.kcShowToast) window.kcShowToast("Taşıma iptal edildi");
        renderRadialTier(3);
        return true;
      }
      closeOverlay();
      return true;
    }

    return true; // Capture all other keys while overlay is open
  }

  // PUBLIC API
  window.AeroRadial = {
    init: function() {
      document.body.classList.add("radial-active");
      var menu = document.getElementById("radialOverlayMenu");
      if (menu) {
        menu.classList.add("hidden");
      }
      state.isOpen = false;
      state.selected.modeIndex = 0; // Favorites on startup!

      // Add mousewheel support to each column
      for (var c = 0; c < 4; c++) {
        (function(cIdx) {
          var colEl = document.getElementById("radialCol-" + cIdx);
          if (colEl) {
            colEl.addEventListener("wheel", function(e) {
              e.preventDefault();
              state.activeTier = cIdx;
              rotateRadialWheel(cIdx, e.deltaY > 0 ? 1 : -1);
            }, { passive: false });
          }
        })(c);
      }

      // Add mousewheel support to series picker columns
      var sCol0 = document.getElementById("radialSeriesCol-0");
      if (sCol0) {
        sCol0.addEventListener("wheel", function(e) {
          e.preventDefault();
          state.seriesPicker.activeCol = 0;
          rotateSeriesPicker(0, e.deltaY > 0 ? 1 : -1);
        }, { passive: false });
      }
      var sCol1 = document.getElementById("radialSeriesCol-1");
      if (sCol1) {
        sCol1.addEventListener("wheel", function(e) {
          e.preventDefault();
          state.seriesPicker.activeCol = 1;
          rotateSeriesPicker(1, e.deltaY > 0 ? 1 : -1);
        }, { passive: false });
      }
    },
    open: openOverlay,
    close: closeOverlay,
    toggle: toggleOverlay,
    isOpen: function() { return state.isOpen; },
    handleKey: handleKey,
    refresh: function() {
      if (state.isOpen) {
        if (state.seriesPicker.active) {
          renderSeriesPicker();
        } else {
          renderAllTiers();
        }
      }
    },
    syncChannelIndex: function(idx) {
      if (idx !== undefined && idx >= 0) {
        state.selected.channelIndex = idx;
        if (state.isOpen && !state.seriesPicker.active) renderRadialTier(3);
      }
    },
    setMode: function(idx) {
      if (idx !== undefined && idx >= 0 && idx < MODES.length) {
        state.selected.modeIndex = idx;
        applyTierPreview(0);
        if (state.isOpen) renderAllTiers();
      }
    }
  };

})(window);
