document.addEventListener("DOMContentLoaded", () => {
  // Disk storage can throw on TVs; memory keeps the session working when it does.
  const store = (() => {
    const memory = {};
    let disk = null;
    try {
      disk = window.localStorage;
      disk.getItem("iptv_probe");
    } catch (error) {
      disk = null;
    }
    return {
      getItem(key) {
        try {
          const value = disk ? disk.getItem(key) : null;
          if (value !== null) return value;
        } catch (error) {}
        return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
      },
      setItem(key, value) {
        memory[key] = String(value);
        try { if (disk) disk.setItem(key, String(value)); } catch (error) {}
      },
      removeItem(key) {
        delete memory[key];
        try { if (disk) disk.removeItem(key); } catch (error) {}
      }
    };
  })();

  // Probeer webOS fullscreen API direct bij opstarten
  if (window.webOS && window.webOS.fullScreen) {
    try { window.webOS.fullScreen(true); } catch(e) {}
  }

  const loginPage = document.getElementById("loginPage");
  const appPage = document.getElementById("appPage");
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const autoLoginSplash = document.getElementById("autoLoginSplash");
  const loginStatus = document.getElementById("loginStatus");
  const loginStateButton = document.getElementById("loginStateButton");
  const loginPanelClose = document.getElementById("loginPanelClose");
  const loginErrorToast = document.getElementById("loginErrorToast");
  const loginMethod = document.getElementById("loginMethod");
  const m3uUrlInput = document.getElementById("m3uUrl");
  const xtreamLoginFields = document.getElementById("xtreamLoginFields");
  const m3uLoginFields = document.getElementById("m3uLoginFields");
  const headerClock = document.getElementById("headerClock");

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
  const osdClockBubble = document.getElementById("osdClockBubble");

  const vodOsdContainer = document.getElementById("vodOsdContainer");
  const vodOsdTitle = document.getElementById("vodOsdTitle");
  const vodOsdClock = document.getElementById("vodOsdClock");
  const vodProgressBar = document.getElementById("vodProgressBar");
  const vodCurrentTime = document.getElementById("vodCurrentTime");
  const vodDuration = document.getElementById("vodDuration");

  const numZapOverlay = document.getElementById("numZapOverlay");
  const numZapText = document.getElementById("numZapText");
  const settingsButton = document.getElementById("settingsButton");
  const settingsPanel = document.getElementById("settingsPanel");
  const customizationPage = document.getElementById("customizationPage");
  const autoplayNextToggle = document.getElementById("autoplayNextToggle");
  const backgroundImageInput = document.getElementById("backgroundImageInput");
  const vodPlaybackControls = document.getElementById("vodPlaybackControls");
  const vodPlayPauseIcon = document.getElementById("vodPlayPauseIcon");
  const vodSeekPreview = document.getElementById("vodSeekPreview");

  // Dynamic UI feedback elementen
  let toastMsg = document.getElementById("toastMsg") || createUIElement("toastMsg", "toast-msg");
  let moveBanner = document.getElementById("moveBanner") || createUIElement("moveBanner", "move-banner hidden", "🔴 VERPLAATS-MODUS ACTIEF: Gebruik ⬆/⬇ om te verplaatsen, druk ROOD om te bewaren");
  let currentLang = store.getItem("iptv_lang") || "tr";
  let currentLoginState = "failed";
  const appTranslations = {
    en: {
      settings: "Settings", language: "Language", autoplayNext: "Play next episode automatically", customization: "Customization", switchProfile: "Switch profile", resetApp: "Reset app", close: "Close menu", back: "Back", accentColor: "Accent color", highlightColor: "Highlight color", backgroundImage: "Background image URL", apply: "Apply", removeBackground: "Remove image", done: "Done", previous: "Previous", next: "Next", playPause: "Pause / play", serverUrl: "Server URL", username: "Username", password: "Password", login: "Sign in", connecting: "Connecting to IPTV server...", loginFailed: "Login failed.", modes: "MODES", modeFavorites: "★ Favorites", modeLive: "📺 Live TV", modeMovies: "🎬 Movies", modeSeries: "🍿 Series", region: "REGION", categories: "CATEGORIES", allRegions: "🌍 All regions", channels: "CHANNELS", movies: "MOVIES", series: "SERIES", liveNow: "Live TV", noNextProgram: "No upcoming program", vodHint: "Up: controls | Play/Pause: toggle | Left/Right: seek", backToSeries: "← Back to series", noEpisodes: "No episodes found", loadingEpisodes: "Loading episodes...", unableLoad: "Unable to load episodes", favoritesRemoved: "Removed from favorites", favoritesAdded: "Added to favorites", moveOnlyFavorites: "Move mode is only available in Favorites", moveStarted: "Move mode started", positionSaved: "Position saved", channelNotFound: "Channel #{number} not found", autoplay: "Autoplay next episode", colors: "Colors", backgroundApplied: "Background updated", backgroundRemoved: "Background removed", invalidBackground: "Enter a valid HTTP or HTTPS image URL", previousEpisode: "Previous episode", nextEpisode: "Next episode", profileChanged: "Profile changed", appReset: "App reset", zapped: "Playing channel #{number}: {title}", colorRed: "Red", colorBlue: "Blue", colorGreen: "Green", colorRose: "Rose", colorOrange: "Orange", colorGold: "Gold", colorTurquoise: "Turquoise", colorLime: "Lime", colorSky: "Sky blue"
    },
    tr: {
      settings: "Ayarlar", language: "Dil", autoplayNext: "Sonraki bölümü otomatik oynat", customization: "Özelleştirme", switchProfile: "Profili değiştir", resetApp: "Uygulamayı sıfırla", close: "Menüyü kapat", back: "Geri", accentColor: "Vurgu rengi", highlightColor: "Öne çıkan renk", backgroundImage: "Arka plan görseli URL'si", apply: "Uygula", removeBackground: "Görseli kaldır", done: "Tamam", previous: "Önceki", next: "Sonraki", playPause: "Duraklat / oynat", serverUrl: "Sunucu URL'si", username: "Kullanıcı adı", password: "Şifre", login: "Giriş yap", connecting: "IPTV sunucusuna bağlanılıyor...", loginFailed: "Giriş başarısız.", modes: "MODLAR", modeFavorites: "★ Favoriler", modeLive: "📺 Canlı TV", modeMovies: "🎬 Filmler", modeSeries: "🍿 Diziler", region: "BÖLGE", categories: "KATEGORİLER", allRegions: "🌍 Tüm bölgeler", channels: "KANALLAR", movies: "FİLMLER", series: "DİZİLER", liveNow: "Canlı yayın", noNextProgram: "Sonraki program yok", vodHint: "Yukarı: kontroller | Oynat/Duraklat: değiştir | Sol/Sağ: sar", backToSeries: "← Dizi listesine dön", noEpisodes: "Bölüm bulunamadı", loadingEpisodes: "Bölümler yükleniyor...", unableLoad: "Bölümler yüklenemedi", favoritesRemoved: "Favorilerden çıkarıldı", favoritesAdded: "Favorilere eklendi", moveOnlyFavorites: "Taşıma modu yalnızca Favorilerde kullanılabilir", moveStarted: "Taşıma başladı", positionSaved: "Sıralama kaydedildi", channelNotFound: "#{number} numaralı kanal bulunamadı", autoplay: "Sonraki bölümü otomatik oynat", colors: "Renkler", backgroundApplied: "Arka plan güncellendi", backgroundRemoved: "Arka plan kaldırıldı", invalidBackground: "Geçerli bir HTTP veya HTTPS görsel URL'si girin", previousEpisode: "Önceki bölüm", nextEpisode: "Sonraki bölüm", profileChanged: "Profil değiştirildi", appReset: "Uygulama sıfırlandı", zapped: "Kanal #{number} açılıyor: {title}", colorRed: "Kırmızı", colorBlue: "Mavi", colorGreen: "Yeşil", colorRose: "Pembe", colorOrange: "Turuncu", colorGold: "Altın", colorTurquoise: "Turkuaz", colorLime: "Fıstık yeşili", colorSky: "Gök mavisi"
    },
    nl: {
      settings: "Instellingen", language: "Taal", autoplayNext: "Volgende aflevering automatisch afspelen", customization: "Aanpassen", switchProfile: "Profiel wisselen", resetApp: "App resetten", close: "Menu sluiten", back: "Terug", accentColor: "Accentkleur", highlightColor: "Markeringskleur", backgroundImage: "URL van achtergrondafbeelding", apply: "Toepassen", removeBackground: "Afbeelding verwijderen", done: "Gereed", previous: "Vorige", next: "Volgende", playPause: "Pauzeren / afspelen", serverUrl: "Server-URL", username: "Gebruikersnaam", password: "Wachtwoord", login: "Inloggen", connecting: "Verbinden met IPTV-server...", loginFailed: "Inloggen mislukt.", modes: "MODI", modeFavorites: "★ Favorieten", modeLive: "📺 Live-tv", modeMovies: "🎬 Films", modeSeries: "🍿 Series", region: "REGIO", categories: "CATEGORIEËN", allRegions: "🌍 Alle regio's", channels: "KANALEN", movies: "FILMS", series: "SERIES", liveNow: "Live-uitzending", noNextProgram: "Geen volgend programma", vodHint: "Omhoog: bediening | Afspelen/Pauze: wisselen | Links/Rechts: zoeken", backToSeries: "← Terug naar series", noEpisodes: "Geen afleveringen gevonden", loadingEpisodes: "Afleveringen laden...", unableLoad: "Afleveringen laden mislukt", favoritesRemoved: "Verwijderd uit favorieten", favoritesAdded: "Toegevoegd aan favorieten", moveOnlyFavorites: "Verplaatsen kan alleen in Favorieten", moveStarted: "Verplaatsen gestart", positionSaved: "Positie opgeslagen", channelNotFound: "Kanaal #{number} niet gevonden", autoplay: "Volgende aflevering automatisch afspelen", colors: "Kleuren", backgroundApplied: "Achtergrond bijgewerkt", backgroundRemoved: "Achtergrond verwijderd", invalidBackground: "Voer een geldige HTTP- of HTTPS-afbeeldings-URL in", previousEpisode: "Vorige aflevering", nextEpisode: "Volgende aflevering", profileChanged: "Profiel gewijzigd", appReset: "App gereset", zapped: "Kanaal #{number} wordt afgespeeld: {title}", colorRed: "Rood", colorBlue: "Blauw", colorGreen: "Groen", colorRose: "Roze", colorOrange: "Oranje", colorGold: "Goud", colorTurquoise: "Turquoise", colorLime: "Limoen", colorSky: "Hemelsblauw"
    },
    fr: {
      settings: "Paramètres", language: "Langue", autoplayNext: "Lire automatiquement l’épisode suivant", customization: "Personnalisation", switchProfile: "Changer de profil", resetApp: "Réinitialiser l’application", close: "Fermer le menu", back: "Retour", accentColor: "Couleur d’accentuation", highlightColor: "Couleur de surbrillance", backgroundImage: "URL de l’image d’arrière-plan", apply: "Appliquer", removeBackground: "Supprimer l’image", done: "Terminé", previous: "Précédent", next: "Suivant", playPause: "Pause / lecture", serverUrl: "URL du serveur", username: "Nom d’utilisateur", password: "Mot de passe", login: "Connexion", connecting: "Connexion au serveur IPTV...", loginFailed: "Échec de la connexion.", modes: "MODES", modeFavorites: "★ Favoris", modeLive: "📺 TV en direct", modeMovies: "🎬 Films", modeSeries: "🍿 Séries", region: "RÉGION", categories: "CATÉGORIES", allRegions: "🌍 Toutes les régions", channels: "CHAÎNES", movies: "FILMS", series: "SÉRIES", liveNow: "En direct", noNextProgram: "Aucun programme suivant", vodHint: "Haut : commandes | Lecture/Pause : basculer | Gauche/Droite : avancer", backToSeries: "← Retour aux séries", noEpisodes: "Aucun épisode trouvé", loadingEpisodes: "Chargement des épisodes...", unableLoad: "Impossible de charger les épisodes", favoritesRemoved: "Retiré des favoris", favoritesAdded: "Ajouté aux favoris", moveOnlyFavorites: "Le déplacement est réservé aux Favoris", moveStarted: "Déplacement commencé", positionSaved: "Position enregistrée", channelNotFound: "Chaîne #{number} introuvable", autoplay: "Lire automatiquement l’épisode suivant", colors: "Couleurs", backgroundApplied: "Arrière-plan mis à jour", backgroundRemoved: "Arrière-plan supprimé", invalidBackground: "Saisissez une URL d’image HTTP ou HTTPS valide", previousEpisode: "Épisode précédent", nextEpisode: "Épisode suivant", profileChanged: "Profil modifié", appReset: "Application réinitialisée", zapped: "Lecture de la chaîne #{number} : {title}", colorRed: "Rouge", colorBlue: "Bleu", colorGreen: "Vert", colorRose: "Rose", colorOrange: "Orange", colorGold: "Or", colorTurquoise: "Turquoise", colorLime: "Citron vert", colorSky: "Bleu ciel"
    }
  };

  Object.assign(appTranslations.en, { backgroundPlaceholder: "https://example.com/image.jpg", moveBanner: "MOVE MODE: Use Up/Down to reorder, Red to save", season: "Season {number}", episode: "Episode {number}", channelZap: "CHANNEL ZAP" });
  Object.assign(appTranslations.tr, { backgroundPlaceholder: "https://example.com/image.jpg", moveBanner: "TAŞIMA MODU: Yukarı/Aşağı ile sırala, kaydetmek için Kırmızı tuşa bas", season: "{number}. Sezon", episode: "{number}. Bölüm", channelZap: "KANAL DEĞİŞTİR" });
  Object.assign(appTranslations.nl, { backgroundPlaceholder: "https://example.com/image.jpg", moveBanner: "VERPLAATSEN: Gebruik Omhoog/Omlaag om te sorteren, druk op Rood om op te slaan", season: "Seizoen {number}", episode: "Aflevering {number}", channelZap: "KANAAL ZAPPEN" });
  Object.assign(appTranslations.fr, { backgroundPlaceholder: "https://example.com/image.jpg", moveBanner: "DÉPLACEMENT : utilisez Haut/Bas pour réorganiser, appuyez sur Rouge pour enregistrer", season: "Saison {number}", episode: "Épisode {number}", channelZap: "CHANGEMENT DE CHAÎNE" });

  Object.assign(appTranslations.en, { providerLogin: "Provider login", loginMethod: "Login method", xtreamCodes: "Xtream Codes", m3uPlaylist: "M3U playlist URL", m3uUrl: "Playlist URL", loggingIn: "Logging in", loggedIn: "Logged in", loginRequired: "Login failed", noSavedProfile: "No saved profile. Enter your provider details.", invalidCredentials: "The provider rejected the username or password.", playlistUnavailable: "The playlist could not be loaded.", playlistInvalid: "The URL did not return a valid M3U playlist.", loginErrorToast: "Login failed: {reason}" });
  Object.assign(appTranslations.tr, { providerLogin: "Sağlayıcı girişi", loginMethod: "Giriş yöntemi", xtreamCodes: "Xtream Codes", m3uPlaylist: "M3U oynatma listesi URL'si", m3uUrl: "Oynatma listesi URL'si", loggingIn: "Giriş yapılıyor", loggedIn: "Giriş başarılı", loginRequired: "Giriş başarısız", noSavedProfile: "Kayıtlı profil yok. Sağlayıcı bilgilerini girin.", invalidCredentials: "Sağlayıcı kullanıcı adı veya parolayı kabul etmedi.", playlistUnavailable: "Oynatma listesi yüklenemedi.", playlistInvalid: "URL geçerli bir M3U oynatma listesi döndürmedi.", loginErrorToast: "Giriş başarısız: {reason}" });
  Object.assign(appTranslations.nl, { providerLogin: "Provider aanmelden", loginMethod: "Aanmeldmethode", xtreamCodes: "Xtream Codes", m3uPlaylist: "M3U-afspeellijst-URL", m3uUrl: "Afspeellijst-URL", loggingIn: "Aanmelden", loggedIn: "Aangemeld", loginRequired: "Aanmelden mislukt", noSavedProfile: "Geen opgeslagen profiel. Vul je providergegevens in.", invalidCredentials: "De provider heeft de gebruikersnaam of het wachtwoord geweigerd.", playlistUnavailable: "De afspeellijst kon niet worden geladen.", playlistInvalid: "De URL bevat geen geldige M3U-afspeellijst.", loginErrorToast: "Aanmelden mislukt: {reason}" });
  Object.assign(appTranslations.fr, { providerLogin: "Connexion au fournisseur", loginMethod: "Méthode de connexion", xtreamCodes: "Xtream Codes", m3uPlaylist: "URL de playlist M3U", m3uUrl: "URL de la playlist", loggingIn: "Connexion en cours", loggedIn: "Connecté", loginRequired: "Échec de connexion", noSavedProfile: "Aucun profil enregistré. Saisissez vos identifiants fournisseur.", invalidCredentials: "Le fournisseur a refusé le nom d’utilisateur ou le mot de passe.", playlistUnavailable: "Impossible de charger la playlist.", playlistInvalid: "L’URL ne renvoie pas une playlist M3U valide.", loginErrorToast: "Échec de connexion : {reason}" });
  Object.assign(appTranslations.en, { streamPlaybackFailed: "This stream could not be played. Try the provider's HLS URL or a compatible stream format." });
  Object.assign(appTranslations.tr, { streamPlaybackFailed: "Bu yayın oynatılamadı. Sağlayıcının HLS URL'sini veya uyumlu bir yayın biçimini deneyin." });
  Object.assign(appTranslations.nl, { streamPlaybackFailed: "Deze stream kan niet worden afgespeeld. Probeer de HLS-URL van de provider of een compatibel formaat." });
  Object.assign(appTranslations.fr, { streamPlaybackFailed: "Impossible de lire ce flux. Essayez l’URL HLS du fournisseur ou un format compatible." });

  function t(key, values = {}) {
    let text = (appTranslations[currentLang] && appTranslations[currentLang][key]) || appTranslations.en[key] || key;
    Object.keys(values).forEach(name => {
      text = text.replace(`{${name}}`, values[name]);
    });
    return text;
  }
  let autoplayNext = store.getItem("iptv_autoplay_next") === "true";
  let currentEpisodeId = null;
  let seekPreviewTime = null;
  let seekTimer = null;

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
  let seriesCategories = [];
  let seriesStreams = [];
  let selectedSeries = null;
  let currentVodItems = [];
  let currentVodMovieId = null;
  let allCategories = [];
  function readFavorites(key) {
    try {
      const saved = JSON.parse(store.getItem(key));
      return Array.isArray(saved) ? saved.map(String) : null;
    } catch (error) {
      return null;
    }
  }

  function saveFavorites(list) {
    const serialized = JSON.stringify(list);
    store.setItem("iptv_favorites", serialized);
    store.setItem("iptv_favorites_backup", serialized);
  }

  function loadFavorites() {
    const primary = readFavorites("iptv_favorites");
    const backup = readFavorites("iptv_favorites_backup");
    const saved = primary !== null ? primary : (backup || []);
    saveFavorites(saved);
    return saved;
  }

  let favorites = loadFavorites();
  let currentModus = "favorites";
  
  let currentLiveRegion = "TR";
  let currentVodRegion = "TR";

  let currentCategoryId = null;
  let currentStreamIndex = 0;
  let currentPlayingStreamId = null;
  let currentActiveStreams = [];
  let hlsPlayer = null;
  let mpegTsPlayer = null;
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

  function setLoginState(state) {
    currentLoginState = state;
    if (loginStateButton) loginStateButton.dataset.state = state;
    if (loginStatus) {
      const stateKeys = { failed: "loginFailed", logging: "loggingIn", "logged-in": "loggedIn" };
      loginStatus.textContent = t(stateKeys[state] || "loginFailed");
      if (state === "logged-in" && currentAuth) loginStatus.textContent += currentAuth.provider === "m3u" ? " · M3U" : " · Xtream";
    }
    if (state === "failed") toggleLoginPanel(true, true);
  }

  function showLoginError(message) {
    setLoginErrorMessage(t("loginErrorToast", { reason: message || t("playlistUnavailable") }));
    showToast(t("loginErrorToast", { reason: message || t("playlistUnavailable") }));
  }

  function setLoginErrorMessage(message) {
    if (loginErrorToast) {
      if (!message) {
        loginErrorToast.textContent = "";
        loginErrorToast.classList.add("hidden");
        return;
      }
      loginErrorToast.textContent = message;
      loginErrorToast.classList.remove("hidden");
    }
  }

  function toggleLoginPanel(show, focusInput = false) {
    if (!loginForm || !loginStateButton) return;
    const shouldShow = show === undefined ? loginForm.classList.contains("hidden") : show;
    loginForm.classList.toggle("hidden", !shouldShow);
    loginStateButton.setAttribute("aria-expanded", String(shouldShow));
    if (shouldShow && focusInput) {
      const firstInput = loginForm.querySelector(".focusable:not([type='hidden'])");
      if (firstInput) setElementFocus(firstInput);
    }
  }

  function toggleSettingsMenu(forceOpen = null) {
    if (!settingsPanel || !settingsButton) return;
    const shouldOpen = forceOpen !== null ? forceOpen : settingsPanel.classList.contains("hidden");
    if (shouldOpen && isFitScreen) {
      isFitScreen = false;
      document.body.classList.remove("speler-fit-screen");
    }
    settingsPanel.classList.toggle("hidden", !shouldOpen);
    settingsButton.setAttribute("aria-expanded", String(shouldOpen));
    if (shouldOpen) {
      const firstItem = settingsPanel.querySelector(".settings-item");
      if (firstItem) setElementFocus(firstItem);
    } else if (appPage && !appPage.classList.contains("hidden")) {
      setElementFocus(settingsButton);
    }
  }

  function updateSettingsSelection() {
    if (!settingsPanel) return;
    const items = settingsPanel.querySelectorAll(".settings-item[data-setting='language']");
    items.forEach(item => {
      const isActive = item.dataset.value === currentLang;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
  }

  function applyAppLanguage(lang) {
    currentLang = appTranslations[lang] ? lang : "en";
    store.setItem("iptv_lang", currentLang);
    document.documentElement.lang = currentLang;
    updateSettingsSelection();
    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(element => {
      element.setAttribute("aria-label", t(element.dataset.i18nAria));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(element => {
      element.title = t(element.dataset.i18nTitle);
    });
    if (settingsButton) settingsButton.textContent = `⚙ ${t("settings")}`;
    if (headerModeIndicator) {
      const modeKeys = { favorites: "modeFavorites", live: "modeLive", vod: "modeMovies", series: "modeSeries" };
      headerModeIndicator.textContent = t(modeKeys[currentModus]);
    }
    if (contentTitle) {
      contentTitle.textContent = selectedSeries ? selectedSeries.title : t(currentModus === "vod" ? "movies" : currentModus === "series" ? "series" : "channels");
    }
    if (selectedSeries && !isFitScreen) {
      selectedSeries.seasons.forEach(season => {
        season.name = season.number ? t("season", { number: season.number }) : t("series");
      });
      renderSeriesEpisodes();
    }
    if (autoplayNextToggle) autoplayNextToggle.checked = autoplayNext;
    if (moveBanner) moveBanner.textContent = t("moveBanner");
  }

  function loadThemeConfig() {
    try {
      const saved = JSON.parse(store.getItem("iptv_theme") || "{}");
      let backgroundImage = "";
      if (typeof saved.backgroundImage === "string" && saved.backgroundImage) {
        const parsed = new URL(saved.backgroundImage);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") backgroundImage = parsed.href;
      }
      return {
        accent: /^#[0-9a-f]{6}$/i.test(saved.accent || "") ? saved.accent : "#e50914",
        highlight: /^#[0-9a-f]{6}$/i.test(saved.highlight || "") ? saved.highlight : "#ffd700",
        backgroundImage
      };
    } catch (error) {
      return { accent: "#e50914", highlight: "#ffd700", backgroundImage: "" };
    }
  }

  let themeConfig = loadThemeConfig();

  function applyThemeConfig() {
    const root = document.documentElement;
    const toRgb = color => color.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16)).join(", ");
    root.style.setProperty("--accent", themeConfig.accent);
    root.style.setProperty("--accent-rgb", toRgb(themeConfig.accent));
    root.style.setProperty("--highlight", themeConfig.highlight);
    root.style.setProperty("--highlight-rgb", toRgb(themeConfig.highlight));

    document.querySelectorAll(".color-swatch").forEach(swatch => {
      const selected = themeConfig[swatch.dataset.colorRole] === swatch.dataset.color;
      swatch.style.setProperty("--swatch-color", swatch.dataset.color);
      swatch.classList.toggle("selected", selected);
      swatch.setAttribute("aria-pressed", String(selected));
    });
    if (backgroundImageInput) backgroundImageInput.value = themeConfig.backgroundImage;

    if (appPage) {
      if (themeConfig.backgroundImage) {
        const imageUrl = new URL(themeConfig.backgroundImage);
        appPage.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.66)), url("${imageUrl.href}")`;
        appPage.style.backgroundSize = "cover";
        appPage.style.backgroundPosition = "center";
      } else {
        appPage.style.backgroundImage = "none";
      }
    }
    store.setItem("iptv_theme", JSON.stringify(themeConfig));
  }

  function updateThemeColor(role, color) {
    if ((role !== "accent" && role !== "highlight") || !/^#[0-9a-f]{6}$/i.test(color || "")) return;
    themeConfig[role] = color;
    applyThemeConfig();
  }

  function updateBackgroundImage(value) {
    const url = value.trim();
    if (!url) {
      themeConfig.backgroundImage = "";
    } else {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Unsupported image URL");
        themeConfig.backgroundImage = parsed.href;
      } catch (error) {
        showToast(t("invalidBackground"));
        return;
      }
    }
    applyThemeConfig();
    showToast(t(url ? "backgroundApplied" : "backgroundRemoved"));
  }

  function showCustomizationPage(show) {
    if (!customizationPage) return;
    customizationPage.classList.toggle("hidden", !show);
    if (show) {
      toggleSettingsMenu(false);
      customizationPage.classList.remove("hidden");
      setElementFocus(customizationPage.querySelector(".color-swatch"));
    } else {
      settingsPanel.classList.remove("hidden");
      settingsButton.setAttribute("aria-expanded", "true");
      setElementFocus(settingsPanel.querySelector(".settings-item[data-setting='customization']"));
    }
  }

  function handleSettingsAction(action, value = null) {
    switch (action) {
      case "language":
        applyAppLanguage(value);
        showToast(`🌐 ${value.toUpperCase()}`);
        return;
      case "customization":
        showCustomizationPage(true);
        return;
      case "switchProfile":
        store.removeItem("iptv_profile");
        currentAuth = null;
        showLoginPage();
        showToast(t("profileChanged"));
        break;
      case "close":
      default:
        toggleSettingsMenu(false);
        setElementFocus(document.querySelector("#modusList [data-modus='favorites']"));
        return;
    }
    toggleSettingsMenu(false);
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

  const updateClocks = () => {
    const now = new Date();
    const clockStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (headerClock) headerClock.textContent = clockStr;
    if (osdClock) osdClock.textContent = clockStr;
    if (vodOsdClock) vodOsdClock.textContent = clockStr;
  };
  updateClocks();
  setInterval(updateClocks, 1000);

  video.addEventListener("timeupdate", () => {
    if (video.duration && isFinite(video.duration)) {
      const displayedTime = seekPreviewTime === null ? video.currentTime : seekPreviewTime;
      const pct = (displayedTime / video.duration) * 100;
      if (vodProgressBar) vodProgressBar.style.width = `${pct}%`;
      if (vodCurrentTime) vodCurrentTime.textContent = formatTime(displayedTime);
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

  const loginDraftFields = { method: loginMethod, server: serverUrlInput, username: usernameInput, password: passwordInput, m3u: m3uUrlInput };

  function saveLoginDraft() {
    const draft = {};
    Object.keys(loginDraftFields).forEach((name) => {
      if (loginDraftFields[name]) draft[name] = loginDraftFields[name].value;
    });
    store.setItem("iptv_login_draft", JSON.stringify(draft));
  }

  function restoreLoginDraft() {
    try {
      const draft = JSON.parse(store.getItem("iptv_login_draft") || "{}");
      Object.keys(loginDraftFields).forEach((name) => {
        if (loginDraftFields[name] && typeof draft[name] === "string" && draft[name]) loginDraftFields[name].value = draft[name];
      });
      if (loginMethod) loginMethod.dispatchEvent(new Event("change"));
    } catch (error) {}
  }

  Object.keys(loginDraftFields).forEach((name) => {
    const field = loginDraftFields[name];
    if (!field) return;
    field.addEventListener("input", saveLoginDraft);
    field.addEventListener("change", saveLoginDraft);
  });

  function initProfile() {
    showAppPage();
    restoreLoginDraft();
    const saved = store.getItem("iptv_profile");
    if (saved) {
      try {
        currentAuth = JSON.parse(saved);
        if (currentAuth.provider === "m3u") {
          if (loginMethod) loginMethod.value = "m3u";
          if (m3uUrlInput) m3uUrlInput.value = currentAuth.playlistUrl || "";
          if (m3uLoginFields) m3uLoginFields.classList.remove("hidden");
          if (xtreamLoginFields) xtreamLoginFields.classList.add("hidden");
          const cachedFavorites = loadFavoriteCache();
          if (cachedFavorites.length > 0 && favorites.length > 0) {
            // Show favorites from the cache now; the full playlist refreshes behind it.
            allStreams = cachedFavorites;
            allCategories = [];
            currentLiveRegion = "ALL";
            setLoginState("logging");
            switchModus("favorites");
            if (currentActiveStreams.length > 0) {
              const first = currentActiveStreams[0];
              playStream(first.stream_id, first.name, first.stream_icon, 0, first.url);
              activeerFitScreen();
            }
            login(currentAuth.playlistUrl, "", "", true, "m3u", true);
          } else {
            login(currentAuth.playlistUrl, "", "", true, "m3u");
          }
        } else {
          if (loginMethod) loginMethod.value = "xtream";
          if (serverUrlInput) serverUrlInput.value = currentAuth.server || "";
          if (usernameInput) usernameInput.value = currentAuth.username || "";
          if (passwordInput) passwordInput.value = currentAuth.password || "";
          login(currentAuth.server, currentAuth.username, currentAuth.password, true, "xtream");
        }
        return;
      } catch (e) {
        setLoginState("failed");
        showLoginError(e.message);
      }
    }
    const defaults = window.KC_DEFAULT_LOGIN;
    if (!saved && defaults && defaults.server && defaults.username && defaults.password) {
      if (serverUrlInput) serverUrlInput.value = defaults.server;
      if (usernameInput) usernameInput.value = defaults.username;
      if (passwordInput) passwordInput.value = defaults.password;
      login(defaults.server, defaults.username, defaults.password, true, "xtream");
      return;
    }
    setLoginState("failed");
    if (!saved) setLoginErrorMessage(t("noSavedProfile"));
  }

  function showLoginPage() {
    showAppPage();
    setLoginState("failed");
    toggleLoginPanel(true, true);
  }

  function showAppPage() {
    if (appPage) appPage.classList.remove("hidden");
    toggleLoginPanel(false);
    setElementFocus(document.querySelector("#modusList [data-modus='favorites']"));
  }

  if (settingsButton && settingsPanel) {
    settingsButton.addEventListener("click", () => {
      toggleSettingsMenu();
    });

    settingsPanel.addEventListener("click", (e) => {
      const btn = e.target.closest(".settings-item");
      if (!btn) return;
      const setting = btn.dataset.setting;
      const value = btn.dataset.value || null;
      handleSettingsAction(setting, value);
    });
  }

  if (loginStateButton) {
    loginStateButton.addEventListener("click", () => {
      const shouldOpen = loginForm.classList.contains("hidden");
      toggleLoginPanel(shouldOpen, shouldOpen);
    });
  }

  if (loginPanelClose) loginPanelClose.addEventListener("click", () => toggleLoginPanel(false));

  if (loginMethod) {
    loginMethod.addEventListener("change", () => {
      const useM3u = loginMethod.value === "m3u";
      if (m3uLoginFields) m3uLoginFields.classList.toggle("hidden", !useM3u);
      if (xtreamLoginFields) xtreamLoginFields.classList.toggle("hidden", useM3u);
      setLoginErrorMessage("");
    });
  }

  if (vodPlaybackControls) {
    vodPlaybackControls.addEventListener("click", e => {
      const control = e.target.closest("[data-vod-control]");
      if (!control) return;
      if (control.dataset.vodControl === "toggle") togglePlayPauseVod();
      else if (control.dataset.vodControl === "previous") playAdjacentVod(-1);
      else if (control.dataset.vodControl === "next") playAdjacentVod(1);
      showVodControls();
    });
  }

  if (autoplayNextToggle) {
    autoplayNextToggle.checked = autoplayNext;
    autoplayNextToggle.addEventListener("change", () => {
      autoplayNext = autoplayNextToggle.checked;
      store.setItem("iptv_autoplay_next", String(autoplayNext));
    });
  }

  if (customizationPage) {
    customizationPage.addEventListener("click", e => {
      const swatch = e.target.closest(".color-swatch");
      if (swatch) {
        updateThemeColor(swatch.dataset.colorRole, swatch.dataset.color);
      }
    });
  }

  const applyBackgroundButton = document.getElementById("applyBackgroundButton");
  const clearBackgroundButton = document.getElementById("clearBackgroundButton");
  const customizationBack = document.getElementById("customizationBack");
  const customizationDone = document.getElementById("customizationDone");
  if (applyBackgroundButton) applyBackgroundButton.addEventListener("click", () => updateBackgroundImage(backgroundImageInput.value));
  if (clearBackgroundButton) clearBackgroundButton.addEventListener("click", () => updateBackgroundImage(""));
  if (customizationBack) customizationBack.addEventListener("click", () => showCustomizationPage(false));
  if (customizationDone) customizationDone.addEventListener("click", () => showCustomizationPage(false));

  applyThemeConfig();
  applyAppLanguage(currentLang);

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (loginMethod && loginMethod.value === "m3u") {
        login(m3uUrlInput.value.trim(), "", "", false, "m3u");
      } else {
        let server = serverUrlInput.value.trim();
        if (server && !/^https?:\/\//i.test(server)) server = `http://${server}`;
        server = server.replace(/\/+$/, "");
        login(server, usernameInput.value.trim(), passwordInput.value.trim(), false, "xtream");
      }
    });
  }

  function parseM3UPlaylist(text) {
    const streams = [];
    const categoryNames = new Set();
    let pending = null;

    text.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("#EXTINF:")) {
        const groupMatch = trimmed.match(/group-title="([^"]*)"/i);
        const logoMatch = trimmed.match(/tvg-logo="([^"]*)"/i);
        const comma = trimmed.indexOf(",");
        pending = {
          name: comma >= 0 ? trimmed.slice(comma + 1).trim() : "Channel",
          stream_icon: logoMatch ? logoMatch[1] : "",
          category_id: groupMatch && groupMatch[1] ? groupMatch[1] : "M3U"
        };
        categoryNames.add(pending.category_id);
      } else if (trimmed && !trimmed.startsWith("#") && pending) {
        const streamId = String(streams.length + 1);
        streams.push(Object.assign({}, pending, { stream_id: streamId, url: trimmed }));
        pending = null;
      }
    });

    return {
      streams,
      categories: Array.from(categoryNames).map(name => ({ category_id: name, category_name: name }))
    };
  }

  function cacheFavoriteStreams() {
    const wanted = {};
    favorites.forEach((id) => { wanted[String(id)] = true; });
    const subset = allStreams.filter((s) => wanted[String(s.stream_id)]);
    store.setItem("iptv_fav_cache", JSON.stringify(subset));
  }

  function loadFavoriteCache() {
    try {
      const list = JSON.parse(store.getItem("iptv_fav_cache") || "[]");
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  async function login(server, username, password, isAuto = false, provider = "xtream", background = false) {
    if (loginErrorToast) loginErrorToast.classList.add("hidden");
    if (loginBtn) loginBtn.disabled = true;
    setLoginState("logging");

    try {
      let startMode = "favorites";
      if (provider === "m3u") {
        if (!server) throw new Error(t("playlistUnavailable"));
        const response = await fetch(server);
        if (!response.ok) throw new Error(`${t("playlistUnavailable")} (${response.status})`);
        const content = await response.text();
        if (content.replace(/^\s+/, "").indexOf("#EXTM3U") !== 0) throw new Error(t("playlistInvalid"));
        const playlist = parseM3UPlaylist(content);
        if (playlist.streams.length === 0) throw new Error(t("playlistInvalid"));

        allStreams = playlist.streams;
        allCategories = playlist.categories;
        vodStreams = [];
        vodCategories = [];
        seriesStreams = [];
        seriesCategories = [];
        currentAuth = { provider: "m3u", playlistUrl: server };
        currentLiveRegion = "ALL";
        startMode = "favorites";
      } else {
        if (!server || !username || !password) throw new Error(t("invalidCredentials"));
        const credentials = new URLSearchParams({ username, password });
        const apiBase = `${server.replace(/\/+$/, "")}/player_api.php?${credentials}`;
        // Some providers return an empty body on the first or oversized request.
        // XHR instead of fetch: the TV's fetch returned empty bodies for this provider.
        const requestText = (url) => new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.timeout = 120000;
          xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText || "" });
          xhr.onerror = () => resolve({ status: 0, body: "", failed: "network" });
          xhr.ontimeout = () => resolve({ status: 0, body: "", failed: "timeout" });
          xhr.send();
        });
        const fetchApi = async (action) => {
          let info = "";
          for (let attempt = 0; attempt < 1; attempt++) {
            const result = await requestText(apiBase + (action ? `&action=${action}` : ""));
            if (result.status === 200 && result.body.trim()) {
              try { return JSON.parse(result.body); } catch (error) { info = `bad JSON, ${result.body.length}B: ${result.body.slice(0, 30)}`; }
            } else {
              info = `HTTP ${result.status}${result.failed ? " " + result.failed : ""}, ${result.body.length}B`;
            }
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
          throw new Error(`${t("playlistUnavailable")} (${info}, ${action || "auth"})`);
        };

        // This provider's account reply can arrive empty on the TV, so it only counts when it parses.
        try {
          const account = await fetchApi("");
          if (account && account.user_info && Number(account.user_info.auth) === 0) throw new Error(t("invalidCredentials"));
        } catch (error) {
          if (error.message === t("invalidCredentials")) throw error;
        }
        const categories = await fetchApi("get_live_categories");
        if (!Array.isArray(categories)) throw new Error(t("invalidCredentials"));
        const streams = await fetchApi("get_live_streams");
        if (!Array.isArray(streams)) throw new Error(t("invalidCredentials"));

        allCategories = categories;
        allStreams = streams;
        currentAuth = { provider: "xtream", server, username, password };
        try {
          const vodCatRes = await fetch(`${server}/player_api.php?${credentials}&action=get_vod_categories`);
          const vodStreamRes = await fetch(`${server}/player_api.php?${credentials}&action=get_vod_streams`);
          vodCategories = vodCatRes.ok ? await vodCatRes.json() : [];
          vodStreams = vodStreamRes.ok ? await vodStreamRes.json() : [];
        } catch (error) {
          vodCategories = [];
          vodStreams = [];
        }
        try {
          const seriesCatRes = await fetch(`${server}/player_api.php?${credentials}&action=get_series_categories`);
          const seriesRes = await fetch(`${server}/player_api.php?${credentials}&action=get_series`);
          const seriesCatData = seriesCatRes.ok ? await seriesCatRes.json() : [];
          const seriesData = seriesRes.ok ? await seriesRes.json() : [];
          seriesCategories = Array.isArray(seriesCatData) ? seriesCatData : [];
          seriesStreams = Array.isArray(seriesData) ? seriesData : [];
        } catch (error) {
          seriesCategories = [];
          seriesStreams = [];
        }
      }

      store.setItem("iptv_profile", JSON.stringify(currentAuth));
      cacheFavoriteStreams();
      setLoginState("logged-in");
      if (background) {
        setupRegions();
        if (currentModus === "favorites") filterChannels();
        return;
      }
      showAppPage();
      switchModus(startMode);

      if (currentActiveStreams.length > 0) {
        const firstStream = currentActiveStreams[0];
        playStream(firstStream.stream_id, firstStream.name, firstStream.stream_icon, 0, firstStream.url);
        activeerFitScreen();
      }
    } catch (error) {
      if (provider === "xtream" && server && username && password) {
        // The TV can't read this provider's API, but its M3U playlist works.
        const params = new URLSearchParams({ username, password, type: "m3u_plus", output: "ts" });
        return login(`${server.replace(/\/+$/, "")}/get.php?${params}`, "", "", isAuto, "m3u", background);
      }
      setLoginState("failed");
      showLoginError(error.message || t("playlistUnavailable"));
      toggleLoginPanel(true);
    } finally {
      if (loginBtn) loginBtn.disabled = false;
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
    const categoriesToUse = currentModus === "series"
      ? (seriesCategories.length ? seriesCategories : vodCategories)
      : (isVod ? vodCategories : allCategories);

    const regions = new Set();
    categoriesToUse.forEach(cat => {
      const reg = extractRegionFromCategory(cat.category_name, isVod);
      if (reg) regions.add(reg);
    });

    let currentActiveRegion = isVod ? currentVodRegion : currentLiveRegion;
    if (currentActiveRegion !== "ALL" && !regions.has(currentActiveRegion)) {
      currentActiveRegion = "ALL";
      if (isVod) currentVodRegion = currentActiveRegion;
      else currentLiveRegion = currentActiveRegion;
    }

    const topRegions = ["TR", "NL", "BE", "PL", "EXYU"];
    const activeTop = topRegions.filter(r => regions.has(r));
    const otherRegions = Array.from(regions).filter(r => !topRegions.includes(r)).sort();
    
    regionList.innerHTML = `<li class="nav-item focusable" data-region="ALL" tabindex="0">${t("allRegions")}</li>`;

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
    const categoriesToUse = currentModus === "series"
      ? (seriesCategories.length ? seriesCategories : vodCategories)
      : (isVod ? vodCategories : allCategories);
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

  function renderSeriesEpisodes() {
    channelList.innerHTML = "";
    channelList.className = "netflix-grid";
    contentTitle.textContent = selectedSeries.title;

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "series-back grid-item focusable";
    backButton.dataset.action = "series-back";
    backButton.tabIndex = 0;
    backButton.textContent = t("backToSeries");
    channelList.appendChild(backButton);

    if (!selectedSeries.seasons || selectedSeries.seasons.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "season-heading";
      emptyState.textContent = t("noEpisodes");
      channelList.appendChild(emptyState);
      return;
    }

    selectedSeries.seasons.forEach(season => {
      const heading = document.createElement("div");
      heading.className = "season-heading";
      heading.textContent = season.name;
      channelList.appendChild(heading);

      season.episodes.forEach(episode => {
        const episodeId = episode.id || episode.stream_id;
        if (!episodeId) return;
        const card = document.createElement("button");
        card.type = "button";
        card.className = "episode-card grid-item focusable";
        card.dataset.episodeId = episodeId;
        card.dataset.containerExtension = episode.container_extension || episode.container || "mp4";
        card.dataset.title = episode.title || episode.name || `Episode ${episode.episode_num || ""}`;
        card.tabIndex = 0;

        const episodeNumber = document.createElement("span");
        episodeNumber.className = "episode-number";
        episodeNumber.textContent = `${season.name} · ${t("episode", { number: episode.episode_num || "?" })}`;
        const episodeTitle = document.createElement("span");
        episodeTitle.className = "episode-title";
        episodeTitle.textContent = card.dataset.title;
        card.append(episodeNumber, episodeTitle);
        channelList.appendChild(card);
      });
    });
  }

  async function openSeries(seriesCard) {
    const seriesId = seriesCard.dataset.seriesId;
    if (!seriesId || !currentAuth) return;

    selectedSeries = { id: seriesId, title: seriesCard.dataset.title, seasons: [] };
    channelList.innerHTML = "";
    contentTitle.textContent = selectedSeries.title;
    const loading = document.createElement("div");
    loading.className = "season-heading";
    loading.textContent = t("loadingEpisodes");
    channelList.appendChild(loading);

    try {
      const url = `${currentAuth.server}/player_api.php?username=${currentAuth.username}&password=${currentAuth.password}&action=get_series_info&series_id=${encodeURIComponent(seriesId)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Series details unavailable");
      const info = await response.json();
      const episodes = info.episodes || {};
      const seasonKeys = Array.isArray(episodes) ? ["Episodes"] : Object.keys(episodes).sort((a, b) => Number(a) - Number(b));

      selectedSeries.seasons = seasonKeys.map(seasonKey => {
        const seasonEpisodes = Array.isArray(episodes) ? episodes : episodes[seasonKey];
        return {
          number: Array.isArray(episodes) ? "" : seasonKey,
          name: Array.isArray(episodes) ? "Episodes" : `Season ${seasonKey}`,
          episodes: Array.isArray(seasonEpisodes) ? seasonEpisodes : []
        };
      }).filter(season => season.episodes.length > 0);
      renderSeriesEpisodes();
      const firstEpisode = channelList.querySelector(".episode-card");
      setElementFocus(firstEpisode || channelList.querySelector(".series-back"));
    } catch (error) {
      selectedSeries = null;
      filterChannels();
      showToast(t("unableLoad"));
    }
  }

  function filterChannels() {
    if (!channelList) return;
    channelList.innerHTML = "";

    if (currentModus === "vod" || currentModus === "series") {
      playerWrapper.classList.add("hidden");
      colContent.classList.add("vod-mode-active");
      channelList.className = "netflix-grid";
      contentTitle.textContent = t(currentModus === "vod" ? "movies" : "series");

      if (currentModus === "series" && selectedSeries) {
        renderSeriesEpisodes();
        return;
      }
      
      let streamsToUse = (currentModus === "vod") ? vodStreams : seriesStreams;
      let filteredVod = streamsToUse.filter(s => String(s.category_id) === String(currentCategoryId));
      if (filteredVod.length === 0) filteredVod = streamsToUse.slice(0, 40);
      currentVodItems = currentModus === "vod" ? filteredVod : [];

      filteredVod.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "poster-card grid-item focusable";
        div.tabIndex = 0;
        if (currentModus === "series") {
          div.dataset.seriesId = item.series_id || item.stream_id;
        } else {
          div.dataset.streamId = item.stream_id;
        }
        div.dataset.containerExtension = item.container_extension || "mp4";
        const displayTitle = cleanTitle(item.name || item.title || "");
        div.dataset.title = displayTitle;

        const posterSrc = item.stream_icon || item.cover || "https://picsum.photos/300/450?movie=" + idx;
        div.innerHTML = `
          <img src="${posterSrc}" class="poster-img" onerror="this.src='https://picsum.photos/300/450?movie=${idx}';">
          <div class="poster-info">
            <div class="poster-title">${displayTitle}</div>
          </div>
        `;
        channelList.appendChild(div);
      });
      return;
    }

    playerWrapper.classList.remove("hidden");
    colContent.classList.remove("vod-mode-active");
    channelList.className = "channel-grid";
    contentTitle.textContent = t("channels");

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
      li.dataset.streamUrl = s.url || "";
      li.tabIndex = 0;

      const numStr = (idx + 1).toString();
      const logoHtml = s.stream_icon 
        ? `<img src="${s.stream_icon}" class="channel-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="channel-logo-placeholder" style="display:none;">TV</div>`
        : `<div class="channel-logo-placeholder">TV</div>`;

      const starColor = isFav ? "var(--highlight)" : "#444455";
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
    if (modus !== currentModus) selectedSeries = null;
    currentModus = modus;
    document.body.classList.toggle("favorites-mode", modus === "favorites");
    document.querySelectorAll("#modusList .nav-item").forEach(el => el.classList.toggle("active", el.dataset.modus === modus));

    if (headerModeIndicator) {
      const modeKeys = { favorites: "modeFavorites", live: "modeLive", vod: "modeMovies", series: "modeSeries" };
      headerModeIndicator.textContent = t(modeKeys[modus]) || "TV";
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
      showToast(`⭐ ${t("favoritesRemoved")}`);
    } else {
      favorites.push(sId);
      showToast(`⭐ ${t("favoritesAdded")}`);
    }
    saveFavorites(favorites);
    cacheFavoriteStreams();
    filterChannels();
  }

  function toggleMoveMode(streamId) {
    if (currentModus !== "favorites") {
      showToast(`⚠️ ${t("moveOnlyFavorites")}`);
      return;
    }
    if (!streamId) return;
    const sId = streamId.toString();
    if (!movingStreamId) {
      movingStreamId = sId;
      moveBanner.classList.remove("hidden");
      showToast(`🔴 ${t("moveStarted")}`);
    } else {
      movingStreamId = null;
      moveBanner.classList.add("hidden");
      showToast(`✅ ${t("positionSaved")}`);
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
      saveFavorites(favorites);
      filterChannels();
      const targetCard = document.querySelector(`#channelList [data-stream-id="${movingStreamId}"]`);
      if (targetCard) {
        setElementFocus(targetCard);
        targetCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }

  async function fetchEPGData(streamId) {
    if (!streamId || !currentAuth || currentAuth.provider === "m3u") return;
    try {
      const res = await fetch(`${currentAuth.server}/player_api.php?username=${currentAuth.username}&password=${currentAuth.password}&action=get_short_epg&stream_id=${streamId}&limit=3`);
      const data = await res.json();
      if (data && data.epg_listings && data.epg_listings.length > 0) {
        const epgs = data.epg_listings;
        const b64 = (str) => { try { return decodeURIComponent(escape(atob(str))); } catch(e) { return str; } };

        const cTitle = b64(epgs[0].title || t("liveNow"));
        const cTime = `${epgs[0].start ? epgs[0].start.substring(11,16) : ""} - ${epgs[0].end ? epgs[0].end.substring(11,16) : ""}`;

        document.getElementById("epgCurrTitle").textContent = cTitle;
        document.getElementById("epgCurrTime").textContent = cTime;
        if (osdEpgCurrTitle) osdEpgCurrTitle.textContent = cTitle;
        if (osdEpgCurrTime) osdEpgCurrTime.textContent = cTime;

        if (epgs[1]) {
          const nTitle = b64(epgs[1].title || t("noNextProgram"));
          const nTime = `${epgs[1].start ? epgs[1].start.substring(11,16) : ""}`;
          document.getElementById("epgNextTitle").textContent = nTitle;
          document.getElementById("epgNextTime").textContent = nTime;
          if (osdEpgNextTitle) osdEpgNextTitle.textContent = nTitle;
          if (osdEpgNextTime) osdEpgNextTime.textContent = nTime;
        }
        return;
      }
    } catch(e) {}
    
    document.getElementById("epgCurrTitle").textContent = t("liveNow");
    document.getElementById("epgCurrTime").textContent = "--:--";
    document.getElementById("epgNextTitle").textContent = t("noNextProgram");
    document.getElementById("epgNextTime").textContent = "--:--";

    if (osdEpgCurrTitle) osdEpgCurrTitle.textContent = t("liveNow");
    if (osdEpgCurrTime) osdEpgCurrTime.textContent = "--:--";
    if (osdEpgNextTitle) osdEpgNextTitle.textContent = t("noNextProgram");
    if (osdEpgNextTime) osdEpgNextTime.textContent = "--:--";
  }

  function destroyStreamPlayers() {
    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }
    if (mpegTsPlayer) {
      mpegTsPlayer.destroy();
      mpegTsPlayer = null;
    }
  }

  function playVodMovie(streamId, title, ext) {
    currentVodMovieId = String(streamId);
    currentEpisodeId = null;
    playerWrapper.classList.remove("hidden");
    activeerFitScreen();
    if (vodOsdTitle) vodOsdTitle.textContent = title;
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    showVodOSD();

    destroyStreamPlayers();

    video.muted = false;
    video.volume = 1.0;

    const directMovieUrl = `${currentAuth.server}/movie/${currentAuth.username}/${currentAuth.password}/${streamId}.${ext || 'mp4'}`;

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.src = directMovieUrl;
    video.play().catch(console.error);
  }

  function playSeriesEpisode(episodeId, title, ext) {
    currentEpisodeId = String(episodeId);
    currentVodMovieId = null;
    playerWrapper.classList.remove("hidden");
    activeerFitScreen();
    if (vodOsdTitle) vodOsdTitle.textContent = title;
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    showVodOSD();

    destroyStreamPlayers();

    video.muted = false;
    video.volume = 1.0;
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.src = `${currentAuth.server}/series/${currentAuth.username}/${currentAuth.password}/${episodeId}.${ext || "mp4"}`;
    video.play().catch(console.error);
  }

  function playStream(streamId, name, icon, index, directUrl = "") {
    if (index !== undefined) currentStreamIndex = index;
    currentPlayingStreamId = String(streamId);

    const activeLi = document.querySelector(`#channelList [data-stream-id="${streamId}"]`);
    if (activeLi) {
      document.querySelectorAll("#channelList .channel-card").forEach(el => el.classList.remove("active"));
      activeLi.classList.add("active");
    }

    const numStr = (currentStreamIndex + 1).toString();
    updateLiveOSDData(numStr, name, icon);
    showLiveOSD();
    fetchEPGData(streamId);

    const streamUrl = directUrl || `${currentAuth.server}/live/${currentAuth.username}/${currentAuth.password}/${streamId}.m3u8`;
    const isTransportStream = Boolean(directUrl && /\.ts(?:$|[?#])/i.test(directUrl));
    const hlsUrl = isTransportStream ? streamUrl.replace(/\.ts(?=([?#]|$))/i, ".m3u8") : streamUrl;

    destroyStreamPlayers();

    video.muted = false;
    video.volume = 1.0;

    if (isTransportStream && window.mpegts && mpegts.isSupported()) {
      mpegTsPlayer = mpegts.createPlayer({ type: "mpegts", isLive: true, url: streamUrl });
      mpegTsPlayer.on(mpegts.Events.ERROR, (type, detail) => {
        console.error("MPEG-TS playback error", type, detail);
        showToast(t("streamPlaybackFailed"));
      });
      mpegTsPlayer.attachMediaElement(video);
      mpegTsPlayer.load();
      Promise.resolve(mpegTsPlayer.play()).catch(error => {
        console.error(error);
        showToast(t("streamPlaybackFailed"));
      });
    } else if (window.Hls && Hls.isSupported() && /\.m3u8(?:$|[?#])/i.test(hlsUrl)) {
      hlsPlayer = new Hls({ enableWorker: true });
      hlsPlayer.loadSource(hlsUrl);
      hlsPlayer.attachMedia(video);
      hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(console.error));
    } else {
      video.src = hlsUrl;
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
    if (osdClockBubble) osdClockBubble.classList.remove("hidden");
    if (osdTimeout) clearTimeout(osdTimeout);
    osdTimeout = setTimeout(() => {
      if (osdContainer) osdContainer.classList.add("hidden");
      if (osdClockBubble) osdClockBubble.classList.add("hidden");
    }, 4500);
  }

  function showVodOSD() {
    if (vodOsdContainer) vodOsdContainer.classList.remove("hidden");
    if (vodOsdTimeout) clearTimeout(vodOsdTimeout);
    vodOsdTimeout = setTimeout(() => {
      if (vodOsdContainer) vodOsdContainer.classList.add("hidden");
      if (vodPlaybackControls) {
        vodPlaybackControls.classList.add("hidden");
        if (vodPlaybackControls.contains(document.activeElement)) {
          document.activeElement.blur();
          document.activeElement.classList.remove("focused");
        }
      }
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
    updateVodPlayPauseIcon();
    showVodOSD();
  }

  function updateVodPlayPauseIcon() {
    if (vodPlayPauseIcon) vodPlayPauseIcon.textContent = video.paused ? "▶" : "⏸";
  }

  function showVodControls(focusToggle = false) {
    if (!vodPlaybackControls) return;
    vodPlaybackControls.classList.remove("hidden");
    updateVodPlayPauseIcon();
    if (focusToggle) setElementFocus(vodPlaybackControls.querySelector("[data-vod-control='toggle']"));
    showVodOSD();
  }

  function seriesEpisodes() {
    if (!selectedSeries || !selectedSeries.seasons) return [];
    return selectedSeries.seasons.flatMap(season => season.episodes || []);
  }

  function playAdjacentVod(direction) {
    if (currentModus === "series") {
      const episodes = seriesEpisodes();
      const currentIndex = episodes.findIndex(episode => String(episode.id || episode.stream_id) === String(currentEpisodeId));
      const nextEpisode = episodes[currentIndex + direction];
      if (!nextEpisode) return false;
      const episodeId = nextEpisode.id || nextEpisode.stream_id;
      const title = nextEpisode.title || nextEpisode.name || t("episode", { number: nextEpisode.episode_num || "?" });
      playSeriesEpisode(episodeId, title, nextEpisode.container_extension || nextEpisode.container);
      return true;
    }

    const currentIndex = currentVodItems.findIndex(movie => String(movie.stream_id) === String(currentVodMovieId));
    const nextMovie = currentVodItems[currentIndex + direction];
    if (!nextMovie) return false;
    playVodMovie(nextMovie.stream_id, cleanTitle(nextMovie.name), nextMovie.container_extension);
    return true;
  }

  function queueVodSeek(direction) {
    if (!video.duration || !isFinite(video.duration)) return;
    const baseTime = seekPreviewTime === null ? video.currentTime : seekPreviewTime;
    seekPreviewTime = Math.max(0, Math.min(video.duration, baseTime + direction * 10));
    if (vodSeekPreview) {
      vodSeekPreview.textContent = `${direction < 0 ? "◀" : "▶"} ${formatTime(seekPreviewTime)}`;
      vodSeekPreview.classList.remove("hidden");
    }
    if (vodProgressBar) vodProgressBar.style.width = `${(seekPreviewTime / video.duration) * 100}%`;
    if (vodCurrentTime) vodCurrentTime.textContent = formatTime(seekPreviewTime);
    if (seekTimer) clearTimeout(seekTimer);
    seekTimer = setTimeout(commitVodSeek, 450);
    showVodOSD();
  }

  function commitVodSeek() {
    if (seekPreviewTime === null) return;
    video.currentTime = seekPreviewTime;
    seekPreviewTime = null;
    if (vodSeekPreview) vodSeekPreview.classList.add("hidden");
    showVodControls();
  }

  video.addEventListener("ended", () => {
    if (currentModus === "series" && autoplayNext && playAdjacentVod(1)) return;
    showVodControls();
  });

  video.addEventListener("play", updateVodPlayPauseIcon);
  video.addEventListener("pause", updateVodPlayPauseIcon);

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
      playStream(target.stream_id, target.name, target.stream_icon, targetIdx, target.url);
      showToast(`📺 ${t("zapped", { number: num, title: cleanTitle(target.name) })}`);
    } else {
      showToast(`⚠️ ${t("channelNotFound", { number: num })}`);
    }
  }

  function setElementFocus(element) {
    if (!element) return;
    document.querySelectorAll(".focusable").forEach(el => el.classList.remove("focused"));
    element.classList.add("focused");
    element.focus();

    if (element.classList.contains("grid-item")) {
      lastFocusedPoster = element;
    }

    const parentCol = element.closest(".col-nav");
    if (parentCol && parentCol.dataset.col !== undefined) {
      setColumnFocus(parseInt(parentCol.dataset.col, 10));
    }
  }

  function moveFocusByDirection(current, direction, scope) {
    const candidates = Array.from(scope.querySelectorAll(".focusable"))
      .filter(element => element !== current && !element.disabled && element.getClientRects().length > 0);
    if (!current || candidates.length === 0) return;

    const rect = current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let best = null;
    let bestScore = Infinity;
    candidates.forEach(element => {
      const candidateRect = element.getBoundingClientRect();
      const dx = candidateRect.left + candidateRect.width / 2 - centerX;
      const dy = candidateRect.top + candidateRect.height / 2 - centerY;
      const primary = direction === "left" ? -dx : direction === "right" ? dx : direction === "up" ? -dy : dy;
      const cross = direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx);
      if (primary <= 0) return;
      const score = primary + cross * 1.8;
      if (score < bestScore) {
        best = element;
        bestScore = score;
      }
    });
    if (best) setElementFocus(best);
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
    const posters = Array.from(document.querySelectorAll("#channelList .grid-item"));
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
      const li = e.target.closest("li, .channel-card, .grid-item");
      if (!li) return;

      if (li.dataset.action === "series-back") {
        selectedSeries = null;
        filterChannels();
        setElementFocus(channelList.querySelector(".poster-card"));
        return;
      }

      if (li.dataset.episodeId && currentModus === "series") {
        lastFocusedPoster = li;
        playSeriesEpisode(li.dataset.episodeId, li.dataset.title, li.dataset.containerExtension);
        return;
      }

      if (currentModus === "series") {
        lastFocusedPoster = li;
        openSeries(li);
        return;
      }

      if (!li.dataset.streamId) return;
      if (currentModus === "vod") {
        lastFocusedPoster = li;
        playVodMovie(li.dataset.streamId, li.dataset.title, li.dataset.containerExtension);
      } else {
        const selectedStreamId = String(li.dataset.streamId);
        if ((currentModus === "live" || currentModus === "favorites") && !isFitScreen && currentPlayingStreamId === selectedStreamId) {
          activeerFitScreen();
          return;
        }
        const nameEl = li.querySelector(".channel-name");
        const idx = parseInt(li.dataset.index || "0", 10);
        playStream(li.dataset.streamId, nameEl ? nameEl.textContent : li.textContent, li.dataset.streamIcon, idx, li.dataset.streamUrl);
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

    const isPlayPause = key === 179 || e.key === "MediaPlayPause" || e.key === " ";
    const isPause = key === 19 || key === 474 || e.key === "Pause" || e.key === "MediaPause";
    const isPlay = key === 415 || e.key === "MediaPlay";
    const isFastForward = key === 417 || e.key === "MediaFastForward" || e.key === "FastForward";
    const isRewind = key === 412 || e.key === "MediaRewind" || e.key === "Rewind";

    let focused = document.activeElement;

    // Login panel: step through visible fields in order
    if (loginForm && !loginForm.classList.contains("hidden") && loginForm.contains(focused)) {
      const fields = Array.from(loginForm.querySelectorAll(".focusable")).filter((el) => el.offsetParent !== null);
      const idx = fields.indexOf(focused);
      if (isDown || isUp) {
        e.preventDefault();
        const step = isDown ? 1 : -1;
        const next = Math.max(0, Math.min(fields.length - 1, idx + step));
        setElementFocus(fields[next]);
      } else if ((isLeft || isRight) && focused === loginMethod) {
        e.preventDefault();
        const count = loginMethod.options.length;
        loginMethod.selectedIndex = (loginMethod.selectedIndex + (isRight ? 1 : -1) + count) % count;
        loginMethod.dispatchEvent(new Event("change"));
      } else if (isEnter && focused === loginBtn) {
        e.preventDefault();
        loginForm.requestSubmit ? loginForm.requestSubmit() : loginBtn.click();
      } else if (e.key === "Escape" || key === 27 || e.key === "Back" || key === 461) {
        e.preventDefault();
        toggleLoginPanel(false);
        setElementFocus(loginStateButton);
      }
      return;
    }

    if (customizationPage && !customizationPage.classList.contains("hidden")) {
      if (e.key === "Escape" || key === 27 || e.key === "Back" || key === 461) {
        e.preventDefault();
        showCustomizationPage(false);
      } else if (isUp || isDown || isLeft || isRight) {
        e.preventDefault();
        moveFocusByDirection(focused, isUp ? "up" : isDown ? "down" : isLeft ? "left" : "right", customizationPage);
      } else if (isEnter && focused) {
        e.preventDefault();
        if (focused === backgroundImageInput) updateBackgroundImage(backgroundImageInput.value);
        else focused.click();
      }
      return;
    }

    if (settingsPanel && !settingsPanel.classList.contains("hidden")) {
      const settingsItems = Array.from(settingsPanel.querySelectorAll(".settings-item, #autoplayNextToggle"));
      const settingsIndex = settingsItems.indexOf(focused);
      if (e.key === "Escape" || key === 27 || e.key === "Back" || key === 461) {
        e.preventDefault();
        toggleSettingsMenu(false);
        return;
      }
      if (isUp || isDown) {
        e.preventDefault();
        const step = isDown ? 1 : -1;
        const nextIndex = (settingsIndex + step + settingsItems.length) % settingsItems.length;
        setElementFocus(settingsItems[nextIndex]);
        return;
      }
      if (isLeft || isRight) {
        const languageItems = Array.from(settingsPanel.querySelectorAll("[data-setting='language']"));
        const languageIndex = languageItems.indexOf(focused);
        if (languageIndex >= 0) {
          e.preventDefault();
          const step = isRight ? 1 : -1;
          const nextIndex = (languageIndex + step + languageItems.length) % languageItems.length;
          setElementFocus(languageItems[nextIndex]);
          return;
        }
      }
      if (isEnter && settingsIndex >= 0) {
        e.preventDefault();
        focused.click();
        return;
      }
    }

    const isVodMode = currentModus === "vod" || currentModus === "series";
    if (vodPlaybackControls && !vodPlaybackControls.classList.contains("hidden") && isVodMode) {
      if (e.key === "Escape" || key === 27 || e.key === "Back" || key === 461 || isDown) {
        e.preventDefault();
        vodPlaybackControls.classList.add("hidden");
        return;
      }
      if (isLeft || isRight) {
        e.preventDefault();
        moveFocusByDirection(focused, isLeft ? "left" : "right", vodPlaybackControls);
        return;
      }
      if (isEnter && vodPlaybackControls.contains(focused)) {
        e.preventDefault();
        focused.click();
        return;
      }
    }

    if (isVodMode && (isPlayPause || isPause || isPlay || isFastForward || isRewind)) {
      e.preventDefault();
      if (isPlayPause) togglePlayPauseVod();
      else if (isPause) video.pause();
      else if (isPlay) video.play().catch(console.error);
      else queueVodSeek(isFastForward ? 1 : -1);
      showVodControls();
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

    if (e.key === "s" || e.key === "S" || e.key === "Settings" || key === 83 || key === 115 || key === 457) {
      e.preventDefault();
      toggleSettingsMenu();
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

    if (isUp && focused && focused.dataset.modus === "favorites" && !movingStreamId) {
      e.preventDefault();
      toggleSettingsMenu(true);
      return;
    }

    // FULLSCREEN SPELER HANDLING
    if (isFitScreen) {
      if (currentModus === "vod" || currentModus === "series") {
        if (isUp) {
          e.preventDefault();
          showVodControls(true);
        } else if (isRight) {
          e.preventDefault();
          queueVodSeek(1);
        } else if (isLeft) {
          e.preventDefault();
          queueVodSeek(-1);
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
          playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex, target.url);
        } else if (isDown || isPageDown) {
          e.preventDefault();
          currentStreamIndex = (currentStreamIndex - 1 + currentActiveStreams.length) % currentActiveStreams.length;
          const target = currentActiveStreams[currentStreamIndex];
          playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex, target.url);
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

    if (focused && focused.classList.contains("grid-item")) {
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

  document.addEventListener("keyup", e => {
    if (seekPreviewTime === null || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    if (seekTimer) clearTimeout(seekTimer);
    commitVodSeek();
  });

  initProfile();
});
