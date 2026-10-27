document.addEventListener("DOMContentLoaded", () => {
  if (window.webOS && window.webOS.fullScreen) {
    try { window.webOS.fullScreen(true); } catch(e) {}
  }

  const loginPage = document.getElementById("loginPage");
  const appPage = document.getElementById("appPage");
  const loginForm = document.getElementById("loginForm");
  const autoLoginSplash = document.getElementById("autoLoginSplash");
  const loginStatus = document.getElementById("loginStatus");

  const serverUrlInput = document.getElementById("serverUrl");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  const regionList = document.getElementById("regionList");
  const categoryList = document.getElementById("categoryList");
  const channelList = document.getElementById("channelList");
  const colContent = document.getElementById("colContent");
  const contentTitle = document.getElementById("contentTitle");
  const video = document.getElementById("videoPlayer");
  const playerWrapper = document.getElementById("playerWrapper");
  const vodPauseIcon = document.getElementById("vodPauseIcon");
  
  const osdContainer = document.getElementById("osdContainer");
  const osdChannelTitle = document.getElementById("osdChannelTitle");
  const osdClock = document.getElementById("osdClock");
  const osdExitBtn = document.getElementById("osdExitBtn");
  const vodOsdExitBtn = document.getElementById("vodOsdExitBtn");
  const trapezoidToggleBtn = document.getElementById("trapezoidToggleBtn");

  const osdEpgCurrTime = document.getElementById("osdEpgCurrTime");
  const osdEpgCurrTitle = document.getElementById("osdEpgCurrTitle");
  const osdEpgNextTime = document.getElementById("osdEpgNextTime");
  const osdEpgNextTitle = document.getElementById("osdEpgNextTitle");
  const headerModeIndicator = document.getElementById("headerModeIndicator");

  const vodOsdContainer = document.getElementById("vodOsdContainer");
  const vodOsdTitle = document.getElementById("vodOsdTitle");
  const vodOsdClock = document.getElementById("vodOsdClock");
  const vodProgressBar = document.getElementById("vodProgressBar");
  const vodProgressBarContainer = document.getElementById("vodProgressBarContainer");
  const vodCurrentTime = document.getElementById("vodCurrentTime");
  const vodDuration = document.getElementById("vodDuration");
  const vodSkipBtn = document.getElementById("vodSkipBtn");

  const numZapOverlay = document.getElementById("numZapOverlay");
  const numZapText = document.getElementById("numZapText");

  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingText = document.getElementById("loadingText");
  const errorModal = document.getElementById("errorModal");
  const errorTitle = document.getElementById("errorTitle");
  const errorDesc = document.getElementById("errorDesc");
  const errorRetryBtn = document.getElementById("errorRetryBtn");

  const seriesModal = document.getElementById("seriesModal");
  const seriesModalTitle = document.getElementById("seriesModalTitle");
  const seriesModalClose = document.getElementById("seriesModalClose");
  const seriesSeasonTabs = document.getElementById("seriesSeasonTabs");
  const seriesEpisodesGrid = document.getElementById("seriesEpisodesGrid");

  const ytRippleLeft = document.getElementById("ytRippleLeft");
  const ytRippleRight = document.getElementById("ytRippleRight");
  const skipSecLeft = document.getElementById("skipSecLeft");
  const skipSecRight = document.getElementById("skipSecRight");
  const speedBadge = document.getElementById("speedBadge");

  let toastMsg = document.getElementById("toastMsg") || createUIElement("toastMsg", "toast-msg");
  let moveBanner = document.getElementById("moveBanner") || createUIElement("moveBanner", "move-banner hidden", "🔴 VERPLAATS-MODUS ACTIEF: Gebruik ⬆/⬇ om te verplaatsen, druk ROOD om te bewaren");

  function createUIElement(id, className, innerHTML = "", parent = document.body) {
    const el = document.createElement("div");
    el.id = id;
    el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    if (parent) parent.appendChild(el);
    return el;
  }

  let currentAuth = null;
  let allStreams = [];
  let vodStreams = [];
  let vodCategories = [];
  let seriesStreams = [];
  let seriesCategories = [];
  let allCategories = [];
  let favorites = JSON.parse(localStorage.getItem("iptv_favorites") || "[]");
  let currentModus = "favorites";
  
  let currentLiveRegion = "TR";
  let currentVodRegion = "TR";
  let currentSeriesRegion = "TR";

  let currentCategoryId = null;
  let currentStreamIndex = 0;
  let currentActiveStreams = [];
  let hlsPlayer = null;
  let osdTimeout = null;
  let vodOsdTimeout = null;
  let isFitScreen = false;
  let menuCollapsedAll = false;
  let movingStreamId = null;

  let numberBuffer = "";
  let numberTimer = null;
  let lastFocusedPoster = null;

  let skipIntervals = [5, 10, 15, 30];
  let skipIndex = parseInt(localStorage.getItem("vod_skip_index") || "1", 10);
  let currentSkipSec = skipIntervals[skipIndex] || 10;
  if (vodSkipBtn) vodSkipBtn.textContent = `⚙️ ${currentSkipSec}s`;
  if (skipSecLeft) skipSecLeft.textContent = currentSkipSec;
  if (skipSecRight) skipSecRight.textContent = currentSkipSec;

  if (vodSkipBtn) {
    vodSkipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      skipIndex = (skipIndex + 1) % skipIntervals.length;
      currentSkipSec = skipIntervals[skipIndex];
      localStorage.setItem("vod_skip_index", skipIndex);
      vodSkipBtn.textContent = `⚙️ ${currentSkipSec}s`;
      if (skipSecLeft) skipSecLeft.textContent = currentSkipSec;
      if (skipSecRight) skipSecRight.textContent = currentSkipSec;
      showToast(`⚙️ Atlama süresi: ${currentSkipSec}s`);
    });
  }

  function showLoading(text) {
    if (loadingText) loadingText.textContent = text || "Yükleniyor...";
    if (loadingOverlay) loadingOverlay.classList.remove("hidden");
  }

  function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  }

  function showError(title, desc) {
    if (errorTitle) errorTitle.textContent = title || "Bağlantı Hatası";
    if (errorDesc) errorDesc.textContent = desc || "Sunucuya bağlanılamadı.";
    if (errorModal) errorModal.classList.remove("hidden");
  }

  if (errorRetryBtn) {
    errorRetryBtn.addEventListener("click", () => {
      if (errorModal) errorModal.classList.add("hidden");
      initProfile();
    });
  }

  window.addEventListener("offline", () => {
    showError("İnternet Yok", "Cihaz internet bağlantısını kaybetti.");
  });

  function showToast(text) {
    toastMsg.textContent = text;
    toastMsg.classList.add("show");
    setTimeout(() => toastMsg.classList.remove("show"), 2500);
  }

  function cleanTitle(str) {
    if (!str) return "";
    return str
      .replace(/\([^)]*\)/g, "")
      .replace(/^[A-Z0-9]{2,5}\s*:\s*/i, "")
      .replace(/\b(HEVC|VIP|FHD|HD|SD|4K|H265|H264)\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function extractRegionFromCategory(catName, isVodOrSeries) {
    if (!catName) return "";
    if (isVodOrSeries) {
      const match = catName.match(/\(VI([A-Z0-9-]+)[|)]/i);
      if (match && match[1]) return match[1].replace("-", "").toUpperCase();
    }
    const prefix = catName.split(" ")[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (prefix.length >= 2 && prefix.length <= 5) return prefix;
    return "";
  }

  setInterval(() => {
    const now = new Date();
    const clockStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (osdClock) osdClock.textContent = clockStr;
    if (vodOsdClock) vodOsdClock.textContent = clockStr;
  }, 1000);

  video.addEventListener("timeupdate", () => {
    if (video.duration && isFinite(video.duration)) {
      const pct = (video.currentTime / video.duration) * 100;
      if (vodProgressBar) vodProgressBar.style.width = `${pct}%`;
      if (vodCurrentTime) vodCurrentTime.textContent = formatTime(video.currentTime);
      if (vodDuration) vodDuration.textContent = formatTime(video.duration);
    }
  });

  if (vodProgressBarContainer) {
    vodProgressBarContainer.addEventListener("click", (e) => {
      if (!video.duration || isNaN(video.duration)) return;
      const rect = vodProgressBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      video.currentTime = pct * video.duration;
      showVodOSD();
    });
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  function initProfile() {
    const saved = localStorage.getItem("iptv_profile");
    if (saved) {
      try {
        currentAuth = JSON.parse(saved);
        if (serverUrlInput) serverUrlInput.value = currentAuth.server;
        if (usernameInput) usernameInput.value = currentAuth.username;
        if (passwordInput) passwordInput.value = currentAuth.password;

        if (autoLoginSplash) autoLoginSplash.classList.remove("hidden");
        if (loginForm) loginForm.classList.add("hidden");

        login(currentAuth.server, currentAuth.username, currentAuth.password, true);
        return;
      } catch (e) {
        localStorage.removeItem("iptv_profile");
      }
    }
    showLoginPage();
  }

  function showLoginPage() {
    if (loginPage) loginPage.classList.remove("hidden");
    if (autoLoginSplash) autoLoginSplash.classList.add("hidden");
    if (loginForm) loginForm.classList.remove("hidden");
    if (appPage) appPage.classList.add("hidden");
    setTimeout(() => {
      if (serverUrlInput) setElementFocus(serverUrlInput);
    }, 100);
  }

  function showAppPage() {
    if (loginPage) loginPage.classList.add("hidden");
    if (appPage) appPage.classList.remove("hidden");
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let server = serverUrlInput.value.trim();
      if (server.endsWith("/")) server = server.slice(0, -1);
      login(server, usernameInput.value.trim(), passwordInput.value.trim(), false);
    });
  }

  async function login(server, username, password, isAuto) {
    if (loginStatus) loginStatus.textContent = "Bağlanılıyor...";
    showLoading("IPTV Sunucusuna Bağlanılıyor...");

    try {
      const catRes = await fetch(`${server}/player_api.php?username=${username}&password=${password}&action=get_live_categories`);
      if (!catRes.ok) throw new Error("Server error");

      allCategories = await catRes.json();
      currentAuth = { server, username, password };
      
      localStorage.setItem("iptv_profile", JSON.stringify(currentAuth));
      showAppPage();

      const streamRes = await fetch(`${server}/player_api.php?username=${username}&password=${password}&action=get_live_streams`);
      allStreams = await streamRes.json();

      try {
        const vodCatRes = await fetch(`${server}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`);
        vodCategories = await vodCatRes.json();
        const vodStreamRes = await fetch(`${server}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`);
        vodStreams = await vodStreamRes.json();
      } catch(e) {}

      try {
        const seriesCatRes = await fetch(`${server}/player_api.php?username=${username}&password=${password}&action=get_series_categories`);
        seriesCategories = await seriesCatRes.json();
        const seriesStreamRes = await fetch(`${server}/player_api.php?username=${username}&password=${password}&action=get_series`);
        seriesStreams = await seriesStreamRes.json();
      } catch(e) {}

      hideLoading();
      setupRegions();

      if (!favorites || favorites.length === 0) {
        switchModus("live");
      } else {
        switchModus("favorites");
      }

      if (currentActiveStreams && currentActiveStreams.length > 0) {
        const firstStream = currentActiveStreams[0];
        playStream(firstStream.stream_id, firstStream.name, firstStream.stream_icon, 0);
        activeerFitScreen();
      } else if (allStreams && allStreams.length > 0) {
        switchModus("live");
        if (currentActiveStreams && currentActiveStreams.length > 0) {
          const firstStream = currentActiveStreams[0];
          playStream(firstStream.stream_id, firstStream.name, firstStream.stream_icon, 0);
          activeerFitScreen();
        }
      }

    } catch (err) {
      hideLoading();
      if (isAuto) localStorage.removeItem("iptv_profile");
      if (loginStatus) loginStatus.textContent = "Giriş başarısız.";
      showError("Giriş Başarısız", "Kullanıcı adı, şifre veya sunucu URL hatalı.");
      showLoginPage();
    }
  }

  function activeerFitScreen() {
    isFitScreen = true;
    document.body.classList.add("speler-fit-screen");
    if (trapezoidToggleBtn) trapezoidToggleBtn.classList.add("hidden");
    if (currentModus === "live" || currentModus === "favorites") {
      showLiveOSD();
    } else if (currentModus === "vod" || currentModus === "series") {
      showVodOSD();
    }
  }

  function deactiveerFitScreen() {
    isFitScreen = false;
    document.body.classList.remove("speler-fit-screen");
    if (trapezoidToggleBtn) trapezoidToggleBtn.classList.remove("hidden");
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    if (currentModus === "vod" || currentModus === "series") {
      playerWrapper.classList.add("hidden");
      setTimeout(() => {
        const targetFocus = lastFocusedPoster || document.querySelector("#channelList .poster-card") || document.querySelector(".focusable");
        if (targetFocus) setElementFocus(targetFocus);
      }, 50);
    }
  }

  function setColumnFocus(activeColIdx) {
    if (menuCollapsedAll) {
      document.getElementById("colModus").classList.add("collapsed");
      document.getElementById("colRegions").classList.add("collapsed");
      document.getElementById("colCategories").classList.add("collapsed");
      if (trapezoidToggleBtn) trapezoidToggleBtn.textContent = "➔";
      return;
    }

    const cols = [
      document.getElementById("colModus"),
      document.getElementById("colRegions"),
      document.getElementById("colCategories"),
      document.getElementById("colContent")
    ];

    cols.forEach((col, idx) => {
      if (!col) return;
      if (idx === 3) {
        col.classList.remove("collapsed");
        return;
      }
      if (currentModus === "favorites" && (idx === 1 || idx === 2)) {
        col.classList.add("collapsed");
        return;
      }
      // Allow explicit uncollapsing of whichever column was clicked/selected (activeColIdx)
      if (idx === activeColIdx) {
        col.classList.remove("collapsed");
      } else {
        col.classList.add("collapsed");
      }
    });

    if (trapezoidToggleBtn) trapezoidToggleBtn.textContent = "☰";
  }

  function toggleCollapseAllMenu() {
    menuCollapsedAll = !menuCollapsedAll;
    if (menuCollapsedAll) {
      document.getElementById("colModus").classList.add("collapsed");
      document.getElementById("colRegions").classList.add("collapsed");
      document.getElementById("colCategories").classList.add("collapsed");
      if (trapezoidToggleBtn) trapezoidToggleBtn.textContent = "➔";
      showToast("📁 Menü gizlendi");
    } else {
      menuCollapsedAll = false;
      if (currentModus === "vod" || currentModus === "series") {
        setColumnFocus(2);
      } else {
        setColumnFocus(1);
      }
      if (trapezoidToggleBtn) trapezoidToggleBtn.textContent = "☰";
      showToast("📂 Menü açıldı");
    }
  }

  if (trapezoidToggleBtn) {
    trapezoidToggleBtn.addEventListener("click", () => {
      toggleCollapseAllMenu();
    });
  }

  function setupRegions() {
    if (!regionList) return;
    const isVodOrSeries = (currentModus === "vod" || currentModus === "series");
    const categoriesToUse = currentModus === "series" ? seriesCategories : (currentModus === "vod" ? vodCategories : allCategories);
    const currentActiveRegion = currentModus === "series" ? currentSeriesRegion : (currentModus === "vod" ? currentVodRegion : currentLiveRegion);

    const regions = new Set();
    categoriesToUse.forEach(cat => {
      const reg = extractRegionFromCategory(cat.category_name, isVodOrSeries);
      if (reg) regions.add(reg);
    });

    const topRegions = ["TR", "NL", "BE", "PL", "EXYU"];
    const activeTop = topRegions.filter(r => regions.has(r));
    const otherRegions = Array.from(regions).filter(r => !topRegions.includes(r)).sort();
    
    regionList.innerHTML = `<li class="nav-item focusable" data-region="ALL" tabindex="0">🌍 Tüm Bölgeler</li>`;

    activeTop.forEach(reg => {
      const li = document.createElement("li");
      li.className = "nav-item focusable" + (reg === currentActiveRegion ? " active" : "");
      li.dataset.region = reg;
      li.tabIndex = 0;
      li.textContent = `⭐ ${reg}`;
      regionList.appendChild(li);
    });

    otherRegions.forEach(reg => {
      const li = document.createElement("li");
      li.className = "nav-item focusable" + (reg === currentActiveRegion ? " active" : "");
      li.dataset.region = reg;
      li.tabIndex = 0;
      li.textContent = reg;
      regionList.appendChild(li);
    });

    filterCategories();
  }

  function filterCategories() {
    if (!categoryList) return;
    categoryList.innerHTML = "";

    const isVodOrSeries = (currentModus === "vod" || currentModus === "series");
    const categoriesToUse = currentModus === "series" ? seriesCategories : (currentModus === "vod" ? vodCategories : allCategories);
    const activeRegion = currentModus === "series" ? currentSeriesRegion : (currentModus === "vod" ? currentVodRegion : currentLiveRegion);

    const filtered = categoriesToUse.filter(cat => {
      if (activeRegion === "ALL") return true;
      const catRegion = extractRegionFromCategory(cat.category_name, isVodOrSeries);
      return catRegion === activeRegion;
    });

    filtered.forEach((cat, index) => {
      const li = document.createElement("li");
      li.className = "nav-item focusable" + (index === 0 ? " active" : "");
      li.dataset.catId = cat.category_id;
      li.tabIndex = 0;
      li.textContent = cleanTitle(cat.category_name);
      categoryList.appendChild(li);
    });

    if (filtered.length > 0) {
      currentCategoryId = filtered[0].category_id;
      filterChannels();
    } else {
      currentCategoryId = null;
      filterChannels();
    }
  }

  function filterChannels() {
    if (!channelList) return;
    channelList.innerHTML = "";

    if (currentModus === "vod" || currentModus === "series") {
      playerWrapper.classList.add("hidden");
      colContent.classList.add("vod-mode-active");
      channelList.className = "netflix-grid";
      contentTitle.textContent = currentModus === "vod" ? "FİLMLER" : "DİZİLER";
      
      let streamsToUse = currentModus === "series" ? seriesStreams : vodStreams;
      let filteredItems = currentCategoryId ? streamsToUse.filter(s => s.category_id.toString() === currentCategoryId.toString()) : streamsToUse;
      if (filteredItems.length === 0) filteredItems = streamsToUse.slice(0, 80);

      if (filteredItems.length === 0) {
        channelList.innerHTML = `<div style="color:#aaa;font-size:1.5rem;padding:30px;grid-column:1/-1;text-align:center;">Yükleniyor...</div>`;
        return;
      }

      filteredItems.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "poster-card focusable";
        div.tabIndex = 0;
        div.dataset.streamId = item.stream_id || item.series_id;
        div.dataset.containerExtension = item.container_extension || "mp4";
        const displayTitle = cleanTitle(item.name || item.title || "");
        div.dataset.title = displayTitle;

        const posterSrc = item.stream_icon || item.cover || "";
        div.innerHTML = `
          <img src="${posterSrc}" loading="lazy" decoding="async" class="poster-img" onerror="this.src='https://picsum.photos/300/450?movie=${idx}';">
          <div class="poster-info">
            <div class="poster-title">${displayTitle}</div>
            <div class="poster-sub">${currentModus === 'series' ? '🍿 Dizi' : '★ 8.5 / HD'}</div>
          </div>
        `;
        channelList.appendChild(div);
      });
      return;
    }

    playerWrapper.classList.remove("hidden");
    colContent.classList.remove("vod-mode-active");
    channelList.className = "channel-grid";
    contentTitle.textContent = "KANALLAR";

    currentActiveStreams = currentModus === "favorites" 
      ? favorites.map(id => allStreams.find(s => s.stream_id.toString() === id.toString())).filter(Boolean)
      : allStreams.filter(s => s.category_id === currentCategoryId);

    currentActiveStreams.forEach((s, idx) => {
      const isFav = favorites.includes(s.stream_id.toString());
      const isMoving = movingStreamId === s.stream_id.toString();
      const li = document.createElement("li");
      li.className = "channel-card focusable" + (idx === currentStreamIndex ? " active" : "") + (isMoving ? " moving-card" : "");
      li.dataset.streamId = s.stream_id;
      li.dataset.index = idx;
      li.dataset.streamIcon = s.stream_icon || "";
      li.tabIndex = 0;

      const numStr = (idx + 1).toString();
      const logoHtml = s.stream_icon 
        ? `<img src="${s.stream_icon}" loading="lazy" decoding="async" class="channel-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="channel-logo-placeholder" style="display:none;">TV</div>`
        : `<div class="channel-logo-placeholder">TV</div>`;

      const starColor = isFav ? '#ffd700' : '#444455';
      const starSvg = `<div class="channel-star-btn" title="Favori" style="cursor:pointer;padding:8px;display:flex;align-items:center;"><svg style="width:22px;height:22px;fill:${starColor};min-width:22px;" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></div>`;

      li.innerHTML = `
        <span class="channel-number">${numStr}</span>
        ${logoHtml}
        <span class="channel-name">${cleanTitle(s.name)}</span>
        ${starSvg}
      `;
      channelList.appendChild(li);
    });
  }

  async function switchModus(modus) {
    currentModus = modus;
    document.querySelectorAll("#modusList .nav-item").forEach(el => el.classList.toggle("active", el.dataset.modus === modus));

    if (headerModeIndicator) {
      const modeTitles = { favorites: "★ FAVORİLER", live: "📺 CANLI TV", vod: "🎬 FİLMLER", series: "🍿 DİZİLER" };
      headerModeIndicator.textContent = modeTitles[modus] || "TV";
    }

    menuCollapsedAll = false;

    if (modus === "vod" && vodStreams.length === 0 && currentAuth) {
      showLoading("Filmler yükleniyor...");
      try {
        const catRes = await fetch(`${currentAuth.server}/player_api.php?username=${currentAuth.username}&password=${currentAuth.password}&action=get_vod_categories`);
        vodCategories = await catRes.json();
        const res = await fetch(`${currentAuth.server}/player_api.php?username=${currentAuth.username}&password=${currentAuth.password}&action=get_vod_streams`);
        vodStreams = await res.json();
      } catch(e) {}
      hideLoading();
    } else if (modus === "series" && seriesStreams.length === 0 && currentAuth) {
      showLoading("Diziler yükleniyor...");
      try {
        const catRes = await fetch(`${currentAuth.server}/player_api.php?username=${currentAuth.username}&password=${password}&action=get_series_categories`);
        seriesCategories = await catRes.json();
        const res = await fetch(`${currentAuth.server}/player_api.php?username=${currentAuth.username}&password=${password}&action=get_series`);
        seriesStreams = await res.json();
      } catch(e) {}
      hideLoading();
    }

    setupRegions();

    if (modus === "favorites") {
      setColumnFocus(3);
    } else if (modus === "vod" || modus === "series") {
      setColumnFocus(2); // Category list
    } else {
      setColumnFocus(1); // Region list
    }
  }

  function toggleFavorite(streamId) {
    if (!streamId) return;
    const sId = streamId.toString();
    const idx = favorites.indexOf(sId);
    if (idx >= 0) {
      favorites.splice(idx, 1);
      showToast("⭐ Favorilerden Çıkarıldı");
    } else {
      favorites.push(sId);
      showToast("⭐ Favorilere Eklendi!");
    }
    localStorage.setItem("iptv_favorites", JSON.stringify(favorites));
    filterChannels();
  }

  function toggleMoveMode(streamId) {
    if (currentModus !== "favorites") {
      showToast("⚠️ Verplaatsen alleen in Favorieten!");
      return;
    }
    if (!streamId) return;
    const sId = streamId.toString();
    if (!movingStreamId) {
      movingStreamId = sId;
      moveBanner.classList.remove("hidden");
      showToast("🔴 Verplaatsen gestart");
    } else {
      movingStreamId = null;
      moveBanner.classList.add("hidden");
      showToast("✅ Positie opgeslagen!");
    }
    filterChannels();
  }

  function stepMoveFavorite(delta) {
    if (!movingStreamId || currentModus !== "favorites") return;
    const idx = favorites.indexOf(movingStreamId);
    if (idx < 0) return;
    const newIdx = idx + delta;
    if (newIdx >= 0 && newIdx < favorites.length) {
      const temp = favorites[idx];
      favorites[idx] = favorites[newIdx];
      favorites[newIdx] = temp;
      localStorage.setItem("iptv_favorites", JSON.stringify(favorites));
      filterChannels();
      const targetCard = document.querySelector(`#channelList [data-stream-id="${movingStreamId}"]`);
      if (targetCard) {
        setElementFocus(targetCard);
        targetCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }

  async function fetchEPGData(streamId) {
    if (!streamId || !currentAuth) return;
    try {
      const res = await fetch(`${currentAuth.server}/player_api.php?username=${currentAuth.username}&password=${currentAuth.password}&action=get_short_epg&stream_id=${streamId}&limit=3`);
      const data = await res.json();
      if (data && data.epg_listings && data.epg_listings.length > 0) {
        const epgs = data.epg_listings;
        const b64 = (str) => { try { return decodeURIComponent(escape(atob(str))); } catch(e) { return str; } };

        const cTitle = b64(epgs[0].title || "Canlı Yayın");
        const cTime = `${epgs[0].start ? epgs[0].start.substring(11,16) : ""} - ${epgs[0].end ? epgs[0].end.substring(11,16) : ""}`;

        document.getElementById("epgCurrTitle").textContent = cTitle;
        document.getElementById("epgCurrTime").textContent = cTime;
        if (osdEpgCurrTitle) osdEpgCurrTitle.textContent = cTitle;
        if (osdEpgCurrTime) osdEpgCurrTime.textContent = cTime;

        if (epgs[1]) {
          const nTitle = b64(epgs[1].title || "Sonraki Yayın");
          const nTime = `${epgs[1].start ? epgs[1].start.substring(11,16) : ""}`;
          document.getElementById("epgNextTitle").textContent = nTitle;
          document.getElementById("epgNextTime").textContent = nTime;
          if (osdEpgNextTitle) osdEpgNextTitle.textContent = nTitle;
          if (osdEpgNextTime) osdEpgNextTime.textContent = nTime;
        }
        return;
      }
    } catch(e) {}
    
    document.getElementById("epgCurrTitle").textContent = "Canlı Yayın";
    document.getElementById("epgCurrTime").textContent = "--:--";
    document.getElementById("epgNextTitle").textContent = "Sonraki Yayın Yok";
    document.getElementById("epgNextTime").textContent = "--:--";

    if (osdEpgCurrTitle) osdEpgCurrTitle.textContent = "Canlı Yayın";
    if (osdEpgCurrTime) osdEpgCurrTime.textContent = "--:--";
    if (osdEpgNextTitle) osdEpgNextTitle.textContent = "Sonraki Yayın Yok";
    if (osdEpgNextTime) osdEpgNextTime.textContent = "--:--";
  }

  function playVodMovie(streamId, title, ext) {
    playerWrapper.classList.remove("hidden");
    activeerFitScreen();
    if (vodOsdTitle) vodOsdTitle.textContent = title;
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    showVodOSD();

    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }

    video.muted = false;
    video.volume = 1.0;

    const fileExt = ext || 'mp4';
    const directMovieUrl = `${currentAuth.server}/movie/${currentAuth.username}/${currentAuth.password}/${streamId}.${fileExt}`;

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.src = directMovieUrl;
    video.play().catch(err => {
      const fallbackUrl = `${currentAuth.server}/movie/${currentAuth.username}/${currentAuth.password}/${streamId}.mkv`;
      video.src = fallbackUrl;
      video.play().catch(e => {
        video.muted = true;
        video.play().catch(console.error);
      });
    });
  }

  async function openSeriesModal(seriesId, title) {
    showLoading("Dizi bilgileri yükleniyor...");
    try {
      const res = await fetch(`${currentAuth.server}/player_api.php?username=${currentAuth.username}&password=${currentAuth.password}&action=get_series_info&series_id=${seriesId}`);
      const data = await res.json();
      hideLoading();

      if (!data || !data.episodes) {
        showToast("⚠️ Bölüm bulunamadı");
        return;
      }

      if (seriesModalTitle) seriesModalTitle.textContent = title;
      seriesSeasonTabs.innerHTML = "";
      seriesEpisodesGrid.innerHTML = "";

      const seasons = Object.keys(data.episodes);
      if (seasons.length === 0) {
        showToast("⚠️ Sezon bulunamadı");
        return;
      }

      seasons.forEach((seasonNum, sIdx) => {
        const tab = document.createElement("button");
        tab.className = "season-tab" + (sIdx === 0 ? " active" : "");
        tab.textContent = `${seasonNum}. Sezon`;
        tab.dataset.season = seasonNum;
        tab.addEventListener("click", () => {
          document.querySelectorAll(".season-tab").forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          renderEpisodes(data.episodes[seasonNum], title);
        });
        seriesSeasonTabs.appendChild(tab);
      });

      renderEpisodes(data.episodes[seasons[0]], title);
      seriesModal.classList.remove("hidden");

    } catch(e) {
      hideLoading();
      showToast("⚠️ Dizi yüklenemedi");
    }
  }

  function renderEpisodes(episodesList, seriesTitle) {
    seriesEpisodesGrid.innerHTML = "";
    if (!episodesList || episodesList.length === 0) {
      seriesEpisodesGrid.innerHTML = `<div style="color:#aaa;font-size:1.3rem;padding:20px;">Bu sezonda bölüm yok.</div>`;
      return;
    }

    episodesList.forEach(ep => {
      const card = document.createElement("div");
      card.className = "episode-card focusable";
      card.tabIndex = 0;
      const epTitle = cleanTitle(ep.title || `Bölüm ${ep.episode_num}`);
      card.innerHTML = `
        <div class="episode-title">Bölüm ${ep.episode_num}: ${epTitle}</div>
        <div class="episode-sub">HD / Süre: ${ep.info && ep.info.duration ? ep.info.duration : '45 dk'}</div>
      `;
      card.addEventListener("click", () => {
        seriesModal.classList.add("hidden");
        playSeriesEpisode(ep.id, `${seriesTitle} - B${ep.episode_num}`, ep.container_extension || "mp4");
      });
      seriesEpisodesGrid.appendChild(card);
    });
  }

  if (seriesModalClose) {
    seriesModalClose.addEventListener("click", () => {
      seriesModal.classList.add("hidden");
    });
  }

  function playSeriesEpisode(episodeId, title, ext) {
    playerWrapper.classList.remove("hidden");
    activeerFitScreen();
    if (vodOsdTitle) vodOsdTitle.textContent = title;
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    showVodOSD();

    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }

    video.muted = false;
    video.volume = 1.0;

    const fileExt = ext || 'mp4';
    const directEpUrl = `${currentAuth.server}/series/${currentAuth.username}/${currentAuth.password}/${episodeId}.${fileExt}`;

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.src = directEpUrl;
    video.play().catch(err => {
      const fallbackUrl = `${currentAuth.server}/series/${currentAuth.username}/${currentAuth.password}/${episodeId}.mkv`;
      video.src = fallbackUrl;
      video.play().catch(e => {
        video.muted = true;
        video.play().catch(console.error);
      });
    });
  }

  function playStream(streamId, name, icon, index) {
    if (index !== undefined) currentStreamIndex = index;

    const activeLi = document.querySelector(`#channelList [data-stream-id="${streamId}"]`);
    if (activeLi) {
      document.querySelectorAll("#channelList .channel-card").forEach(el => el.classList.remove("active"));
      activeLi.classList.add("active");
    }

    const numStr = (currentStreamIndex + 1).toString();
    updateLiveOSDData(numStr, name, icon);
    showLiveOSD();
    fetchEPGData(streamId);

    const m3u8Url = `${currentAuth.server}/live/${currentAuth.username}/${currentAuth.password}/${streamId}.m3u8`;
    const tsUrl = `${currentAuth.server}/live/${currentAuth.username}/${currentAuth.password}/${streamId}.ts`;

    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }

    video.muted = false;
    video.volume = 1.0;

    const startDirectPlay = (url) => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.src = url;
      video.play().catch(err => {
        video.muted = true;
        video.play().catch(console.error);
      });
    };

    if (window.Hls && Hls.isSupported()) {
      hlsPlayer = new Hls({
        enableWorker: false,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 15000
      });

      hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          hlsPlayer.destroy();
          hlsPlayer = null;
          startDirectPlay(tsUrl);
        }
      });

      hlsPlayer.loadSource(m3u8Url);
      hlsPlayer.attachMedia(video);
      hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => {
          video.muted = true;
          video.play().catch(console.error);
        });
      });
    } else {
      startDirectPlay(tsUrl);
    }
  }

  function updateLiveOSDData(numStr, name, icon) {
    if (osdChannelTitle) osdChannelTitle.textContent = `${numStr}. ${cleanTitle(name)}`;
    const osdLogo = document.getElementById("osdLogo");
    const osdLogoFallback = document.getElementById("osdLogoFallback");
    if (osdLogo && icon) {
      osdLogo.src = icon;
      osdLogo.classList.remove("hidden");
      if (osdLogoFallback) osdLogoFallback.style.display = "none";
    } else if (osdLogoFallback) {
      if (osdLogo) osdLogo.classList.add("hidden");
      osdLogoFallback.style.display = "flex";
    }
  }

  function showLiveOSD() {
    if (osdContainer) osdContainer.classList.remove("hidden");
    if (osdTimeout) clearTimeout(osdTimeout);
    osdTimeout = setTimeout(() => {
      if (osdContainer) osdContainer.classList.add("hidden");
    }, 4500);
  }

  function showVodOSD() {
    if (vodOsdContainer) vodOsdContainer.classList.remove("hidden");
    if (vodOsdTimeout) clearTimeout(vodOsdTimeout);
    vodOsdTimeout = setTimeout(() => {
      if (vodOsdContainer) vodOsdContainer.classList.add("hidden");
    }, 5000);
  }

  function togglePlayPauseVod() {
    if (video.paused) {
      video.play();
      if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
      showToast("▶ Oynatılıyor");
    } else {
      video.pause();
      if (vodPauseIcon) vodPauseIcon.classList.remove("hidden");
      showToast("⏸ Duraklatıldı");
    }
    showVodOSD();
  }

  function seekVod(seconds) {
    if (!video.duration || isNaN(video.duration)) return;
    let targetTime = video.currentTime + seconds;
    targetTime = Math.max(0, Math.min(targetTime, video.duration));
    video.currentTime = targetTime;
    showVodOSD();
  }

  function setElementFocus(element) {
    if (!element) return;
    document.querySelectorAll(".focusable").forEach(el => el.classList.remove("focused"));
    element.classList.add("focused");
    element.focus();

    if (element.classList.contains("poster-card")) {
      lastFocusedPoster = element;
    }

    const parentCol = element.closest(".col-nav");
    if (parentCol && parentCol.dataset.col !== undefined) {
      setColumnFocus(parseInt(parentCol.dataset.col, 10));
    }
  }

  // --- EXIT FULLSCREEN BUTTON LISTENERS ---
  if (osdExitBtn) {
    osdExitBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deactiveerFitScreen();
    });
  }

  if (vodOsdExitBtn) {
    vodOsdExitBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deactiveerFitScreen();
    });
  }

  // --- CLICK LISTENERS FOR TABS & COLUMNS ---
  document.querySelectorAll(".col-nav").forEach(col => {
    col.addEventListener("click", (e) => {
      const colIdx = parseInt(col.dataset.col, 10);
      if (isNaN(colIdx)) return;

      if (col.classList.contains("collapsed") || e.target.closest(".tab-label")) {
        e.stopPropagation();
        menuCollapsedAll = false;
        setColumnFocus(colIdx);
        const focusable = col.querySelector(".focusable.active") || col.querySelector(".focusable");
        if (focusable) setElementFocus(focusable);
      }
    });
  });

  // --- VOD / SERIES PLAYER INTERACTION ---
  let lastTapTime = 0;
  let holdTimer = null;
  let isHolding = false;

  if (playerWrapper) {
    playerWrapper.addEventListener("click", (e) => {
      if (video.muted) video.muted = false;
      const now = Date.now();
      const dt = now - lastTapTime;

      if (currentModus === "vod" || currentModus === "series") {
        const rect = playerWrapper.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const isLeftHalf = clickX < rect.width / 2;

        if (dt < 300) {
          if (isLeftHalf) {
            seekVod(-currentSkipSec);
            if (ytRippleLeft) {
              skipSecLeft.textContent = currentSkipSec;
              ytRippleLeft.classList.remove("hidden");
              setTimeout(() => ytRippleLeft.classList.add("hidden"), 600);
            }
          } else {
            seekVod(currentSkipSec);
            if (ytRippleRight) {
              skipSecRight.textContent = currentSkipSec;
              ytRippleRight.classList.remove("hidden");
              setTimeout(() => ytRippleRight.classList.add("hidden"), 600);
            }
          }
          lastTapTime = 0;
          return;
        }

        lastTapTime = now;
        setTimeout(() => {
          if (lastTapTime === now) {
            togglePlayPauseVod();
          }
        }, 320);

      } else {
        if (!isFitScreen) {
          activeerFitScreen();
        } else {
          showLiveOSD();
        }
      }
    });

    playerWrapper.addEventListener("touchstart", (e) => {
      if (currentModus !== "vod" && currentModus !== "series") return;
      isHolding = false;
      holdTimer = setTimeout(() => {
        isHolding = true;
        video.playbackRate = 2.0;
        if (speedBadge) speedBadge.classList.remove("hidden");
        showToast("⚡ 2x Hız Devrede");
      }, 350);
    }, { passive: true });

    playerWrapper.addEventListener("touchend", () => {
      if (holdTimer) clearTimeout(holdTimer);
      if (isHolding) {
        video.playbackRate = 1.0;
        if (speedBadge) speedBadge.classList.add("hidden");
        showToast("▶ Normal Hız");
        isHolding = false;
      }
    }, { passive: true });
  }

  if (document.getElementById("modusList")) {
    document.getElementById("modusList").addEventListener("click", e => {
      const li = e.target.closest("li");
      if (li && li.dataset.modus) {
        const modus = li.dataset.modus;
        switchModus(modus);
        setElementFocus(li);
      }
    });
  }

  if (regionList) {
    regionList.addEventListener("click", e => {
      const li = e.target.closest("li");
      if (!li || !li.dataset.region) return;
      document.querySelectorAll("#regionList .nav-item").forEach(el => el.classList.remove("active"));
      li.classList.add("active");
      const isVodOrSeries = (currentModus === "vod" || currentModus === "series");
      if (currentModus === "series") currentSeriesRegion = li.dataset.region;
      else if (currentModus === "vod") currentVodRegion = li.dataset.region;
      else currentLiveRegion = li.dataset.region;
      if (currentModus !== "favorites") filterCategories();
      setColumnFocus(2);
    });
  }

  if (categoryList) {
    categoryList.addEventListener("click", e => {
      const li = e.target.closest("li");
      if (!li || !li.dataset.catId) return;
      document.querySelectorAll("#categoryList .nav-item").forEach(el => el.classList.remove("active"));
      li.classList.add("active");
      currentCategoryId = li.dataset.catId;
      filterChannels();
      setColumnFocus(3);
    });
  }

  if (channelList) {
    channelList.addEventListener("click", e => {
      const starBtn = e.target.closest(".channel-star-btn");
      if (starBtn) {
        const card = starBtn.closest(".channel-card");
        if (card && card.dataset.streamId) {
          toggleFavorite(card.dataset.streamId);
          return;
        }
      }

      const li = e.target.closest("li, .channel-card, .poster-card");
      if (!li || !li.dataset.streamId) return;
      
      if (currentModus === "vod") {
        lastFocusedPoster = li;
        playVodMovie(li.dataset.streamId, li.dataset.title, li.dataset.containerExtension);
      } else if (currentModus === "series") {
        lastFocusedPoster = li;
        openSeriesModal(li.dataset.streamId, li.dataset.title);
      } else {
        const nameEl = li.querySelector(".channel-name");
        const idx = parseInt(li.dataset.index || "0", 10);
        playStream(li.dataset.streamId, nameEl ? nameEl.textContent : li.textContent, li.dataset.streamIcon, idx);
        activeerFitScreen();
      }
    });
  }

  // --- TOUCH & SWIPE GESTURE HANDLERS ---
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  document.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const dt = Date.now() - touchStartTime;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (dt < 500 && (absDx > 35 || absDy > 35)) {
      if (isFitScreen) {
        const startedNearTop = touchStartY < (window.innerHeight * 0.45);

        if (dy > 40 && (startedNearTop || absDy > absDx * 1.2)) {
          deactiveerFitScreen();
          return;
        }

        if (absDx > absDy) {
          if (dx < -35) {
            if (currentModus === "vod" || currentModus === "series") {
              seekVod(-currentSkipSec);
            } else if (currentActiveStreams.length > 0) {
              currentStreamIndex = (currentStreamIndex + 1) % currentActiveStreams.length;
              const target = currentActiveStreams[currentStreamIndex];
              playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex);
              showToast(`📺 Next: ${cleanTitle(target.name)}`);
            }
          } else if (dx > 35) {
            if (currentModus === "vod" || currentModus === "series") {
              seekVod(currentSkipSec);
            } else if (currentActiveStreams.length > 0) {
              currentStreamIndex = (currentStreamIndex - 1 + currentActiveStreams.length) % currentActiveStreams.length;
              const target = currentActiveStreams[currentStreamIndex];
              playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex);
              showToast(`📺 Prev: ${cleanTitle(target.name)}`);
            }
          }
        }
      } else {
        if (absDx > absDy) {
          const focused = document.activeElement;
          if (dx < -50) {
            navigateColumn(focused, "right");
          } else if (dx > 50) {
            navigateColumn(focused, "left");
          }
        }
      }
    }
  }, { passive: true });

  initProfile();
});
