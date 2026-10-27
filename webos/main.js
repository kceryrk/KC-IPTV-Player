document.addEventListener("DOMContentLoaded", () => {
  // Probeer webOS fullscreen API direct bij opstarten
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
  const osdEpgCurrTime = document.getElementById("osdEpgCurrTime");
  const osdEpgCurrTitle = document.getElementById("osdEpgCurrTitle");
  const osdEpgNextTime = document.getElementById("osdEpgNextTime");
  const osdEpgNextTitle = document.getElementById("osdEpgNextTitle");
  const headerModeIndicator = document.getElementById("headerModeIndicator");

  const vodOsdContainer = document.getElementById("vodOsdContainer");
  const vodOsdTitle = document.getElementById("vodOsdTitle");
  const vodOsdClock = document.getElementById("vodOsdClock");
  const vodProgressBar = document.getElementById("vodProgressBar");
  const vodCurrentTime = document.getElementById("vodCurrentTime");
  const vodDuration = document.getElementById("vodDuration");

  const numZapOverlay = document.getElementById("numZapOverlay");
  const numZapText = document.getElementById("numZapText");

  // Dynamic UI feedback elementen
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
  let allCategories = [];
  let favorites = JSON.parse(localStorage.getItem("iptv_favorites") || "[]");
  let currentModus = "favorites";
  
  let currentLiveRegion = "TR";
  let currentVodRegion = "TR";

  let currentCategoryId = null;
  let currentStreamIndex = 0;
  let currentActiveStreams = [];
  let hlsPlayer = null;
  let osdTimeout = null;
  let vodOsdTimeout = null;
  let isFitScreen = false;
  let movingStreamId = null;

  let numberBuffer = "";
  let numberTimer = null;
  let lastFocusedPoster = null;

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

  function extractRegionFromCategory(catName, isVod) {
    if (!catName) return "";
    if (isVod) {
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

      setupRegions();
      switchModus("favorites");

      // AUTOMATISCH VOLSCHERM AFSPELEN BIJ HET OPENEN VAN DE APP
      if (currentActiveStreams.length > 0) {
        playStream(currentActiveStreams[0].stream_id, currentActiveStreams[0].name, currentActiveStreams[0].stream_icon, 0);
        activeerFitScreen();
      }

    } catch (err) {
      if (isAuto) localStorage.removeItem("iptv_profile");
      if (loginStatus) loginStatus.textContent = "Giriş başarısız.";
      showLoginPage();
    }
  }

  function activeerFitScreen() {
    isFitScreen = true;
    document.body.classList.add("speler-fit-screen");
    if (currentModus === "live" || currentModus === "favorites") {
      showLiveOSD();
    } else if (currentModus === "vod" || currentModus === "series") {
      showVodOSD();
    }
  }

  function deactiveerFitScreen() {
    isFitScreen = false;
    document.body.classList.remove("speler-fit-screen");
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
    const cols = [
      document.getElementById("colModus"),
      document.getElementById("colRegions"),
      document.getElementById("colCategories"),
      document.getElementById("colContent")
    ];

    cols.forEach((col, idx) => {
      if (!col) return;
      if (currentModus === "favorites" && (idx === 1 || idx === 2)) {
        col.classList.add("collapsed");
        return;
      }
      if (idx < activeColIdx) {
        col.classList.add("collapsed");
      } else {
        col.classList.remove("collapsed");
      }
    });
  }

  function setupRegions() {
    if (!regionList) return;
    const isVod = (currentModus === "vod" || currentModus === "series");
    const categoriesToUse = isVod ? vodCategories : allCategories;
    const currentActiveRegion = isVod ? currentVodRegion : currentLiveRegion;

    const regions = new Set();
    categoriesToUse.forEach(cat => {
      const reg = extractRegionFromCategory(cat.category_name, isVod);
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

    const isVod = (currentModus === "vod" || currentModus === "series");
    const categoriesToUse = isVod ? vodCategories : allCategories;
    const activeRegion = isVod ? currentVodRegion : currentLiveRegion;

    const filtered = categoriesToUse.filter(cat => {
      if (activeRegion === "ALL") return true;
      const catRegion = extractRegionFromCategory(cat.category_name, isVod);
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
      
      let streamsToUse = (currentModus === "vod") ? vodStreams : seriesStreams;
      let filteredVod = streamsToUse.filter(s => s.category_id === currentCategoryId);
      if (filteredVod.length === 0) filteredVod = streamsToUse.slice(0, 40);

      filteredVod.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "poster-card focusable";
        div.tabIndex = 0;
        div.dataset.streamId = item.stream_id || item.series_id;
        div.dataset.containerExtension = item.container_extension || "mp4";
        const displayTitle = cleanTitle(item.name || item.title || "");
        div.dataset.title = displayTitle;

        const posterSrc = item.stream_icon || item.cover || "https://picsum.photos/300/450?movie=" + idx;
        div.innerHTML = `
          <img src="${posterSrc}" class="poster-img" onerror="this.src='https://picsum.photos/300/450?movie=${idx}';">
          <div class="poster-info">
            <div class="poster-title">${displayTitle}</div>
            <div class="poster-sub">★ 8.5 / HD</div>
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
        ? `<img src="${s.stream_icon}" class="channel-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="channel-logo-placeholder" style="display:none;">TV</div>`
        : `<div class="channel-logo-placeholder">TV</div>`;

      const starColor = isFav ? '#ffd700' : '#444455';
      const starSvg = `<svg style="width:24px;height:24px;fill:${starColor};min-width:24px;" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;

      li.innerHTML = `
        <span class="channel-number">${numStr}</span>
        ${logoHtml}
        <span class="channel-name">${cleanTitle(s.name)}</span>
        ${starSvg}
      `;
      channelList.appendChild(li);
    });
  }

  function switchModus(modus) {
    currentModus = modus;
    document.querySelectorAll("#modusList .nav-item").forEach(el => el.classList.toggle("active", el.dataset.modus === modus));

    if (headerModeIndicator) {
      const modeTitles = { favorites: "★ FAVORİLER", live: "📺 CANLI TV", vod: "🎬 FİLMLER", series: "🍿 DİZİLER" };
      headerModeIndicator.textContent = modeTitles[modus] || "TV";
    }

    setupRegions();
    if (modus === "favorites") {
      setColumnFocus(0);
      filterChannels();
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

    const directMovieUrl = `${currentAuth.server}/movie/${currentAuth.username}/${currentAuth.password}/${streamId}.${ext || 'mp4'}`;

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.src = directMovieUrl;
    video.play().catch(console.error);
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

    const streamUrl = `${currentAuth.server}/live/${currentAuth.username}/${currentAuth.password}/${streamId}.m3u8`;

    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }

    video.muted = false;
    video.volume = 1.0;

    if (window.Hls && Hls.isSupported()) {
      hlsPlayer = new Hls({ enableWorker: true });
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
      hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(console.error));
    } else {
      video.src = streamUrl;
      video.play().catch(console.error);
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
    } else {
      video.pause();
      if (vodPauseIcon) vodPauseIcon.classList.remove("hidden");
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

  function zapToNumber(num) {
    if (currentActiveStreams.length === 0) return;
    const targetIdx = parseInt(num, 10) - 1;
    if (targetIdx >= 0 && targetIdx < currentActiveStreams.length) {
      const target = currentActiveStreams[targetIdx];
      playStream(target.stream_id, target.name, target.stream_icon, targetIdx);
      showToast(`📺 Zap: #${num} ${cleanTitle(target.name)}`);
    } else {
      showToast(`⚠️ Kanal #${num} bulunamadı`);
    }
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

  function navigateColumn(current, direction) {
    const cols = ["colModus", "colRegions", "colCategories", "colContent"];
    let parentCol = current ? current.closest(".col-nav") : null;

    if (direction === "right" && (!parentCol || parentCol.id === "colContent" || (current && current.closest("#channelList")))) {
      if (currentModus !== "vod" && currentModus !== "series") {
        activeerFitScreen();
      }
      return;
    }

    if (!parentCol) return;

    let currentIndex = parseInt(parentCol.dataset.col, 10);

    if (direction === "left") {
      let targetIndex = (currentModus === "favorites") ? 0 : currentIndex - 1;
      if (targetIndex >= 0 && targetIndex < cols.length) {
        setColumnFocus(targetIndex);
        const targetCol = document.getElementById(cols[targetIndex]);
        const firstFocusable = targetCol ? targetCol.querySelector(".focusable") : null;
        if (firstFocusable) setElementFocus(firstFocusable);
      }
      return;
    }

    let targetIndex = currentIndex + 1;
    if (targetIndex >= 0 && targetIndex < cols.length) {
      if (currentModus === "favorites" && targetIndex === 1) {
        targetIndex = 3;
      }
      setColumnFocus(targetIndex);
      const targetCol = document.getElementById(cols[targetIndex]);
      const firstFocusable = targetCol ? targetCol.querySelector(".focusable") : null;
      if (firstFocusable) setElementFocus(firstFocusable);
    }
  }

  function navigatePosterGrid(current, direction) {
    const posters = Array.from(document.querySelectorAll("#channelList .poster-card"));
    if (posters.length === 0) return;

    const currentRect = current.getBoundingClientRect();
    const currentCenter = currentRect.left + currentRect.width / 2;

    let target = null;
    let minDistance = Infinity;

    posters.forEach(p => {
      if (p === current) return;
      const rect = p.getBoundingClientRect();
      const center = rect.left + rect.width / 2;

      if (direction === "down" && rect.top > currentRect.top + 20) {
        const dist = Math.hypot(center - currentCenter, rect.top - currentRect.top);
        if (dist < minDistance) { minDistance = dist; target = p; }
      } else if (direction === "up" && rect.top < currentRect.top - 20) {
        const dist = Math.hypot(center - currentCenter, currentRect.top - rect.top);
        if (dist < minDistance) { minDistance = dist; target = p; }
      } else if (direction === "right" && Math.abs(rect.top - currentRect.top) < 30 && rect.left > currentRect.left) {
        const dist = rect.left - currentRect.left;
        if (dist < minDistance) { minDistance = dist; target = p; }
      } else if (direction === "left" && Math.abs(rect.top - currentRect.top) < 30 && rect.left < currentRect.left) {
        const dist = currentRect.left - rect.left;
        if (dist < minDistance) { minDistance = dist; target = p; }
      }
    });

    if (target) {
      setElementFocus(target);
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else if (direction === "left") {
      const catCol = document.getElementById("colCategories");
      const activeCat = catCol ? catCol.querySelector(".focusable.active") || catCol.querySelector(".focusable") : null;
      if (activeCat) setElementFocus(activeCat);
    }
  }

  // CLICK LISTENERS
  if (playerWrapper) {
    playerWrapper.addEventListener("click", () => {
      if (currentModus === "live" || currentModus === "favorites") {
        activeerFitScreen();
      }
    });
  }

  if (document.getElementById("modusList")) {
    document.getElementById("modusList").addEventListener("click", e => {
      const li = e.target.closest("li");
      if (li && li.dataset.modus) {
        switchModus(li.dataset.modus);
        setElementFocus(li);
        navigateColumn(li, "right");
      }
    });
  }

  if (regionList) {
    regionList.addEventListener("click", e => {
      const li = e.target.closest("li");
      if (!li || !li.dataset.region) return;
      document.querySelectorAll("#regionList .nav-item").forEach(el => el.classList.remove("active"));
      li.classList.add("active");
      const isVod = (currentModus === "vod" || currentModus === "series");
      if (isVod) currentVodRegion = li.dataset.region;
      else currentLiveRegion = li.dataset.region;
      if (currentModus !== "favorites") filterCategories();
      navigateColumn(li, "right");
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
      navigateColumn(li, "right");
    });
  }

  if (channelList) {
    channelList.addEventListener("click", e => {
      const li = e.target.closest("li, .channel-card, .poster-card");
      if (!li || !li.dataset.streamId) return;
      
      if (currentModus === "vod" || currentModus === "series") {
        lastFocusedPoster = li;
        playVodMovie(li.dataset.streamId, li.dataset.title, li.dataset.containerExtension);
      } else {
        const nameEl = li.querySelector(".channel-name");
        const idx = parseInt(li.dataset.index || "0", 10);
        playStream(li.dataset.streamId, nameEl ? nameEl.textContent : li.textContent, li.dataset.streamIcon, idx);
      }
    });
  }

  // KEYBOARD & NUMPAD HANDLER
  document.addEventListener("keydown", (e) => {
    const key = e.keyCode || e.which;

    const isUp = key === 38 || e.key === "ArrowUp";
    const isDown = key === 40 || e.key === "ArrowDown";
    const isLeft = key === 37 || e.key === "ArrowLeft";
    const isRight = key === 39 || e.key === "ArrowRight";
    const isEnter = key === 13 || e.key === "Enter";

    // KNOPPEN MET VOLLEDIGE KEYCODE & ALIAS DETECTIE
    const isRed = key === 403 || e.key === "F1" || e.key === "Red" || e.code === "F1";
    const isGreen = key === 404 || e.key === "F2" || e.key === "Green" || e.code === "F2";
    const isYellow = key === 405 || e.key === "F3" || e.key === "Yellow" || e.code === "F3";
    const isBlue = key === 406 || e.key === "F4" || e.key === "Blue" || e.code === "F4";

    const isPageUp = key === 33 || e.key === "PageUp" || key === 427 || e.key === "ChannelUp";
    const isPageDown = key === 34 || e.key === "PageDown" || key === 428 || e.key === "ChannelDown";

    const isPause = key === 19 || key === 179 || e.key === "MediaPlayPause" || e.key === "Pause" || e.key === " ";

    let focused = document.activeElement;

    // INLOGSCHERM HANDLER
    if (loginPage && !loginPage.classList.contains("hidden")) {
      const loginFocusables = Array.from(loginForm.querySelectorAll(".focusable"));
      let currentIdx = loginFocusables.indexOf(focused);

      if (isDown) {
        e.preventDefault();
        let nextIdx = (currentIdx + 1) % loginFocusables.length;
        setElementFocus(loginFocusables[nextIdx]);
      } else if (isUp) {
        e.preventDefault();
        let prevIdx = (currentIdx - 1 + loginFocusables.length) % loginFocusables.length;
        setElementFocus(loginFocusables[prevIdx]);
      } else if (isEnter && focused) {
        if (focused.tagName === "BUTTON" || focused.type === "submit") {
          e.preventDefault();
          loginForm.requestSubmit();
        }
      }
      return;
    }

    // GELE KNOP HANDLER (FAVORIET TOGGLE - KEY 405)
    if (isYellow) {
      e.preventDefault();
      let targetStreamId = null;
      if (focused && focused.dataset && focused.dataset.streamId) {
        targetStreamId = focused.dataset.streamId;
      } else if (currentActiveStreams[currentStreamIndex]) {
        targetStreamId = currentActiveStreams[currentStreamIndex].stream_id;
      }
      if (targetStreamId) toggleFavorite(targetStreamId);
      return;
    }

    // RODE KNOP HANDLER (VERPLAATS MODUS TOGGLE - KEY 403)
    if (isRed) {
      e.preventDefault();
      let targetStreamId = null;
      if (focused && focused.dataset && focused.dataset.streamId) {
        targetStreamId = focused.dataset.streamId;
      } else if (currentActiveStreams[currentStreamIndex]) {
        targetStreamId = currentActiveStreams[currentStreamIndex].stream_id;
      }
      if (targetStreamId) toggleMoveMode(targetStreamId);
      return;
    }

    // UNIVERSELE NUMPAD DETECTIE
    let numChar = null;
    if (key >= 48 && key <= 57) {
      numChar = (key - 48).toString();
    } else if (key >= 96 && key <= 105) {
      numChar = (key - 96).toString();
    } else if (e.key && e.key.length === 1 && e.key >= '0' && e.key <= '9') {
      numChar = e.key;
    }

    if (numChar !== null) {
      e.preventDefault();
      numberBuffer += numChar;

      if (numZapText) numZapText.textContent = `#${numberBuffer}`;
      if (numZapOverlay) numZapOverlay.classList.remove("hidden");

      if (numberTimer) clearTimeout(numberTimer);
      numberTimer = setTimeout(() => {
        const num = numberBuffer;
        numberBuffer = "";
        if (numZapOverlay) numZapOverlay.classList.add("hidden");
        zapToNumber(num);
      }, 1200);
      return;
    }

    // FULLSCREEN SPELER HANDLING
    if (isFitScreen) {
      if (currentModus === "vod" || currentModus === "series") {
        if (isPause) {
          e.preventDefault();
          togglePlayPauseVod();
        } else if (isRight) {
          e.preventDefault();
          seekVod(10);
        } else if (isLeft) {
          e.preventDefault();
          seekVod(-10);
        } else if (isEnter || e.key === "Back" || key === 461 || key === 27) {
          e.preventDefault();
          video.pause();
          deactiveerFitScreen();
        }
      } else {
        if (isUp || isPageUp) {
          e.preventDefault();
          currentStreamIndex = (currentStreamIndex + 1) % currentActiveStreams.length;
          const target = currentActiveStreams[currentStreamIndex];
          playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex);
        } else if (isDown || isPageDown) {
          e.preventDefault();
          currentStreamIndex = (currentStreamIndex - 1 + currentActiveStreams.length) % currentActiveStreams.length;
          const target = currentActiveStreams[currentStreamIndex];
          playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex);
        } else if (isLeft || isEnter || e.key === "Back" || key === 461) {
          e.preventDefault();
          deactiveerFitScreen();
        }
      }
      return;
    }
    
    // VERPLAATS MODUS IN FAVORİETEN
    if (movingStreamId && currentModus === "favorites") {
      if (isUp) {
        e.preventDefault();
        stepMoveFavorite(-1);
        return;
      } else if (isDown) {
        e.preventDefault();
        stepMoveFavorite(1);
        return;
      }
    }

    // 2. PAGE UP / PAGE DOWN IN HET MENU
      if (isPageUp) {
        e.preventDefault();
        if (focused && focused.classList.contains("channel-card")) {
          let target = focused;
          for (let i = 0; i < 5; i++) {
            if (target.previousElementSibling && target.previousElementSibling.classList.contains("focusable")) {
              target = target.previousElementSibling;
            }
          }
          setElementFocus(target);
          target.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
        return;
      }

      if (isPageDown) {
        e.preventDefault();
        if (focused && focused.classList.contains("channel-card")) {
          let target = focused;
          for (let i = 0; i < 5; i++) {
            if (target.nextElementSibling && target.nextElementSibling.classList.contains("focusable")) {
              target = target.nextElementSibling;
            }
          }
          setElementFocus(target);
          target.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
        return;
      }

    // MENU NAVIGATIE
    if (!focused || !focused.classList.contains("focusable")) {
      const fallback = lastFocusedPoster || document.querySelector("#channelList .channel-card.active") || document.querySelector(".focusable");
      if (fallback) {
        setElementFocus(fallback);
        focused = fallback;
      }
    }

    if (focused && focused.classList.contains("poster-card")) {
      e.preventDefault();
      if (isRight) navigatePosterGrid(focused, "right");
      else if (isLeft) navigatePosterGrid(focused, "left");
      else if (isDown) navigatePosterGrid(focused, "down");
      else if (isUp) navigatePosterGrid(focused, "up");
      else if (isEnter) focused.click();
      return;
    }

    if (isUp) {
      e.preventDefault();
      let prev = focused.previousElementSibling;
      while (prev && !prev.classList.contains("focusable")) {
        prev = prev.previousElementSibling;
      }
      if (prev) {
        setElementFocus(prev);
        prev.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      return;
    }

    if (isDown) {
      e.preventDefault();
      let next = focused.nextElementSibling;
      while (next && !next.classList.contains("focusable")) {
        next = next.nextElementSibling;
      }
      if (next) {
        setElementFocus(next);
        next.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      return;
    }

    if (isRight) {
      e.preventDefault();
      navigateColumn(focused, "right");
      return;
    }

    if (isLeft) {
      e.preventDefault();
      navigateColumn(focused, "left");
      return;
    }

    if (isEnter && focused) {
      e.preventDefault();
      focused.click();
      return;
    }
  });

  initProfile();
});
