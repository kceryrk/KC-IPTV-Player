// Polyfill missing DOM methods on older Smart TV browsers (webOS 3/4)
if (typeof Element !== "undefined") {
  if (!Element.prototype.append) {
    Element.prototype.append = function() {
      for (var i = 0; i < arguments.length; i++) {
        var item = arguments[i];
        if (typeof item === "string") {
          this.appendChild(document.createTextNode(item));
        } else if (item && item.nodeType) {
          this.appendChild(item);
        }
      }
    };
  }
  if (!Element.prototype.remove) {
    Element.prototype.remove = function() {
      if (this.parentNode) this.parentNode.removeChild(this);
    };
  }
}

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
  const hintBar = document.getElementById("hintBar");
  const searchPanel = document.getElementById("searchPanel");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchEmpty = document.getElementById("searchEmpty");
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
  const m3uProfileSelect = document.getElementById("m3uProfile");
  const m3uProfileNameInput = document.getElementById("m3uProfileName");
  const headerClock = document.getElementById("headerClock");

  const serverUrlInput = document.getElementById("serverUrl");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginRevealBtn = document.getElementById("loginRevealBtn");
  const loginAccount = document.getElementById("loginAccount");
  const loginAccountRows = document.getElementById("loginAccountRows");

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
  const osdDate = document.getElementById("osdDate");
  const osdEpgCurrTime = document.getElementById("osdEpgCurrTime");
  const osdEpgCurrTitle = document.getElementById("osdEpgCurrTitle");
  const osdEpgCurrDesc = document.getElementById("osdEpgCurrDesc");
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
  const settingsPanel = document.getElementById("settingsPage");
  const customizationPage = settingsPanel;
  const focusWidthRange = document.getElementById("focusWidthRange");
  const focusWidthValue = document.getElementById("focusWidthValue");
  const autoplayNextToggle = document.getElementById("autoplayNextToggle");
  const showEpgToggle = document.getElementById("showEpgToggle");
  const hideRegionsToggle = document.getElementById("hideRegionsToggle");
  const backgroundImageInput = document.getElementById("backgroundImageInput");
  const vodPlaybackControls = document.getElementById("vodPlaybackControls");
  const vodPlayPauseIcon = document.getElementById("vodPlayPauseIcon");
  const vodSeekPreview = document.getElementById("vodSeekPreview");

  // Top Bar Center Navigation & Stremio Page Elements
  const headerNavSelector = document.getElementById("headerNavSelector");
  const headerTabIptv = document.getElementById("headerTabIptv");
  const headerTabStremio = document.getElementById("headerTabStremio");
  const headerTabSettings = document.getElementById("headerTabSettings");
  const tvGrid = document.querySelector(".tv-grid");
  const stremioPage = document.getElementById("stremioPage");
  const stremioHeroBackdrop = document.getElementById("stremioHeroBackdrop");
  const stremioSidebarDock = document.getElementById("stremioSidebarDock");
  const sideTv = document.getElementById("sideTv");
  const sideMovies = document.getElementById("sideMovies");
  const sideSeries = document.getElementById("sideSeries");
  const stremioScrollContainer = document.getElementById("stremioScrollContainer");
  const stremioSubpageMovies = document.getElementById("stremioSubpageMovies");
  const stremioSubpageSeries = document.getElementById("stremioSubpageSeries");
  const stremioSubpageTv = document.getElementById("stremioSubpageTv");
  const stremioRowLive = document.getElementById("stremioRowLive");
  const stremioGridLive = document.getElementById("stremioGridLive");
  const stremioCountLive = document.getElementById("stremioCountLive");
  const stremioLiveCatBar = document.getElementById("stremioLiveCatBar");

  const stremioStripPopular = document.getElementById("stremioStripPopular");
  const stremioStripNewlyAdded = document.getElementById("stremioStripNewlyAdded");
  const stremioStripAction = document.getElementById("stremioStripAction");
  const stremioCountAction = document.getElementById("stremioCountAction");
  const stremioStripComedy = document.getElementById("stremioStripComedy");
  const stremioCountComedy = document.getElementById("stremioCountComedy");
  const stremioStripSciFi = document.getElementById("stremioStripSciFi");
  const stremioCountSciFi = document.getElementById("stremioCountSciFi");

  const stremioStripSeries = document.getElementById("stremioStripSeries");
  const stremioStripAnimationSeries = document.getElementById("stremioStripAnimationSeries");
  const stremioCountAnimationSeries = document.getElementById("stremioCountAnimationSeries");
  const stremioStripCrimeSeries = document.getElementById("stremioStripCrimeSeries");
  const stremioCountCrimeSeries = document.getElementById("stremioCountCrimeSeries");
  const stremioStripComedySeries = document.getElementById("stremioStripComedySeries");
  const stremioCountComedySeries = document.getElementById("stremioCountComedySeries");

  const stremioCountPopular = document.getElementById("stremioCountPopular");
  const stremioMoviePillsGrid = document.getElementById("stremioMoviePillsGrid");
  const stremioSeriesPillsGrid = document.getElementById("stremioSeriesPillsGrid");
  const stremioEmpty = document.getElementById("stremioEmpty");
  const stremioGoAddonsBtn = document.getElementById("stremioGoAddonsBtn");
  const autoResumeLastChannelToggle = document.getElementById("autoResumeLastChannelToggle");

  let currentAppSection = "iptv";
  let previousAppSection = "iptv";
  let currentStremioSubpage = "movies";
  let currentStremioType = "movie";
  let currentStremioCatalogId = null;
  let streamSelectorOpener = null;
  let currentStremioItems = [];

  // Dynamic UI feedback elementen
  let toastMsg = document.getElementById("toastMsg") || createUIElement("toastMsg", "toast-msg");
  let moveBanner = document.getElementById("moveBanner") || createUIElement("moveBanner", "move-banner hidden", "🔴 VERPLAATS-MODUS ACTIEF: Gebruik ⬆/⬇ om te verplaatsen, druk ROOD om te bewaren");
  let currentLang = store.getItem("iptv_lang") || "tr";
  let currentLoginState = "failed";
  const appTranslations = {
    en: {
      addonsTab: "Addons",
      generalTab: "General", playbackTab: "Playback", profileTab: "Source", progressCategories: "Loading categories", progressPlaylist: "Downloading playlist", progressParsing: "Reading channels", streamFailed: "Channel error: {reason}", streamTimedOut: "Channel did not start within 20 s: {reason}", streamNoData: "no data received", settings: "Settings", language: "Language", autoplayNext: "Play next episode automatically", customization: "Customization", switchProfile: "Change source", resetApp: "Reset app", close: "Close menu", back: "Back", accentColor: "Primary color", highlightColor: "Secondary color", bgTintLabel: "Background tint", backgroundImage: "Background image URL", apply: "Apply", removeBackground: "Remove image", done: "Done", previous: "Previous", next: "Next", playPause: "Pause / play", serverUrl: "Server URL", username: "Username", password: "Password", login: "Sign in", connecting: "Connecting to IPTV server...", loginFailed: "Login failed.", modes: "MODES", modeFavorites: "Favorites", modeLive: "Live TV", modeMovies: "Movies", modeSeries: "Series", region: "COUNTRY", categories: "CATEGORIES", allRegions: "ALL", channels: "CHANNELS", movies: "MOVIES", series: "SERIES", liveNow: "Live TV", noNextProgram: "No upcoming program", vodHint: "Up: controls | Play/Pause: toggle | Left/Right: seek", backToSeries: "← Back to series", noEpisodes: "No episodes found", loadingEpisodes: "Loading episodes...", unableLoad: "Unable to load episodes", favoritesRemoved: "Removed from favorites", favoritesAdded: "Added to favorites", moveOnlyFavorites: "Move mode is only available in Favorites", moveStarted: "Move mode started", positionSaved: "Position saved", channelNotFound: "Channel #{number} not found", autoplay: "Autoplay next episode", colors: "Colors", backgroundApplied: "Background updated", backgroundRemoved: "Background removed", invalidBackground: "Enter a valid HTTP or HTTPS image URL", previousEpisode: "Previous episode", nextEpisode: "Next episode", profileChanged: "Profile changed", appReset: "App reset", zapped: "Playing channel #{number}: {title}", colorRed: "Red", colorBlue: "Blue", colorGreen: "Green", colorRose: "Rose", colorOrange: "Orange", colorGold: "Gold", colorTurquoise: "Turquoise", colorLime: "Lime", colorSky: "Sky blue"
    },
    tr: {
      addonsTab: "Eklentiler",
      generalTab: "Genel", playbackTab: "Oynatma", profileTab: "Kaynak", progressCategories: "Kategoriler yükleniyor", progressPlaylist: "Playlist indiriliyor", progressParsing: "Kanallar okunuyor", streamFailed: "Kanal hatası: {reason}", streamTimedOut: "Kanal 20 sn içinde açılmadı: {reason}", streamNoData: "veri alınamadı", settings: "Ayarlar", language: "Dil", autoplayNext: "Sonraki bölümü otomatik oynat", customization: "Özelleştirme", switchProfile: "Kaynağı değiştir", resetApp: "Uygulamayı sıfırla", close: "Menüyü kapat", back: "Geri", accentColor: "Birincil renk", highlightColor: "İkincil renk", bgTintLabel: "Arka plan karartması", backgroundImage: "Arka plan görseli URL'si", apply: "Uygula", removeBackground: "Görseli kaldır", done: "Tamam", previous: "Önceki", next: "Sonraki", playPause: "Duraklat / oynat", serverUrl: "Sunucu URL'si", username: "Kullanıcı adı", password: "Şifre", login: "Giriş yap", connecting: "IPTV sunucusuna bağlanılıyor...", loginFailed: "Giriş başarısız.", modes: "MODLAR", modeFavorites: "Favoriler", modeLive: "Canlı TV", modeMovies: "Filmler", modeSeries: "Diziler", region: "ÜLKE", categories: "KATEGORİLER", allRegions: "TÜMÜ", channels: "KANALLAR", movies: "FİLMLER", series: "DİZİLER", liveNow: "Canlı yayın", noNextProgram: "Sonraki program yok", vodHint: "Yukarı: kontroller | Oynat/Duraklat: değiştir | Sol/Sağ: sar", backToSeries: "← Dizi listesine dön", noEpisodes: "Bölüm bulunamadı", loadingEpisodes: "Bölümler yükleniyor...", unableLoad: "Bölümler yüklenemedi", favoritesRemoved: "Favorilerden çıkarıldı", favoritesAdded: "Favorilere eklendi", moveOnlyFavorites: "Taşıma modu yalnızca Favorilerde kullanılabilir", moveStarted: "Taşıma başladı", positionSaved: "Sıralama kaydedildi", channelNotFound: "#{number} numaralı kanal bulunamadı", autoplay: "Sonraki bölümü otomatik oynat", colors: "Renkler", backgroundApplied: "Arka plan güncellendi", backgroundRemoved: "Arka plan kaldırıldı", invalidBackground: "Geçerli bir HTTP veya HTTPS görsel URL'si girin", previousEpisode: "Önceki bölüm", nextEpisode: "Sonraki bölüm", profileChanged: "Profil değiştirildi", appReset: "Uygulama sıfırlandı", zapped: "Kanal #{number} açılıyor: {title}", colorRed: "Kırmızı", colorBlue: "Mavi", colorGreen: "Yeşil", colorRose: "Pembe", colorOrange: "Turuncu", colorGold: "Altın", colorTurquoise: "Turkuaz", colorLime: "Fıstık yeşili", colorSky: "Gök mavisi"
    },
    nl: {
      addonsTab: "Add-ons",
      generalTab: "Algemeen", playbackTab: "Afspelen", profileTab: "Bron", settings: "Instellingen", language: "Taal", autoplayNext: "Volgende aflevering automatisch afspelen", customization: "Aanpassen", switchProfile: "Bron wijzigen", resetApp: "App resetten", close: "Menu sluiten", back: "Terug", accentColor: "Primaire kleur", highlightColor: "Secundaire kleur", bgTintLabel: "Achtergrondtint", backgroundImage: "URL van achtergrondafbeelding", apply: "Toepassen", removeBackground: "Afbeelding verwijderen", done: "Gereed", previous: "Vorige", next: "Volgende", playPause: "Pauzeren / afspelen", serverUrl: "Server-URL", username: "Gebruikersnaam", password: "Wachtwoord", login: "Inloggen", connecting: "Verbinden met IPTV-server...", loginFailed: "Inloggen mislukt.", modes: "MODI", modeFavorites: "Favorieten", modeLive: "Live-tv", modeMovies: "Films", modeSeries: "Series", region: "LAND", categories: "CATEGORIEËN", allRegions: "ALLES", channels: "KANALEN", movies: "FILMS", series: "SERIES", liveNow: "Live-uitzending", noNextProgram: "Geen volgend programma", vodHint: "Omhoog: bediening | Afspelen/Pauze: wisselen | Links/Rechts: zoeken", backToSeries: "← Terug naar series", noEpisodes: "Geen afleveringen gevonden", loadingEpisodes: "Afleveringen laden...", unableLoad: "Afleveringen laden mislukt", favoritesRemoved: "Verwijderd uit favorieten", favoritesAdded: "Toegevoegd aan favorieten", moveOnlyFavorites: "Verplaatsen kan alleen in Favorieten", moveStarted: "Verplaatsen gestart", positionSaved: "Positie opgeslagen", channelNotFound: "Kanaal #{number} niet gevonden", autoplay: "Volgende aflevering automatisch afspelen", colors: "Kleuren", backgroundApplied: "Achtergrond bijgewerkt", backgroundRemoved: "Achtergrond verwijderd", invalidBackground: "Voer een geldige HTTP- of HTTPS-afbeeldings-URL in", previousEpisode: "Vorige aflevering", nextEpisode: "Volgende aflevering", profileChanged: "Profiel gewijzigd", appReset: "App gereset", zapped: "Kanaal #{number} wordt afgespeeld: {title}", colorRed: "Rood", colorBlue: "Blauw", colorGreen: "Groen", colorRose: "Roze", colorOrange: "Oranje", colorGold: "Goud", colorTurquoise: "Turquoise", colorLime: "Limoen", colorSky: "Hemelsblauw"
    },
    fr: {
      addonsTab: "Extensions",
      generalTab: "Général", playbackTab: "Lecture", profileTab: "Source", settings: "Paramètres", language: "Langue", autoplayNext: "Lire automatiquement l’épisode suivant", customization: "Personnalisation", switchProfile: "Changer de source", resetApp: "Réinitialiser l’application", close: "Fermer le menu", back: "Retour", accentColor: "Couleur primaire", highlightColor: "Couleur secondaire", bgTintLabel: "Teinte d'arrière-plan", backgroundImage: "URL de l’image d’arrière-plan", apply: "Appliquer", removeBackground: "Supprimer l’image", done: "Terminé", previous: "Précédent", next: "Suivant", playPause: "Pause / lecture", serverUrl: "URL du serveur", username: "Nom d’utilisateur", password: "Mot de passe", login: "Connexion", connecting: "Connexion au serveur IPTV...", loginFailed: "Échec de la connexion.", modes: "MODES", modeFavorites: "Favoris", modeLive: "TV en direct", modeMovies: "Films", modeSeries: "Séries", region: "PAYS", categories: "CATÉGORIES", allRegions: "TOUT", channels: "CHAÎNES", movies: "FILMS", series: "SÉRIES", liveNow: "En direct", noNextProgram: "Aucun programme suivant", vodHint: "Haut : commandes | Lecture/Pause : basculer | Gauche/Droite : avancer", backToSeries: "← Retour aux séries", noEpisodes: "Aucun épisode trouvé", loadingEpisodes: "Chargement des épisodes...", unableLoad: "Impossible de charger les épisodes", favoritesRemoved: "Retiré des favoris", favoritesAdded: "Ajouté aux favoris", moveOnlyFavorites: "Le déplacement est réservé aux Favoris", moveStarted: "Déplacement commencé", positionSaved: "Position enregistrée", channelNotFound: "Chaîne #{number} introuvable", autoplay: "Lire automatiquement l’épisode suivant", colors: "Couleurs", backgroundApplied: "Arrière-plan mis à jour", backgroundRemoved: "Arrière-plan supprimé", invalidBackground: "Saisissez une URL d’image HTTP ou HTTPS valide", previousEpisode: "Épisode précédent", nextEpisode: "Épisode suivant", profileChanged: "Profil modifié", appReset: "Application réinitialisée", zapped: "Lecture de la chaîne #{number} : {title}", colorRed: "Rouge", colorBlue: "Bleu", colorGreen: "Vert", colorRose: "Rose", colorOrange: "Orange", colorGold: "Or", colorTurquoise: "Turquoise", colorLime: "Citron vert", colorSky: "Bleu ciel"
    }
  };

  Object.assign(appTranslations.en, { backgroundPlaceholder: "https://example.com/image.jpg", moveBanner: "MOVE MODE: Use Up/Down to reorder, Red to save", season: "Season {number}", episode: "Episode {number}", channelZap: "CHANNEL ZAP" });
  Object.assign(appTranslations.tr, { backgroundPlaceholder: "https://example.com/image.jpg", moveBanner: "TAŞIMA MODU: Yukarı/Aşağı ile sırala, kaydetmek için Kırmızı tuşa bas", season: "{number}. Sezon", episode: "{number}. Bölüm", channelZap: "KANAL DEĞİŞTİR" });
  Object.assign(appTranslations.nl, { backgroundPlaceholder: "https://example.com/image.jpg", moveBanner: "VERPLAATSEN: Gebruik Omhoog/Omlaag om te sorteren, druk op Rood om op te slaan", season: "Seizoen {number}", episode: "Aflevering {number}", channelZap: "KANAAL ZAPPEN" });
  Object.assign(appTranslations.fr, { backgroundPlaceholder: "https://example.com/image.jpg", moveBanner: "DÉPLACEMENT : utilisez Haut/Bas pour réorganiser, appuyez sur Rouge pour enregistrer", season: "Saison {number}", episode: "Épisode {number}", channelZap: "CHANGEMENT DE CHAÎNE" });

  Object.assign(appTranslations.en, { providerLogin: "Provider login", loginMethod: "Login method", xtreamCodes: "Xtream (Movies & Series)", m3uPlaylist: "M3U playlist (Live TV)", m3uUrl: "Playlist URL", loggingIn: "Logging in", loggedIn: "Logged in", loginRequired: "Login failed", noSavedProfile: "No saved profile. Enter your provider details.", invalidCredentials: "The provider rejected the username or password.", playlistUnavailable: "The playlist could not be loaded.", playlistInvalid: "The URL did not return a valid M3U playlist.", loginErrorToast: "Login failed: {reason}" });
  Object.assign(appTranslations.tr, { providerLogin: "Sağlayıcı girişi", loginMethod: "Giriş yöntemi", xtreamCodes: "Xtream (Film ve Dizi)", m3uPlaylist: "M3U listesi (Canlı TV)", m3uUrl: "Oynatma listesi URL'si", loggingIn: "Giriş yapılıyor", loggedIn: "Giriş başarılı", loginRequired: "Giriş başarısız", noSavedProfile: "Kayıtlı profil yok. Sağlayıcı bilgilerini girin.", invalidCredentials: "Sağlayıcı kullanıcı adı veya parolayı kabul etmedi.", playlistUnavailable: "Oynatma listesi yüklenemedi.", playlistInvalid: "URL geçerli bir M3U oynatma listesi döndürmedi.", loginErrorToast: "Giriş başarısız: {reason}" });
  Object.assign(appTranslations.nl, { providerLogin: "Provider aanmelden", loginMethod: "Aanmeldmethode", xtreamCodes: "Xtream (Films & Series)", m3uPlaylist: "M3U-afspeellijst (Live-tv)", m3uUrl: "Afspeellijst-URL", loggingIn: "Aanmelden", loggedIn: "Aangemeld", loginRequired: "Aanmelden mislukt", noSavedProfile: "Geen opgeslagen profiel. Vul je providergegevens in.", invalidCredentials: "De provider heeft de gebruikersnaam of het wachtwoord geweigerd.", playlistUnavailable: "De afspeellijst kon niet worden geladen.", playlistInvalid: "De URL bevat geen geldige M3U-afspeellijst.", loginErrorToast: "Aanmelden mislukt: {reason}" });
  Object.assign(appTranslations.fr, { providerLogin: "Connexion au fournisseur", loginMethod: "Méthode de connexion", xtreamCodes: "Xtream (Films et séries)", m3uPlaylist: "Playlist M3U (TV en direct)", m3uUrl: "URL de la playlist", loggingIn: "Connexion en cours", loggedIn: "Connecté", loginRequired: "Échec de connexion", noSavedProfile: "Aucun profil enregistré. Saisissez vos identifiants fournisseur.", invalidCredentials: "Le fournisseur a refusé le nom d’utilisateur ou le mot de passe.", playlistUnavailable: "Impossible de charger la playlist.", playlistInvalid: "L’URL ne renvoie pas une playlist M3U valide.", loginErrorToast: "Échec de connexion : {reason}" });
  Object.assign(appTranslations.en, { m3uProfiles: "Saved playlists", m3uProfileNew: "+ New playlist", m3uProfileName: "Playlist name", generateM3uPrompt: "Generate the M3U playlist from your Xtream login?" });
  Object.assign(appTranslations.tr, { m3uProfiles: "Kayıtlı listeler", m3uProfileNew: "+ Yeni liste", m3uProfileName: "Liste adı", generateM3uPrompt: "M3U listesi Xtream girişinizden oluşturulsun mu?" });
  Object.assign(appTranslations.nl, { m3uProfiles: "Opgeslagen afspeellijsten", m3uProfileNew: "+ Nieuwe afspeellijst", m3uProfileName: "Naam afspeellijst", generateM3uPrompt: "Zal de M3U-afspeellijst maken op basis van je Xtream-login?" });
  Object.assign(appTranslations.fr, { m3uProfiles: "Playlists enregistrées", m3uProfileNew: "+ Nouvelle playlist", m3uProfileName: "Nom de la playlist", generateM3uPrompt: "Générer la playlist M3U à partir de votre connexion Xtream ?" });
  Object.assign(appTranslations.en, { showPassword: "Show", hidePassword: "Hide", accountDetails: "Account", accountStatus: "Status", accountExpires: "Expires", accountDaysLeft: "{days} days left", accountExpired: "Expired", accountUnlimited: "Unlimited", accountConnections: "Connections", accountTrial: "Trial", accountCreated: "Created", accountFormats: "Formats", testingConnection: "Testing connection...", connectionOk: "Connection OK" });
  Object.assign(appTranslations.tr, { showPassword: "Göster", hidePassword: "Gizle", accountDetails: "Hesap", accountStatus: "Durum", accountExpires: "Bitiş", accountDaysLeft: "{days} gün kaldı", accountExpired: "Süresi doldu", accountUnlimited: "Sınırsız", accountConnections: "Bağlantılar", accountTrial: "Deneme", accountCreated: "Oluşturulma", accountFormats: "Formatlar", testingConnection: "Bağlantı test ediliyor...", connectionOk: "Bağlantı tamam" });

  Object.assign(appTranslations.nl, { showPassword: "Tonen", hidePassword: "Verbergen", accountDetails: "Account", accountStatus: "Status", accountExpires: "Vervalt", accountDaysLeft: "{days} dagen over", accountExpired: "Verlopen", accountUnlimited: "Onbeperkt", accountConnections: "Verbindingen", accountTrial: "Proef", accountCreated: "Aangemaakt", accountFormats: "Formaten", testingConnection: "Verbinding testen...", connectionOk: "Verbinding OK" });
  Object.assign(appTranslations.fr, { showPassword: "Afficher", hidePassword: "Masquer", accountDetails: "Compte", accountStatus: "Statut", accountExpires: "Expire le", accountDaysLeft: "{days} jours restants", accountExpired: "Expiré", accountUnlimited: "Illimité", accountConnections: "Connexions", accountTrial: "Essai", accountCreated: "Créé le", accountFormats: "Formats", testingConnection: "Test de la connexion...", connectionOk: "Connexion OK" });
  Object.assign(appTranslations.en, { presetBackgrounds: "Presets", installedAddonsTitle: "Installed Addons", installedAddonsHint: "Active addons providing metadata, catalogs, and media streams.", legalAddonsTitle: "Official & Legal Addons", legalAddonsHint: "1-click install verified legal catalogs and services.", customAddonTitle: "Install from URL", customAddonHint: "Paste a Stremio manifest.json URL to install any community addon." });
  Object.assign(appTranslations.tr, { presetBackgrounds: "Hazır arka planlar", installedAddonsTitle: "Yüklü Eklentiler", installedAddonsHint: "Meta veri, katalog ve medya akışı sağlayan aktif eklentiler.", legalAddonsTitle: "Resmi ve Yasal Eklentiler", legalAddonsHint: "Doğrulanmış yasal katalogları ve servisleri tek tuşla yükleyin.", customAddonTitle: "Bağlantıdan Yükle", customAddonHint: "Topluluk eklentisi yüklemek için bir Stremio manifest.json bağlantısı yapıştırın." });
  Object.assign(appTranslations.nl, { presetBackgrounds: "Voorinstellingen", installedAddonsTitle: "Geïnstalleerde Add-ons", installedAddonsHint: "Actieve add-ons voor metadata, catalogi en mediastromen.", legalAddonsTitle: "Officiële & Legale Add-ons", legalAddonsHint: "Installeer geverifieerde legale catalogi en diensten met 1 klik.", customAddonTitle: "Installeren via URL", customAddonHint: "Plak een Stremio manifest.json-URL om een add-on te installeren." });
  Object.assign(appTranslations.fr, { presetBackgrounds: "Préréglages", installedAddonsTitle: "Extensions Installées", installedAddonsHint: "Extensions actives fournissant des métadonnées, catalogues et flux.", legalAddonsTitle: "Extensions Officielles et Légales", legalAddonsHint: "Installez des catalogues et services légaux vérifiés en 1 clic.", customAddonTitle: "Installer via URL", customAddonHint: "Collez une URL manifest.json Stremio pour installer une extension." });
  Object.assign(appTranslations.nl, { presetBackgrounds: "Voorinstellingen" });
  Object.assign(appTranslations.fr, { presetBackgrounds: "Préréglages" });
  Object.assign(appTranslations.en, { m3uGenerateXtream: "⚡ Generate from Xtream", clockFormat: "Clock format", animations: "Animations", colorTab: "Color", backgroundTab: "Background", clockTab: "Clock" });
  Object.assign(appTranslations.tr, { m3uGenerateXtream: "⚡ Xtream'den oluştur", clockFormat: "Saat biçimi", animations: "Animasyonlar", colorTab: "Renk", backgroundTab: "Arka plan", clockTab: "Saat" });
  Object.assign(appTranslations.nl, { m3uGenerateXtream: "⚡ Genereren uit Xtream", clockFormat: "Klokweergave", animations: "Animaties", colorTab: "Kleur", backgroundTab: "Achtergrond", clockTab: "Klok" });
  Object.assign(appTranslations.fr, { m3uGenerateXtream: "⚡ Générer depuis Xtream", clockFormat: "Format de l'horloge", animations: "Animations", colorTab: "Couleur", backgroundTab: "Arrière-plan", clockTab: "Horloge" });
  const languageOptions = { en: "🇬🇧", tr: "🇹🇷", nl: "🇳🇱", fr: "🇫🇷" };
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
  Object.assign(appTranslations.en, {"hintFavorite": "Favorite", "hintReorder": "Reorder", "hintHide": "Hide category", "hintSearch": "Search", "searchTitle": "Search channels", "searchPlaceholder": "Type a channel name", "searchNoResults": "No channels found", "categoryHidden": "Category hidden", "resetHidden": "Show hidden categories", "hiddenReset": "Hidden categories restored", "refreshInterval": "Refresh lists", "refreshOff": "Off", "customColor": "Custom", "hueLabel": "Hue", "saturationLabel": "Saturation", "lightnessLabel": "Lightness", "focusWidthLabel": "Focus box thickness"});
  Object.assign(appTranslations.tr, {"hintFavorite": "Favori", "hintReorder": "Sırala", "hintHide": "Kategoriyi gizle", "hintSearch": "Ara", "searchTitle": "Kanal ara", "searchPlaceholder": "Kanal adını yazın", "searchNoResults": "Kanal bulunamadı", "categoryHidden": "Kategori gizlendi", "resetHidden": "Gizli kategorileri göster", "hiddenReset": "Gizli kategoriler geri yüklendi", "refreshInterval": "Listeleri yenile", "refreshOff": "Kapalı", "customColor": "Özel", "hueLabel": "Ton", "saturationLabel": "Doygunluk", "lightnessLabel": "Parlaklık", "focusWidthLabel": "Odak kutusu kalınlığı"});
  Object.assign(appTranslations.nl, {"hintFavorite": "Favoriet", "hintReorder": "Verplaatsen", "hintHide": "Categorie verbergen", "hintSearch": "Zoeken", "searchTitle": "Zoek kanalen", "searchPlaceholder": "Typ een kanaalnaam", "searchNoResults": "Geen kanalen gevonden", "categoryHidden": "Categorie verborgen", "resetHidden": "Verborgen categorieën tonen", "hiddenReset": "Verborgen categorieën hersteld", "refreshInterval": "Lijsten vernieuwen", "refreshOff": "Uit", "customColor": "Aangepast", "hueLabel": "Tint", "saturationLabel": "Verzadiging", "lightnessLabel": "Helderheid", "focusWidthLabel": "Dikte van focusvak"});
  Object.assign(appTranslations.en, {"menuTab": "Menu", "hideRegions": "Hide region column"});
  Object.assign(appTranslations.tr, {"menuTab": "Menü", "hideRegions": "Bölge sütununu gizle"});
  Object.assign(appTranslations.nl, {"menuTab": "Menu", "hideRegions": "Regiokolom verbergen"});
  Object.assign(appTranslations.fr, {"menuTab": "Menu", "hideRegions": "Masquer la colonne des régions"});
  Object.assign(appTranslations.en, {"guideTitle": "Guide", "guideHint": "OK: play · Back: close", "guideNoData": "No programme information"});
  Object.assign(appTranslations.tr, {"guideTitle": "Rehber", "guideHint": "OK: izle · Geri: kapat", "guideNoData": "Program bilgisi yok"});
  Object.assign(appTranslations.nl, {"guideTitle": "Gids", "guideHint": "OK: afspelen · Terug: sluiten", "guideNoData": "Geen programma-informatie"});
  Object.assign(appTranslations.fr, {"guideTitle": "Guide", "guideHint": "OK : lire · Retour : fermer", "guideNoData": "Aucune information de programme"});
  Object.assign(appTranslations.en, {"renameTitle": "Rename", "renameSave": "Save", "renameCancel": "Cancel", "renameHint": "Leave empty to restore the original name"});
  Object.assign(appTranslations.tr, {"renameTitle": "Yeniden adlandır", "renameSave": "Kaydet", "renameCancel": "İptal", "renameHint": "Boş bırakırsanız özgün ad geri yüklenir"});
  Object.assign(appTranslations.nl, {"renameTitle": "Hernoemen", "renameSave": "Opslaan", "renameCancel": "Annuleren", "renameHint": "Leeg laten om de oorspronkelijke naam te herstellen"});
  Object.assign(appTranslations.fr, {"renameTitle": "Renommer", "renameSave": "Enregistrer", "renameCancel": "Annuler", "renameHint": "Laisser vide pour restaurer le nom d'origine"});
  Object.assign(appTranslations.fr, {"hintFavorite": "Favori", "hintReorder": "Déplacer", "hintHide": "Masquer la catégorie", "hintSearch": "Rechercher", "searchTitle": "Rechercher des chaînes", "searchPlaceholder": "Saisissez un nom de chaîne", "searchNoResults": "Aucune chaîne trouvée", "categoryHidden": "Catégorie masquée", "resetHidden": "Afficher les catégories masquées", "hiddenReset": "Catégories masquées restaurées", "refreshInterval": "Actualiser les listes", "refreshOff": "Désactivé", "customColor": "Personnalisée", "hueLabel": "Teinte", "saturationLabel": "Saturation", "lightnessLabel": "Luminosité", "focusWidthLabel": "Épaisseur du cadre de focus"});
  Object.assign(appTranslations.en, {"showEpg": "Show EPG info", "epgOffset": "EPG time offset"});
  Object.assign(appTranslations.tr, {"showEpg": "EPG bilgisini göster", "epgOffset": "EPG saat farkı"});
  Object.assign(appTranslations.nl, {"showEpg": "EPG-info tonen", "epgOffset": "EPG-tijdverschil"});
  Object.assign(appTranslations.fr, {"showEpg": "Afficher les infos EPG", "epgOffset": "Décalage horaire EPG"});
  let autoplayNext = store.getItem("iptv_autoplay_next") === "true";
  let epgVisible = store.getItem("iptv_epg_show") !== "false";
  let epgOffsetHours = Math.max(-2, Math.min(2, Number(store.getItem("iptv_epg_offset")) || 0));
  let hideRegionColumn = store.getItem("iptv_hide_regions") === "true";
  let refreshTimer = null;
  let movingRegion = null;
  let focusContentWhenReady = false;
  const columnMemory = {};
  const regionOrderCache = { live: [], vod: [] };
  let regionPrefs = { fav: { live: [], vod: [] }, hidden: { live: [], vod: [] }, order: { live: [], vod: [] } };
  try {
    const savedRegionPrefs = JSON.parse(store.getItem("iptv_region_prefs") || "{}");
    Object.keys(regionPrefs).forEach((group) => {
      ["live", "vod"].forEach((kind) => {
        if (savedRegionPrefs[group] && Array.isArray(savedRegionPrefs[group][kind])) regionPrefs[group][kind] = savedRegionPrefs[group][kind].map(String);
      });
    });
  } catch (error) {}
  let refreshHours = parseInt(store.getItem("iptv_refresh_hours") || "0", 10) || 0;
  let hiddenCategories = { live: [], vod: [], series: [] };
  try {
    const savedHidden = JSON.parse(store.getItem("iptv_hidden_cats") || "{}");
    Object.keys(hiddenCategories).forEach((kind) => {
      if (Array.isArray(savedHidden[kind])) hiddenCategories[kind] = savedHidden[kind].map(String);
    });
  } catch (error) {}
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
  Object.assign(appTranslations.en, {
    categoryLoadTimeout: "This category did not load within 30 s. Check the connection and try again.",
    vodSettings: "Audio & Subtitles", vodPlayerSettings: "Playback Settings", vodAudioTab: "Audio", vodSubtitlesTab: "Subtitles", vodVideoTab: "Video",
    vodAudioTrackLabel: "Audio Track / Language", vodSubtitleTrackLabel: "Subtitle Track", vodSubtitleSizeLabel: "Subtitle Size",
    vodAspectRatioLabel: "Aspect Ratio", vodSpeedLabel: "Playback Speed", sizeSmall: "Small", sizeNormal: "Normal", sizeLarge: "Large",
    aspectFit: "Fit", aspectFill: "Fill / Crop", aspectStretch: "16:9 Stretch", off: "Off", noAudioTracks: "No additional audio tracks found", noSubTracks: "No subtitle tracks found"
  });
  Object.assign(appTranslations.tr, {
    categoryLoadTimeout: "Bu kategori 30 sn içinde yüklenmedi. Bağlantıyı kontrol edip tekrar deneyin.",
    vodSettings: "Ses ve Altyazı", vodPlayerSettings: "Oynatma Ayarları", vodAudioTab: "Ses", vodSubtitlesTab: "Altyazılar", vodVideoTab: "Video",
    vodAudioTrackLabel: "Ses Kaynağı / Dili", vodSubtitleTrackLabel: "Altyazı Parçası", vodSubtitleSizeLabel: "Altyazı Boyutu",
    vodAspectRatioLabel: "En Boy Oranı", vodSpeedLabel: "Oynatma Hızı", sizeSmall: "Küçük", sizeNormal: "Normal", sizeLarge: "Büyük",
    aspectFit: "Sığdır", aspectFill: "Doldur / Kırp", aspectStretch: "16:9 Genişlet", off: "Kapalı", noAudioTracks: "Ek ses parçası bulunamadı", noSubTracks: "Altyazı parçası bulunamadı"
  });
  Object.assign(appTranslations.nl, {
    categoryLoadTimeout: "Deze categorie laadde niet binnen 30 s. Controleer de verbinding en probeer het opnieuw.",
    vodSettings: "Audio & Ondertitels", vodPlayerSettings: "Afspeelinstellingen", vodAudioTab: "Audio", vodSubtitlesTab: "Ondertitels", vodVideoTab: "Video",
    vodAudioTrackLabel: "Audiobron / Taal", vodSubtitleTrackLabel: "Ondertitelspoor", vodSubtitleSizeLabel: "Ondertitelgrootte",
    vodAspectRatioLabel: "Beeldverhouding", vodSpeedLabel: "Afspeelsnelheid", sizeSmall: "Klein", sizeNormal: "Normaal", sizeLarge: "Groot",
    aspectFit: "Passend", aspectFill: "Vullend", aspectStretch: "16:9 Uitrekken", off: "Uit", noAudioTracks: "Geen extra audiosporen gevonden", noSubTracks: "Geen ondertitels gevonden"
  });
  Object.assign(appTranslations.fr, {
    categoryLoadTimeout: "Cette catégorie ne s'est pas chargée en 30 s. Vérifiez la connexion et réessayez.",
    vodSettings: "Audio & Sous-titres", vodPlayerSettings: "Paramètres de lecture", vodAudioTab: "Audio", vodSubtitlesTab: "Sous-titres", vodVideoTab: "Vidéo",
    vodAudioTrackLabel: "Piste audio / Langue", vodSubtitleTrackLabel: "Piste de sous-titres", vodSubtitleSizeLabel: "Taille des sous-titres",
    vodAspectRatioLabel: "Format de l'image", vodSpeedLabel: "Vitesse de lecture", sizeSmall: "Petit", sizeNormal: "Normal", sizeLarge: "Grand",
    aspectFit: "Ajuster", aspectFill: "Remplir", aspectStretch: "Étirer 16:9", off: "Désactivé", noAudioTracks: "Aucune piste audio supplémentaire trouvée", noSubTracks: "Aucun sous-titre trouvé"
  });

  const CATEGORY_LOAD_TIMEOUT_MS = 30000;

  let xtreamAuth = null;
  let allStreams = [];
  let vodStreams = [];
  let vodCategories = [];
  try {
    const rawVod = store.getItem("iptv_vod_categories_cache");
    if (rawVod) vodCategories = JSON.parse(rawVod);
  } catch (e) {}
  let seriesCategories = [];
  try {
    const rawSeries = store.getItem("iptv_series_categories_cache");
    if (rawSeries) seriesCategories = JSON.parse(rawSeries);
  } catch (e) {}
  let xtreamCategoriesLoading = false;
  let seriesStreams = [];
  let selectedSeries = null;
  let currentVodItems = [];
  let currentVodMovieId = null;
  let allCategories = [];
  let favoritesNs = "";
  let streamByIdMap = {};
  let streamsByCatMap = {};

  function rebuildStreamIndexes() {
    streamByIdMap = {};
    streamsByCatMap = {};
    if (!allStreams || !allStreams.length) return;
    for (let i = 0; i < allStreams.length; i++) {
      const s = allStreams[i];
      const sId = String(s.stream_id);
      streamByIdMap[sId] = s;
      const cId = String(s.category_id || "all");
      if (!streamsByCatMap[cId]) streamsByCatMap[cId] = [];
      streamsByCatMap[cId].push(s);
    }
  }

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
    store.setItem("iptv_favorites" + favoritesNs, serialized);
    store.setItem("iptv_favorites_backup" + favoritesNs, serialized);
  }

  // M3U entries get an ID from their name and URL, so favorites survive playlist refreshes.
  function stableStreamId(name, url) {
    const text = `${name}|${url}`;
    let hash = 5381;
    for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
    return "m" + (hash >>> 0).toString(36);
  }

  // Adds the favorites listed in credentials.local.js once, after the M3U playlist loads.
  function seedM3uFavorites(streams) {
    const defaults = window.KC_DEFAULT_LOGIN;
    if (favoritesNs !== "" || !defaults || !Array.isArray(defaults.m3uFavorites)) return;
    if (store.getItem("iptv_m3u_favorites_seeded")) return;
    const wanted = new Set(defaults.m3uFavorites.map(name => String(name).trim().toLowerCase()));
    const ids = streams.filter(s => wanted.has(String(s.name).trim().toLowerCase())).map(s => String(s.stream_id));
    favorites = Array.from(new Set(favorites.concat(ids)));
    saveFavorites(favorites);
    store.setItem("iptv_m3u_favorites_seeded", "1");
  }

  function loadFavorites() {
    const primary = readFavorites("iptv_favorites" + favoritesNs);
    const backup = readFavorites("iptv_favorites_backup" + favoritesNs);
    const defaults = window.KC_DEFAULT_LOGIN && Array.isArray(window.KC_DEFAULT_LOGIN.favorites) ? window.KC_DEFAULT_LOGIN.favorites : null;
    const seed = favoritesNs === "_xtream" && primary === null && backup === null && defaults ? defaults.map(String) : null;
    const saved = primary !== null ? primary : (backup || seed || []);
    saveFavorites(saved);
    return saved;
  }

  let favorites = loadFavorites();
  let currentModus = "favorites";
  
  let currentLiveRegion = "TR";
  let currentVodRegion = "TR";
  // Flags load lazily: a region box fetches its SVG only when it scrolls into view, so long lists don't stall the TV.
  const FLAG_ALIASES = { UK: "gb", EN: "gb", EL: "gr" };
  let flagObserver = null;

  let currentCategoryId = null;
  let currentStreamIndex = 0;
  let currentPlayingStreamId = null;
  let currentActiveStreams = [];
  let hlsPlayer = null;
  let mpegTsPlayer = null;
  let osdTimeout = null;
  let vodOsdTimeout = null;
  let isFitScreen = false;
  // Pick-stack move mode (favourites only): moveStack holds the picked-up channel ids, in pick order.
  let moveMode = false;
  let moveStack = [];
  let moveFirstId = null;

  let numberBuffer = "";
  let numberTimer = null;
  let lastFocusedPoster = null;

  function showToast(text) {
    toastMsg.textContent = text;
    toastMsg.classList.add("show");
    setTimeout(() => toastMsg.classList.remove("show"), 2500);
  }

  let loginCredentialsRejected = false;

  function setLoginState(state) {
    currentLoginState = state;
    if (loginStateButton) loginStateButton.dataset.state = state;
    if (loginStatus) {
      const stateKeys = { failed: "loginFailed", logging: "loggingIn", "logged-in": "loggedIn" };
      loginStatus.textContent = t(stateKeys[state] || "loginFailed");
      const sources = [];
      if (currentAuth) sources.push("M3U");
      if (xtreamAuth) sources.push("Xtream");
      if (state === "logged-in" && sources.length) loginStatus.textContent += " · " + sources.join(" + ");
    }
    if (state === "failed") toggleLoginPanel(true, true);
  }

  // A single progress bar on the main screen, visible from Settings too.
  function setLoginProgress(percent, text) {
    const width = `${Math.min(100, Math.max(0, Math.round(percent)))}%`;
    document.querySelectorAll(".app-progress").forEach((box) => {
      box.classList.remove("hidden");
      const bar = box.querySelector(".login-progress-bar");
      const label = box.querySelector(".login-progress-text");
      if (bar) bar.style.width = width;
      if (label) label.textContent = text;
    });
  }

  function hideLoginProgress() {
    document.querySelectorAll(".app-progress").forEach((box) => box.classList.add("hidden"));
  }

  // Without saved M3U playlists, the playlist generated from the Xtream login becomes the default.
  function ensureDefaultXtreamPlaylist(server, username, password) {
    if (getM3uProfiles().length > 0) return null;
    const url = buildXtreamM3uUrl(server, username, password);
    saveM3uProfile(url, "Xtream");
    return url;
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
    // The form lives in the Source tab, so it stays visible and the tab decides when it is seen.
    loginForm.classList.remove("hidden");
    loginStateButton.setAttribute("aria-expanded", "true");
    if (show && focusInput) {
      const firstInput = loginForm.querySelector(".focusable:not([type='hidden'])");
      if (firstInput) setElementFocus(firstInput);
    }
  }

  function toggleSettingsMenu(forceOpen = null) {
    if (!settingsPanel) return;
    const shouldOpen = forceOpen !== null ? forceOpen : settingsPanel.classList.contains("hidden");
    if (shouldOpen && isFitScreen) {
      isFitScreen = false;
      document.body.classList.remove("speler-fit-screen");
    }
    settingsPanel.classList.toggle("hidden", !shouldOpen);
    if (settingsButton) settingsButton.setAttribute("aria-expanded", String(shouldOpen));
    if (headerTabSettings) headerTabSettings.classList.toggle("active", shouldOpen);
    if (shouldOpen) {
      showCustomizationTab("general");
      const firstItem = settingsPanel.querySelector(".customization-tab.active") || settingsPanel.querySelector(".customization-tab");
      if (firstItem) {
        setElementFocus(firstItem);
        setTimeout(() => centerCustomizationNav(firstItem), 30);
      }
    } else {
      if (currentAppSection === "settings") {
        switchAppSection(previousAppSection || "iptv");
      }
      if (favorites && favorites.length > 0) {
        currentModus = "favorites";
        filterChannels();
        if (window.AeroRadial) {
          window.AeroRadial.setMode(0); // 0: Favorites
        }
      }
      document.body.classList.add("radial-active");
      if (window.AeroRadial) window.AeroRadial.open();
    }
  }

  function nextLanguage(lang) {
    const codes = Object.keys(languageOptions);
    return codes[(codes.indexOf(lang) + 1) % codes.length];
  }

  function uiIcon(name) {
    return `<svg class="ui-icon" aria-hidden="true"><use xlink:href="#i-${name}"/></svg>`;
  }

  function setIconLabel(el, icon, text) {
    if (el) el.innerHTML = `${uiIcon(icon)}<span>${text}</span>`;
  }

  function updateSettingsSelection() {
    if (!settingsPanel) return;
    const refreshButton = settingsPanel.querySelector(".settings-item[data-setting='refreshCycle']");
    setIconLabel(refreshButton, "refresh", refreshHours ? refreshHours + " h" : t("refreshOff"));
    updateFavoritesTab();
  }

  function applyAppLanguage(lang) {
    currentLang = appTranslations[lang] ? lang : "en";
    store.setItem("iptv_lang", currentLang);
    document.documentElement.lang = currentLang;
    updateSettingsSelection();
    const languageButton = settingsPanel && settingsPanel.querySelector(".settings-item[data-setting='language']");
    if (languageButton) setIconLabel(languageButton, "globe", `${languageOptions[currentLang]} ${currentLang.toUpperCase()}`);
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

  const DEFAULT_BACKGROUND = "backgrounds/aurora.svg";

  function normalizeBackgroundSource(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    if (/^backgrounds\/[\w-]+\.svg$/.test(url)) return url;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "";
    } catch (error) {
      return "";
    }
  }

  function clampFocusWidth(value) {
    const width = typeof value === "number" ? Math.round(value) : NaN;
    return Number.isFinite(width) ? Math.min(10, Math.max(1, width)) : 5;
  }

  function loadThemeConfig() {
    try {
      const saved = JSON.parse(store.getItem("iptv_theme") || "{}");
      const backgroundImage = saved.backgroundImage === undefined
        ? DEFAULT_BACKGROUND
        : normalizeBackgroundSource(saved.backgroundImage);
      const bgTint = typeof saved.bgTint === "number" ? Math.min(Math.max(saved.bgTint, 10), 95) : 55;
      return {
        accent: /^#[0-9a-f]{6}$/i.test(saved.accent || "") ? saved.accent : "#e50914",
        highlight: /^#[0-9a-f]{6}$/i.test(saved.highlight || "") ? saved.highlight : "#ffd700",
        focusWidth: clampFocusWidth(saved.focusWidth),
        bgTint,
        backgroundImage
      };
    } catch (error) {
      return { accent: "#e50914", highlight: "#ffd700", focusWidth: 5, bgTint: 55, backgroundImage: DEFAULT_BACKGROUND };
    }
  }

  let themeConfig = loadThemeConfig();
  try { store.removeItem("iptv_nav_theme"); } catch (e) {}

  const TRAIL_STEPS = 10;

  function applyThemeConfig() {
    const root = document.documentElement;
    const toRgb = color => color.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16)).join(", ");
    root.style.setProperty("--accent", themeConfig.accent);
    root.style.setProperty("--accent-rgb", toRgb(themeConfig.accent));
    root.style.setProperty("--highlight", themeConfig.highlight);
    root.style.setProperty("--highlight-rgb", toRgb(themeConfig.highlight));
    root.style.setProperty("--focus-width", `${themeConfig.focusWidth}px`);
    if (focusWidthRange) focusWidthRange.value = String(themeConfig.focusWidth);
    if (focusWidthValue) focusWidthValue.textContent = `${themeConfig.focusWidth}px`;
    const bgTintRange = document.getElementById("bgTintRange");
    const bgTintValue = document.getElementById("bgTintValue");
    const tintVal = typeof themeConfig.bgTint === "number" ? themeConfig.bgTint : 55;
    if (bgTintRange) bgTintRange.value = String(tintVal);
    if (bgTintValue) bgTintValue.textContent = `${tintVal}%`;
    const tintAlpha = tintVal / 100;
    root.style.setProperty("--settings-tint-alpha", String(tintAlpha));
    const mixColor = (from, to, amount) => {
      const start = toRgb(from).split(", ").map(Number);
      const end = toRgb(to).split(", ").map(Number);
      return `rgb(${start.map((value, index) => Math.round(value + (end[index] - value) * amount)).join(", ")})`;
    };
    for (let index = 0; index < TRAIL_STEPS; index++) {
      root.style.setProperty(`--trail-${index}`, mixColor(themeConfig.accent, themeConfig.highlight, index / (TRAIL_STEPS - 1)));
    }

    document.querySelectorAll(".color-swatch").forEach(swatch => {
      if (swatch.classList.contains("custom-swatch")) {
        const role = swatch.dataset.customRole;
        const isCustom = !Array.from(document.querySelectorAll(".color-swatch[data-color]")).some(preset => preset.dataset.color === themeConfig[role]);
        swatch.style.setProperty("--swatch-color", themeConfig[role]);
        swatch.classList.toggle("selected", isCustom);
        swatch.setAttribute("aria-pressed", String(isCustom));
        return;
      }
      const selected = themeConfig[swatch.dataset.colorRole] === swatch.dataset.color;
      swatch.style.setProperty("--swatch-color", swatch.dataset.color);
      swatch.classList.toggle("selected", selected);
      swatch.setAttribute("aria-pressed", String(selected));
    });
    if (backgroundImageInput) backgroundImageInput.value = themeConfig.backgroundImage;
    document.querySelectorAll(".background-preset").forEach(preset => {
      preset.classList.toggle("selected", preset.dataset.preset === themeConfig.backgroundImage);
    });

    if (themeConfig.backgroundImage) {
      document.body.style.backgroundImage = `url("${themeConfig.backgroundImage}")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.classList.add("kc-has-bg");
    } else {
      document.body.style.backgroundImage = "none";
      document.body.classList.remove("kc-has-bg");
    }
    const bgUrl = themeConfig.backgroundImage || DEFAULT_BACKGROUND;
    root.style.setProperty("--settings-bg", `url("${bgUrl}")`);
    const setPage = document.getElementById("settingsPage");
    if (setPage) {
      setPage.style.backgroundImage = `linear-gradient(135deg, rgba(6, 8, 14, ${tintAlpha}) 0%, rgba(9, 12, 20, ${Math.min(tintAlpha + 0.15, 0.98)}) 100%), url("${bgUrl}")`;
      setPage.style.backgroundSize = "cover";
      setPage.style.backgroundPosition = "center";
      setPage.style.backgroundColor = "transparent";
    }

    store.setItem("iptv_theme", JSON.stringify(themeConfig));
  }

  function updateBgTint(value) {
    themeConfig.bgTint = Math.min(Math.max(Number(value) || 55, 10), 95);
    applyThemeConfig();
  }



  function updateThemeColor(role, color) {
    if ((role !== "accent" && role !== "highlight") || !/^#[0-9a-f]{6}$/i.test(color || "")) return;
    themeConfig[role] = color;
    applyThemeConfig();
  }

  function updateFocusWidth(value) {
    themeConfig.focusWidth = clampFocusWidth(Number(value));
    applyThemeConfig();
  }

  // Custom colours use a fixed saturation and lightness so the hue slider always gives a vivid colour.
  function hslToHex(hue, saturation, lightness) {
    const a = saturation * Math.min(lightness, 1 - lightness);
    const channel = n => {
      const k = (n + hue / 30) % 12;
      const value = lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(value * 255).toString(16).padStart(2, "0");
    };
    return `#${channel(0)}${channel(8)}${channel(4)}`;
  }

  function hexToHue(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    if (delta === 0) return 0;
    let hue;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    return (hue * 60 + 360) % 360;
  }

  function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const delta = max - min;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
    return { hue: hexToHue(hex), saturation, lightness };
  }

  function readHuePanel(role) {
    const panel = customizationPage.querySelector(`.hue-panel[data-hue-role="${role}"]`);
    if (!panel) return null;
    const value = part => Number(panel.querySelector(`[data-hsl-part="${part}"]`).value);
    return { panel, hue: value("h"), saturation: value("s") / 100, lightness: value("l") / 100 };
  }

  // The saturation and lightness tracks show the colours the current hue can produce.
  function updateHueTracks(panel, hue, saturation, lightness) {
    panel.querySelector('[data-hsl-part="s"]').style.background = `linear-gradient(to right, ${hslToHex(hue, 0, lightness)}, ${hslToHex(hue, 1, lightness)})`;
    panel.querySelector('[data-hsl-part="l"]').style.background = `linear-gradient(to right, #000000, ${hslToHex(hue, saturation, 0.5)}, #ffffff)`;
  }

  function applyHuePanel(role) {
    const state = readHuePanel(role);
    if (!state) return;
    updateHueTracks(state.panel, state.hue, state.saturation, state.lightness);
    updateThemeColor(role, hslToHex(state.hue, state.saturation, state.lightness));
  }

  function openHuePanel(role) {
    const panel = customizationPage.querySelector(`.hue-panel[data-hue-role="${role}"]`);
    if (!panel) return;
    const current = hexToHsl(themeConfig[role]);
    panel.querySelector('[data-hsl-part="h"]').value = String(Math.round(current.hue / 6) * 6 % 360);
    panel.querySelector('[data-hsl-part="s"]').value = String(Math.round(current.saturation * 100));
    panel.querySelector('[data-hsl-part="l"]').value = String(Math.round(current.lightness * 100));
    const state = readHuePanel(role);
    updateHueTracks(panel, state.hue, state.saturation, state.lightness);
    panel.classList.remove("hidden");
    setElementFocus(panel.querySelector('[data-hsl-part="h"]'));
  }

  function closeHuePanel(role) {
    const panel = customizationPage.querySelector(`.hue-panel[data-hue-role="${role}"]`);
    if (panel) panel.classList.add("hidden");
  }

  function updateBackgroundImage(value) {
    const url = value.trim();
    if (!url) {
      themeConfig.backgroundImage = "";
    } else {
      const normalized = normalizeBackgroundSource(url);
      if (!normalized) {
        showToast(t("invalidBackground"));
        return;
      }
      themeConfig.backgroundImage = normalized;
    }
    applyThemeConfig();
    showToast(t(url ? "backgroundApplied" : "backgroundRemoved"));
  }

  function centerCustomizationNav(item) {
    const nav = customizationPage && customizationPage.querySelector(".customization-nav");
    const list = nav && nav.querySelector(".customization-nav-list");
    if (!item || !list) return;
    nav.scrollTop = 0;
    const offset = Math.round((nav.clientHeight / 2) - (item.offsetTop + item.offsetHeight / 2));
    list.style.transform = `translateY(${offset}px)`;
  }

  function showCustomizationTab(name) {
    if (!customizationPage) return;
    if (name === "addons" && typeof renderAddonsSection === "function") {
      renderAddonsSection();
    }
    customizationPage.querySelectorAll(".customization-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === name);
    });
    customizationPage.querySelectorAll(".customization-pane").forEach(pane => {
      pane.classList.toggle("hidden", pane.dataset.pane !== name);
    });
    const custContent = customizationPage.querySelector(".customization-content");
    if (custContent) custContent.scrollTop = 0;
  }

  function showCustomizationPage(show, tab = "general") {
    if (!customizationPage) return;
    toggleSettingsMenu(show);
    if (show) {
      showCustomizationTab(tab);
      const targetTab = customizationPage.querySelector(`.customization-tab[data-tab="${tab}"]`);
      if (targetTab) {
        setElementFocus(targetTab);
        setTimeout(() => centerCustomizationNav(targetTab), 30);
      }
    }
  }

  function handleSettingsAction(action, value = null) {
    switch (action) {
      case "language": {
        const next = appTranslations[value] ? value : nextLanguage(currentLang);
        applyAppLanguage(next);
        showToast(`${languageOptions[next]} ${next.toUpperCase()}`);
        return;
      }
      case "customization":
        showCustomizationPage(true, "customization");
        return;
      case "refreshCycle": {
        const options = [0, 3, 6, 12, 24];
        refreshHours = options[(options.indexOf(refreshHours) + 1) % options.length];
        store.setItem("iptv_refresh_hours", String(refreshHours));
        updateSettingsSelection();
        scheduleListRefresh();
        showToast(`${t("refreshInterval")}: ${refreshHours ? refreshHours + " h" : t("refreshOff")}`);
        return;
      }
      case "epgOffset":
        epgOffsetHours = ((epgOffsetHours + 3) % 5) - 2;
        store.setItem("iptv_epg_offset", String(epgOffsetHours));
        updateEpgOffsetLabel();
        if (epgVisible && currentPlayingStreamId) fetchEPGData(currentPlayingStreamId);
        return;
      case "resetHidden":
        hiddenCategories = { live: [], vod: [], series: [] };
        regionPrefs.hidden = { live: [], vod: [] };
        saveHiddenCategories();
        saveRegionPrefs();
        if (currentModus !== "favorites") setupRegions();
        showToast(t("hiddenReset"));
        return;
      case "switchProfile":
        showCustomizationPage(true, "source");
        return;
      case "close":
      default:
        toggleSettingsMenu(false);
        if (window.AeroRadial) window.AeroRadial.open();
        return;
    }
    toggleSettingsMenu(false);
  }

  const QUALITY_TAGS = ["HD", "FHD", "UHD", "4K"];
  const TITLE_TAGS = ["HEVC", "VIP", "UHD", "FHD", "HD", "SD", "4K", "H265", "H264"];

  // Tags listed in `keep` stay visible in the cleaned title.
  function cleanTitle(str, keep) {
    if (!str) return "";
    const kept = keep || [];
    const tags = TITLE_TAGS.filter((tag) => kept.indexOf(tag) === -1);
    let text = str
      .replace(/^\[[^\]]*\]\s*/, "")
      .replace(/^\([A-Za-z0-9-]+\)\s*/, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/^[A-Z0-9]{2,5}\s*[:|-]\s*/i, "");
    if (tags.length) text = text.replace(new RegExp("\\b(" + tags.join("|") + ")\\b", "gi"), "");
    return text.replace(/\s{2,}/g, " ").trim();
  }
  window.kcCleanTitle = cleanTitle;

  function extractRegionFromCategory(catName, isVod) {
    if (!catName) return "";
    let clean = catName.trim();

    // 1. Check bracketed prefix like (V|PL), (V|TR), (S|TR), (V:TR), (V-TR), (VI-TR), [V|TR]
    const bracketMatch = clean.match(/^[(\[][VS]?[|:_\-\/]([A-Z0-9-]+)[)\]|]/i);
    if (bracketMatch && bracketMatch[1]) {
      let r = bracketMatch[1].replace("-", "").toUpperCase();
      if (/^[VS]([A-Z]{2,3})$/.test(r)) r = RegExp.$1;
      else if (/^[VS][A-Z]{2,4}$/.test(r)) r = r.substring(1);
      return r;
    }

    // 2. Check (VI-TR|...) or similar legacy patterns
    const viMatch = clean.match(/\(VI-?([A-Z0-9]+)[|)]/i);
    if (viMatch && viMatch[1]) {
      let r = viMatch[1].toUpperCase();
      if (/^[VS]([A-Z]{2,3})$/.test(r)) r = RegExp.$1;
      return r;
    }

    // 3. Clean leading symbols
    clean = clean.replace(/^[|\[\(*•#\s]+/, "");
    // Strip section prefix words: VOD, SERIES, MOVIES, etc.
    clean = clean.replace(/^(VOD|SERIES|SERIE|MOVIES|MOVIE|FILMLER|FILM|CINEMA)[\s:|\-_/]+/i, "");
    clean = clean.replace(/^[|\[\(*•#\s]+/, "");

    // 4. Handle "V|TR" or "S|TR" without brackets
    const pipePrefixMatch = clean.match(/^[VS][|:_\-\/]([A-Z0-9-]+)/i);
    if (pipePrefixMatch && pipePrefixMatch[1]) {
      let r = pipePrefixMatch[1].replace("-", "").toUpperCase();
      if (/^[VS]([A-Z]{2,3})$/.test(r)) r = RegExp.$1;
      else if (/^[VS][A-Z]{2,4}$/.test(r)) r = r.substring(1);
      return r;
    }

    // 5. Standard country code prefix: "TR | ...", "TR: ...", "VTR | ...", "STR | ..."
    let prefix = clean.split(/[\s:|\-/]+/)[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (prefix.length >= 2 && prefix.length <= 5) {
      if (/^[VS]([A-Z]{2,3})$/.test(prefix)) {
        prefix = RegExp.$1;
      } else if (/^[VS][A-Z]{2,4}$/.test(prefix)) {
        prefix = prefix.substring(1);
      }
      return prefix;
    }
    return "";
  }

  let clock24h = store.getItem("iptv_clock_24h") !== "0";
  let clockSeconds = store.getItem("iptv_clock_seconds") === "1"; // Default OFF

  function updateClockFormatButton() {
    const button = document.getElementById("clockFormatButton");
    if (button) setIconLabel(button, "clock", `${clock24h ? "24" : "12"} h`);
    const secBtn = document.getElementById("clockSecondsButton");
    if (secBtn) setIconLabel(secBtn, "clock", clockSeconds ? "Saniye: Açık" : "Saniye: Kapalı");
  }

  const updateClocks = () => {
    const now = new Date();
    const timeOpt = { hour: "2-digit", minute: "2-digit", hour12: !clock24h };
    if (clockSeconds) timeOpt.second = "2-digit";
    const clockStr = now.toLocaleTimeString([], timeOpt);
    if (headerClock) headerClock.textContent = clockStr;
    if (osdClock) osdClock.textContent = clockStr;
    if (osdDate) osdDate.textContent = now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
    if (vodOsdClock) vodOsdClock.textContent = clockStr;

    // Update Radial Top Clock
    const rTime = document.getElementById("radialClockTime");
    const rDate = document.getElementById("radialClockDate");
    if (rTime) rTime.textContent = clockStr;
    if (rDate) rDate.textContent = now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
  };
  updateClockFormatButton();
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
    const two = (n) => (n < 10 ? "0" : "") + n;
    return `${two(h)}:${two(m)}:${two(s)}`;
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
    // Saved defaults beat the draft so a TV-keyboard typo can't stick.
    const defaults = window.KC_DEFAULT_LOGIN;
    if (defaults && defaults.server && defaults.username && defaults.password) {
      if (serverUrlInput) serverUrlInput.value = defaults.server;
      if (usernameInput) usernameInput.value = defaults.username;
      if (passwordInput) passwordInput.value = defaults.password;
    }
    if (defaults && defaults.m3uUrl && m3uUrlInput) m3uUrlInput.value = defaults.m3uUrl;
  }

  Object.keys(loginDraftFields).forEach((name) => {
    const field = loginDraftFields[name];
    if (!field) return;
    field.addEventListener("input", saveLoginDraft);
    field.addEventListener("change", saveLoginDraft);
  });

  function buildXtreamM3uUrl(server, username, password) {
    return `${server}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=ts`;
  }

  function normalizeServerUrl(value) {
    let server = value.trim();
    if (server && !/^https?:\/\//i.test(server)) server = `http://${server}`;
    return server.replace(/\/+$/, "");
  }

  function getM3uProfiles() {
    try { return JSON.parse(store.getItem("iptv_m3u_profiles") || "[]").filter(p => p && p.url); } catch (error) { return []; }
  }

  const XTREAM_OPTION = "__xtream__";

  function updateFavoritesTab() {
    const tab = document.querySelector("#modusList [data-modus='favorites']");
    if (!tab) return;
    const hasFavorites = favorites.length > 0;
    tab.classList.toggle("hidden", !hasFavorites);
    if (!hasFavorites && currentModus === "favorites") switchModus("live");
  }

  function renderM3uProfileOptions(selectedUrl = "") {
    if (!m3uProfileSelect) return;
    const profiles = getM3uProfiles();
    m3uProfileSelect.innerHTML = "";
    const newOption = document.createElement("option");
    newOption.value = "";
    newOption.textContent = t("m3uProfileNew");
    m3uProfileSelect.appendChild(newOption);
    if (serverUrlInput && usernameInput && passwordInput && serverUrlInput.value.trim() && usernameInput.value.trim() && passwordInput.value.trim()) {
      const generateOption = document.createElement("option");
      generateOption.value = XTREAM_OPTION;
      generateOption.textContent = t("m3uGenerateXtream");
      m3uProfileSelect.appendChild(generateOption);
    }
    profiles.forEach(profile => {
      const option = document.createElement("option");
      option.value = profile.url;
      option.textContent = profile.name;
      m3uProfileSelect.appendChild(option);
    });
    m3uProfileSelect.value = profiles.some(p => p.url === selectedUrl) ? selectedUrl : "";
  }

  function saveM3uProfile(url, name = "") {
    if (!url) return;
    const profiles = getM3uProfiles();
    const existing = profiles.find(p => p.url === url);
    if (existing) {
      if (name) existing.name = name;
    } else {
      profiles.push({ name: name || `${t("m3uProfiles")} ${profiles.length + 1}`, url });
    }
    store.setItem("iptv_m3u_profiles", JSON.stringify(profiles));
    renderM3uProfileOptions(url);
  }

  function buildXtreamPlaylistFromForm() {
    const server = normalizeServerUrl(serverUrlInput.value);
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!server || !username || !password) return "";
    return buildXtreamM3uUrl(server, username, password);
  }

  // Settings text fields start read-only; OK turns editing on and blur turns it off again.
  function armTextInputs() {
    document.querySelectorAll("#settingsPage input:not([type=checkbox])").forEach((input) => {
      input.readOnly = true;
      input.addEventListener("blur", () => { input.readOnly = true; });
    });
  }

  function initProfile() {
    armTextInputs();
    showAppPage();
    restoreLoginDraft();
    renderM3uProfileOptions();
    let liveProfile = null;
    let vodProfile = null;
    try { liveProfile = JSON.parse(store.getItem("iptv_profile") || "null"); } catch (error) {}
    try { vodProfile = JSON.parse(store.getItem("iptv_xtream_profile") || "null"); } catch (error) {}

    // Older versions saved Xtream as the single profile; it now only serves Movies and Series.
    if (liveProfile && liveProfile.provider === "xtream") {
      vodProfile = vodProfile || { server: liveProfile.server, username: liveProfile.username, password: liveProfile.password };
      store.setItem("iptv_xtream_profile", JSON.stringify(vodProfile));
      store.removeItem("iptv_profile");
      liveProfile = null;
    }

    const defaults = window.KC_DEFAULT_LOGIN;
    if (!vodProfile && defaults && defaults.server && defaults.username && defaults.password) {
      vodProfile = { server: defaults.server, username: defaults.username, password: defaults.password };
    }
    if (vodProfile) {
      if (serverUrlInput) serverUrlInput.value = vodProfile.server || "";
      if (usernameInput) usernameInput.value = vodProfile.username || "";
      if (passwordInput) passwordInput.value = vodProfile.password || "";
    }

    if (!liveProfile && vodProfile) {
      const defaultUrl = ensureDefaultXtreamPlaylist(normalizeServerUrl(vodProfile.server), vodProfile.username, vodProfile.password);
      if (defaultUrl) liveProfile = { provider: "m3u", playlistUrl: defaultUrl };
    }

    if (liveProfile && liveProfile.provider === "m3u") {
      currentAuth = liveProfile;
      setFavoritesProvider("m3u");
      if (m3uUrlInput) m3uUrlInput.value = currentAuth.playlistUrl || "";
      saveM3uProfile(currentAuth.playlistUrl);
      const cachedChannels = loadChannelCache(currentAuth.playlistUrl);
      if (cachedChannels) {
        // Start from the saved playlist without downloading. The playlist only refreshes on the refresh timer.
        allStreams = cachedChannels.streams;
        rebuildStreamIndexes();
        allCategories = cachedChannels.categories || [];
        currentLiveRegion = "ALL";
        setLoginState("logged-in");
        switchModus(favorites.length ? "favorites" : "live");

        let resumed = false;
        if (autoResumeLastChannel) {
          try {
            const raw = store.getItem("iptv_last_stream");
            if (raw) {
              const last = JSON.parse(raw);
              if (last && last.section === "stremio") {
                // User explicitly requested: Disable Stremio autoplay
                // Do not auto-play video on boot for Stremio
                resumed = true;
                deactiveerFitScreen();
              } else if (last && last.streamId) {
                const found = allStreams.find(s => String(s.stream_id) === String(last.streamId));
                if (found) {
                  activeerFitScreen();
                  const targetIdx = currentActiveStreams.findIndex(s => String(s.stream_id) === String(found.stream_id));
                  const playIdx = targetIdx !== -1 ? targetIdx : 0;
                  playStream(found.stream_id, found.name, found.stream_icon, playIdx, found.url || last.directUrl);
                  resumed = true;
                }
              }
            }
          } catch (e) {}

          if (!resumed && currentActiveStreams.length > 0) {
            activeerFitScreen();
            const first = currentActiveStreams[0];
            playStream(first.stream_id, first.name, first.stream_icon, 0, first.url);
          } else if (!resumed) {
            deactiveerFitScreen();
            if (window.AeroRadial) window.AeroRadial.open();
          }
        } else {
          // Auto resume is disabled: do NOT play in background, open radial menu
          deactiveerFitScreen();
          if (window.AeroRadial) window.AeroRadial.open();
        }
      } else {
        login(currentAuth.playlistUrl, "", "", true, "m3u", false);
      }
    } else {
      if (loginMethod) {
        loginMethod.value = "m3u";
        loginMethod.dispatchEvent(new Event("change"));
      }
      setLoginState("failed");
      setLoginErrorMessage(t("noSavedProfile"));
    }

    // Xtream categories load when Movies or Series is opened, not on every start.
    if (vodProfile) xtreamAuth = { server: vodProfile.server, username: vodProfile.username, password: vodProfile.password };
  }

  // Categories are usable before the playlist finishes: a cached playlist is used first,
  // otherwise the provider's live categories are listed until the download replaces them.
  async function showCategoriesWhileDownloading(server, username, password, sourceUrl) {
    const cached = loadChannelCache(sourceUrl);
    if (cached) {
      allStreams = cached.streams;
      rebuildStreamIndexes();
      allCategories = cached.categories || [];
    } else {
      try {
        const url = `${server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_live_categories`;
        const result = await requestText(url);
        const list = result.status === 200 && result.body.trim() ? JSON.parse(result.body) : null;
        // The download may have finished while waiting; its categories are then already in place.
        if (!Array.isArray(list) || !list.length || loadChannelCache(sourceUrl)) return;
        allStreams = [];
        rebuildStreamIndexes();
        allCategories = list.map((cat) => ({ category_id: String(cat.category_id), category_name: cat.category_name }));
      } catch (error) {
        return;
      }
    }
    setupRegions();
    if (currentModus === "live") filterCategories();
  }

  async function loginXtream(server, username, password, background = false) {
    if (loginErrorToast) loginErrorToast.classList.add("hidden");
    if (loginBtn) loginBtn.disabled = true;
    if (!background) setLoginState("logging");

    try {
      if (!server || !username || !password) throw new Error(t("invalidCredentials"));
      const apiBase = `${server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      const fetchApi = async (action) => {
        const result = await requestText(apiBase + (action ? `&action=${action}` : ""));
        if (result.status === 200 && result.body.trim()) {
          try { return JSON.parse(result.body); } catch (error) {}
        }
        throw new Error(`${t("playlistUnavailable")} (HTTP ${result.status}${result.failed ? " " + result.failed : ""}, ${result.body.length}B, ${action || "auth"})`);
      };
      let transportError = null;
      let accountInfo = null;
      const optionalList = async (action) => {
        try {
          const value = await fetchApi(action);
          return Array.isArray(value) ? value : [];
        } catch (error) {
          transportError = transportError || error;
          return [];
        }
      };

      try {
        const account = await fetchApi("");
        if (account && account.user_info && Number(account.user_info.auth) === 0) throw new Error(t("invalidCredentials"));
        accountInfo = account && account.user_info ? account.user_info : null;
      } catch (error) {
        if (error.message === t("invalidCredentials")) throw error;
        transportError = transportError || error;
      }
      xtreamAuth = { server, username, password };
      loginCredentialsRejected = false;
      store.setItem("iptv_xtream_profile", JSON.stringify({ server, username, password }));
      renderLoginAccount(accountInfo);
      if (!background) {
        setLoginState("logged-in");
        showToast(t("loggedIn"));
        setLoginProgress(15, t("progressCategories"));
      }

      const vodCats = await optionalList("get_vod_categories");
      const seriesCats = await optionalList("get_series_categories");
      if (!vodCats.length && !seriesCats.length) throw transportError || new Error(t("invalidCredentials"));

      vodCategories = vodCats;
      seriesCategories = seriesCats;
      try {
        store.setItem("iptv_vod_categories_cache", JSON.stringify(vodCats));
        store.setItem("iptv_series_categories_cache", JSON.stringify(seriesCats));
      } catch (e) {}
      vodStreams = [];
      seriesStreams = [];
      Object.keys(loadedCategories).forEach((key) => { delete loadedCategories[key]; });
      setLoginState("logged-in");
      if (background) {
        if (currentModus === "vod" || currentModus === "series") {
          setupRegions();
          var reg = (currentModus === "vod" ? currentVodRegion : currentLiveRegion) || "ALL";
          var cList = window.kcGetCategories(reg);
          if (cList && cList.length) currentCategoryId = cList[0].category_id;
          filterChannels();
          if (window.AeroRadial) window.AeroRadial.refresh();
        }
      } else {
        // The playlist download is separate from login, so a download failure does not fail the login.
        hideLoginProgress();
        showAppPage();
        const defaultUrl = ensureDefaultXtreamPlaylist(server, username, password);
        if (defaultUrl) {
          showCategoriesWhileDownloading(server, username, password, defaultUrl);
          login(defaultUrl, "", "", false, "m3u", true);
        }
      }
    } catch (error) {
      hideLoginProgress();
      if (error.message === t("invalidCredentials")) loginCredentialsRejected = true;
      renderLoginAccount(null);
      setLoginState(currentAuth ? "logged-in" : "failed");
      showLoginError(error.message || t("playlistUnavailable"));
      toggleLoginPanel(true);
    } finally {
      if (loginBtn) loginBtn.disabled = false;
    }
  }

  function showLoginPage() {
    showAppPage();
    setLoginState("failed");
    toggleLoginPanel(true, true);
  }

  function showAppPage() {
    if (appPage) appPage.classList.remove("hidden");
    toggleLoginPanel(false);
    document.body.classList.add("radial-active");
  }

  if (settingsButton && settingsPanel) {
    settingsButton.addEventListener("click", () => {
      toggleSettingsMenu();
    });

    settingsPanel.addEventListener("click", (e) => {
      const btn = e.target.closest(".settings-item");
      if (!btn) return;
      const setting = btn.dataset.setting;
      if (!setting) return;
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

  const loginTestBtn = document.getElementById("loginTestBtn");
  if (loginTestBtn) {
    loginTestBtn.addEventListener("click", () => {
      if (loginMethod && loginMethod.value === "m3u") {
        showToast(t("playlistUnavailable"));
        return;
      }
      runConnectionTest(serverUrlInput.value.trim(), usernameInput.value.trim(), passwordInput.value);
    });
  }

  if (loginRevealBtn) {
    loginRevealBtn.addEventListener("click", toggleLoginPasswordVisibility);
  }

  if (loginMethod) {
    loginMethod.addEventListener("change", () => {
      const useM3u = loginMethod.value === "m3u";
      if (m3uLoginFields) m3uLoginFields.classList.toggle("hidden", !useM3u);
      if (xtreamLoginFields) xtreamLoginFields.classList.toggle("hidden", useM3u);
      if (useM3u) renderM3uProfileOptions(m3uUrlInput ? m3uUrlInput.value.trim() : "");
      setLoginErrorMessage("");
    });
  }

  if (m3uProfileSelect) {
    m3uProfileSelect.addEventListener("change", () => {
      if (m3uProfileSelect.value === XTREAM_OPTION) {
        if (m3uUrlInput) m3uUrlInput.value = buildXtreamPlaylistFromForm();
        if (m3uProfileNameInput && !m3uProfileNameInput.value.trim()) m3uProfileNameInput.value = "Xtream";
        saveLoginDraft();
        return;
      }
      const url = m3uProfileSelect.value;
      const profile = getM3uProfiles().find(p => p.url === url);
      if (m3uUrlInput) m3uUrlInput.value = url;
      if (m3uProfileNameInput) m3uProfileNameInput.value = profile ? profile.name : "";
      saveLoginDraft();
    });
  }

  const clockFormatButton = document.getElementById("clockFormatButton");
  if (clockFormatButton) {
    clockFormatButton.addEventListener("click", () => {
      clock24h = !clock24h;
      store.setItem("iptv_clock_24h", clock24h ? "1" : "0");
      updateClockFormatButton();
      updateClocks();
    });
  }

  const clockSecondsButton = document.getElementById("clockSecondsButton");
  if (clockSecondsButton) {
    clockSecondsButton.addEventListener("click", () => {
      clockSeconds = !clockSeconds;
      store.setItem("iptv_clock_seconds", clockSeconds ? "1" : "0");
      updateClockFormatButton();
      updateClocks();
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

  let autoResumeLastChannel = store.getItem("iptv_auto_resume_last") === "true";
  if (autoResumeLastChannelToggle) {
    autoResumeLastChannelToggle.checked = autoResumeLastChannel;
    autoResumeLastChannelToggle.addEventListener("change", () => {
      autoResumeLastChannel = autoResumeLastChannelToggle.checked;
      store.setItem("iptv_auto_resume_last", String(autoResumeLastChannel));
    });
  }

  // Off turns off CSS transitions and animations, and makes list scrolling jump straight to the target.
  const animationsToggle = document.getElementById("animationsToggle");
  let animationsEnabled = store.getItem("iptv_animations") === "1";
  function applyAnimationsSetting() {
    document.body.classList.toggle("no-animations", !animationsEnabled);
  }
  applyAnimationsSetting();
  if (animationsToggle) {
    animationsToggle.checked = animationsEnabled;
    animationsToggle.addEventListener("change", () => {
      animationsEnabled = animationsToggle.checked;
      store.setItem("iptv_animations", animationsEnabled ? "1" : "0");
      applyAnimationsSetting();
    });
  }

  if (showEpgToggle) {
    showEpgToggle.checked = epgVisible;
    showEpgToggle.addEventListener("change", () => {
      epgVisible = showEpgToggle.checked;
      store.setItem("iptv_epg_show", String(epgVisible));
      applyEpgVisibility();
      if (epgVisible && currentPlayingStreamId) fetchEPGData(currentPlayingStreamId);
    });
  }
  updateEpgOffsetLabel();
  applyEpgVisibility();

  document.body.classList.toggle("no-region-column", hideRegionColumn);
  if (hideRegionsToggle) {
    hideRegionsToggle.checked = hideRegionColumn;
    hideRegionsToggle.addEventListener("change", () => {
      hideRegionColumn = hideRegionsToggle.checked;
      store.setItem("iptv_hide_regions", String(hideRegionColumn));
      document.body.classList.toggle("no-region-column", hideRegionColumn);
      if (currentModus !== "favorites") setupRegions();
    });
  }

  if (customizationPage) {
    customizationPage.addEventListener("click", e => {
      const customSwatch = e.target.closest(".custom-swatch");
      if (customSwatch) {
        openHuePanel(customSwatch.dataset.customRole);
        return;
      }
      const swatch = e.target.closest(".color-swatch");
      if (swatch) {
        closeHuePanel(swatch.dataset.colorRole);
        updateThemeColor(swatch.dataset.colorRole, swatch.dataset.color);
      }
    });
    customizationPage.addEventListener("input", e => {
      if (e.target.id === "focusWidthRange") {
        updateFocusWidth(e.target.value);
        return;
      }
      if (e.target.id === "bgTintRange") {
        updateBgTint(e.target.value);
        return;
      }
      const slider = e.target.closest(".hue-range");
      if (!slider) return;
      applyHuePanel(slider.dataset.hueRole);
    });
    customizationPage.querySelectorAll(".customization-tab").forEach(tab => {
      tab.addEventListener("focus", () => showCustomizationTab(tab.dataset.tab));
      tab.addEventListener("click", () => showCustomizationTab(tab.dataset.tab));
    });
    customizationPage.querySelectorAll(".customization-nav .settings-item").forEach(item => {
      item.addEventListener("focus", () => centerCustomizationNav(item));
    });
    customizationPage.querySelectorAll(".background-preset").forEach(preset => {
      preset.addEventListener("click", () => updateBackgroundImage(preset.dataset.preset));
    });
  }

  const applyBackgroundButton = document.getElementById("applyBackgroundButton");
  const clearBackgroundButton = document.getElementById("clearBackgroundButton");
  const settingsDone = document.getElementById("settingsDone");
  const settingsBack = document.getElementById("settingsBack");
  if (applyBackgroundButton) applyBackgroundButton.addEventListener("click", () => updateBackgroundImage(backgroundImageInput.value));
  if (clearBackgroundButton) clearBackgroundButton.addEventListener("click", () => updateBackgroundImage(""));
  // Done slides the panel out, then closes it like Back.
  let settingsCloseTimer = null;
  const closeSettingsAnimated = () => {
    if (!settingsPanel || settingsPanel.classList.contains("hidden") || settingsPanel.classList.contains("closing")) return;
    settingsPanel.classList.add("closing");
    clearTimeout(settingsCloseTimer);
    settingsCloseTimer = setTimeout(() => {
      settingsPanel.classList.remove("closing");
      if (!settingsPanel.classList.contains("hidden")) showCustomizationPage(false);
    }, 260);
  };
  if (settingsDone) {
    settingsDone.addEventListener("click", closeSettingsAnimated);
  }
  if (settingsBack) settingsBack.addEventListener("click", () => showCustomizationPage(false));

  applyThemeConfig();
  applyAppLanguage(currentLang);

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (loginMethod && loginMethod.value === "m3u") {
        login(m3uUrlInput.value.trim(), "", "", false, "m3u");
      } else {
        const server = normalizeServerUrl(serverUrlInput.value);
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        if (m3uUrlInput) {
          m3uUrlInput.value = buildXtreamM3uUrl(server, username, password);
          saveLoginDraft();
        }
        login(server, username, password, false, "xtream");
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
      } else if (trimmed && !trimmed.startsWith("#") && pending) {
        const isVodEntry = /\/(movie|series)\//i.test(trimmed) || /\.(mp4|mkv|avi)(?:[?#]|$)/i.test(trimmed);
        if (!isVodEntry) {
          categoryNames.add(pending.category_id);
          streams.push(Object.assign({}, pending, { stream_id: stableStreamId(pending.name, trimmed), url: trimmed }));
        }
        pending = null;
      }
    });

    return {
      streams,
      categories: Array.from(categoryNames).map(name => ({ category_id: name, category_name: name }))
    };
  }

  function setFavoritesProvider(provider) {
    const ns = provider === "xtream" ? "_xtream" : "";
    if (ns === favoritesNs) return;
    favoritesNs = ns;
    favorites = loadFavorites();
  }

  function cacheFavoriteStreams() {
    const wanted = {};
    favorites.forEach((id) => { wanted[String(id)] = true; });
    const kept = {};
    loadFavoriteCache().forEach((s) => { if (wanted[String(s.stream_id)]) kept[String(s.stream_id)] = s; });
    allStreams.forEach((s) => { if (wanted[String(s.stream_id)]) kept[String(s.stream_id)] = s; });
    store.setItem("iptv_fav_cache" + favoritesNs, JSON.stringify(Object.keys(kept).map((id) => kept[id])));
  }

  function loadFavoriteCache() {
    try {
      const list = JSON.parse(store.getItem("iptv_fav_cache" + favoritesNs) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  // Full parsed playlist, so a restart does not download it again. Written straight to localStorage so a full disk is detected.
  function saveChannelCache(source, streams, categories) {
    try {
      window.localStorage.setItem("iptv_channel_cache" + favoritesNs, JSON.stringify({ source, streams, categories }));
      return true;
    } catch (error) {
      try { window.localStorage.removeItem("iptv_channel_cache" + favoritesNs); } catch (e) {}
      return false;
    }
  }

  function loadChannelCache(source) {
    try {
      const cache = JSON.parse(window.localStorage.getItem("iptv_channel_cache" + favoritesNs) || "null");
      if (cache && cache.source === source && Array.isArray(cache.streams) && cache.streams.length) return cache;
    } catch (error) {}
    return null;
  }

  // XHR instead of fetch: the TV's fetch returned empty bodies for this provider.
  function requestText(url, timeout = 60000, onProgress = null) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.timeout = timeout;
      if (onProgress) xhr.onprogress = (event) => onProgress(event.loaded, event.lengthComputable ? event.total : 0);
      xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText || "" });
      xhr.onerror = () => resolve({ status: 0, body: "", failed: "network" });
      xhr.ontimeout = () => resolve({ status: 0, body: "", failed: "timeout" });
      xhr.send();
    });
  }

  // Xtream lists are fetched one category at a time; whole catalogs are too big for the TV.
  const loadedCategories = {};
  const pendingCategoryLoads = {};

  function loadXtreamCategory(kind, categoryId) {
    const key = `${kind}:${categoryId}`;
    if (loadedCategories[key]) return Promise.resolve(true);
    if (pendingCategoryLoads[key]) return pendingCategoryLoads[key];
    const action = { live: "get_live_streams", vod: "get_vod_streams", series: "get_series" }[kind];
    const url = `${xtreamAuth.server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(xtreamAuth.username)}&password=${encodeURIComponent(xtreamAuth.password)}&action=${action}&category_id=${encodeURIComponent(categoryId)}`;
    pendingCategoryLoads[key] = (async () => {
      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          const result = await requestText(url);
          let list = null;
          if (result.status === 200 && result.body.trim()) {
            try { list = JSON.parse(result.body); } catch (error) {}
          }
          if (!Array.isArray(list)) continue;
          if (kind === "live") {
            const known = {};
            allStreams.forEach((s) => { known[String(s.stream_id)] = true; });
            list.forEach((s) => { if (!known[String(s.stream_id)]) allStreams.push(s); });
          } else if (kind === "vod") {
            vodStreams = vodStreams.concat(list);
          } else {
            seriesStreams = seriesStreams.concat(list);
          }
          loadedCategories[key] = true;
          return true;
        }
        return false;
      } finally {
        delete pendingCategoryLoads[key];
      }
    })();
    return pendingCategoryLoads[key];
  }

  async function fetchXtreamAccount(server, username, password) {
    const url = `${server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const result = await requestText(url, 15000);
    if (result.status !== 200 || !result.body.trim()) {
      throw new Error(`${t("playlistUnavailable")} (HTTP ${result.status}${result.failed ? " " + result.failed : ""})`);
    }
    let data = null;
    try { data = JSON.parse(result.body); } catch (error) {}
    if (!data || !data.user_info) throw new Error(t("playlistUnavailable"));
    if (Number(data.user_info.auth) === 0) throw new Error(t("invalidCredentials"));
    return data.user_info;
  }

  // Provider timestamps are Unix seconds; empty or zero means no expiry or creation date.
  function renderLoginAccount(info) {
    if (!loginAccount || !loginAccountRows) return;
    loginAccountRows.textContent = "";
    if (!info) {
      loginAccount.classList.add("hidden");
      return;
    }
    const formatDate = (value) => {
      const seconds = Number(value);
      return seconds ? new Date(seconds * 1000).toLocaleDateString() : "—";
    };
    const expires = Number(info.exp_date);
    let expiresText = t("accountUnlimited");
    if (expires) {
      const days = Math.ceil((expires * 1000 - Date.now()) / 86400000);
      expiresText = `${formatDate(expires)} · ${days > 0 ? t("accountDaysLeft", { days }) : t("accountExpired")}`;
    }
    const formats = Array.isArray(info.allowed_output_formats) && info.allowed_output_formats.length ? info.allowed_output_formats.join(", ") : "—";
    const rows = [
      [t("accountStatus"), info.status || "—"],
      [t("accountExpires"), expiresText],
      [t("accountConnections"), `${info.active_cons || 0} / ${info.max_connections || "?"}`],
      [t("accountTrial"), String(info.is_trial) === "1" ? "✓" : "—"],
      [t("accountCreated"), formatDate(info.created_at)],
      [t("accountFormats"), formats]
    ];
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "login-account-row";
      const labelEl = document.createElement("span");
      labelEl.className = "login-account-label";
      labelEl.textContent = label;
      const valueEl = document.createElement("span");
      valueEl.className = "login-account-value";
      valueEl.textContent = value;
      row.appendChild(labelEl);
      row.appendChild(valueEl);
      loginAccountRows.appendChild(row);
    });
    loginAccount.classList.remove("hidden");
  }

  async function runConnectionTest(server, username, password) {
    if (!server || !username || !password) {
      setLoginErrorMessage(t("invalidCredentials"));
      return;
    }
    setLoginErrorMessage("");
    showToast(t("testingConnection"));
    try {
      renderLoginAccount(await fetchXtreamAccount(server, username, password));
      showToast(t("connectionOk"));
    } catch (error) {
      renderLoginAccount(null);
      showLoginError(error.message);
    }
  }

  function toggleLoginPasswordVisibility() {
    if (!passwordInput || !loginRevealBtn) return;
    const shown = passwordInput.type === "text";
    passwordInput.type = shown ? "password" : "text";
    loginRevealBtn.textContent = t(shown ? "showPassword" : "hidePassword");
  }

  async function login(server, username, password, isAuto = false, provider = "xtream", background = false) {
    if (provider === "xtream") return loginXtream(server, username, password, background);
    if (loginErrorToast) loginErrorToast.classList.add("hidden");
    if (loginBtn) loginBtn.disabled = true;
    if (!background) setLoginState("logging");

    try {
      let startMode = "favorites";
      if (provider === "m3u") {
        if (!server) throw new Error(t("playlistUnavailable"));
        setLoginProgress(10, t("progressPlaylist"));
        const response = await requestText(server, 180000, (loaded, total) => {
          const mb = (loaded / 1048576).toFixed(1);
          setLoginProgress(total ? 10 + (loaded / total) * 60 : 40, `${t("progressPlaylist")} ${mb} MB`);
        });
        if (response.status !== 200) throw new Error(`${t("playlistUnavailable")} (${response.status || response.failed})`);
        const content = response.body;
        if (content.replace(/^\s+/, "").indexOf("#EXTM3U") !== 0) throw new Error(t("playlistInvalid"));
        setLoginProgress(75, t("progressParsing"));
        const playlist = parseM3UPlaylist(content);
        if (playlist.streams.length === 0) throw new Error(t("playlistInvalid"));

        allStreams = playlist.streams;
        rebuildStreamIndexes();
        allCategories = playlist.categories;
        saveChannelCache(server, playlist.streams, playlist.categories);
        setFavoritesProvider("m3u");
        seedM3uFavorites(playlist.streams);
        currentAuth = { provider: "m3u", playlistUrl: server };
        currentLiveRegion = "ALL";
        startMode = "favorites";
      }

      store.setItem("iptv_profile", JSON.stringify(currentAuth));
      hideLoginProgress();
      if (provider === "m3u") saveM3uProfile(server, m3uProfileNameInput ? m3uProfileNameInput.value.trim() : "");
      cacheFavoriteStreams();
      if (!favorites.length && startMode === "favorites") startMode = "live";
      updateFavoritesTab();
      setLoginState("logged-in");
      if (background) {
        setupRegions();
        if (currentModus === "favorites") filterChannels();
        else if (currentModus === "live") filterCategories();
        return;
      }
      activeerFitScreen();
      showAppPage();
      switchModus(startMode);

      if (currentActiveStreams.length > 0) {
        const firstStream = currentActiveStreams[0];
        playStream(firstStream.stream_id, firstStream.name, firstStream.stream_icon, 0, firstStream.url);
      }
    } catch (error) {
      hideLoginProgress();
      if (background) {
        // A failed background download keeps the signed-in account and only reports the download.
        showToast(t("playlistUnavailable"));
        return;
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
    if (guideOpen) hideGuide();
    document.body.classList.remove("speler-fit-screen");
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");

    if (currentAppSection === "stremio") {
      stopLivePlayback();
      destroyStreamPlayers();
      if (tvGrid) tvGrid.classList.add("hidden");
      setTimeout(() => {
        const activeSub = currentStremioSubpage === "tv" ? stremioSubpageTv : (currentStremioSubpage === "series" ? stremioSubpageSeries : stremioSubpageMovies);
        const card = activeSub ? (activeSub.querySelector(".stremio-card.focused") || activeSub.querySelector(".stremio-card.active") || activeSub.querySelector(".stremio-card.focusable")) : null;
        if (card) setElementFocus(card);
      }, 50);
      return;
    }

    if (document.body.classList.contains("radial-active")) {
      if (window.AeroRadial && !window.AeroRadial.isOpen()) {
        window.AeroRadial.open();
      }
      return;
    }

    // Collapse the skipped columns before the layout returns, so the modes list does not flash open.
    if (currentModus === "live" || currentModus === "favorites") setColumnFocus(3);
    if (currentModus === "live" || currentModus === "favorites") {
      setTimeout(() => {
        const card = channelList.querySelector(`[data-stream-id="${currentPlayingStreamId}"]`)
          || channelList.querySelector(".channel-card.active")
          || channelList.querySelector(".channel-card");
        if (card) {
          setElementFocus(card);
        }
      }, 50);
    }
    if (currentModus === "vod" || currentModus === "series") {
      playerWrapper.classList.add("hidden");
      setTimeout(() => {
        const targetFocus = lastFocusedPoster || document.querySelector("#channelList .poster-card") || document.querySelector(".focusable");
        if (targetFocus) setElementFocus(targetFocus);
      }, 50);
    }
  }

  function isColumnSkipped(idx) {
    if (idx === 1) return hideRegionColumn || currentModus === "favorites";
    return idx === 2 && currentModus === "favorites";
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
      if (isColumnSkipped(idx) || idx < activeColIdx) {
        collapseColumn(col);
      } else {
        expandColumn(col);
      }
    });
  }

  // Contents are hidden first, then the column narrows on the next frame.
  function collapseColumn(col) {
    if (col.classList.contains("collapsed")) return;
    clearTimeout(col._revealTimer);
    col._revealTimer = null;
    col._pendingFocus = null;
    cancelAnimationFrame(col._collapseFrame);
    col.classList.add("content-hidden");
    if (document.body.classList.contains("no-animations")) {
      col.classList.add("collapsed");
      return;
    }
    col._collapseFrame = requestAnimationFrame(() => col.classList.add("collapsed"));
  }

  // The width animates first. Contents stay hidden until it settles, so they lay out at full width.
  function expandColumn(col) {
    cancelAnimationFrame(col._collapseFrame);
    const wasCollapsed = col.classList.contains("collapsed");
    col.classList.remove("collapsed");
    if (!col.classList.contains("content-hidden")) return;
    if (!wasCollapsed || document.body.classList.contains("no-animations")) {
      revealColumnContents(col);
      return;
    }
    if (!col._revealTimer) {
      col._revealTimer = setTimeout(() => {
        col._revealTimer = null;
        revealColumnContents(col);
      }, 150);
    }
  }

  // Focus requested during the reveal waits here, because a hidden element cannot take focus.
  function revealColumnContents(col) {
    col.classList.remove("content-hidden");
    const pending = col._pendingFocus;
    col._pendingFocus = null;
    if (pending && pending.element.isConnected && pending.element.classList.contains("focused")) {
      setElementFocus(pending.element, pending.instant);
    }
  }

  function regionFlagPath(reg) {
    const iso = (FLAG_ALIASES[reg] || reg).toLowerCase();
    return iso.length === 2 ? `flags/${iso}.svg` : "";
  }

  function loadRegionFlag(underlay) {
    underlay.style.backgroundImage = `url("${regionFlagPath(underlay.parentElement.dataset.region)}")`;
  }

  function observeRegionFlags() {
    const underlays = regionList.querySelectorAll(".flag-underlay");
    if (!("IntersectionObserver" in window)) {
      underlays.forEach(loadRegionFlag);
      return;
    }
    if (!flagObserver) {
      flagObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          flagObserver.unobserve(entry.target);
          loadRegionFlag(entry.target);
        });
      }, { root: regionList, rootMargin: "100% 0px" });
    }
    underlays.forEach((el) => flagObserver.observe(el));
  }

  function setupRegions(keepCategories) {
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
    if (currentActiveRegion !== "ALL" && (hideRegionColumn || (regions.size > 0 && !regions.has(currentActiveRegion)))) {
      currentActiveRegion = "ALL";
      if (isVod) currentVodRegion = currentActiveRegion;
      else currentLiveRegion = currentActiveRegion;
    }

    const kind = isVod ? "vod" : "live";
    const topRegions = ["TR", "NL", "BE", "PL", "EXYU"];
    const base = topRegions.filter(r => regions.has(r)).concat(Array.from(regions).filter(r => !topRegions.includes(r)).sort());
    const manual = regionPrefs.order[kind];
    let visible = base
      .filter(r => regionPrefs.hidden[kind].indexOf(r) === -1)
      .map((r, i) => ({ r, i, m: manual.indexOf(r) }))
      .sort((x, y) => {
        if (x.m === -1 && y.m === -1) return x.i - y.i;
        if (x.m === -1) return 1;
        if (y.m === -1) return -1;
        return x.m - y.m;
      })
      .map(entry => entry.r);
    const favoriteRegions = visible.filter(r => regionPrefs.fav[kind].indexOf(r) !== -1);
    visible = favoriteRegions.concat(visible.filter(r => favoriteRegions.indexOf(r) === -1));
    regionOrderCache[kind] = visible;

    if (currentActiveRegion !== "ALL" && visible.indexOf(currentActiveRegion) === -1) {
      currentActiveRegion = "ALL";
      if (isVod) currentVodRegion = currentActiveRegion;
      else currentLiveRegion = currentActiveRegion;
    }

    if (flagObserver) flagObserver.disconnect();
    if (document.body.classList.contains("radial-active")) {
      if (!keepCategories) filterCategories();
      return;
    }
    regionList.innerHTML = `<li class="nav-item focusable${currentActiveRegion === "ALL" ? " active" : ""}" data-region="ALL" tabindex="0"><span class="region-label">${t("allRegions")}</span></li>`;

    visible.forEach(reg => {
      const li = document.createElement("li");
      li.className = "nav-item focusable" + (reg === currentActiveRegion ? " active" : "") + (movingRegion === reg ? " moving-region" : "");
      li.dataset.region = reg;
      li.tabIndex = 0;

      if (regionFlagPath(reg)) {
        const underlay = document.createElement("span");
        underlay.className = "flag-underlay";
        underlay.setAttribute("aria-hidden", "true");
        li.appendChild(underlay);
      }
      const isFavRegion = favoriteRegions.indexOf(reg) !== -1;
      const marker = !isFavRegion && topRegions.includes(reg) ? "\u2B50 " : "";
      const label = document.createElement("span");
      label.className = "region-label";
      label.textContent = marker + (customNames[customNameKey("region", reg)] || reg);
      if (isFavRegion) label.insertAdjacentHTML("afterbegin", `<svg class="region-fav-star" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`);
      li.appendChild(label);
      regionList.appendChild(li);
    });
    observeRegionFlags();
    const activeRegionItem = regionList.querySelector(".active");
    if (activeRegionItem) centerInList(activeRegionItem, true);

    if (!keepCategories) filterCategories();
  }

  function regionKind() {
    return (currentModus === "vod" || currentModus === "series") ? "vod" : "live";
  }

  function saveRegionPrefs() {
    store.setItem("iptv_region_prefs", JSON.stringify(regionPrefs));
  }

  function focusRegion(region) {
    const li = regionList.querySelector(`[data-region="${escapeAttr(region)}"]`);
    if (li) setElementFocus(li);
  }

  function toggleRegionFavorite(region) {
    const list = regionPrefs.fav[regionKind()];
    const position = list.indexOf(region);
    if (position >= 0) list.splice(position, 1);
    else list.push(region);
    saveRegionPrefs();
    setupRegions(true);
    focusRegion(region);
  }

  function hideRegion(region) {
    const kind = regionKind();
    const items = Array.from(regionList.querySelectorAll(":scope > li"));
    const position = items.findIndex(li => li.dataset.region === region);
    regionPrefs.hidden[kind].push(region);
    saveRegionPrefs();
    const wasActive = (kind === "vod" ? currentVodRegion : currentLiveRegion) === region;
    setupRegions(!wasActive);
    const remaining = regionList.querySelectorAll(":scope > li");
    if (remaining.length) setElementFocus(remaining[Math.min(position, remaining.length - 1)]);
    showToast(t("categoryHidden"));
  }

  const CUSTOM_NAMES_KEY = "iptv_custom_names";
  let customNames = {};
  try {
    customNames = JSON.parse(store.getItem(CUSTOM_NAMES_KEY) || "{}") || {};
  } catch (_) {
    customNames = {};
  }

  function customNameKey(type, id) {
    return type === "region" ? "region:" + id : "category:" + categoryKind() + ":" + id;
  }

  const renameDialog = document.getElementById("renameDialog");
  const renameInput = document.getElementById("renameInput");
  const renameSave = document.getElementById("renameSave");
  const renameCancel = document.getElementById("renameCancel");
  let renameContext = null;

  function openRenameDialog(type, id, originalLabel, element) {
    renameContext = { type, id, key: customNameKey(type, id), originalLabel, element };
    renameInput.value = customNames[renameContext.key] || "";
    renameInput.placeholder = originalLabel;
    renameDialog.classList.remove("hidden");
    renameInput.focus();
  }

  function closeRenameDialog(save) {
    if (!renameContext) return;
    const ctx = renameContext;
    renameContext = null;
    if (save) {
      const value = renameInput.value.trim();
      if (value) customNames[ctx.key] = value;
      else delete customNames[ctx.key];
      store.setItem(CUSTOM_NAMES_KEY, JSON.stringify(customNames));
    }
    renameDialog.classList.add("hidden");
    if (ctx.type === "region") {
      setupRegions(true);
      focusRegion(ctx.id);
    } else if (ctx.element) {
      ctx.element.textContent = customNames[ctx.key] || ctx.originalLabel;
      setElementFocus(ctx.element);
    }
  }

  // Dialog keys stay inside the dialog so the list underneath does not move
  if (renameDialog) {
    const renameButtons = [renameInput, renameSave, renameCancel];
    renameDialog.addEventListener("keydown", e => {
      e.stopPropagation();
      const k = e.keyCode || e.which;
      const isEnterKey = k === 13 || e.key === "Enter";
      const isBackKey = k === 10009 || k === 461 || k === 27 || e.key === "Back" || e.key === "Escape";
      const isUpKey = k === 38 || e.key === "ArrowUp";
      const isDownKey = k === 40 || e.key === "ArrowDown";
      if (isBackKey) {
        e.preventDefault();
        closeRenameDialog(false);
        return;
      }
      if (isUpKey || isDownKey) {
        e.preventDefault();
        const index = renameButtons.indexOf(e.target);
        const next = Math.min(renameButtons.length - 1, Math.max(0, index + (isDownKey ? 1 : -1)));
        renameButtons[next].focus();
        return;
      }
      if (isEnterKey) {
        // Holding OK sends repeats; ignore them so the dialog does not save the moment it opens
        if (e.repeat) {
          e.preventDefault();
          return;
        }
        if (e.target === renameInput) {
          e.preventDefault();
          closeRenameDialog(true);
        } else if (e.target === renameCancel) {
          e.preventDefault();
          closeRenameDialog(false);
        }
      }
    });
    renameSave.addEventListener("click", () => closeRenameDialog(true));
    renameCancel.addEventListener("click", () => closeRenameDialog(false));
  }

  function toggleRegionMove(region) {
    movingRegion = movingRegion === region ? null : region;
    setupRegions(true);
    focusRegion(region);
    showToast(movingRegion ? t("moveStarted") : t("positionSaved"));
  }

  function stepRegion(delta) {
    const kind = regionKind();
    const order = regionOrderCache[kind].slice();
    const position = order.indexOf(movingRegion);
    const target = position + delta;
    if (position < 0 || target < 0 || target >= order.length) return;
    const isFavorite = (r) => regionPrefs.fav[kind].indexOf(r) !== -1;
    if (isFavorite(order[position]) !== isFavorite(order[target])) return;
    const swapped = order[position];
    order[position] = order[target];
    order[target] = swapped;
    regionPrefs.order[kind] = order;
    saveRegionPrefs();
    setupRegions(true);
    focusRegion(movingRegion);
  }

  function categoryKind() {
    return currentModus === "series" ? "series" : currentModus === "vod" ? "vod" : "live";
  }

  function saveHiddenCategories() {
    store.setItem("iptv_hidden_cats", JSON.stringify(hiddenCategories));
  }

  function scheduleListRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = null;
    if (refreshHours > 0) refreshTimer = setInterval(runListRefresh, refreshHours * 3600000);
  }

  function runListRefresh() {
    // A 24 MB download during playback can stall the stream, so wait for the list screen.
    if (isFitScreen) {
      setTimeout(runListRefresh, 600000);
      return;
    }
    if (currentAuth && currentAuth.provider === "m3u") login(currentAuth.playlistUrl, "", "", true, "m3u", true);
    if (xtreamAuth) loginXtream(xtreamAuth.server, xtreamAuth.username, xtreamAuth.password, true);
  }

  function updateHintBar(element) {
    if (!hintBar) return;
    const inCategories = !!(element && element.closest && element.closest("#categoryList"));
    const inContent = !!(element && element.closest && element.closest("#channelList"));
    const regionItem = element && element.closest ? element.closest("#regionList li") : null;
    const inRegions = !!(regionItem && regionItem.dataset.region !== "ALL");
    const liveLike = currentModus === "live" || currentModus === "favorites";
    const show = (name, on) => {
      const hint = hintBar.querySelector(`[data-hint="${name}"]`);
      if (hint) hint.classList.toggle("hidden", !on);
    };
    show("fav", (inContent && liveLike) || inRegions);
    show("reorder", (inContent && currentModus === "favorites") || inRegions);
    show("hide", inCategories || inRegions);
    show("search", liveLike);
  }

  let searchHits = [];
  let searchTimer = null;

  function openSearch() {
    if (!searchPanel) return;
    searchPanel.classList.remove("hidden");
    searchInput.value = "";
    renderSearchResults();
    setElementFocus(searchInput);
  }

  function closeSearch() {
    if (!searchPanel) return;
    searchPanel.classList.add("hidden");
    searchInput.blur();
    if (window.AeroRadial) window.AeroRadial.open();
  }

  function renderSearchResults() {
    const words = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    searchHits = [];
    if (words.length > 0 && words.join("").length >= 2) {
      for (let i = 0; i < allStreams.length && searchHits.length < 50; i++) {
        const name = String(allStreams[i].name || "").toLowerCase();
        if (words.every((word) => name.indexOf(word) !== -1)) searchHits.push(allStreams[i]);
      }
    }
    searchResults.innerHTML = "";
    searchHits.forEach((stream, index) => {
      const li = document.createElement("li");
      li.className = "channel-card focusable";
      li.tabIndex = 0;
      li.dataset.index = index;
      const name = document.createElement("span");
      name.className = "channel-name";
      name.textContent = cleanTitle(stream.name, QUALITY_TAGS);
      li.appendChild(name);
      searchResults.appendChild(li);
    });
    fitChannelNames(searchResults);
    if (searchEmpty) searchEmpty.classList.toggle("hidden", searchHits.length > 0 || searchInput.value.trim().length < 2);
  }

  function playSearchResult(index) {
    const stream = searchHits[index];
    if (!stream) return;
    currentActiveStreams = searchHits.slice();
    closeSearch();
    playStream(stream.stream_id, stream.name, stream.stream_icon, index, stream.url);
    activeerFitScreen();
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(renderSearchResults, 200);
    });
  }
  if (searchResults) {
    searchResults.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (li) playSearchResult(parseInt(li.dataset.index, 10));
    });
  }

  let categorySearchQuery = "";
  const categorySearch = document.getElementById("categorySearch");
  if (categorySearch) {
    categorySearch.addEventListener("input", () => {
      categorySearchQuery = categorySearch.value.trim().toLowerCase();
      filterCategories();
    });
  }

  function filterCategories() {
    if (!categoryList) return;
    if (document.body.classList.contains("radial-active")) return;
    categoryList.innerHTML = "";

    const isVod = (currentModus === "vod" || currentModus === "series");
    const categoriesToUse = currentModus === "series"
      ? (seriesCategories.length ? seriesCategories : vodCategories)
      : (isVod ? vodCategories : allCategories);
    const activeRegion = isVod ? currentVodRegion : currentLiveRegion;

    const hiddenIds = hiddenCategories[categoryKind()];
    const filtered = categoriesToUse.filter(cat => {
      if (hiddenIds.indexOf(String(cat.category_id)) !== -1) return false;
      if (activeRegion !== "ALL" && extractRegionFromCategory(cat.category_name, isVod) !== activeRegion) return false;
      if (categorySearchQuery && cleanTitle(cat.category_name, ["HEVC", "VIP"]).toLowerCase().indexOf(categorySearchQuery) === -1) return false;
      return true;
    });

    filtered.forEach((cat, index) => {
      const li = document.createElement("li");
      li.className = "nav-item focusable" + (index === 0 ? " active" : "");
      li.dataset.catId = cat.category_id;
      li.tabIndex = 0;
      const originalLabel = cleanTitle(cat.category_name, ["HEVC", "VIP"]);
      li.dataset.label = originalLabel;
      li.textContent = customNames[customNameKey("category", cat.category_id)] || originalLabel;
      categoryList.appendChild(li);
    });

    if (filtered.length > 0) {
      currentCategoryId = filtered[0].category_id;
      filterChannels();
    } else if (channelList) {
      channelList.innerHTML = "";
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
        card.dataset.seasonNum = String(episode.season || season.season_number || "1");
        card.dataset.episodeNum = String(episode.episode_num || "1");
        card.tabIndex = 0;

        const episodeNumber = document.createElement("span");
        episodeNumber.className = "episode-number";
        episodeNumber.textContent = `${season.name} · ${t("episode", { number: episode.episode_num || "?" })}`;
        const episodeTitle = document.createElement("span");
        episodeTitle.className = "episode-title";
        episodeTitle.textContent = card.dataset.title;
        card.appendChild(episodeNumber);
        card.appendChild(episodeTitle);
        channelList.appendChild(card);
      });
    });
  }

  async function openSeries(seriesCard) {
    const seriesId = seriesCard.dataset.seriesId;
    if (!seriesId) return;

    if (seriesCard.dataset.isStremio === "true" && window.StremioEngine) {
      selectedSeries = { id: seriesId, title: seriesCard.dataset.title, seasons: [], isStremio: true, addonUrl: seriesCard.dataset.addonUrl };
      channelList.innerHTML = "";
      contentTitle.textContent = selectedSeries.title;
      renderCategoryPlaceholders();
      window.StremioEngine.getSeriesMeta(seriesId, seriesCard.dataset.addonUrl, function(meta) {
        if (!meta || !Array.isArray(meta.videos)) {
          showToast("Unable to load episodes");
          return;
        }
        const seasonMap = {};
        meta.videos.forEach(function(v) {
          const sNum = v.season || 1;
          if (!seasonMap[sNum]) {
            seasonMap[sNum] = { name: "Season " + sNum, season_number: sNum, episodes: [] };
          }
          seasonMap[sNum].episodes.push({
            id: v.id,
            stream_id: v.id,
            title: v.name || ("Episode " + (v.episode || "")),
            episode_num: v.episode || 1,
            season: sNum,
            isStremio: true
          });
        });
        const seasons = Object.keys(seasonMap).sort((a,b) => Number(a)-Number(b)).map(k => seasonMap[k]);
        selectedSeries = { id: seriesId, title: seriesCard.dataset.title, seasons: seasons, isStremio: true };
        renderSeriesEpisodes();
        const firstEp = channelList.querySelector(".episode-card");
        if (firstEp) setElementFocus(firstEp);
      });
      return;
    }

    if (!xtreamAuth) return;

    selectedSeries = { id: seriesId, title: seriesCard.dataset.title, seasons: [] };
    channelList.innerHTML = "";
    contentTitle.textContent = selectedSeries.title;
    const loading = document.createElement("div");
    loading.className = "season-heading";
    loading.textContent = t("loadingEpisodes");
    channelList.appendChild(loading);

    try {
      const url = `${xtreamAuth.server}/player_api.php?username=${xtreamAuth.username}&password=${xtreamAuth.password}&action=get_series_info&series_id=${encodeURIComponent(seriesId)}`;
      const response = await requestText(url);
      if (response.status !== 200 || !response.body.trim()) throw new Error("Series details unavailable");
      const info = JSON.parse(response.body);
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
      showToast(`${t("unableLoad")}: ${error && error.message ? error.message : error}`);
    }
  }

  // Posters load only near the viewport; thousands of image requests stall the TV.
  function loadVisiblePosters() {
    if (posterObserver && channelList && channelList.classList.contains("netflix-grid")) return;
    const height = window.innerHeight || 720;
    const images = channelList ? channelList.querySelectorAll("img[data-src]") : [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const rect = img.getBoundingClientRect();
      if (rect.bottom > -height * 0.25 && rect.top < height * 1.25) {
        const src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
        if (src) img.src = src;
      }
    }
  }

  let posterScrollTimer = null;
  document.addEventListener("scroll", () => {
    if (posterScrollTimer) return;
    posterScrollTimer = setTimeout(() => {
      posterScrollTimer = null;
      loadVisiblePosters();
    }, 150);
  }, true);

  // Shrink long channel names so they fit on one line; measured in one pass to avoid repeated reflows.
  function fitChannelNames(root) {
    const names = Array.from(root.querySelectorAll(".channel-name"));
    names.forEach(el => el.style.removeProperty("font-size"));
    const plan = names.map(el => {
      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow <= 0) return null;
      const base = parseFloat(getComputedStyle(el).fontSize);
      const scale = Math.max(0.6, (el.clientWidth / el.scrollWidth) * 0.97);
      return { el, size: base * scale };
    });
    plan.forEach(item => {
      if (item) item.el.style.setProperty("font-size", `${item.size}px`, "important");
    });
  }

  function renderCategoryPlaceholders() {
    if (currentModus === "live" || currentModus === "favorites") {
      playerWrapper.classList.remove("hidden");
      colContent.classList.remove("vod-mode-active");
      channelList.className = "channel-grid";
      channelList.innerHTML = '<div style="padding:24px;color:#94a3b8;font-size:1.3rem;">Loading channels...</div>';
      return;
    }
    playerWrapper.classList.add("hidden");
    colContent.classList.add("vod-mode-active");
    channelList.className = "netflix-grid";
    channelList.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const card = document.createElement("div");
      card.className = "poster-card is-placeholder";
      card.innerHTML = '<div class="poster-media"></div>';
      channelList.appendChild(card);
    }
  }

  function renderCategoryStatus(text) {
    channelList.innerHTML = "";
    const status = document.createElement("div");
    status.className = "category-status";
    status.textContent = text;
    channelList.appendChild(status);
  }

  // Movie and series grids scroll inside channelList, so it is the observer root.
  // Posters inside a one-screen band around the viewport are loaded once scrolling settles;
  // posters that leave the band are unloaded so decoded images do not pile up in big categories.
  let posterObserver = null;
  let posterLoadQueue = [];
  let posterFlushTimer = null;
  let lastNavigationAt = 0;
  // Few posters download at once so heavy images do not block the TV's main thread.
  const POSTER_MAX_IN_FLIGHT = 2;
  let posterInFlight = 0;
  let posterEpoch = 0;

  function finishPosterLoad(img, epoch) {
    if (!img._posterInFlight) return;
    img._posterInFlight = false;
    if (epoch === posterEpoch) posterInFlight = Math.max(0, posterInFlight - 1);
    if (posterLoadQueue.length && !posterFlushTimer) posterFlushTimer = setTimeout(flushPosterLoads, 60);
  }

  // Navigation has priority: posters wait until focus has been still briefly, then load within the in-flight cap.
  function flushPosterLoads() {
    posterFlushTimer = null;
    if (Date.now() - lastNavigationAt < 350) {
      posterFlushTimer = setTimeout(flushPosterLoads, 350);
      return;
    }
    const epoch = posterEpoch;
    while (posterInFlight < POSTER_MAX_IN_FLIGHT && posterLoadQueue.length) {
      const img = posterLoadQueue.shift();
      if (!img.inBand || img.getAttribute("src") || !img.dataset.src) continue;
      posterInFlight++;
      img._posterInFlight = true;
      const done = () => finishPosterLoad(img, epoch);
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
      img.src = img.dataset.src;
    }
    if (posterLoadQueue.length && !posterFlushTimer) posterFlushTimer = setTimeout(flushPosterLoads, 120);
  }

  function schedulePosterFlush() {
    clearTimeout(posterFlushTimer);
    posterFlushTimer = setTimeout(flushPosterLoads, 200);
  }

  function unloadPoster(img) {
    if (!img.getAttribute("src")) return;
    if (img._posterInFlight) {
      img._posterInFlight = false;
      posterInFlight = Math.max(0, posterInFlight - 1);
    }
    img.removeAttribute("src");
    img.style.visibility = "";
    img.parentNode.classList.remove("is-loaded", "is-failed");
  }

  function observeVodPosters() {
    if (posterObserver) posterObserver.disconnect();
    clearTimeout(posterFlushTimer);
    posterFlushTimer = null;
    posterLoadQueue = [];
    posterEpoch++;
    posterInFlight = 0;
    if (!("IntersectionObserver" in window)) { loadVisiblePosters(); return; }
    posterObserver = new IntersectionObserver((entries) => {
      let queued = false;
      entries.forEach((entry) => {
        const img = entry.target;
        if (entry.isIntersecting) {
          img.inBand = true;
          img.parentNode.classList.remove("is-away");
          if (!img.getAttribute("src") && img.dataset.src) {
            posterLoadQueue.push(img);
            queued = true;
          }
        } else {
          img.inBand = false;
          img.parentNode.classList.add("is-away");
          unloadPoster(img);
        }
      });
      if (queued) schedulePosterFlush();
    }, { root: channelList, rootMargin: "100% 0px 100% 0px" });
    channelList.querySelectorAll("img[data-src]").forEach((img) => posterObserver.observe(img));
  }

  function filterChannels() {
    if (!channelList) return;
    channelList.innerHTML = "";

    const loadKind = currentModus === "vod" ? "vod"
      : (currentModus === "series" && !selectedSeries) ? "series" : null;
    if (loadKind && xtreamAuth && currentCategoryId !== null
        && !loadedCategories[`${loadKind}:${currentCategoryId}`]) {
      const requestedModus = currentModus;
      const requestedCategory = currentCategoryId;
      const requestKey = `${loadKind}:${requestedCategory}`;
      const isCurrentRequest = () => currentModus === requestedModus && currentCategoryId === requestedCategory;
      renderCategoryPlaceholders();
      const timer = setTimeout(() => {
        if (isCurrentRequest() && !loadedCategories[requestKey]) renderCategoryStatus(t("categoryLoadTimeout"));
      }, CATEGORY_LOAD_TIMEOUT_MS);
      loadXtreamCategory(loadKind, requestedCategory).then((ok) => {
        clearTimeout(timer);
        if (!ok) {
          loadedCategories[requestKey] = true;
          showToast(t("playlistUnavailable"));
        }
        if (isCurrentRequest()) {
          filterChannels();
          if (window.AeroRadial) window.AeroRadial.refresh();
        }
      });
      return;
    }

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

        const posterSrc = item.stream_icon || item.cover || "";
        const posterState = posterSrc ? "" : " is-failed";
        div.innerHTML = `
          <div class="poster-media${posterState}">
            <img data-src="${posterSrc}" class="poster-img" alt="" decoding="async" onload="this.parentNode.classList.add('is-loaded')" onerror="this.parentNode.classList.add('is-failed'); this.style.visibility='hidden'">
          </div>
          <div class="poster-info">
            <div class="poster-title">${displayTitle}</div>
          </div>
        `;
        channelList.appendChild(div);
      });
      observeVodPosters();
      applyPendingFocus();
      return;
    }

    playerWrapper.classList.remove("hidden");
    colContent.classList.remove("vod-mode-active");
    channelList.className = "channel-grid";
    contentTitle.textContent = t("channels");

    if (currentModus === "favorites") {
      currentActiveStreams = [];
      if (favorites && favorites.length) {
        for (let f = 0; f < favorites.length; f++) {
          const item = streamByIdMap[String(favorites[f])];
          if (item) currentActiveStreams.push(item);
        }
      }
    } else {
      currentActiveStreams = streamsByCatMap[String(currentCategoryId)] || [];
      if (!currentActiveStreams.length && allStreams.length) {
        currentActiveStreams = allStreams.filter(s => {
          if (currentLiveRegion === "ALL" || !currentLiveRegion) return true;
          return extractRegionFromCategory(s.category_name || "", false) === currentLiveRegion;
        });
      }
    }

    channelList.innerHTML = "";
    if (document.body.classList.contains("radial-active")) {
      if (window.AeroRadial) window.AeroRadial.refresh();
      return;
    }

    const domBatch = currentActiveStreams.slice(0, 50);
    domBatch.forEach((s, idx) => {
      const isFav = favorites.includes(s.stream_id.toString());
      const numStr = (idx + 1).toString();

      const li = document.createElement("li");
      li.className = "channel-card focusable" + (String(s.stream_id) === String(currentPlayingStreamId) ? " active" : "");
      li.dataset.streamId = s.stream_id;
      li.dataset.index = idx;
      li.dataset.streamIcon = s.stream_icon || "";
      li.dataset.streamUrl = s.url || "";
      li.tabIndex = 0;
      const logoHtml = s.stream_icon 
        ? `<img data-src="${s.stream_icon}" class="channel-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="channel-logo-placeholder" style="display:none;">TV</div>`
        : `<div class="channel-logo-placeholder">TV</div>`;

      const starColor = isFav ? "#ffd700" : "#444455";
      const starSvg = `<svg style="width:24px;height:24px;fill:${starColor};min-width:24px;" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;

      li.innerHTML = `
        <span class="channel-number">${numStr}</span>
        ${logoHtml}
        <span class="channel-name">${cleanTitle(s.name, currentModus === "favorites" ? [] : QUALITY_TAGS)}</span>
        ${starSvg}
      `;
      channelList.appendChild(li);
    });
    fitChannelNames(channelList);
    const activeCard = channelList.querySelector(".channel-card.active");
    if (activeCard) centerInList(activeCard, true);
    loadVisiblePosters();
    applyPendingFocus();
    if (window.AeroRadial) window.AeroRadial.refresh();
  }

  function switchModus(modus) {
    if (modus !== currentModus) selectedSeries = null;
    if ((modus === "vod" || modus === "series") && lastLive) stopLivePlayback();
    currentModus = modus;
    document.body.classList.toggle("favorites-mode", modus === "favorites");
    document.querySelectorAll("#modusList .nav-item").forEach(el => el.classList.toggle("active", el.dataset.modus === modus));

    if (headerModeIndicator) {
      const modeKeys = { favorites: "modeFavorites", live: "modeLive", vod: "modeMovies", series: "modeSeries" };
      headerModeIndicator.textContent = t(modeKeys[modus]) || "TV";
    }

    setupRegions();
    if ((modus === "vod" || modus === "series") && !vodCategories.length && !seriesCategories.length && xtreamAuth && !xtreamCategoriesLoading) {
      xtreamCategoriesLoading = true;
      loginXtream(xtreamAuth.server, xtreamAuth.username, xtreamAuth.password, true).finally(() => { xtreamCategoriesLoading = false; });
    }
    if (modus === "favorites") {
      setColumnFocus(0);
      filterChannels();
    }
  }

  function toggleFavorite(streamId) {
    if (!streamId) return;
    const sId = streamId.toString();
    const idx = favorites.indexOf(sId);
    const focusedNow = document.activeElement;
    const wasInList = !!(focusedNow && focusedNow.closest && focusedNow.closest("#channelList"));
    const listPosition = wasInList ? Array.prototype.indexOf.call(channelList.children, focusedNow) : -1;
    if (idx >= 0) {
      favorites.splice(idx, 1);
      showToast(`⭐ ${t("favoritesRemoved")}`);
    } else {
      favorites.push(sId);
      showToast(`⭐ ${t("favoritesAdded")}`);
    }
    saveFavorites(favorites);
    cacheFavoriteStreams();
    updateFavoritesTab();
    filterChannels();
    if (wasInList) {
      const cards = channelList.querySelectorAll(".focusable");
      const sameCard = channelList.querySelector(`[data-stream-id="${escapeAttr(sId)}"]`);
      const target = sameCard || cards[Math.max(0, Math.min(cards.length - 1, listPosition))];
      if (target) setElementFocus(target);
    }
  }

  // Pick-stack move (favourites only). OK picks up channels into a stack shown in a slot, Up/Down moves the slot,
  // OK takes the channel under the gap into the stack, red drops, Back undoes. The favourites are only written on red.
  function moveSlot() {
    return channelList.querySelector(".pick-slot");
  }

  function resetMoveState() {
    moveMode = false;
    moveStack = [];
    moveFirstId = null;
    if (moveBanner) moveBanner.classList.add("hidden");
  }

  function toggleMoveMode() {
    if (currentModus !== "favorites") {
      showToast(`⚠️ ${t("moveOnlyFavorites")}`);
      return;
    }
    if (moveMode && moveStack.length) {
      dropMove();
      return;
    }
    if (moveMode) {
      cancelMoveMode();
      return;
    }
    moveMode = true;
    if (moveBanner) moveBanner.classList.remove("hidden");
    showToast(`🔴 ${t("moveStarted")}`);
  }

  // Back with a held stack undoes it: favourites were never changed, so rebuilding the list restores the order.
  function cancelMoveMode() {
    const firstId = moveFirstId;
    const hadStack = moveStack.length > 0;
    resetMoveState();
    if (hadStack) {
      filterChannels();
      const target = channelList.querySelector(`[data-stream-id="${escapeAttr(firstId)}"]`);
      if (target) setElementFocus(target, true);
    } else {
      const focusedRow = channelList.querySelector(".focused");
      if (focusedRow) centerInList(focusedRow, true);
    }
  }

  function dropMove() {
    const slot = moveSlot();
    const ids = [];
    wheelItems(channelList).forEach((el) => {
      if (el === slot) ids.push(...moveStack);
      else if (el.dataset.streamId) ids.push(el.dataset.streamId.toString());
    });
    // Favourites not shown in this list keep their place at the end.
    favorites.forEach((id) => {
      const key = String(id);
      if (!ids.includes(key)) ids.push(key);
    });
    const firstId = moveFirstId;
    favorites.splice(0, favorites.length, ...ids);
    saveFavorites(favorites);
    resetMoveState();
    filterChannels();
    const target = channelList.querySelector(`[data-stream-id="${escapeAttr(firstId)}"]`);
    if (target) setElementFocus(target, true);
    showToast(`✅ ${t("positionSaved")}`);
  }

  // The first OK turns the focused channel into the slot. Each later OK takes the channel under the gap into the stack.
  function pickUpMove(row) {
    if (!moveMode || currentModus !== "favorites") return;
    let slot = moveSlot();
    if (!slot) {
      if (!row || !row.dataset.streamId) return;
      moveFirstId = row.dataset.streamId.toString();
      moveStack = [moveFirstId];
      slot = row;
    } else {
      const rows = wheelItems(channelList);
      const next = rows[(rows.indexOf(slot) + 1) % rows.length];
      if (!next || next === slot || !next.dataset.streamId) return;
      moveStack.push(next.dataset.streamId.toString());
      next.remove();
    }
    slot.classList.add("pick-slot");
    refreshMoveList(slot);
    renderMoveStack(slot);
    syncWheelCopies(channelList);
    centerInList(slot, true);
  }

  // Moves the slot one row. The list loops, so moving past either end wraps; a wrap is instant.
  function stepMoveSlot(delta) {
    const slot = moveSlot();
    const rows = wheelItems(channelList);
    const n = rows.length;
    if (!slot || n < 2) return;
    const g = rows.indexOf(slot);
    const newG = (g + delta + n) % n;
    const others = rows.filter((el) => el !== slot);
    channelList.insertBefore(slot, others[newG] || null);
    refreshMoveList(slot);
    syncWheelCopies(channelList);
    const wrapped = (delta > 0 && g === n - 1) || (delta < 0 && g === 0);
    centerInList(slot, wrapped);
  }

  // The stack takes one number per channel it holds. The row under the gap gets .pick-preview, so OK visibly targets it.
  function refreshMoveList(slot) {
    const rows = wheelItems(channelList);
    const g = rows.indexOf(slot);
    const K = moveStack.length;
    const n = rows.length;
    const next = n > 1 ? rows[(g + 1) % n] : null;
    rows.forEach((el, i) => {
      el.dataset.index = i;
      const num = el.querySelector(".channel-number");
      if (num) num.textContent = (i < g ? i + 1 : i === g ? g + 1 : i + K).toString();
      el.classList.toggle("pick-preview", el === next);
    });
  }

  // Draws the held channels as same-sized frames, each 3px further down-right than the one below. The last picked is the top frame.
  function renderMoveStack(slot) {
    slot.querySelectorAll(":scope > .pick-layer").forEach((el) => el.remove());
    const count = moveStack.length;
    const frames = Math.min(count, 4);
    const byId = new Map(allStreams.map((s) => [String(s.stream_id), s]));
    const nameOf = (id) => {
      const s = byId.get(id);
      return s ? cleanTitle(s.name) : id;
    };
    for (let i = 0; i < frames; i++) {
      const layer = document.createElement("div");
      const inset = 3 * (frames - 1 - i);
      const isTop = i === frames - 1;
      layer.className = "pick-layer" + (isTop ? " top" : "");
      layer.style.top = `${3 * i}px`;
      layer.style.left = `${3 * i}px`;
      layer.style.bottom = `${inset}px`;
      layer.style.right = `${inset}px`;
      if (isTop) {
        const name = document.createElement("span");
        name.className = "pick-name";
        name.textContent = nameOf(moveStack[count - 1]);
        layer.appendChild(name);
        if (count > 1) {
          const badge = document.createElement("span");
          badge.className = "pick-count";
          badge.textContent = `×${count}`;
          layer.appendChild(badge);
        }
      }
      slot.appendChild(layer);
    }
  }

  // M3U channels carry the Xtream stream id in their URL, so the Xtream API can supply the guide.
  function epgStreamIdFor(streamId) {
    if (!xtreamAuth) return null;
    const stream = allStreams.find((s) => String(s.stream_id) === String(streamId));
    if (!stream || !stream.url) return null;
    try {
      const streamUrl = new URL(stream.url);
      if (streamUrl.origin !== new URL(xtreamAuth.server).origin) return null;
      const match = streamUrl.pathname.match(/\/(\d+)(?:\.\w+)?$/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  function resetEpgTexts() {
    document.getElementById("epgCurrTitle").textContent = t("liveNow");
    document.getElementById("epgCurrTime").textContent = "--:--";
    document.getElementById("epgNextTitle").textContent = t("noNextProgram");
    document.getElementById("epgNextTime").textContent = "--:--";

    if (osdEpgCurrTitle) osdEpgCurrTitle.textContent = t("liveNow");
    if (osdEpgCurrDesc) osdEpgCurrDesc.textContent = "";
    if (osdEpgCurrTime) osdEpgCurrTime.textContent = "--:--";
    if (osdEpgNextTitle) osdEpgNextTitle.textContent = t("noNextProgram");
    if (osdEpgNextTime) osdEpgNextTime.textContent = "--:--";
  }

  function updateEpgOffsetLabel() {
    const valueEl = document.getElementById("epgOffsetValue");
    if (valueEl) valueEl.textContent = `${epgOffsetHours > 0 ? "+" : ""}${epgOffsetHours} h`;
  }

  function applyEpgVisibility() {
    const panel = document.getElementById("epgPreviewPanel");
    const osdInfo = document.querySelector(".osd-epg-info");
    if (panel) panel.classList.toggle("hidden", !epgVisible);
    if (osdInfo) osdInfo.classList.toggle("hidden", !epgVisible);
  }

  const epgCache = {};

  // Raw Xtream listings for a channel, cached for five minutes.
  async function getEpgListings(streamId) {
    const epgId = epgStreamIdFor(streamId);
    if (!epgId) return null;
    const cached = epgCache[epgId];
    if (cached && Date.now() - cached.at < 300000) return cached.epgs;
    try {
      const result = await requestText(`${xtreamAuth.server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(xtreamAuth.username)}&password=${encodeURIComponent(xtreamAuth.password)}&action=get_short_epg&stream_id=${epgId}&limit=3`, 15000);
      if (result.status !== 200 || !result.body.trim()) return null;
      const data = JSON.parse(result.body);
      if (!data || !data.epg_listings || data.epg_listings.length === 0) return null;
      epgCache[epgId] = { at: Date.now(), epgs: data.epg_listings };
      return data.epg_listings;
    } catch (error) {
      return null;
    }
  }

  // Cached listings only (no network), used when painting the guide.
  function cachedEpgListings(streamId) {
    const epgId = epgStreamIdFor(streamId);
    const cached = epgId ? epgCache[epgId] : null;
    return cached && Date.now() - cached.at < 300000 ? cached.epgs : null;
  }

  function decodeEpgText(str) {
    if (!str) return "";
    try { return decodeURIComponent(escape(atob(str))); } catch (e) { return str; }
  }

  // Index of the listing on air now. Xtream often lists past shows first, so this compares
  // against the offset-adjusted clock to match the offset-adjusted times shown to the user.
  function onAirIndex(epgs) {
    if (!epgs.some((l) => Number(l.start_timestamp) > 0)) return 0;
    const nowSec = Date.now() / 1000 - epgOffsetHours * 3600;
    const startOf = (l) => Number(l.start_timestamp) || 0;
    const endOf = (l) => Number(l.stop_timestamp || l.end_timestamp) || 0;
    const live = epgs.findIndex((l) => startOf(l) <= nowSec && nowSec < endOf(l));
    if (live >= 0) return live;
    const upcoming = epgs.findIndex((l) => startOf(l) > nowSec);
    return upcoming === -1 ? epgs.length - 1 : Math.max(0, upcoming - 1);
  }

  // Now/next programme for a channel, with the user's EPG offset applied.
  function nowNextFrom(epgs) {
      const pad2 = (n) => (n < 10 ? "0" : "") + n;
      // Times are shown with the user's offset. Stamps are epoch seconds from the provider.
      const clock = (listing, field) => {
        const stamp = Number(listing[field + "_timestamp"] || (field === "end" ? listing.stop_timestamp : 0));
        let ms = stamp ? stamp * 1000 : NaN;
        if (!stamp && listing[field]) ms = new Date(listing[field].replace(" ", "T") + "Z").getTime();
        if (isNaN(ms)) return listing[field] ? listing[field].substring(11, 16) : "";
        const d = new Date(ms + epgOffsetHours * 3600000);
        return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
      };

      const idx = onAirIndex(epgs);
      const current = epgs[idx];
      const next = epgs[idx + 1];
      return {
        current: { title: decodeEpgText(current.title) || t("liveNow"), description: decodeEpgText(current.description), time: `${clock(current, "start")} - ${clock(current, "end")}` },
        next: next ? { title: decodeEpgText(next.title) || t("noNextProgram"), time: clock(next, "start") } : null
      };
  }

  let epgDebounceTimer = null;

  function applyEpgInfoToUI(info) {
    if (!info || !info.current) return;
    const currTitleEl = document.getElementById("epgCurrTitle");
    const currTimeEl = document.getElementById("epgCurrTime");
    if (currTitleEl) currTitleEl.textContent = info.current.title;
    if (currTimeEl) currTimeEl.textContent = info.current.time;
    if (osdEpgCurrTitle) osdEpgCurrTitle.textContent = info.current.title;
    if (osdEpgCurrDesc) osdEpgCurrDesc.textContent = info.current.description || "";
    if (osdEpgCurrTime) osdEpgCurrTime.textContent = info.current.time;

    if (info.next) {
      const nextTitleEl = document.getElementById("epgNextTitle");
      const nextTimeEl = document.getElementById("epgNextTime");
      if (nextTitleEl) nextTitleEl.textContent = info.next.title;
      if (nextTimeEl) nextTimeEl.textContent = info.next.time;
      if (osdEpgNextTitle) osdEpgNextTitle.textContent = info.next.title;
      if (osdEpgNextTime) osdEpgNextTime.textContent = info.next.time;
    }
  }

  async function fetchEPGData(streamId) {
    resetEpgTexts();
    if (!epgVisible) return;
    if (epgDebounceTimer) {
      clearTimeout(epgDebounceTimer);
      epgDebounceTimer = null;
    }

    // Instant paint if already in memory cache (zero network delay)
    const epgId = epgStreamIdFor(streamId);
    const cached = epgId ? epgCache[epgId] : null;
    if (cached && Date.now() - cached.at < 300000 && cached.epgs) {
      if (String(currentPlayingStreamId) !== String(streamId)) return;
      const info = nowNextFrom(cached.epgs);
      applyEpgInfoToUI(info);
      return;
    }

    // 350ms Debounce: During rapid zapping, don't compete with video buffer network requests
    epgDebounceTimer = setTimeout(async () => {
      if (String(currentPlayingStreamId) !== String(streamId)) return;
      const epgs = await getEpgListings(streamId);
      if (!epgs || String(currentPlayingStreamId) !== String(streamId)) return;
      const info = nowNextFrom(epgs);
      applyEpgInfoToUI(info);
    }, 350);
  }

  // GUIDE OVERLAY (opened with the Guide key while fullscreen)
  const guideOverlay = document.getElementById("guideOverlay");
  const guideRows = document.getElementById("guideRows");
  const guideRuler = document.getElementById("guideRuler");
  const guideNowLine = document.getElementById("guideNowLine");
  const guideClock = document.getElementById("guideClock");
  const guideDate = document.getElementById("guideDate");
  const guideInfoChannel = document.getElementById("guideInfoChannel");
  const guideInfoProgramme = document.getElementById("guideInfoProgramme");
  const guideInfoTime = document.getElementById("guideInfoTime");
  const guideInfoDesc = document.getElementById("guideInfoDesc");
  const GUIDE_ROWS = 8;
  const GUIDE_LOOK_BACK_MS = 30 * 60000;
  const GUIDE_SPAN_MS = 150 * 60000;
  let guideOpen = false;
  let guideSelected = 0;
  let guideViewStart = 0;
  let guideWindow = null;
  let guideMinute = -1;
  let guideRenderToken = 0;
  let guideEpgTimer = null;
  let guideClockTimer = null;

  function formatGuideTime(ms) {
    return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: !clock24h });
  }

  // Places an element on the timeline; the channel column sits left of the time area.
  function setTimelinePosition(el, fraction) {
    const clamped = Math.max(0, Math.min(1, fraction));
    el.style.left = `calc(var(--guide-ch-w) + (100% - var(--guide-ch-w)) * ${clamped})`;
  }

  function updateGuideClock() {
    const now = new Date();
    if (guideClock) guideClock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: !clock24h });
    if (guideDate) guideDate.textContent = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
    if (guideWindow) setTimelinePosition(guideNowLine, (now.getTime() - guideWindow.start) / GUIDE_SPAN_MS);
    if (now.getMinutes() !== guideMinute) {
      guideMinute = now.getMinutes();
      renderGuide();
    }
  }

  // Half-hour labels across the window, aligned to local clock times.
  function renderGuideRuler(winStart, winEnd) {
    guideRuler.textContent = "";
    const cursor = new Date(winStart);
    cursor.setSeconds(0, 0);
    while (cursor.getTime() < winStart) cursor.setMinutes(cursor.getMinutes() + 1);
    for (; cursor.getTime() <= winEnd; cursor.setMinutes(cursor.getMinutes() + 1)) {
      if (cursor.getMinutes() % 30 !== 0) continue;
      const tick = document.createElement("span");
      tick.className = "guide-tick";
      tick.textContent = formatGuideTime(cursor.getTime());
      setTimelinePosition(tick, (cursor.getTime() - winStart) / GUIDE_SPAN_MS);
      guideRuler.appendChild(tick);
    }
  }

  // Start and end in ms, with the user's EPG offset applied so they line up with the clock.
  function listingSpan(listing) {
    const toMs = (stamp, text) => {
      if (Number(stamp)) return Number(stamp) * 1000;
      return text ? new Date(String(text).replace(" ", "T") + "Z").getTime() : NaN;
    };
    const start = toMs(listing.start_timestamp, listing.start);
    const end = toMs(listing.stop_timestamp || listing.end_timestamp, listing.end);
    const shift = epgOffsetHours * 3600000;
    return [start + shift, end + shift];
  }

  function paintGuideTrack(track, epgs, win, selected) {
    track.textContent = "";
    if (!epgs) return;
    const span = win.end - win.start;
    const onAir = onAirIndex(epgs);
    epgs.forEach((listing, index) => {
      const [s, e] = listingSpan(listing);
      if (!(e > win.start && s < win.end)) return;
      const from = Math.max(s, win.start);
      const to = Math.min(e, win.end);
      const width = (to - from) / span * 100;
      if (width < 0.5) return;
      const block = document.createElement("div");
      block.className = "guide-block";
      if (index === onAir) block.classList.add("is-on-air");
      block.style.left = `calc(${(from - win.start) / span * 100}% + 3px)`;
      block.style.width = `calc(${width}% - 6px)`;
      const label = document.createElement("span");
      label.className = "guide-block-title";
      label.textContent = decodeEpgText(listing.title) || t("liveNow");
      block.appendChild(label);
      track.appendChild(block);
    });
  }

  function buildGuideRow(index, win) {
    const stream = currentActiveStreams[index];
    const row = document.createElement("div");
    row.className = "guide-row" + (index === guideSelected ? " selected" : "");
    row.dataset.index = String(index);
    const chan = document.createElement("div");
    chan.className = "guide-chan";
    const num = document.createElement("span");
    num.className = "guide-num";
    num.textContent = String(index + 1);
    const logo = document.createElement("img");
    logo.className = "guide-logo";
    logo.alt = "";
    if (stream.stream_icon) logo.src = stream.stream_icon;
    logo.onerror = () => { logo.style.visibility = "hidden"; };
    const name = document.createElement("div");
    name.className = "guide-name";
    name.textContent = cleanTitle(stream.name || "");
    chan.appendChild(num);
    chan.appendChild(logo);
    chan.appendChild(name);
    const track = document.createElement("div");
    track.className = "guide-track";
    row.appendChild(chan);
    row.appendChild(track);
    paintGuideTrack(track, cachedEpgListings(stream.stream_id), win, index === guideSelected);
    return row;
  }

  // Rebuilds the visible rows from cached EPG only; network fetches happen in loadGuideEpgWindow.
  function renderGuide() {
    if (!guideOpen || !guideRows) return;
    const now = Date.now();
    const start = now - GUIDE_LOOK_BACK_MS;
    const end = start + GUIDE_SPAN_MS;
    const count = currentActiveStreams.length;
    guideWindow = { start, end };
    guideViewStart = Math.max(0, Math.min(guideSelected - 3, count - GUIDE_ROWS));
    renderGuideRuler(start, end);
    setTimelinePosition(guideNowLine, (now - start) / GUIDE_SPAN_MS);
    guideRows.textContent = "";
    const last = Math.min(count, guideViewStart + GUIDE_ROWS);
    for (let i = guideViewStart; i < last; i++) guideRows.appendChild(buildGuideRow(i, guideWindow));
    renderGuideInfo();
  }

  function renderGuideInfo(fallbackText = "") {
    const stream = currentActiveStreams[guideSelected];
    if (!stream) return;
    guideInfoChannel.textContent = cleanTitle(stream.name || "");
    const epgs = cachedEpgListings(stream.stream_id);
    if (!epgs) {
      guideInfoProgramme.textContent = fallbackText;
      guideInfoTime.textContent = "";
      guideInfoDesc.textContent = "";
      return;
    }
    const listing = epgs[onAirIndex(epgs)];
    const [s, e] = listingSpan(listing);
    guideInfoProgramme.textContent = decodeEpgText(listing.title) || t("liveNow");
    guideInfoTime.textContent = `${formatGuideTime(s)} - ${formatGuideTime(e)}`;
    guideInfoDesc.textContent = decodeEpgText(listing.description);
  }

  function applyGuideSelection() {
    renderGuide();
    clearTimeout(guideEpgTimer);
    guideEpgTimer = setTimeout(loadGuideEpgWindow, 200);
  }

  // Fetches EPG for the visible rows only, so long playlists stay light. Each row repaints when its data arrives.
  async function loadGuideEpgWindow() {
    const token = ++guideRenderToken;
    const last = Math.min(currentActiveStreams.length, guideViewStart + GUIDE_ROWS);
    const jobs = [];
    for (let i = guideViewStart; i < last; i++) {
      const stream = currentActiveStreams[i];
      jobs.push(getEpgListings(stream.stream_id).then((epgs) => {
        if (!guideOpen || token !== guideRenderToken || !guideWindow) return;
        const row = guideRows.querySelector(`.guide-row[data-index="${i}"]`);
        if (row) paintGuideTrack(row.querySelector(".guide-track"), epgs, guideWindow, i === guideSelected);
        if (i === guideSelected) renderGuideInfo(t("guideNoData"));
      }));
    }
    await Promise.all(jobs);
  }

  function openGuide() {
    if (currentAppSection !== "iptv") return;
    if (!guideOverlay || guideOpen || currentActiveStreams.length === 0) return;
    guideOpen = true;
    guideSelected = Math.max(0, Math.min(currentStreamIndex, currentActiveStreams.length - 1));
    guideMinute = new Date().getMinutes();
    guideOverlay.classList.remove("hidden");
    if (osdContainer) osdContainer.classList.add("hidden");
    if (osdClockBubble) osdClockBubble.classList.add("hidden");
    applyGuideSelection();
    updateGuideClock();
    clearInterval(guideClockTimer);
    guideClockTimer = setInterval(updateGuideClock, 1000);
  }

  function hideGuide() {
    guideOpen = false;
    clearTimeout(guideEpgTimer);
    clearInterval(guideClockTimer);
    if (guideOverlay) guideOverlay.classList.add("hidden");
  }

  function closeGuide() {
    hideGuide();
    showLiveOSD();
  }

  function playGuideSelection() {
    const target = currentActiveStreams[guideSelected];
    closeGuide();
    if (!target) return;
    if (String(target.stream_id) === String(currentPlayingStreamId)) return;
    currentStreamIndex = guideSelected;
    playStream(target.stream_id, target.name, target.stream_icon, guideSelected, target.url);
  }

  let lastLive = null;
  let liveReconnectTimer = null;
  let liveReconnectAttempts = 0;
  let playbackSessionId = 0;
  let currentStageTimer = null;
  let isPlaybackHealthy = false;
  let watchdogTime = -1;
  let watchdogStallSeconds = 0;

  function scheduleLiveReconnect(reason) {
    if (!lastLive || liveReconnectTimer) return;
    isPlaybackHealthy = false;
    liveReconnectAttempts += 1;
    // Progressive backoff: 400ms on first retry, 1200ms on 2nd, 2500ms on 3rd, 5000ms onwards
    let delay = 400;
    if (liveReconnectAttempts === 2) delay = 1200;
    else if (liveReconnectAttempts === 3) delay = 2500;
    else if (liveReconnectAttempts > 3) delay = 5000;

    if (liveReconnectAttempts > 5) {
      // Don't kill the player permanently on IPTV hiccups!
      // Keep a slow background retry pulse (every 7s) so stream automatically reloads when server recovers
      console.warn("Extended reconnect active (attempt #" + liveReconnectAttempts + "). Retrying in 7s. Reason:", reason);
      delay = 7000;
    }
    showPlayerLoading();
    liveReconnectTimer = setTimeout(() => {
      liveReconnectTimer = null;
      if (!lastLive) return;
      const s = lastLive;
      playStream(s.streamId, s.name, s.icon, s.index, s.directUrl, true);
    }, delay);
  }

  // Fast Stall & Freeze Watchdog: checks every 1 second
  setInterval(() => {
    if (!lastLive || liveReconnectTimer) {
      watchdogStallSeconds = 0;
      return;
    }
    // If browser auto-paused due to network buffer dry-up, attempt soft kick
    if (video.paused && !video.ended && currentAppSection !== "stremio") {
      try {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});
      } catch (e) {}
    }
    // If video is supposed to be playing live
    if (video.currentTime === watchdogTime && video.readyState >= 2) {
      watchdogStallSeconds += 1;
      // At 2 seconds stall: try soft jump to live edge if buffer exists
      if (watchdogStallSeconds === 2) {
        try {
          if (video.buffered && video.buffered.length > 0) {
            const bufEnd = video.buffered.end(video.buffered.length - 1);
            if (bufEnd > video.currentTime + 0.3) {
              video.currentTime = bufEnd - 0.1;
            }
          }
          if (hlsPlayer && typeof hlsPlayer.startLoad === "function") {
            hlsPlayer.startLoad();
          }
        } catch (e) {}
      } else if (watchdogStallSeconds >= 4) {
        // Freeze exceeded 4 seconds: trigger instant reconnect & reload!
        console.warn("Live stream frozen for 4s, triggering auto-reload. Current time:", video.currentTime);
        watchdogStallSeconds = 0;
        isPlaybackHealthy = false;
        scheduleLiveReconnect("Stream stalled / frozen");
      }
    } else {
      watchdogTime = video.currentTime;
      watchdogStallSeconds = 0;
    }
  }, 1000);

  const playerLoading = document.getElementById("playerLoading");
  function showPlayerLoading() {
    if (playerLoading) playerLoading.classList.remove("hidden");
    if (playerWrapper) playerWrapper.classList.add("is-loading");
  }
  function hidePlayerLoading() {
    if (playerLoading) playerLoading.classList.add("hidden");
    if (playerWrapper) playerWrapper.classList.remove("is-loading");
  }

  let playbackTimer = null;
  let lastPlaybackReason = "";
  let lastReportedErrorTime = 0;
  let lastReportedErrorText = "";
  function reportPlaybackError(reason) {
    lastPlaybackReason = reason;
    console.error("Playback:", reason);
    const now = Date.now();
    if (reason === lastReportedErrorText && now - lastReportedErrorTime < 6000) {
      return;
    }
    lastReportedErrorText = reason;
    lastReportedErrorTime = now;
    showToast(t("streamFailed", { reason }));
  }
  function startPlaybackTimeout() {
    clearTimeout(playbackTimer);
    lastPlaybackReason = "";
    playbackTimer = setTimeout(() => {
      playbackTimer = null;
      hidePlayerLoading();
      if (!isPlaybackHealthy && lastLive) {
        scheduleLiveReconnect("Connection timed out");
      }
    }, 7000);
  }
  function clearPlaybackTimeout() {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  function mediaErrorReason(mediaError) {
    const names = { 1: "aborted", 2: "network", 3: "decode", 4: "format not supported" };
    if (!mediaError) return "unknown media error";
    return `${names[mediaError.code] || "media error"}${mediaError.message ? ` (${mediaError.message})` : ""}`;
  }

  video.addEventListener("playing", () => {
    isPlaybackHealthy = true;
    liveReconnectAttempts = 0;
    watchdogStallSeconds = 0;
    clearPlaybackTimeout();
    if (currentStageTimer) {
      clearTimeout(currentStageTimer);
      currentStageTimer = null;
    }
    if (liveReconnectTimer) {
      clearTimeout(liveReconnectTimer);
      liveReconnectTimer = null;
    }
    hidePlayerLoading();
  });
  video.addEventListener("timeupdate", () => {
    if (video.currentTime > 0) {
      isPlaybackHealthy = true;
      if (liveReconnectTimer) {
        clearTimeout(liveReconnectTimer);
        liveReconnectTimer = null;
      }
      hidePlayerLoading();
    }
  });
  video.addEventListener("canplay", hidePlayerLoading);

  // Fast stall detection via native HTML5 events
  let stallTimeout = null;
  function handleStreamStall() {
    if (!lastLive || liveReconnectTimer) return;
    if (stallTimeout) clearTimeout(stallTimeout);
    stallTimeout = setTimeout(() => {
      stallTimeout = null;
      if (!lastLive || liveReconnectTimer) return;
      if (video.readyState < 3) {
        console.warn("Stream waiting/stalled event timed out, reconnecting...");
        isPlaybackHealthy = false;
        scheduleLiveReconnect("Buffer underrun");
      }
    }, 3000);
  }
  video.addEventListener("waiting", handleStreamStall);
  video.addEventListener("stalled", handleStreamStall);

  video.addEventListener("error", () => {
    if (!lastLive) {
      hidePlayerLoading();
      return;
    }
    isPlaybackHealthy = false;
    console.warn("Video element error encountered:", mediaErrorReason(video.error));
    if (typeof window.__handlePlaybackStageError === "function") {
      window.__handlePlaybackStageError(mediaErrorReason(video.error));
    } else {
      scheduleLiveReconnect(mediaErrorReason(video.error));
    }
  });
  video.addEventListener("ended", () => {
    if (lastLive) {
      isPlaybackHealthy = false;
      console.warn("Live stream ended event; reconnecting to live edge");
      scheduleLiveReconnect("Live stream ended");
    }
  });

  function destroyStreamPlayers() {
    isPlaybackHealthy = false;
    window.__handlePlaybackStageError = null;
    if (currentStageTimer) {
      clearTimeout(currentStageTimer);
      currentStageTimer = null;
    }
    if (stallTimeout) {
      clearTimeout(stallTimeout);
      stallTimeout = null;
    }
    if (liveReconnectTimer) {
      clearTimeout(liveReconnectTimer);
      liveReconnectTimer = null;
    }
    if (hlsPlayer) {
      try { hlsPlayer.destroy(); } catch (e) {}
      hlsPlayer = null;
    }
    if (mpegTsPlayer) {
      try { mpegTsPlayer.destroy(); } catch (e) {}
      mpegTsPlayer = null;
    }
  }

  // Live audio must not keep playing behind the movie and series lists.
  function stopLivePlayback() {
    lastLive = null;
    destroyStreamPlayers();
    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  // =========================================================================
  // STREMIO ADDONS & STREAM SELECTOR INTEGRATION
  // =========================================================================
  const addonManifestInput = document.getElementById("addonManifestInput");
  const addonInstallBtn = document.getElementById("addonInstallBtn");
  const addonListContainer = document.getElementById("addonListContainer");

  const streamSelectorModal = document.getElementById("streamSelectorModal");
  const streamModalTitle = document.getElementById("streamModalTitle");
  const streamModalSubtitle = document.getElementById("streamModalSubtitle");
  const streamModalLoading = document.getElementById("streamModalLoading");
  const streamModalList = document.getElementById("streamModalList");
  const streamModalClose = document.getElementById("streamModalClose");

  let streamSelectorActive = false;
  let streamSelectorResolveContext = null;

  const legalAddonsGrid = document.getElementById("legalAddonsGrid");

  function renderAddonsSection() {
    renderInstalledAddons();
    renderLegalAddons();
  }

  function renderInstalledAddons() {
    if (!addonListContainer || !window.StremioEngine) return;
    addonListContainer.innerHTML = "";
    const list = window.StremioEngine.getAddons();
    list.forEach(function(addon) {
      const card = document.createElement("div");
      card.className = "addon-card";

      const info = document.createElement("div");
      info.className = "addon-card-info";

      const title = document.createElement("div");
      title.className = "addon-card-title";
      title.textContent = (addon.manifest && addon.manifest.name) || "Addon";

      const desc = document.createElement("div");
      desc.className = "addon-card-desc";
      desc.textContent = (addon.manifest && addon.manifest.description) || addon.transportUrl;

      info.appendChild(title);
      info.appendChild(desc);
      card.appendChild(info);

      if (addon.isCore) {
        const coreBadge = document.createElement("span");
        coreBadge.className = "legal-addon-badge";
        coreBadge.textContent = "Included Core";
        card.appendChild(coreBadge);
      } else {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "addon-remove-btn focusable";
        removeBtn.textContent = "Remove";
        removeBtn.tabIndex = 0;
        removeBtn.addEventListener("click", function() {
          window.StremioEngine.removeAddon(addon.transportUrl);
          renderAddonsSection();
          if (currentAppSection === "stremio") initStremioPage();
          showToast("Addon removed");
        });
        card.appendChild(removeBtn);
      }
      addonListContainer.appendChild(card);
    });
  }

  function renderLegalAddons() {
    if (!legalAddonsGrid || !window.StremioEngine) return;
    legalAddonsGrid.innerHTML = "";
    const catalog = window.StremioEngine.getLegalCatalog ? window.StremioEngine.getLegalCatalog() : [];
    catalog.forEach(function(item) {
      const card = document.createElement("div");
      card.className = "legal-addon-card";

      const isInstalled = window.StremioEngine.isInstalled(item.transportUrl);

      const header = document.createElement("div");
      header.className = "legal-addon-header";

      const title = document.createElement("div");
      title.className = "legal-addon-name";
      title.textContent = item.name;

      const badge = document.createElement("span");
      badge.className = "legal-addon-badge";
      badge.textContent = item.badge || "Official · Legal";

      header.appendChild(title);
      header.appendChild(badge);

      const desc = document.createElement("div");
      desc.className = "legal-addon-desc";
      desc.textContent = item.description;

      const actionBtn = document.createElement("button");
      actionBtn.type = "button";
      actionBtn.className = "settings-item focusable " + (isInstalled ? "legal-addon-btn-remove" : "legal-addon-btn-install");
      actionBtn.tabIndex = 0;
      actionBtn.textContent = isInstalled ? "✕ Uninstall" : "+ Install";

      actionBtn.addEventListener("click", function() {
        if (isInstalled) {
          window.StremioEngine.removeAddon(item.transportUrl);
          showToast("Uninstalled " + item.name);
          renderAddonsSection();
          if (currentAppSection === "stremio") initStremioPage();
        } else {
          actionBtn.textContent = "Installing...";
          actionBtn.disabled = true;
          window.StremioEngine.installAddon(item.transportUrl, function(err, addon) {
            actionBtn.disabled = false;
            if (err) {
              showToast("Failed to install: " + err.message);
              renderAddonsSection();
              return;
            }
            showToast("Installed " + item.name);
            renderAddonsSection();
            if (currentAppSection === "stremio") initStremioPage();
          });
        }
      });

      card.appendChild(header);
      card.appendChild(desc);
      card.appendChild(actionBtn);
      legalAddonsGrid.appendChild(card);
    });
  }

  if (addonInstallBtn && addonManifestInput) {
    addonInstallBtn.addEventListener("click", function() {
      const url = addonManifestInput.value.trim();
      if (!url) return;
      addonInstallBtn.textContent = "Installing...";
      window.StremioEngine.installAddon(url, function(err, addon) {
        addonInstallBtn.textContent = "+ Install";
        if (err) {
          showToast("Failed to install addon: " + err.message);
          return;
        }
        addonManifestInput.value = "";
        renderAddonsSection();
        if (currentAppSection === "stremio") initStremioPage();
        showToast("Installed " + (addon.manifest.name || "Addon"));
      });
    });
  }

  // =========================================================================
  // APP SECTIONS (IPTV - STREMIO - SETTINGS)
  // =========================================================================
  function switchAppSection(section, skipFocus = false) {
    if (!section) section = "iptv";
    if (section === "settings") {
      previousAppSection = currentAppSection === "settings" ? previousAppSection : currentAppSection;
      currentAppSection = "settings";
      if (headerTabSettings) headerTabSettings.classList.add("active");
      if (headerTabIptv) headerTabIptv.classList.remove("active");
      if (headerTabStremio) headerTabStremio.classList.remove("active");
      toggleSettingsMenu(true);
      return;
    }

    if (settingsPanel && !settingsPanel.classList.contains("hidden")) {
      settingsPanel.classList.add("hidden");
    }

    currentAppSection = section;
    previousAppSection = section;

    if (section === "iptv") {
      document.body.classList.add("radial-active");
      if (headerTabIptv) headerTabIptv.classList.add("active");
      if (headerTabStremio) headerTabStremio.classList.remove("active");
      if (headerTabSettings) headerTabSettings.classList.remove("active");
      if (tvGrid) tvGrid.classList.remove("hidden");
      if (stremioPage) stremioPage.classList.add("hidden");
      if (!skipFocus && window.AeroRadial) {
        window.AeroRadial.open();
      }
    } else if (section === "stremio") {
      document.body.classList.add("radial-active");
      if (window.AeroRadial) window.AeroRadial.close();
      stopLivePlayback();
      if (headerTabStremio) headerTabStremio.classList.add("active");
      if (headerTabIptv) headerTabIptv.classList.remove("active");
      if (headerTabSettings) headerTabSettings.classList.remove("active");
      if (tvGrid) tvGrid.classList.add("hidden");
      if (stremioPage) stremioPage.classList.remove("hidden");
      initStremioPage();
      if (!skipFocus) {
        const firstCard = stremioStripPopular ? stremioStripPopular.querySelector(".stremio-card.focusable") : null;
        if (firstCard) setElementFocus(firstCard);
        else if (sideMovies) setElementFocus(sideMovies);
      }
    }
  }

  if (headerTabIptv) {
    headerTabIptv.addEventListener("click", () => switchAppSection("iptv"));
  }
  if (headerTabStremio) {
    headerTabStremio.addEventListener("click", () => switchAppSection("stremio"));
  }
  if (headerTabSettings) {
    headerTabSettings.addEventListener("click", () => switchAppSection("settings"));
  }

  function initStremioPage() {
    if (!stremioPage || !window.StremioEngine) return;
    renderStremioNetflixRows();
  }

  function renderRowPlaceholders(strip, count = 6, isChannel = false) {
    if (!strip) return;
    strip.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const card = document.createElement("div");
      card.className = "stremio-card stremio-skeleton-card" + (isChannel ? " stremio-channel-card" : "");
      card.innerHTML = `
        <div class="${isChannel ? 'stremio-channel-screen' : 'stremio-card-poster'}">
          ${isChannel ? '<span class="stremio-channel-badge stremio-skeleton-pulse">CANLI</span>' : '<span class="stremio-card-rating stremio-skeleton-pulse">★ -.-</span>'}
          <div class="stremio-placeholder-icon stremio-skeleton-pulse">
            ${isChannel ? '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 2l4 4 4-4"/></svg>' : '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>'}
          </div>
        </div>
        <div class="stremio-card-overlay">
          <div class="stremio-skeleton-line stremio-skeleton-pulse" style="width:75%; height:20px;"></div>
          <div class="stremio-skeleton-line stremio-skeleton-pulse" style="width:45%; height:16px; margin-top:6px;"></div>
        </div>
      `;
      strip.appendChild(card);
    }
  }

  function switchStremioSubpage(subpage) {
    currentStremioSubpage = subpage;

    if (sideMovies) sideMovies.classList.toggle("active", subpage === "movies");
    if (sideSeries) sideSeries.classList.toggle("active", subpage === "series");
    if (sideTv) sideTv.classList.toggle("active", subpage === "tv");

    if (stremioSubpageMovies) stremioSubpageMovies.classList.toggle("hidden", subpage !== "movies");
    if (stremioSubpageSeries) stremioSubpageSeries.classList.toggle("hidden", subpage !== "series");
    if (stremioSubpageTv) stremioSubpageTv.classList.toggle("hidden", subpage !== "tv");

    if (stremioScrollContainer) stremioScrollContainer.scrollTop = 0;

    if (subpage === "tv" && stremioGridLive && (stremioGridLive.children.length === 0 || stremioGridLive.querySelector(".stremio-skeleton-card"))) {
      loadStremioLiveChannels();
    }

    const activeSub = subpage === "tv" ? stremioSubpageTv : (subpage === "series" ? stremioSubpageSeries : stremioSubpageMovies);
    if (activeSub) {
      const first = activeSub.querySelector(".focusable");
      if (first) setElementFocus(first);
    }
  }

  const sideBackToIptv = document.getElementById("sideBackToIptv");
  if (sideBackToIptv) {
    sideBackToIptv.addEventListener("click", () => switchAppSection("iptv"));
  }

  if (sideTv) {
    sideTv.addEventListener("click", () => switchStremioSubpage("tv"));
  }
  if (sideMovies) {
    sideMovies.addEventListener("click", () => switchStremioSubpage("movies"));
  }
  if (sideSeries) {
    sideSeries.addEventListener("click", () => switchStremioSubpage("series"));
  }

  function createStremioChannelCard(item, idx) {
    const div = document.createElement("div");
    div.className = "stremio-card stremio-channel-card focusable";
    div.tabIndex = 0;
    const channelId = item.stream_id || item.imdb_id || item.id || "";
    div.dataset.streamId = channelId;
    div.dataset.title = item.name;
    div.dataset.catalogType = item.type || "tv";
    div.dataset.index = idx;

    const iconSrc = item.stream_icon || "";
    if (iconSrc) div.dataset.backdrop = iconSrc;

    div.innerHTML = `
      <div class="stremio-channel-screen">
        <span class="stremio-channel-badge">CANLI</span>
        <div class="stremio-placeholder-icon">
          <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 2l4 4 4-4"/></svg>
        </div>
        ${iconSrc ? `<img src="${iconSrc}" alt="${escapeAttr(item.name)}" onload="if(this.previousElementSibling)this.previousElementSibling.style.display='none';" onerror="this.style.display='none';if(this.previousElementSibling)this.previousElementSibling.style.display='flex';">` : ""}
      </div>
      <div class="stremio-card-overlay">
        <div class="stremio-card-title">${escapeAttr(item.name)}</div>
        <div class="stremio-card-meta">Canlı TV Yayını</div>
      </div>
    `;

    div.addEventListener("click", () => {
      playStremioLiveChannel(channelId, item.name, iconSrc, idx, item.url || item.directUrl, item.type);
    });

    return div;
  }

  function createStremioCard(item, catalogType, idx) {
    const div = document.createElement("div");
    div.className = "stremio-card focusable";
    div.tabIndex = 0;
    const imdbId = item.imdb_id || item.id || "";
    div.dataset.imdbId = imdbId;
    div.dataset.title = item.name;
    div.dataset.catalogType = catalogType;
    div.dataset.index = idx;

    const metahubFallback = (imdbId && imdbId.startsWith("tt")) ? `https://images.metahub.space/poster/medium/${imdbId}/img` : "";
    let posterSrc = item.stream_icon || "";
    if (!posterSrc && metahubFallback) {
      posterSrc = metahubFallback;
    }
    const backdropSrc = item.backdrop || (imdbId && imdbId.startsWith("tt") ? `https://images.metahub.space/background/medium/${imdbId}/img` : "") || posterSrc;
    if (backdropSrc) {
      div.dataset.backdrop = backdropSrc;
    }

    const rating = item.rating || "8.5";
    const year = item.year || "";
    const genre = catalogType === "series" ? "Dizi" : "Film";
    const metaText = year ? `${year} · ${genre}` : genre;

    div.innerHTML = `
      <div class="stremio-card-poster">
        <span class="stremio-card-rating">★ ${escapeAttr(rating)}</span>
        <div class="stremio-placeholder-icon">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        ${posterSrc ? `<img src="${posterSrc}" alt="${escapeAttr(item.name)}" onload="if(this.previousElementSibling)this.previousElementSibling.style.display='none';" onerror="if('${metahubFallback}' && this.src !== '${metahubFallback}'){this.src='${metahubFallback}';}else{this.style.display='none';if(this.previousElementSibling)this.previousElementSibling.style.display='flex';}">` : ""}
      </div>
      <div class="stremio-card-overlay">
        <div class="stremio-card-title">${escapeAttr(item.name)}</div>
        <div class="stremio-card-meta">${escapeAttr(metaText)}</div>
      </div>
    `;

    div.addEventListener("click", () => {
      if (catalogType === "series") {
        openStreamSelectorModal("series", imdbId, item.name, null, "1", "1", true);
      } else {
        openStreamSelectorModal("movie", imdbId, item.name, null, null, null, true);
      }
    });

    return div;
  }

  const MOVIE_GENRES = [
    { id: "Action", name: "⚡ Aksiyon" },
    { id: "Adventure", name: "🚀 Macera" },
    { id: "Animation", name: "🎨 Animasyon" },
    { id: "Comedy", name: "😂 Komedi" },
    { id: "Crime", name: "🕵️ Suç" },
    { id: "Documentary", name: "📜 Belgesel" },
    { id: "Drama", name: "🎭 Dram" },
    { id: "Family", name: "👨‍👩‍👧 Aile" },
    { id: "Fantasy", name: "🧙 Fantastik" },
    { id: "Horror", name: "👻 Korku" },
    { id: "Mystery", name: "🔍 Gizem" },
    { id: "Romance", name: "❤️ Romantik" },
    { id: "Sci-Fi", name: "🛸 Bilim Kurgu" },
    { id: "Thriller", name: "🔪 Gerilim" },
    { id: "War", name: "⚔️ Savaş" },
    { id: "Western", name: "🤠 Vahşi Batı" }
  ];

  const SERIES_GENRES = [
    { id: "Action", name: "⚡ Aksiyon & Macera" },
    { id: "Comedy", name: "😂 Komedi" },
    { id: "Drama", name: "🎭 Dram" },
    { id: "Sci-Fi", name: "🛸 Bilim Kurgu" },
    { id: "Crime", name: "🕵️ Suç & Gizem" },
    { id: "Animation", name: "🎨 Çizgi Dizi & Anime" },
    { id: "Documentary", name: "📜 Belgesel" },
    { id: "Family", name: "👨‍👩‍👧 Aile" }
  ];

  function renderCategoryPills(type, container) {
    if (!container) return;
    container.innerHTML = "";
    const list = type === "series" ? SERIES_GENRES : MOVIE_GENRES;
    list.forEach(g => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-pill-btn focusable";
      btn.dataset.genre = g.id;
      btn.dataset.type = type;
      btn.textContent = g.name;

      btn.addEventListener("click", () => {
        container.querySelectorAll(".category-pill-btn").forEach(el => el.classList.remove("active"));
        btn.classList.add("active");
        if (type === "series") {
          loadGenreSeries(g.id, g.name);
        } else {
          loadGenreMovies(g.id, g.name);
        }
      });

      container.appendChild(btn);
    });
  }

  function loadGenreMovies(genreId, genreName) {
    if (!stremioStripPopular || !window.StremioEngine) return;
    if (stremioTitlePopular) stremioTitlePopular.textContent = `${genreName} Filmleri`;
    renderRowPlaceholders(stremioStripPopular, 6);
    if (stremioScrollContainer) stremioScrollContainer.scrollTop = 0;

    window.StremioEngine.fetchAddonCatalog("cinemeta", "movie", "top", "genre=" + genreId, function(items) {
      if (!stremioStripPopular) return;
      stremioStripPopular.innerHTML = "";
      const list = items || [];
      if (stremioCountPopular) stremioCountPopular.textContent = `${list.length} İçerik`;
      list.forEach((item, idx) => {
        stremioStripPopular.appendChild(createStremioCard(item, "movie", idx));
      });
      const first = stremioStripPopular.querySelector(".stremio-card.focusable");
      if (first) setElementFocus(first);
    });
  }

  function loadGenreSeries(genreId, genreName) {
    if (!stremioStripSeries || !window.StremioEngine) return;
    if (stremioTitleSeries) stremioTitleSeries.textContent = `${genreName} Dizileri`;
    renderRowPlaceholders(stremioStripSeries, 6);
    if (stremioScrollContainer) stremioScrollContainer.scrollTop = 0;

    window.StremioEngine.fetchAddonCatalog("cinemeta", "series", "top", "genre=" + genreId, function(items) {
      if (!stremioStripSeries) return;
      stremioStripSeries.innerHTML = "";
      const list = items || [];
      if (stremioCountSeries) stremioCountSeries.textContent = `${list.length} Dizi`;
      list.forEach((item, idx) => {
        stremioStripSeries.appendChild(createStremioCard(item, "series", idx));
      });
      const first = stremioStripSeries.querySelector(".stremio-card.focusable");
      if (first) setElementFocus(first);
    });
  }

  function renderStremioNetflixRows() {
    if (!window.StremioEngine) return;
    const tvCats = window.StremioEngine.getCategories("tv");
    const movieCats = window.StremioEngine.getCategories("movie");
    const seriesCats = window.StremioEngine.getCategories("series");

    if (movieCats.length === 0 && seriesCats.length === 0 && tvCats.length === 0) {
      if (stremioEmpty) stremioEmpty.classList.remove("hidden");
      return;
    }
    if (stremioEmpty) stremioEmpty.classList.add("hidden");

    // Populate Category Pills
    renderCategoryPills("movie", stremioMoviePillsGrid);
    renderCategoryPills("series", stremioSeriesPillsGrid);

    // Initial subpage visibility
    switchStremioSubpage(currentStremioSubpage || "movies");

    // Render Skeletons for Movies
    renderRowPlaceholders(stremioStripPopular, 6);
    renderRowPlaceholders(stremioStripNewlyAdded, 6);
    renderRowPlaceholders(stremioStripAction, 6);
    renderRowPlaceholders(stremioStripComedy, 6);
    renderRowPlaceholders(stremioStripSciFi, 6);

    // Render Skeletons for Series
    renderRowPlaceholders(stremioStripSeries, 6);
    renderRowPlaceholders(stremioStripAnimationSeries, 6);
    renderRowPlaceholders(stremioStripCrimeSeries, 6);
    renderRowPlaceholders(stremioStripComedySeries, 6);

    if (stremioGridLive) renderRowPlaceholders(stremioGridLive, 8, true);

    function fetchAndFillShelf(strip, countEl, type, catId, genreQuery) {
      if (!strip) return;
      window.StremioEngine.fetchAddonCatalog("cinemeta", type, catId, genreQuery || "", function(items) {
        if (!strip) return;
        strip.innerHTML = "";
        const list = items || [];
        if (countEl) countEl.textContent = `${list.length} İçerik`;
        list.forEach((item, idx) => {
          const card = createStremioCard(item, type, idx);
          strip.appendChild(card);
        });

        // Set initial backdrop if not already set
        if (list.length > 0 && stremioHeroBackdrop) {
          const currentBg = stremioHeroBackdrop.style.backgroundImage;
          if (!currentBg || currentBg === "none" || currentBg.indexOf("b0PlSFdDwbyK0cf5RxwDpaOJQvQ") !== -1) {
            const bg = list[0].backdrop || list[0].stream_icon;
            if (bg) stremioHeroBackdrop.style.backgroundImage = `url('${bg}')`;
          }
        }

        if (strip === stremioStripPopular && currentAppSection === "stremio" && currentStremioSubpage === "movies") {
          const firstCard = strip.querySelector(".stremio-card.focusable");
          if (firstCard && (!document.activeElement || !document.activeElement.classList.contains("focusable"))) {
            setElementFocus(firstCard);
          }
        }
      });
    }

    // Movies shelves
    fetchAndFillShelf(stremioStripPopular, stremioCountPopular, "movie", "top");
    fetchAndFillShelf(stremioStripNewlyAdded, stremioCountNewlyAdded, "movie", "top", "year=2024");
    fetchAndFillShelf(stremioStripAction, stremioCountAction, "movie", "top", "genre=Action");
    fetchAndFillShelf(stremioStripComedy, stremioCountComedy, "movie", "top", "genre=Comedy");
    fetchAndFillShelf(stremioStripSciFi, stremioCountSciFi, "movie", "top", "genre=Sci-Fi");

    // Series shelves
    fetchAndFillShelf(stremioStripSeries, stremioCountSeries, "series", "top");
    fetchAndFillShelf(stremioStripAnimationSeries, stremioCountAnimationSeries, "series", "top", "genre=Animation");
    fetchAndFillShelf(stremioStripCrimeSeries, stremioCountCrimeSeries, "series", "top", "genre=Crime");
    fetchAndFillShelf(stremioStripComedySeries, stremioCountComedySeries, "series", "top", "genre=Comedy");

    // Live TV
    loadStremioLiveChannels();
  }

  const STREMIO_LIVE_GENRES = [
    { id: "ALL", name: "✨ Tümü (All)" },
    { id: "news", name: "📰 Haberler (News)" },
    { id: "sports", name: "⚽ Spor (Sports)" },
    { id: "movies", name: "🎬 Sinema & Dizi (Movies)" },
    { id: "documentary", name: "🌍 Belgesel & Doğa (Documentary)" },
    { id: "kids", name: "🧸 Çocuk & Animasyon (Kids)" },
    { id: "music", name: "🎵 Müzik (Music)" },
    { id: "entertainment", name: "🍿 Eğlence (Entertainment)" }
  ];

  const DEFAULT_STREMIO_LIVE_CHANNELS = [
    // Haberler (News)
    { id: "stremio:live:euronews_tr", name: "Euronews Türkçe", category_id: "news", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Euronews_2016_logo.svg/320px-Euronews_2016_logo.svg.png", directUrl: "https://euronews-euronews-turkish-1-tr.samsung.wurl.tv/playlist.m3u8" },
    { id: "stremio:live:euronews_en", name: "Euronews English", category_id: "news", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Euronews_2016_logo.svg/320px-Euronews_2016_logo.svg.png", directUrl: "https://euronews-euronews-world-1-us.rakuten.wurl.tv/playlist.m3u8" },
    { id: "stremio:live:skynews", name: "Sky News Live", category_id: "news", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Sky_News_2018.svg/320px-Sky_News_2018.svg.png", directUrl: "https://skynewsau-live.akamaized.net/hls/live/2002689/skynewsau-extra1/master.m3u8" },
    { id: "stremio:live:bloomberg", name: "Bloomberg TV", category_id: "news", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bloomberg_Television_logo.svg/320px-Bloomberg_Television_logo.svg.png", directUrl: "https://liveproduseast.global.ssl.fastly.net/us/Channel-USTV-AWS-virginia-1/Source-4500-1080p_clean.m3u8" },
    { id: "stremio:live:france24_en", name: "France 24 English", category_id: "news", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/France_24_logo.svg/320px-France_24_logo.svg.png", directUrl: "https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8" },
    { id: "stremio:live:dw_en", name: "DW News", category_id: "news", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_logo.svg/320px-Deutsche_Welle_logo.svg.png", directUrl: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8" },
    { id: "stremio:live:trt_haber", name: "TRT Haber", category_id: "news", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/TRT_Haber_logo.svg/320px-TRT_Haber_logo.svg.png", directUrl: "https://tv-trthaber.live.trt.com.tr/master.m3u8" },
    { id: "stremio:live:trt_world", name: "TRT World", category_id: "news", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/TRT_World_logo.svg/320px-TRT_World_logo.svg.png", directUrl: "https://tv-trtworld.live.trt.com.tr/master.m3u8" },

    // Spor (Sports)
    { id: "stremio:live:redbull", name: "Red Bull TV", category_id: "sports", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Red_Bull_TV_logo.svg/320px-Red_Bull_TV_logo.svg.png", directUrl: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8" },
    { id: "stremio:live:trt_spor", name: "TRT Spor", category_id: "sports", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/TRT_Spor_logo_2021.svg/320px-TRT_Spor_logo_2021.svg.png", directUrl: "https://tv-trtspor.live.trt.com.tr/master.m3u8" },
    { id: "stremio:live:trt_sporyildiz", name: "TRT Spor Yıldız", category_id: "sports", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/TRT_Spor_logo_2021.svg/320px-TRT_Spor_logo_2021.svg.png", directUrl: "https://tv-trtsporyildiz.live.trt.com.tr/master.m3u8" },
    { id: "stremio:live:ftf_sports", name: "FTF Sports", category_id: "sports", stream_icon: "https://i.imgur.com/8QWv7uL.png", directUrl: "https://ftf.amagi.tv/hls/amagi_hls_ftfsports_rakuten/index.m3u8" },

    // Sinema & Dizi (Movies & Series)
    { id: "stremio:live:rakuten_movies", name: "Rakuten Action Movies", category_id: "movies", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Rakuten_TV_logo.svg/320px-Rakuten_TV_logo.svg.png", directUrl: "https://rakuten-actionmovies-1-eu.rakuten.wurl.tv/playlist.m3u8" },
    { id: "stremio:live:filmstream", name: "Filmstream TV", category_id: "movies", stream_icon: "https://i.imgur.com/KzR79Vl.png", directUrl: "https://rakuten-filmstream-1-gb.samsung.wurl.tv/playlist.m3u8" },
    { id: "stremio:live:dust_scifi", name: "Dust Sci-Fi", category_id: "movies", stream_icon: "https://i.imgur.com/zZ3XyYV.png", directUrl: "https://dust-samsunguk.amagi.tv/playlist.m3u8" },
    { id: "stremio:live:trt_1", name: "TRT 1", category_id: "movies", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/TRT_1_logo_2021.svg/320px-TRT_1_logo_2021.svg.png", directUrl: "https://tv-trt1.live.trt.com.tr/master.m3u8" },

    // Belgesel & Doğa (Documentary)
    { id: "stremio:live:trt_belgesel", name: "TRT Belgesel", category_id: "documentary", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/TRT_Belgesel_logo_2021.svg/320px-TRT_Belgesel_logo_2021.svg.png", directUrl: "https://tv-trtbelgesel.live.trt.com.tr/master.m3u8" },
    { id: "stremio:live:nasa_tv", name: "NASA TV", category_id: "documentary", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png", directUrl: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8" },
    { id: "stremio:live:earthx_tv", name: "EarthxTV", category_id: "documentary", stream_icon: "https://i.imgur.com/t3cEv9L.png", directUrl: "https://earthxtv-samsunguk.amagi.tv/playlist.m3u8" },

    // Çocuk & Animasyon (Kids)
    { id: "stremio:live:trt_cocuk", name: "TRT Çocuk", category_id: "kids", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/TRT_%C3%87ocuk_logo_2021.svg/320px-TRT_%C3%87ocuk_logo_2021.svg.png", directUrl: "https://tv-trtcocuk.live.trt.com.tr/master.m3u8" },

    // Müzik (Music)
    { id: "stremio:live:trt_muzik", name: "TRT Müzik", category_id: "music", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/TRT_M%C3%BCzik_logo_2021.svg/320px-TRT_M%C3%BCzik_logo_2021.svg.png", directUrl: "https://tv-trtmuzik.live.trt.com.tr/master.m3u8" },
    { id: "stremio:live:clubbing_tv", name: "Clubbing TV", category_id: "music", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Clubbing_TV_logo.png/320px-Clubbing_TV_logo.png", directUrl: "https://rakuten-clubbingtv-1-eu.rakuten.wurl.tv/playlist.m3u8" },
    { id: "stremio:live:deluxe_lounge", name: "Deluxe Lounge", category_id: "music", stream_icon: "https://i.imgur.com/7p4G2xN.png", directUrl: "https://deluxelounge.stream.deluxemusic.tv/deluxelounge/deluxelounge.m3u8" },

    // Eğlence (Entertainment)
    { id: "stremio:live:rakuten_comedy", name: "Rakuten Comedy", category_id: "entertainment", stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Rakuten_TV_logo.svg/320px-Rakuten_TV_logo.svg.png", directUrl: "https://rakuten-comedy-1-eu.rakuten.wurl.tv/playlist.m3u8" }
  ];

  let stremioLiveCurrentCategory = "ALL";
  let stremioAllLiveChannels = [];

  function loadStremioLiveChannels() {
    if (!stremioGridLive) return;
    const tvCats = window.StremioEngine ? window.StremioEngine.getCategories("tv") : [];
    const catTv = tvTvFound(tvCats);

    function onChannelsLoaded(list) {
      stremioAllLiveChannels = list || [];
      renderStremioLiveCatBar(stremioAllLiveChannels);
      filterAndRenderStremioLive();
    }

    if (catTv) {
      window.StremioEngine.fetchAddonCatalog(catTv.addonTransportUrl, catTv.catalogType, catTv.catalogId, function(addonItems) {
        const combined = (addonItems && addonItems.length > 0) ? addonItems.concat(DEFAULT_STREMIO_LIVE_CHANNELS) : DEFAULT_STREMIO_LIVE_CHANNELS;
        onChannelsLoaded(combined);
      });
    } else {
      onChannelsLoaded(DEFAULT_STREMIO_LIVE_CHANNELS);
    }
  }

  function renderStremioLiveCatBar(channels) {
    if (!stremioLiveCatBar) return;
    stremioLiveCatBar.innerHTML = "";

    const catMap = new Map();
    STREMIO_LIVE_GENRES.forEach(g => {
      catMap.set(g.id, g.name);
    });

    if (channels) {
      channels.forEach(ch => {
        if (ch.category_id && !catMap.has(ch.category_id)) {
          catMap.set(ch.category_id, ch.category_name || ch.category_id);
        }
      });
    }

    catMap.forEach((name, id) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "stremio-live-cat-pill focusable" + (id === stremioLiveCurrentCategory ? " active" : "");
      btn.tabIndex = 0;
      btn.dataset.catId = id;
      btn.textContent = name;
      btn.addEventListener("click", () => {
        stremioLiveCurrentCategory = id;
        stremioLiveCatBar.querySelectorAll(".stremio-live-cat-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        filterAndRenderStremioLive();
      });
      stremioLiveCatBar.appendChild(btn);
    });
  }

  function filterAndRenderStremioLive() {
    if (!stremioGridLive) return;
    stremioGridLive.innerHTML = "";
    let filtered = stremioAllLiveChannels;
    if (stremioLiveCurrentCategory !== "ALL") {
      filtered = stremioAllLiveChannels.filter(ch => String(ch.category_id) === String(stremioLiveCurrentCategory));
    }
    const displayList = filtered.slice(0, 100);
    if (stremioCountLive) stremioCountLive.textContent = `${displayList.length} Kanal Listelendi`;

    displayList.forEach((item, idx) => {
      const card = createStremioChannelCard(item, idx);
      stremioGridLive.appendChild(card);
    });
  }

  function tvTvFound(cats) {
    if (!cats || !cats.length) return null;
    return cats.find(c => c.catalogId === "live_tv" || c.catalogType === "tv") || cats[0];
  }

  if (stremioGoAddonsBtn) {
    stremioGoAddonsBtn.addEventListener("click", () => {
      switchAppSection("settings");
      showCustomizationTab("addons");
    });
  }

  function scrollModalItemIntoView(target) {
    if (!streamModalList || !target) return;
    if (target === streamModalClose) {
      streamModalList.scrollTop = streamModalList.scrollHeight;
      return;
    }
    if (!target.classList.contains("stream-modal-item")) return;
    if (target === streamModalList.firstElementChild) {
      streamModalList.scrollTop = 0;
      return;
    }

    const itemTop = target.offsetTop;
    const itemHeight = target.offsetHeight;
    const listHeight = streamModalList.clientHeight;
    const scrollTop = streamModalList.scrollTop;

    if (itemTop + itemHeight > scrollTop + listHeight) {
      streamModalList.scrollTop = itemTop + itemHeight - listHeight + 16;
    } else if (itemTop < scrollTop) {
      streamModalList.scrollTop = Math.max(0, itemTop - 16);
    }
  }

  function closeStreamSelectorModal() {
    if (!streamSelectorModal) return;
    streamSelectorModal.classList.add("hidden");
    streamSelectorActive = false;
    streamSelectorResolveContext = null;
    if (streamSelectorOpener && document.body.contains(streamSelectorOpener)) {
      setElementFocus(streamSelectorOpener);
      streamSelectorOpener = null;
    } else if (lastFocusedPoster) {
      setElementFocus(lastFocusedPoster);
    } else if (currentAppSection === "stremio") {
      const first = document.querySelector("#stremioPage .stremio-card.focusable");
      if (first) setElementFocus(first);
    }
  }

  if (streamModalClose) {
    streamModalClose.addEventListener("click", closeStreamSelectorModal);
  }

  function openStreamSelectorModal(type, itemId, title, ext, seasonNum, episodeNum, isStremioItem) {
    if (!streamSelectorModal || !window.StremioEngine) return;
    streamSelectorOpener = document.querySelector(".focused") || document.activeElement;
    streamSelectorActive = true;
    streamSelectorResolveContext = { type: type, itemId: itemId, title: title, ext: ext };

    if (streamModalTitle) streamModalTitle.textContent = cleanTitle(title);
    if (streamModalSubtitle) streamModalSubtitle.textContent = type === "series" ? "Series Episode" : "Movie";
    if (streamModalList) {
      streamModalList.innerHTML = "";
      streamModalList.scrollTop = 0;
    }

    // 1. Primary Option: Check for Free Direct IPTV stream (matches user's IPTV catalog)
    let iptvMatch = null;
    if (!isStremioItem) {
      iptvMatch = { id: itemId, title: title, ext: ext };
    } else if (type === "movie" && Array.isArray(vodStreams) && vodStreams.length > 0) {
      const cleanTarget = cleanTitle(title).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanTarget) {
        const found = vodStreams.find(s => {
          const cleanS = cleanTitle(s.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return cleanS && (cleanS === cleanTarget || (cleanTarget.length > 4 && cleanS.indexOf(cleanTarget) !== -1));
        });
        if (found) {
          iptvMatch = { id: found.stream_id, title: found.name, ext: found.container_extension };
        }
      }
    }

    if (iptvMatch) {
      const iptvLi = document.createElement("li");
      iptvLi.className = "stream-modal-item focusable focused";
      iptvLi.tabIndex = 0;
      iptvLi.innerHTML =
        '<div class="stream-item-main">' +
          '<span class="stream-badge" style="background:#16a34a;">FREE • IPTV</span>' +
          '<div class="stream-item-details">' +
            '<span class="stream-item-title">' + (cleanTitle(iptvMatch.title) || "Play IPTV Stream (Direct)") + '</span>' +
            '<span class="stream-item-sub">100% Free • Direct Stream from your IPTV Server</span>' +
          '</div>' +
        '</div>' +
        '<span class="stream-item-meta">▶ Play Free</span>';

      iptvLi.addEventListener("click", function() {
        closeStreamSelectorModal();
        if (type === "series") {
          playSeriesEpisode(iptvMatch.id, iptvMatch.title, iptvMatch.ext);
        } else {
          playVodMovie(iptvMatch.id, iptvMatch.title, iptvMatch.ext);
        }
      });

      if (streamModalList) streamModalList.appendChild(iptvLi);
      setElementFocus(iptvLi);
    }

    streamSelectorModal.classList.remove("hidden");

    // 2. Fetch Stremio streams in parallel
    if (streamModalLoading) streamModalLoading.classList.remove("hidden");

    function fetchAndRenderStreams(imdbId) {
      if (!streamSelectorActive || !imdbId) {
        if (streamModalLoading) streamModalLoading.classList.add("hidden");
        return;
      }
      var queryId = imdbId;
      if (type === "series") {
        var sNum = seasonNum || "1";
        var eNum = episodeNum || "1";
        queryId = imdbId + ":" + sNum + ":" + eNum;
      }

      window.StremioEngine.getStreams(type, queryId, function(streams) {
        if (!streamSelectorActive) return;
        if (streamModalLoading) streamModalLoading.classList.add("hidden");

        if (!streams || streams.length === 0) {
          if (streamModalList && streamModalList.children.length === 0) {
            const noStreamsLi = document.createElement("li");
            noStreamsLi.className = "stream-modal-item focusable";
            noStreamsLi.innerHTML = '<span class="stream-item-title">No addon streams found</span>';
            streamModalList.appendChild(noStreamsLi);
            setElementFocus(streamModalClose);
          }
          return;
        }

        const hasAnyFree = streams.some(function(s) { return !s.requiresDebrid; }) || !!iptvMatch;
        if (!hasAnyFree && streamModalSubtitle) {
          streamModalSubtitle.textContent = (type === "series" ? "Series Episode" : "Movie") + " • Torrents (Requires Debrid on TV)";
        }

        streams.forEach(function(stream, idx) {
          const li = document.createElement("li");
          const shouldFocus = !streamModalList.querySelector(".focused") && idx === 0;
          li.className = "stream-modal-item focusable" + (shouldFocus ? " focused" : "");
          li.tabIndex = 0;

          const isDebridNeeded = !!stream.requiresDebrid;
          let badgeText, badgeColor, metaText, subText;
          if (isDebridNeeded) {
            badgeText = "P2P";
            badgeColor = "#d97706";
            metaText = "⚠️ Needs Debrid";
            subText = (stream.addonName || "Addon") + (stream.size ? " • " + stream.size : "") + " • Torrent (Debrid Required)";
          } else {
            badgeText = "FREE • " + (stream.quality || "HD");
            badgeColor = "#16a34a";
            metaText = "▶ Free Play";
            subText = (stream.addonName || "Addon") + (stream.size ? " • " + stream.size : "") + " • Direct Stream (No Subscription Needed)";
          }

          li.innerHTML =
            '<div class="stream-item-main">' +
              '<span class="stream-badge" style="background:' + badgeColor + ';">' + badgeText + '</span>' +
              '<div class="stream-item-details">' +
                '<span class="stream-item-title">' + (stream.title || "Stream") + '</span>' +
                '<span class="stream-item-sub">' + subText + '</span>' +
              '</div>' +
            '</div>' +
            '<span class="stream-item-meta">' + metaText + '</span>';

          li.addEventListener("click", function() {
            if (isDebridNeeded) {
              showToast("P2P torrents require a Debrid service (e.g. Real-Debrid) on Smart TVs.");
              return;
            }
            closeStreamSelectorModal();
            if (type === "series") {
              playSeriesEpisode(itemId, title, ext, stream.url);
            } else {
              playVodMovie(itemId, title, ext, stream.url);
            }
          });

          if (streamModalList) streamModalList.appendChild(li);
          if (shouldFocus) setElementFocus(li);
        });
      });
    }

    var knownImdbId = (itemId && String(itemId).indexOf("tt") === 0) ? String(itemId) : null;
    if (knownImdbId) {
      fetchAndRenderStreams(knownImdbId);
    } else {
      window.StremioEngine.searchImdbId(title, type, function(err, imdbId) {
        fetchAndRenderStreams(imdbId);
      });
    }
  }

  function playVodMovie(streamId, title, ext, overrideUrl) {
    currentVodMovieId = String(streamId);
    currentEpisodeId = null;
    playerWrapper.classList.remove("hidden");
    playerWrapper.classList.add("vod-playback");
    activeerFitScreen();
    if (vodOsdTitle) vodOsdTitle.textContent = title;
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    showVodOSD();

    destroyStreamPlayers();

    video.muted = false;
    video.volume = 1.0;

    const directMovieUrl = overrideUrl || (xtreamAuth ? `${xtreamAuth.server}/movie/${xtreamAuth.username}/${xtreamAuth.password}/${streamId}.${ext || 'mp4'}` : "");

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.src = directMovieUrl;
    showPlayerLoading();
    video.play().catch(console.error);
  }

  function playSeriesEpisode(episodeId, title, ext, overrideUrl) {
    currentEpisodeId = String(episodeId);
    currentVodMovieId = null;
    playerWrapper.classList.remove("hidden");
    playerWrapper.classList.add("vod-playback");
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
    const directEpisodeUrl = overrideUrl || (xtreamAuth ? `${xtreamAuth.server}/series/${xtreamAuth.username}/${xtreamAuth.password}/${episodeId}.${ext || "mp4"}` : "");
    video.src = directEpisodeUrl;
    showPlayerLoading();
    video.play().catch(console.error);
  }

  function playStremioLiveChannel(channelId, name, icon, idx, directUrl, streamType) {
    if (!channelId && !directUrl) return;

    if (tvGrid) tvGrid.classList.remove("hidden");
    playerWrapper.classList.remove("hidden");
    playerWrapper.classList.remove("vod-playback");
    currentStreamIndex = idx;
    currentPlayingStreamId = String(channelId);

    activeerFitScreen();

    const activeLi = document.querySelector(`#channelList [data-stream-id="${channelId}"]`);
    if (activeLi) {
      document.querySelectorAll("#channelList .channel-card").forEach(el => el.classList.remove("active"));
      activeLi.classList.add("active");
    }

    const numStr = (currentStreamIndex + 1).toString();
    updateLiveOSDData(numStr, name, icon);
    showLiveOSD();
    showPlayerLoading();
    destroyStreamPlayers();

    if (directUrl) {
      playStream(channelId, name, icon, idx, directUrl);
      return;
    }

    const auth = xtreamAuth || currentAuth;
    if (auth && auth.server && !String(channelId).includes(":") && !String(channelId).startsWith("http")) {
      playStream(channelId, name, icon, idx);
      return;
    }

    if (!window.StremioEngine) {
      reportPlaybackError("Stremio engine not available");
      return;
    }

    const typeQuery = streamType || "tv";
    window.StremioEngine.getStreams(typeQuery, channelId, function(streams) {
      if (String(currentPlayingStreamId) !== String(channelId)) return;
      if (!streams || streams.length === 0) {
        window.StremioEngine.getStreams("events", channelId, function(eventStreams) {
          if (String(currentPlayingStreamId) !== String(channelId)) return;
          const direct = (eventStreams || []).find(s => !!s.url) || (eventStreams && eventStreams[0]);
          if (direct && direct.url) {
            playStream(channelId, name, icon, idx, direct.url);
          } else {
            reportPlaybackError("No live stream found for this channel");
          }
        });
        return;
      }
      const direct = streams.find(s => !!s.url) || streams[0];
      if (direct && direct.url) {
        playStream(channelId, name, icon, idx, direct.url);
      } else {
        reportPlaybackError("Live channel requires Debrid or external stream link");
      }
    });
  }

  async function playStream(streamId, name, icon, index, directUrl = "", isReconnect = false) {
    if (window.kcLibsReady) await window.kcLibsReady;
    playerWrapper.classList.remove("vod-playback");
    
    if (index !== undefined && index !== null) {
      currentStreamIndex = index;
    } else {
      const activeIdx = currentActiveStreams.findIndex(s => String(s.stream_id) === String(streamId));
      if (activeIdx !== -1) currentStreamIndex = activeIdx;
    }
    currentPlayingStreamId = String(streamId);
    window.kcCurrentStreamIndex = currentStreamIndex;
    if (window.AeroRadial) window.AeroRadial.syncChannelIndex(currentStreamIndex);

    const activeLi = document.querySelector(`#channelList [data-stream-id="${streamId}"]`);
    if (activeLi) {
      document.querySelectorAll("#channelList .channel-card").forEach(el => el.classList.remove("active"));
      activeLi.classList.add("active");
    }

    if (!isReconnect) {
      const numStr = (currentStreamIndex + 1).toString();
      updateLiveOSDData(numStr, name, icon);
      showLiveOSD();
      fetchEPGData(streamId);
      liveReconnectAttempts = 0;
    }

    try {
      store.setItem("iptv_last_stream", JSON.stringify({
        section: currentAppSection,
        streamId: String(streamId),
        name: name,
        icon: icon,
        index: currentStreamIndex,
        directUrl: directUrl
      }));
    } catch (e) {}

    const auth = xtreamAuth || currentAuth;
    const isDirect = Boolean(directUrl);
    
    // Construct Primary (.m3u8) and Secondary (.ts) URLs with cache buster on reconnect
    let baseStreamUrl = directUrl || (auth && auth.server ? `${auth.server.replace(/\/+$/, "")}/live/${auth.username}/${auth.password}/${streamId}` : "");
    const cacheParam = (isReconnect ? (baseStreamUrl.indexOf("?") === -1 ? "?_t=" : "&_t=") + Date.now() : "");
    
    let hlsUrl = "";
    let tsUrl = "";
    if (isDirect) {
      if (/\.ts(?:$|[?#])/i.test(directUrl)) {
        tsUrl = directUrl + cacheParam;
        hlsUrl = directUrl.replace(/\.ts(?=([?#]|$))/i, ".m3u8") + cacheParam;
      } else {
        hlsUrl = directUrl + cacheParam;
        tsUrl = directUrl.replace(/\.m3u8(?=([?#]|$))/i, ".ts") + cacheParam;
      }
    } else if (baseStreamUrl) {
      hlsUrl = `${baseStreamUrl}.m3u8${cacheParam}`;
      tsUrl = `${baseStreamUrl}.ts${cacheParam}`;
    }

    destroyStreamPlayers();
    lastLive = { streamId, name, icon, index: currentStreamIndex, directUrl };
    showPlayerLoading();
    startPlaybackTimeout();
    isPlaybackHealthy = false;

    const mySessionId = ++playbackSessionId;

    // 4-Stage Resilient Playback Ladder:
    // Stage 1: Native hardware HLS (.m3u8)
    // Stage 2: Hls.js engine (.m3u8) with low-latency and auto-recovery
    // Stage 3: Native hardware MPEG-TS (.ts)
    // Stage 4: mpegts.js engine (.ts)

    let currentStage = 1;
    function tryStage(stage) {
      if (mySessionId !== playbackSessionId) return; // Discard stale session
      currentStage = stage;
      let stageTransitioned = false;

      if (currentStageTimer) {
        clearTimeout(currentStageTimer);
        currentStageTimer = null;
      }

      function nextStage(reason) {
        if (mySessionId !== playbackSessionId) return;
        if (stageTransitioned) return; // Prevent double-triggering nextStage for the same stage
        stageTransitioned = true;
        if (currentStageTimer) {
          clearTimeout(currentStageTimer);
          currentStageTimer = null;
        }
        window.__handlePlaybackStageError = null;
        if (isPlaybackHealthy) return; // Already healthy, do not advance

        console.warn(`Stage ${stage} finished (${reason || "next"}), proceeding to next stage`);
        if (stage < 4) {
          tryStage(stage + 1);
        } else {
          scheduleLiveReconnect(reason || "Playback engine fallback exhausted");
        }
      }

      // Stage timeout: if no frames render within 3.8s, advance to next engine
      currentStageTimer = setTimeout(() => {
        if (mySessionId !== playbackSessionId) return;
        if (!isPlaybackHealthy) {
          console.warn(`Stage ${stage} timed out without rendering frames, trying next stage`);
          nextStage("timeout");
        }
      }, 3800);

      try {
        if (stage === 1) {
          // Stage 1: Native webOS HLS
          window.__handlePlaybackStageError = function(reason) {
            nextStage(`native hls error: ${reason}`);
          };
          video.pause();
          video.removeAttribute("src");
          video.load();
          video.src = hlsUrl;
          video.muted = false;
          video.volume = 1.0;
          const p = video.play();
          if (p && typeof p.catch === "function") {
            p.catch(err => {
              console.warn("Native HLS play rejected:", err);
              nextStage("native hls rejected");
            });
          }
        } else if (stage === 2) {
          // Stage 2: Hls.js with local engine & worker disabled for webOS stability
          window.__handlePlaybackStageError = null;
          if (window.Hls && Hls.isSupported() && hlsUrl) {
            video.pause();
            video.removeAttribute("src");
            video.load();
            hlsPlayer = new Hls({
              enableWorker: false,
              lowLatencyMode: true,
              backBufferLength: 30,
              maxBufferLength: 8,
              maxMaxBufferLength: 16,
              liveSyncDurationCount: 3,
              liveMaxLatencyDurationCount: 5,
              fragLoadingTimeOut: 5000,
              manifestLoadingTimeOut: 5000,
              levelLoadingTimeOut: 5000
            });
            hlsPlayer.loadSource(hlsUrl);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(e => console.warn("HLS play catch:", e));
            });
            hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
              if (data && data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  try { hlsPlayer.startLoad(); } catch (e) { nextStage("hls network error"); }
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                  try { hlsPlayer.recoverMediaError(); } catch (e) { nextStage("hls media error"); }
                } else {
                  if (hlsPlayer) { try { hlsPlayer.destroy(); } catch (e) {} hlsPlayer = null; }
                  nextStage("hls fatal error");
                }
              }
            });
          } else {
            nextStage("hls.js not supported or no url");
          }
        } else if (stage === 3) {
          // Stage 3: Native MPEG-TS (.ts)
          window.__handlePlaybackStageError = function(reason) {
            nextStage(`native ts error: ${reason}`);
          };
          if (hlsPlayer) { try { hlsPlayer.destroy(); } catch (e) {} hlsPlayer = null; }
          video.pause();
          video.removeAttribute("src");
          video.load();
          video.src = tsUrl;
          video.muted = false;
          video.volume = 1.0;
          const p = video.play();
          if (p && typeof p.catch === "function") {
            p.catch(err => {
              console.warn("Native TS play rejected:", err);
              nextStage("native ts rejected");
            });
          }
        } else if (stage === 4) {
          // Stage 4: mpegts.js local MSE player
          window.__handlePlaybackStageError = null;
          if (window.mpegts && mpegts.isSupported() && tsUrl) {
            video.pause();
            video.removeAttribute("src");
            video.load();
            mpegTsPlayer = mpegts.createPlayer({
              type: "mpegts",
              isLive: true,
              url: tsUrl,
              liveBufferLatencyChasing: true,
              enableWorker: false,
              lazyLoad: false
            });
            mpegTsPlayer.on(mpegts.Events.ERROR, (type, detail) => {
              console.warn(`mpegts.js error: ${type} ${detail}`);
              nextStage(`mpegts error: ${type}`);
            });
            mpegTsPlayer.attachMediaElement(video);
            mpegTsPlayer.load();
            Promise.resolve(mpegTsPlayer.play()).catch(e => {
              console.warn("mpegts play catch:", e);
              if (!isPlaybackHealthy) {
                nextStage("mpegts play rejected");
              }
            });
          } else {
            nextStage("mpegts not supported");
          }
        }
      } catch (err) {
        console.error(`Error initiating stage ${stage}:`, err);
        nextStage("exception in stage " + stage);
      }
    }

    // Start with Stage 1
    tryStage(1);
  }

  function extractLogoColor(img) {
    try {
      const c = document.createElement("canvas");
      c.width = 8;
      c.height = 8;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, 8, 8);
      const data = ctx.getImageData(0, 0, 8, 8).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        const red = data[i], green = data[i + 1], blue = data[i + 2];
        const lum = red * 0.299 + green * 0.587 + blue * 0.114;
        if (a > 120 && lum > 35 && lum < 235) {
          r += red; g += green; b += blue; count++;
        }
      }
      if (count > 0) {
        return `${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}`;
      }
    } catch (e) {}
    return null;
  }

  function updateLiveOSDData(numStr, name, icon) {
    if (osdChannelTitle) osdChannelTitle.textContent = `${numStr}. ${cleanTitle(name)}`;
    const osdLogo = document.getElementById("osdLogo");
    const osdLogoFallback = document.getElementById("osdLogoFallback");
    if (osdLogo && icon) {
      osdLogo.crossOrigin = "anonymous";
      osdLogo.src = icon;
      osdLogo.classList.remove("hidden");
      if (osdLogoFallback) osdLogoFallback.style.display = "none";
      osdLogo.onload = () => {
        const rgb = extractLogoColor(osdLogo);
        if (rgb) {
          if (osdContainer) osdContainer.style.setProperty("--osd-ambient-rgb", rgb);
          const bubble = document.getElementById("osdClockBubble");
          if (bubble) bubble.style.setProperty("--osd-ambient-rgb", rgb);
        } else if (osdContainer) {
          osdContainer.style.removeProperty("--osd-ambient-rgb");
        }
      };
      osdLogo.onerror = () => {
        if (osdContainer) osdContainer.style.removeProperty("--osd-ambient-rgb");
      };
    } else if (osdLogoFallback) {
      if (osdLogo) osdLogo.classList.add("hidden");
      osdLogoFallback.style.display = "flex";
      if (osdContainer) osdContainer.style.removeProperty("--osd-ambient-rgb");
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
    if (vodPlayPauseIcon) vodPlayPauseIcon.innerHTML = uiIcon(video.paused ? "play" : "pause");
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
    return selectedSeries.seasons.reduce((all, season) => all.concat(season.episodes || []), []);
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
    if (lastLive) return;
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

  // =========================================================================
  // VOD PLAYBACK SETTINGS (AUDIO TRACKS, SUBTITLES, VIDEO RATIO, SPEED)
  // =========================================================================
  const vodSettingsBtn = document.getElementById("vodSettingsBtn");
  const vodSettingsPopover = document.getElementById("vodSettingsPopover");
  const vodSettingsCloseBtn = document.getElementById("vodSettingsCloseBtn");
  const vodAudioTrackList = document.getElementById("vodAudioTrackList");
  const vodSubtitleTrackList = document.getElementById("vodSubtitleTrackList");
  const vodSubtitleSizeGroup = document.getElementById("vodSubtitleSizeGroup");
  const vodAspectGroup = document.getElementById("vodAspectGroup");
  const vodSpeedGroup = document.getElementById("vodSpeedGroup");

  let vodSettingsActive = false;
  let vodAspectRatio = "contain";
  let vodPlaybackSpeed = 1.0;
  let vodSubtitleSize = "normal";
  let selectedVodAudioTrack = 0;
  let selectedVodSubtitleTrack = -1;

  function openVodSettings(initialTab) {
    if (!vodSettingsPopover) return;
    vodSettingsActive = true;
    vodSettingsPopover.classList.remove("hidden");
    if (vodOsdTimeout) clearTimeout(vodOsdTimeout);

    renderVodAudioTracks();
    renderVodSubtitleTracks();

    switchVodSettingsTab(initialTab || "audio");
    const activeTab = vodSettingsPopover.querySelector(`.vod-settings-tab[data-vod-tab="${initialTab || "audio"}"]`);
    if (activeTab) setElementFocus(activeTab);
  }

  function closeVodSettings() {
    if (!vodSettingsPopover) return;
    vodSettingsPopover.classList.add("hidden");
    vodSettingsActive = false;
    showVodOSD();
  }

  if (vodSettingsBtn) {
    vodSettingsBtn.addEventListener("click", () => openVodSettings("audio"));
  }
  if (vodSettingsCloseBtn) {
    vodSettingsCloseBtn.addEventListener("click", closeVodSettings);
  }

  function switchVodSettingsTab(tabName) {
    if (!vodSettingsPopover) return;
    vodSettingsPopover.querySelectorAll(".vod-settings-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.vodTab === tabName);
    });
    vodSettingsPopover.querySelectorAll(".vod-settings-pane").forEach(pane => {
      pane.classList.toggle("hidden", pane.dataset.vodPane !== tabName);
    });
  }

  if (vodSettingsPopover) {
    vodSettingsPopover.addEventListener("click", e => {
      const tabBtn = e.target.closest(".vod-settings-tab");
      if (tabBtn && tabBtn.dataset.vodTab) {
        switchVodSettingsTab(tabBtn.dataset.vodTab);
        setElementFocus(tabBtn);
      }
    });
  }

  function getAvailableAudioTracks() {
    const list = [];
    if (video && video.audioTracks && video.audioTracks.length > 0) {
      for (let i = 0; i < video.audioTracks.length; i++) {
        const t = video.audioTracks[i];
        const lang = t.language ? ` (${t.language.toUpperCase()})` : "";
        list.push({
          index: i,
          id: t.id || String(i),
          label: (t.label || `Track ${i + 1}`) + lang,
          enabled: !!t.enabled,
          source: "html5"
        });
      }
    } else if (hlsPlayer && hlsPlayer.audioTracks && hlsPlayer.audioTracks.length > 0) {
      const curIdx = hlsPlayer.audioTrack;
      hlsPlayer.audioTracks.forEach((t, i) => {
        const lang = t.lang ? ` (${t.lang.toUpperCase()})` : "";
        list.push({
          index: i,
          id: String(t.id !== undefined ? t.id : i),
          label: (t.name || `Track ${i + 1}`) + lang,
          enabled: (curIdx === i),
          source: "hls"
        });
      });
    }
    return list;
  }

  function renderVodAudioTracks() {
    if (!vodAudioTrackList) return;
    vodAudioTrackList.innerHTML = "";

    const tracks = getAvailableAudioTracks();
    if (tracks.length === 0) {
      const defaultItem = document.createElement("button");
      defaultItem.type = "button";
      defaultItem.className = "vod-track-item active focusable";
      defaultItem.tabIndex = 0;
      defaultItem.innerHTML = `<span>Default Audio (Stereo / Main)</span><span style="color:#22c55e;font-size:1.3rem;">✓</span>`;
      vodAudioTrackList.appendChild(defaultItem);

      const hint = document.createElement("div");
      hint.style.cssText = "font-size:1.1rem;color:#94a3b8;padding:8px 0;";
      hint.textContent = t("noAudioTracks") || "Single audio track stream.";
      vodAudioTrackList.appendChild(hint);
      return;
    }

    tracks.forEach((track, i) => {
      const isSelected = track.enabled;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vod-track-item focusable" + (isSelected ? " active" : "");
      btn.tabIndex = 0;
      btn.innerHTML = `<span>${escapeAttr(track.label)}</span>${isSelected ? '<span style="color:#22c55e;font-size:1.3rem;">✓</span>' : ''}`;
      btn.addEventListener("click", () => {
        if (track.source === "html5" && video && video.audioTracks) {
          for (let j = 0; j < video.audioTracks.length; j++) {
            video.audioTracks[j].enabled = (j === track.index);
          }
        } else if (track.source === "hls" && hlsPlayer) {
          hlsPlayer.audioTrack = track.index;
        }
        selectedVodAudioTrack = track.index;
        showToast("Audio: " + track.label);
        renderVodAudioTracks();
      });
      vodAudioTrackList.appendChild(btn);
    });
  }

  function getAvailableSubtitleTracks() {
    const list = [];
    if (video && video.textTracks && video.textTracks.length > 0) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const t = video.textTracks[i];
        if (t.kind === "subtitles" || t.kind === "captions" || !t.kind) {
          const lang = t.language ? ` (${t.language.toUpperCase()})` : "";
          list.push({
            index: i,
            id: t.id || String(i),
            label: (t.label || `Subtitle ${i + 1}`) + lang,
            enabled: (t.mode === "showing"),
            source: "html5"
          });
        }
      }
    } else if (hlsPlayer && hlsPlayer.subtitleTracks && hlsPlayer.subtitleTracks.length > 0) {
      const curIdx = hlsPlayer.subtitleTrack;
      hlsPlayer.subtitleTracks.forEach((t, i) => {
        const lang = t.lang ? ` (${t.lang.toUpperCase()})` : "";
        list.push({
          index: i,
          id: String(t.id !== undefined ? t.id : i),
          label: (t.name || `Subtitle ${i + 1}`) + lang,
          enabled: (curIdx === i),
          source: "hls"
        });
      });
    }
    return list;
  }

  function renderVodSubtitleTracks() {
    if (!vodSubtitleTrackList) return;
    vodSubtitleTrackList.innerHTML = "";

    const tracks = getAvailableSubtitleTracks();
    const anyShowing = tracks.some(t => t.enabled);

    // Off option
    const offBtn = document.createElement("button");
    offBtn.type = "button";
    offBtn.className = "vod-track-item focusable" + (!anyShowing ? " active" : "");
    offBtn.tabIndex = 0;
    offBtn.innerHTML = `<span>${t("off") || "Off"}</span>${!anyShowing ? '<span style="color:#22c55e;font-size:1.3rem;">✓</span>' : ''}`;
    offBtn.addEventListener("click", () => {
      selectedVodSubtitleTrack = -1;
      if (video && video.textTracks) {
        for (let j = 0; j < video.textTracks.length; j++) {
          video.textTracks[j].mode = "disabled";
        }
      }
      if (hlsPlayer) {
        hlsPlayer.subtitleTrack = -1;
      }
      showToast("Subtitles: Off");
      renderVodSubtitleTracks();
    });
    vodSubtitleTrackList.appendChild(offBtn);

    tracks.forEach(track => {
      const isSelected = track.enabled;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vod-track-item focusable" + (isSelected ? " active" : "");
      btn.tabIndex = 0;
      btn.innerHTML = `<span>${escapeAttr(track.label)}</span>${isSelected ? '<span style="color:#22c55e;font-size:1.3rem;">✓</span>' : ''}`;
      btn.addEventListener("click", () => {
        selectedVodSubtitleTrack = track.index;
        if (track.source === "html5" && video && video.textTracks) {
          for (let j = 0; j < video.textTracks.length; j++) {
            video.textTracks[j].mode = (j === track.index) ? "showing" : "disabled";
          }
        } else if (track.source === "hls" && hlsPlayer) {
          hlsPlayer.subtitleTrack = track.index;
        }
        showToast("Subtitles: " + track.label);
        renderVodSubtitleTracks();
      });
      vodSubtitleTrackList.appendChild(btn);
    });

    if (tracks.length === 0) {
      const hint = document.createElement("div");
      hint.style.cssText = "font-size:1.1rem;color:#94a3b8;padding:8px 0;";
      hint.textContent = t("noSubTracks") || "No subtitle tracks embedded in this stream.";
      vodSubtitleTrackList.appendChild(hint);
    }
  }

  function applyVodAspectRatio(aspect) {
    vodAspectRatio = aspect || "contain";
    if (!video) return;
    if (vodAspectRatio === "contain") {
      video.style.objectFit = "contain";
      video.style.transform = "none";
    } else if (vodAspectRatio === "cover") {
      video.style.objectFit = "cover";
      video.style.transform = "none";
    } else if (vodAspectRatio === "fill") {
      video.style.objectFit = "fill";
      video.style.transform = "none";
    }
    if (vodAspectGroup) {
      vodAspectGroup.querySelectorAll(".vod-option-chip").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.aspect === vodAspectRatio);
      });
    }
    showToast("Aspect: " + vodAspectRatio);
  }

  function applyVodPlaybackSpeed(speed) {
    vodPlaybackSpeed = parseFloat(speed) || 1.0;
    if (video) {
      try { video.playbackRate = vodPlaybackSpeed; } catch (_) {}
    }
    if (vodSpeedGroup) {
      vodSpeedGroup.querySelectorAll(".vod-option-chip").forEach(chip => {
        chip.classList.toggle("active", parseFloat(chip.dataset.speed) === vodPlaybackSpeed);
      });
    }
    showToast("Speed: " + vodPlaybackSpeed + "x");
  }

  function applyVodSubtitleSize(size) {
    vodSubtitleSize = size || "normal";
    if (playerWrapper) {
      playerWrapper.classList.remove("sub-size-small", "sub-size-normal", "sub-size-large");
      playerWrapper.classList.add("sub-size-" + vodSubtitleSize);
    }
    if (vodSubtitleSizeGroup) {
      vodSubtitleSizeGroup.querySelectorAll(".vod-option-chip").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.subSize === vodSubtitleSize);
      });
    }
  }

  if (vodAspectGroup) {
    vodAspectGroup.addEventListener("click", e => {
      const chip = e.target.closest(".vod-option-chip");
      if (chip && chip.dataset.aspect) applyVodAspectRatio(chip.dataset.aspect);
    });
  }

  if (vodSpeedGroup) {
    vodSpeedGroup.addEventListener("click", e => {
      const chip = e.target.closest(".vod-option-chip");
      if (chip && chip.dataset.speed) applyVodPlaybackSpeed(chip.dataset.speed);
    });
  }

  if (vodSubtitleSizeGroup) {
    vodSubtitleSizeGroup.addEventListener("click", e => {
      const chip = e.target.closest(".vod-option-chip");
      if (chip && chip.dataset.subSize) applyVodSubtitleSize(chip.dataset.subSize);
    });
  }

  video.addEventListener("loadedmetadata", () => {
    if (vodSettingsActive) {
      renderVodAudioTracks();
      renderVodSubtitleTracks();
    }
  });

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

  function escapeAttr(value) {
    return String(value).replace(/["\\]/g, "\\$&");
  }

  // Remember the last focused item per column so returning lands where the user left.
  function rememberFocus(element, column) {
    if (!column || !column.id) return;
    const keys = [["data-region", "region"], ["data-cat-id", "catId"], ["data-modus", "modus"], ["data-stream-id", "streamId"], ["data-series-id", "seriesId"]];
    for (let i = 0; i < keys.length; i++) {
      if (element.dataset[keys[i][1]] !== undefined) {
        columnMemory[column.id] = { element, attr: keys[i][0], value: element.dataset[keys[i][1]] };
        return;
      }
    }
    columnMemory[column.id] = { element };
  }

  function recallFocus(column) {
    const memory = columnMemory[column.id];
    if (memory) {
      if (memory.element && document.body.contains(memory.element) && !memory.element.classList.contains("hidden")) return memory.element;
      if (memory.attr) {
        const found = column.querySelector(`[${memory.attr}="${escapeAttr(memory.value)}"]:not(.hidden)`);
        if (found) return found;
      }
    }
    return column.querySelector(".focusable.active:not(.hidden)") || column.querySelector(".focusable:not(.hidden)");
  }

  function enterColumn(index) {
    if (index === 1 && isColumnSkipped(index)) return false;
    const ids = ["colModus", "colRegions", "colCategories", "colContent"];
    const column = document.getElementById(ids[index]);
    if (!column) return false;
    const target = recallFocus(column);
    if (!target) {
      if (index === 3 && Object.keys(pendingCategoryLoads).length > 0) focusContentWhenReady = true;
      return false;
    }
    setElementFocus(target);
    return true;
  }

  function applyPendingFocus() {
    if (!focusContentWhenReady) return;
    focusContentWhenReady = false;
    const first = channelList.querySelector(".focusable");
    if (first) setElementFocus(first);
  }

  function pickFallbackFocus() {
    const visible = (el) => !!el && document.body.contains(el) && el.getClientRects().length > 0;
    if (visible(lastFocusedPoster)) return lastFocusedPoster;
    const candidates = [
      channelList.querySelector(".channel-card.active"),
      channelList.querySelector(".focusable"),
      document.querySelector(".tv-grid .nav-item.active"),
      document.querySelector(".tv-grid .focusable")
    ];
    for (let i = 0; i < candidates.length; i++) {
      if (visible(candidates[i])) return candidates[i];
    }
    return document.querySelector(".focusable");
  }

  function animateScroll(container, target, instant, duration) {
    const max = container.scrollHeight - container.clientHeight;
    const to = Math.max(0, Math.min(max, target));
    if (container._scrollFrame) cancelAnimationFrame(container._scrollFrame);
    if (instant || document.body.classList.contains("no-animations")) {
      container.scrollTop = to;
      return;
    }
    const from = container.scrollTop;
    const started = Date.now();
    const length = duration || 140;
    const step = () => {
      const progress = Math.min(1, (Date.now() - started) / length);
      container.scrollTop = from + (to - from) * (1 - Math.pow(1 - progress, 3));
      if (progress < 1) container._scrollFrame = requestAnimationFrame(step);
    };
    step();
  }

  // Eased scroll so focus moves glide instead of jumping (replaces scrollIntoView).
  function scrollFocusIntoView(element) {
    let container = element.parentElement;
    while (container && container !== document.body) {
      const overflow = getComputedStyle(container).overflowY;
      if ((overflow === "auto" || overflow === "scroll") && container.scrollHeight > container.clientHeight) break;
      container = container.parentElement;
    }
    if (!container || container === document.body) {
      element.scrollIntoView({ block: "nearest" });
      return;
    }
    const listRect = container.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    let offset = 0;
    if (rect.top < listRect.top) offset = rect.top - listRect.top;
    else if (rect.bottom > listRect.bottom) offset = rect.bottom - listRect.bottom;
    if (offset) animateScroll(container, container.scrollTop + offset, false, 260);
  }

  function wheelAnchor(container) {
    const column = container.closest(".col-nav") || container;
    const listRect = container.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    return Math.min(container.clientHeight, Math.max(0, columnRect.top + columnRect.height / 2 - listRect.top));
  }

  function wheelScrollTop(container, element) {
    const listRect = container.getBoundingClientRect();
    const offset = (element.getBoundingClientRect().top + element.offsetHeight / 2) - (listRect.top + wheelAnchor(container));
    return container.scrollTop + offset;
  }

  // Vertical lists behave like a picker wheel: the focused row stays on the centre line of its column,
  // which is where the collapsed tab labels are centred.
  function centerInList(element, instant) {
    const container = element.parentElement;
    if (!container) return;
    if (!isWheelList(container) || container.clientHeight === 0) return;
    const anchor = wheelAnchor(container);
    const half = element.offsetHeight / 2;
    // Room above the first row for the wrap glide onto the copy of the last row.
    const lead = wheelHasCopies(wheelItems(container).length) ? element.offsetHeight * 2 : 0;
    const padTop = Math.max(0, Math.round(anchor - half)) + lead;
    const padBottom = Math.max(0, Math.round(container.clientHeight - anchor - half));
    // Spacers are margins on the first and last rows, not container padding: padding sits outside the flex
    // basis of a content-box list and makes the list grow, which then feeds back into padBottom.
    const edges = wheelEdges(container);
    if (container._wheelFirst && container._wheelFirst !== edges.first) container._wheelFirst.style.marginTop = "";
    if (container._wheelLast && container._wheelLast !== edges.last) container._wheelLast.style.marginBottom = "";
    container._wheelFirst = edges.first;
    container._wheelLast = edges.last;
    if (edges.first) edges.first.style.marginTop = padTop + "px";
    if (edges.last) edges.last.style.marginBottom = padBottom + "px";
    container.classList.add("wheel", "wheel-detent");
    syncWheelCopies(container);
    animateScroll(container, wheelScrollTop(container, element), !!instant);
  }

  function isWheelList(container) {
    return (container.classList.contains("nav-list") && container.id !== "modusList") || container.classList.contains("channel-grid");
  }

  function wheelHasCopies(count) {
    return count >= 10;
  }

  // First and last in-flow rows (ignores the ghost layer and hidden rows), where the centring spacers go.
  function wheelEdges(container) {
    const kids = Array.from(container.children).filter(el => !el.classList.contains("wheel-ghost") && !el.classList.contains("hidden"));
    return { first: kids[0] || null, last: kids[kids.length - 1] || null };
  }

  // Infinite-wheel look for long lists: copies of the rows beyond both ends (virtual rows -n..-1 and count..count+n-1).
  // Copies are visual only: no id, tabindex or focusable class, and pointer-events are off in CSS.
  function syncWheelCopies(container) {
    const items = wheelItems(container);
    const count = items.length;
    const layerOk = !!container._wheelLayer && container._wheelLayer.parentElement === container;
    // Move mode edits the rows in place, so the ghost layer follows the same rows as the list.
    if (!wheelHasCopies(count)) {
      if (layerOk) container._wheelLayer.remove();
      container._wheelLayer = null;
      container._wheelCopies = [];
      return;
    }
    const first = items[0];
    const last = items[count - 1];
    const gap = items[1].offsetTop - (first.offsetTop + first.offsetHeight);
    const period = last.offsetTop + last.offsetHeight + gap - first.offsetTop;
    const copyEach = Math.min(60, Math.ceil(container.clientHeight / (period / count)) + 2);
    // Copies depend only on the row count and copy count, so the layer is rebuilt only when those change.
    // Otherwise each copy's content is refreshed in place, which keeps numbers and order right after a reorder.
    const sameLayer = layerOk
      && container._wheelCount === copyEach
      && container._wheelRows === count
      && container._wheelCopies.length > 0;
    if (!sameLayer) {
      if (layerOk) container._wheelLayer.remove();
      const layer = document.createElement("div");
      layer.className = "wheel-ghost";
      layer.setAttribute("aria-hidden", "true");
      const copies = [];
      for (let m = -copyEach; m < count + copyEach; m++) {
        if (m >= 0 && m < count) continue;
        const row = ((m % count) + count) % count;
        const el = items[row].cloneNode(true);
        prepareCopy(el);
        layer.appendChild(el);
        copies.push({ el, m, row, cycle: Math.floor(m / count), html: items[row].innerHTML });
      }
      container.appendChild(layer);
      container._wheelLayer = layer;
      container._wheelCopies = copies;
      container._wheelCount = copyEach;
      container._wheelRows = count;
    }
    container._wheelCopies.forEach(copy => {
      const src = items[copy.row];
      copy.el.style.top = (src.offsetTop + copy.cycle * period) + "px";
      copy.el.style.left = src.offsetLeft + "px";
      copy.el.style.width = src.offsetWidth + "px";
      copy.el.className = ("wheel-copy " + src.className.replace(/\b(focused|focusable)\b/g, "")).replace(/\s+/g, " ").trim();
      const html = src.innerHTML;
      if (html !== copy.html) {
        copy.el.innerHTML = html;
        copy.html = html;
        copy.el.querySelectorAll(".flag-underlay").forEach(underlay => {
          if (!underlay.style.backgroundImage) loadRegionFlag(underlay);
        });
      }
    });
  }

  // Copies are visual only: no ids, tab stops or focus classes.
  function prepareCopy(el) {
    el.removeAttribute("id");
    el.removeAttribute("tabindex");
    el.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    el.querySelectorAll(".flag-underlay").forEach(underlay => {
      if (!underlay.style.backgroundImage) loadRegionFlag(underlay);
    });
  }

  // At the end of a long wheel: glide one row onto the copy beyond the edge, then jump to the real row.
  // The copy shows the same content, so the jump is not visible. Returns false when there are no copies.
  function wrapWheel(container, target, forward) {
    syncWheelCopies(container);
    const count = wheelItems(container).length;
    const copy = (container._wheelCopies || []).find(c => c.m === (forward ? count : -1));
    if (!copy) return false;
    const origin = document.activeElement;
    syncWheelCopies(container);
    clearTimeout(container._wrapTimer);
    animateScroll(container, wheelScrollTop(container, copy.el), false);
    container._wrapPending = target;
    container._wrapTimer = setTimeout(() => {
      container._wrapPending = null;
      if (document.activeElement === origin) setElementFocus(target, true);
    }, 150);
    return true;
  }

  // One fixed focus box per screen, drawn on the centre line of the wheel. The rows scroll underneath it.
  let wheelWindowEl = null;
  let wheelWindowTarget = null;
  let wheelFollowUntil = 0;

  // Measures the focused row and places the box on it.
  function positionWheelWindow() {
    const element = wheelWindowTarget;
    if (!wheelWindowEl || !element || !element.isConnected || !element.classList.contains("focused")) return;
    const container = element.parentElement;
    if (!container) return;
    const listRect = container.getBoundingClientRect();
    const rowRect = element.getBoundingClientRect();
    const h = element.offsetHeight;
    wheelWindowEl.style.left = rowRect.left + "px";
    wheelWindowEl.style.width = rowRect.width + "px";
    wheelWindowEl.style.top = (listRect.top + wheelAnchor(container) - h / 2) + "px";
    wheelWindowEl.style.height = h + "px";
  }

  // Columns animate their width after focus moves, so the box re-measures each frame until they settle.
  function followWheelWindow() {
    const running = wheelFollowUntil > performance.now();
    wheelFollowUntil = performance.now() + 200;
    if (running) return;
    const tick = () => {
      positionWheelWindow();
      if (performance.now() < wheelFollowUntil) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function showWheelWindow(container, element) {
    if (!wheelWindowEl) {
      wheelWindowEl = document.createElement("div");
      wheelWindowEl.className = "wheel-focus-window";
      document.body.appendChild(wheelWindowEl);
    }
    wheelWindowTarget = element;
    // The fill is copied from the row while it is focused, then the row goes transparent, so the fill stays fixed.
    wheelWindowEl.style.background = getComputedStyle(element).backgroundColor;
    positionWheelWindow();
    wheelWindowEl.style.display = "block";
  }

  function hideWheelWindow() {
    if (wheelWindowEl) wheelWindowEl.style.display = "none";
  }

  // Short filtered noise burst, like a clock escapement. Created lazily, so the first call happens after a key press.
  let tickCtx = null;
  let tickBuffer = null;
  function playTick(frequency = 3500, level = 0.3) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!tickCtx) tickCtx = new AC();
      if (tickCtx.state === "suspended") tickCtx.resume();
      if (!tickBuffer) {
        const len = Math.floor(tickCtx.sampleRate * 0.012);
        tickBuffer = tickCtx.createBuffer(1, len, tickCtx.sampleRate);
        const data = tickBuffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
      }
      const src = tickCtx.createBufferSource();
      const filter = tickCtx.createBiquadFilter();
      const gain = tickCtx.createGain();
      filter.type = "bandpass";
      filter.frequency.value = frequency;
      filter.Q.value = 8;
      gain.gain.value = level;
      src.buffer = tickBuffer;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(tickCtx.destination);
      src.start();
    } catch (e) {
      // Sound is optional.
    }
  }

  function isElementInHeader(el) {
    if (!el) return false;
    if (el.classList && el.classList.contains("header-nav-tab")) return true;
    let curr = el;
    while (curr && curr !== document.body) {
      if (curr.classList && curr.classList.contains("app-header")) return true;
      if (curr.id === "headerNavSelector" || curr.id === "headerClock") return true;
      curr = curr.parentElement;
    }
    return false;
  }

  function isElementInSidebar(el) {
    if (!el) return false;
    if (el.id === "sideBackToIptv" || el.id === "sideTv" || el.id === "sideMovies" || el.id === "sideSeries") return true;
    let curr = el;
    while (curr && curr !== document.body) {
      if (curr.id === "stremioSidebarDock" || (curr.classList && curr.classList.contains("stremio-sidebar-dock"))) return true;
      curr = curr.parentElement;
    }
    return false;
  }

  function setElementFocus(element, instant) {
    if (!element) return;
    lastNavigationAt = Date.now();
    const previous = document.querySelector(".focused");
    document.querySelectorAll(".focused").forEach(el => el.classList.remove("focused"));
    element.classList.add("focused");

    // Expand the column first: a collapsed column is display:none and cannot take focus.
    const parentCol = element.closest(".col-nav");
    if (parentCol && parentCol.dataset.col !== undefined) {
      setColumnFocus(parseInt(parentCol.dataset.col, 10));
      followWheelWindow();
      if (parentCol.classList.contains("content-hidden")) {
        // Still revealing: focus and centring need laid-out contents, so they run when the reveal ends.
        parentCol._pendingFocus = { element, instant };
        return;
      }
    }
    // Centre the list before focusing so the focus box never paints at the old position.
    centerInList(element, instant);
    const container = element.parentElement;
    if (container && container.classList.contains("wheel") && element.offsetHeight > 0) {
      if (element.classList.contains("pick-slot")) {
        // The held stack is not a focus target: its box stays out of the way of the stack frames.
        hideWheelWindow();
      } else {
        showWheelWindow(container, element);
      }
      if (previous && previous !== element && previous.parentElement === container) playTick();
    } else {
      hideWheelWindow();
      // Posters stay silent so fast scrolling through a grid is not noisy.
      if (previous && previous !== element && !element.classList.contains("grid-item")) playTick(2200, 0.1);
    }
    element.focus({ preventScroll: true });

    if (element && (element.classList.contains("stream-modal-item") || element === streamModalClose)) {
      if (typeof scrollModalItemIntoView === "function") scrollModalItemIntoView(element);
    }

    if (element && (element.classList.contains("stremio-card") || element.classList.contains("stremio-live-cat-pill") || element.classList.contains("category-pill-btn"))) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      if (element.dataset.backdrop && stremioHeroBackdrop) {
        stremioHeroBackdrop.style.backgroundImage = `url('${element.dataset.backdrop}')`;
      }
    }

    // Settings panel auto-scrolling
    const custContent = element && element.closest(".customization-content");
    if (custContent) {
      const targetCard = element.closest(".customization-section, .settings-row, .settings-toggle, .settings-item, .hue-panel") || element;
      const cRect = custContent.getBoundingClientRect();
      const tRect = targetCard.getBoundingClientRect();
      const topPad = 60;
      const botPad = 60;
      if (tRect.top < cRect.top + topPad) {
        custContent.scrollTop = Math.max(0, custContent.scrollTop + (tRect.top - (cRect.top + topPad)));
      } else if (tRect.bottom > cRect.bottom - botPad) {
        custContent.scrollTop += (tRect.bottom - (cRect.bottom - botPad));
      }
    }

    // Top Bar auto-overlap visibility (hidden unless focused/active)
    const appHeader = document.querySelector(".app-header");
    if (appHeader) {
      if (isElementInHeader(element)) {
        appHeader.classList.add("is-active");
      } else {
        appHeader.classList.remove("is-active");
      }
    }

    // Stremio Left Sidebar Dock visibility (invisible unless focused)
    const stremioSidebarDock = document.getElementById("stremioSidebarDock");
    if (stremioSidebarDock) {
      if (isElementInSidebar(element)) {
        stremioSidebarDock.classList.add("is-focused");
      } else {
        stremioSidebarDock.classList.remove("is-focused");
      }
    }

    if (element.classList.contains("grid-item")) {
      lastFocusedPoster = element;
      setTimeout(loadVisiblePosters, 300);
    }
    rememberFocus(element, parentCol);
    updateHintBar(element);
  }

  // Visible focusable rows of a picker list, in order. Used to wrap Up/Down around the list.
  function wheelItems(list) {
    if (!list) return [];
    return Array.from(list.children).filter(el => el.classList.contains("focusable") && !el.classList.contains("hidden"));
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
      while (targetIndex > 0 && isColumnSkipped(targetIndex)) targetIndex--;
      if (targetIndex >= 0 && targetIndex < cols.length) enterColumn(targetIndex);
      return;
    }

    let targetIndex = currentIndex + 1;
    while (targetIndex < cols.length && isColumnSkipped(targetIndex)) targetIndex++;
    if (targetIndex < cols.length) enterColumn(targetIndex);
  }

  function navigatePosterGrid(current, direction) {
    // Grid order is DOM order, so the nearest neighbour in any direction lies within a small window.
    const all = Array.from(document.querySelectorAll("#channelList .grid-item"));
    const index = all.indexOf(current);
    const posters = index < 0 ? all : all.slice(Math.max(0, index - 30), index + 31);
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
      scrollFocusIntoView(target);
    } else if (direction === "left") {
      enterColumn(2);
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
        const isStremio = !!(selectedSeries && selectedSeries.isStremio) || li.dataset.isStremio === "true";
        if (isStremio || (window.StremioEngine && window.StremioEngine.hasStreamAddons())) {
          openStreamSelectorModal("series", li.dataset.episodeId, li.dataset.title, li.dataset.containerExtension, li.dataset.seasonNum, li.dataset.episodeNum, isStremio);
        } else {
          playSeriesEpisode(li.dataset.episodeId, li.dataset.title, li.dataset.containerExtension);
        }
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
        const isStremio = li.dataset.isStremio === "true";
        if (isStremio || (window.StremioEngine && window.StremioEngine.hasStreamAddons())) {
          openStreamSelectorModal("movie", li.dataset.streamId, li.dataset.title, li.dataset.containerExtension, null, null, isStremio);
        } else {
          playVodMovie(li.dataset.streamId, li.dataset.title, li.dataset.containerExtension);
        }
      } else {
        const selectedStreamId = String(li.dataset.streamId);
        if ((currentModus === "live" || currentModus === "favorites") && !isFitScreen && currentPlayingStreamId === selectedStreamId) {
          activeerFitScreen();
          return;
        }
        const nameEl = li.querySelector(".channel-name");
        const idx = parseInt(li.dataset.index || "0", 10);
        if (li.dataset.isStremio === "true") {
          playStremioLiveChannel(li.dataset.streamId, nameEl ? nameEl.textContent : li.textContent, li.dataset.streamIcon, idx);
        } else {
          playStream(li.dataset.streamId, nameEl ? nameEl.textContent : li.textContent, li.dataset.streamIcon, idx, li.dataset.streamUrl);
        }
      }
    });
  }

  // KEYBOARD & NUMPAD HANDLER
  document.addEventListener("keydown", (e) => {
    const key = e.keyCode || e.which;
    const isBack = key === 10009 || key === 461 || key === 27 || e.key === "Back" || e.key === "Escape";

    const isUp = key === 38 || e.key === "ArrowUp";
    const isDown = key === 40 || e.key === "ArrowDown";
    const isLeft = key === 37 || e.key === "ArrowLeft";
    const isRight = key === 39 || e.key === "ArrowRight";
    const isEnter = key === 13 || e.key === "Enter";

    // KNOPPEN MET VOLLEDIGE KEYCODE & ALIAS DETECTIE
    const isRed = key === 403 || e.key === "F1" || e.key === "Red" || e.code === "F1" || e.key === "ColorF0Red";
    const isGreen = key === 404 || e.key === "F2" || e.key === "Green" || e.code === "F2" || e.key === "ColorF1Green";
    const isYellow = key === 405 || e.key === "F3" || e.key === "Yellow" || e.code === "F3" || e.key === "ColorF2Yellow";
    const isBlue = key === 406 || e.key === "F4" || e.key === "Blue" || e.code === "F4" || e.key === "ColorF3Blue";

    const isPageUp = key === 33 || e.key === "PageUp" || key === 427 || e.key === "ChannelUp";
    const isPageDown = key === 34 || e.key === "PageDown" || key === 428 || e.key === "ChannelDown";

    const isPlayPause = key === 179 || e.key === "MediaPlayPause" || e.key === " ";
    const isPause = key === 19 || key === 474 || e.key === "Pause" || e.key === "MediaPause";
    const isPlay = key === 415 || e.key === "MediaPlay";
    const isFastForward = key === 417 || e.key === "MediaFastForward" || e.key === "FastForward";
    const isRewind = key === 412 || e.key === "MediaRewind" || e.key === "Rewind";

    let focused = document.querySelector(".focused") || document.activeElement;

    // If EPG Guide is open, let Guide handle keys
    if (guideOpen) {
      // Guide handler below processes navigation
    } else if (window.AeroRadial && window.AeroRadial.isOpen()) {
      if (window.AeroRadial.handleKey(e, key)) {
        return;
      }
    }

    // Toggle Radial Overlay with 'M' key
    if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      if (window.AeroRadial) window.AeroRadial.toggle();
      return;
    }

    // Stream Selector Modal D-Pad Navigation
    if (streamSelectorActive && streamSelectorModal && !streamSelectorModal.classList.contains("hidden")) {
      if (isBack) {
        e.preventDefault();
        closeStreamSelectorModal();
        return;
      }
      const streamItems = Array.from(streamSelectorModal.querySelectorAll(".focusable, .stream-modal-item, .stream-modal-btn")).filter(el => el.offsetParent !== null);
      if (streamItems.length > 0) {
        const curIdx = streamItems.indexOf(document.querySelector("#streamSelectorModal .focused") || document.activeElement);
        if (isUp || isDown) {
          e.preventDefault();
          const step = isDown ? 1 : -1;
          const nextIdx = Math.max(0, Math.min(streamItems.length - 1, (curIdx >= 0 ? curIdx : 0) + step));
          const target = streamItems[nextIdx];
          setElementFocus(target);
          if (typeof scrollModalItemIntoView === "function") scrollModalItemIntoView(target);
          return;
        }
        if (isPageUp || isPageDown) {
          e.preventDefault();
          const step = isPageDown ? 4 : -4;
          const nextIdx = Math.max(0, Math.min(streamItems.length - 1, (curIdx >= 0 ? curIdx : 0) + step));
          const target = streamItems[nextIdx];
          setElementFocus(target);
          if (typeof scrollModalItemIntoView === "function") scrollModalItemIntoView(target);
          return;
        }
        if (isEnter || isOk) {
          e.preventDefault();
          const target = streamItems[curIdx >= 0 ? curIdx : 0];
          if (target) target.click();
          return;
        }
      }
      return;
    }

    // VOD Playback Settings Popover D-Pad Navigation
    if (vodSettingsActive && vodSettingsPopover && !vodSettingsPopover.classList.contains("hidden")) {
      if (isBack) {
        e.preventDefault();
        closeVodSettings();
        return;
      }
      const tabs = Array.from(vodSettingsPopover.querySelectorAll(".vod-settings-tab"));
      const curTab = vodSettingsPopover.querySelector(".vod-settings-tab.active");
      const activePane = vodSettingsPopover.querySelector(".vod-settings-pane:not(.hidden)");
      const paneItems = activePane ? Array.from(activePane.querySelectorAll(".focusable, .vod-track-item, .vod-option-chip")).filter(el => el.offsetParent !== null) : [];
      const curFocused = vodSettingsPopover.querySelector(".focused") || document.activeElement;

      // If focused on tabs:
      if (tabs.indexOf(curFocused) >= 0) {
        const tabIdx = tabs.indexOf(curFocused);
        if (isUp) {
          e.preventDefault();
          if (vodSettingsCloseBtn) setElementFocus(vodSettingsCloseBtn);
          return;
        }
        if (isLeft || isRight) {
          e.preventDefault();
          const nextTabIdx = (tabIdx + (isRight ? 1 : -1) + tabs.length) % tabs.length;
          const targetTab = tabs[nextTabIdx];
          switchVodSettingsTab(targetTab.dataset.vodTab);
          setElementFocus(targetTab);
          return;
        }
        if (isDown) {
          e.preventDefault();
          if (paneItems.length > 0) {
            setElementFocus(paneItems[0]);
          }
          return;
        }
        if (isEnter || isOk) {
          e.preventDefault();
          switchVodSettingsTab(curFocused.dataset.vodTab);
          return;
        }
      }

      // If focused inside pane items:
      if (paneItems.indexOf(curFocused) >= 0) {
        const itemIdx = paneItems.indexOf(curFocused);
        if (isUp) {
          e.preventDefault();
          if (itemIdx === 0) {
            setElementFocus(curTab || tabs[0]);
          } else {
            setElementFocus(paneItems[itemIdx - 1]);
          }
          return;
        }
        if (isDown) {
          e.preventDefault();
          if (itemIdx < paneItems.length - 1) {
            setElementFocus(paneItems[itemIdx + 1]);
          }
          return;
        }
        if (isLeft || isRight) {
          if (curFocused.classList.contains("vod-option-chip")) {
            e.preventDefault();
            const chipGroup = curFocused.parentElement;
            const chips = Array.from(chipGroup.querySelectorAll(".vod-option-chip"));
            const cIdx = chips.indexOf(curFocused);
            const nextC = chips[cIdx + (isRight ? 1 : -1)];
            if (nextC) setElementFocus(nextC);
            return;
          }
        }
        if (isEnter || isOk) {
          e.preventDefault();
          curFocused.click();
          return;
        }
      }

      if (curFocused === vodSettingsCloseBtn) {
        if (isDown || isLeft) {
          e.preventDefault();
          setElementFocus(curTab || tabs[0]);
          return;
        }
        if (isEnter || isOk) {
          e.preventDefault();
          closeVodSettings();
          return;
        }
      }
      return;
    }

    // Guide key: fullscreen first, then the overlay. Ignored for movies and series, and blocked in Stremio.
    const isGuideKey = key === 458 || e.key === "Guide";
    if (isGuideKey) {
      e.preventDefault();
      if (currentAppSection !== "iptv") return;
      if (currentModus === "live" || currentModus === "favorites") {
        if (!isFitScreen) activeerFitScreen();
        else if (guideOpen) closeGuide();
        else openGuide();
      }
      return;
    }

    if (guideOpen) {
      if (isUp || isDown || isPageUp || isPageDown) {
        e.preventDefault();
        const step = isUp ? -1 : isDown ? 1 : isPageUp ? -8 : 8;
        guideSelected = Math.max(0, Math.min(currentActiveStreams.length - 1, guideSelected + step));
        applyGuideSelection();
      } else if (isEnter) {
        e.preventDefault();
        playGuideSelection();
      } else if (isBack || isLeft || isGuideKey) {
        e.preventDefault();
        closeGuide();
      }
      return;
    }

    // Text fields are read-only until OK, so highlighting one doesn't open the TV keyboard.
    if (isEnter && focused && focused.tagName === "INPUT" && focused.readOnly) {
      e.preventDefault();
      focused.blur();
      focused.readOnly = false;
      focused.focus();
      return;
    }

    // Login panel: step through visible fields in order
    if (loginForm && !loginForm.classList.contains("hidden") && loginForm.contains(focused)) {
      const fields = Array.from(loginForm.querySelectorAll(".focusable")).filter((el) => el.offsetParent !== null && el !== loginRevealBtn);
      const idx = fields.indexOf(focused);
      if (isDown || isUp) {
        e.preventDefault();
        if (isUp && idx <= 0) {
          setElementFocus(loginStateButton);
          return;
        }
        const step = isDown ? 1 : -1;
        const target = fields[idx + step];
        if (target) setElementFocus(target);
      } else if ((isLeft || isRight) && focused === loginMethod) {
        e.preventDefault();
        const count = loginMethod.options.length;
        loginMethod.selectedIndex = (loginMethod.selectedIndex + (isRight ? 1 : -1) + count) % count;
        loginMethod.dispatchEvent(new Event("change"));
      } else if ((isLeft || isRight) && loginRevealBtn && (focused === passwordInput || focused === loginRevealBtn)) {
        e.preventDefault();
        setElementFocus(focused === passwordInput ? loginRevealBtn : passwordInput);
      } else if (isEnter && focused === loginRevealBtn) {
        e.preventDefault();
        toggleLoginPasswordVisibility();
      } else if (isEnter && focused === loginBtn) {
        e.preventDefault();
        loginForm.requestSubmit ? loginForm.requestSubmit() : loginBtn.click();
      } else if (isBack) {
        e.preventDefault();
        toggleLoginPanel(false);
        setElementFocus(loginStateButton);
      }
      return;
    }

    if (searchPanel && !searchPanel.classList.contains("hidden")) {
      const hits = Array.from(searchResults.querySelectorAll(".channel-card"));
      const hitIndex = hits.indexOf(focused);
      if (isBack) {
        e.preventDefault();
        closeSearch();
      } else if (isDown) {
        e.preventDefault();
        const next = hits[hitIndex + 1];
        if (next) setElementFocus(next);
      } else if (isUp) {
        e.preventDefault();
        if (hitIndex > 0) setElementFocus(hits[hitIndex - 1]);
        else if (hitIndex === 0) setElementFocus(searchInput);
      } else if (isEnter && hitIndex >= 0) {
        e.preventDefault();
        playSearchResult(parseInt(focused.dataset.index, 10));
      }
      return;
    }

    if (settingsPanel && !settingsPanel.classList.contains("hidden")) {
      const GROUP_SELECTOR = ".settings-row, .color-swatch-group, .background-presets, .background-image-controls";
      const MEMBER_SELECTOR = ".settings-item, .color-swatch, .background-preset, input.focusable, .settings-toggle input";
      const isVisible = (el) => el.offsetParent !== null;
      const unitOf = (el) => el.closest(GROUP_SELECTOR) || el;
      const repOf = (unit) => (unit.matches(GROUP_SELECTOR) ? unit.querySelector(".active, .selected") || unit.querySelector(MEMBER_SELECTOR) : unit);
      const navItems = Array.from(settingsPanel.querySelectorAll(".customization-header .settings-item, .customization-nav .settings-item")).filter(isVisible);
      const paneRoot = settingsPanel.querySelector(".customization-pane:not(.hidden)");
      const paneCandidates = paneRoot ? Array.from(paneRoot.querySelectorAll(`${MEMBER_SELECTOR}, #loginStateButton`)).filter(isVisible) : [];
      const paneUnits = [...new Set(paneCandidates.map(unitOf))];
      const paneItems = paneUnits.map(repOf).filter(Boolean);
      const inNav = !!(focused && focused.closest(".customization-nav, .customization-header"));
      const activeTab = settingsPanel.querySelector(".customization-tab.active");
      if (isBack) {
        e.preventDefault();
        toggleSettingsMenu(false);
        return;
      }
      if (isDown && focused === loginStateButton && loginForm && !loginForm.classList.contains("hidden")) {
        e.preventDefault();
        const firstField = Array.from(loginForm.querySelectorAll(".focusable")).find((el) => el.offsetParent !== null);
        if (firstField) {
          setElementFocus(firstField);
          return;
        }
      }
      if (isUp || isDown) {
        e.preventDefault();
        const step = isDown ? 1 : -1;
        if (inNav) {
          const idx = navItems.indexOf(focused);
          const next = navItems[Math.min(Math.max(idx + step, 0), navItems.length - 1)];
          if (next) setElementFocus(next);
          return;
        }
        const idx = paneItems.findIndex((item) => unitOf(item) === unitOf(focused));
        const next = paneItems[Math.min(Math.max(idx + step, 0), paneItems.length - 1)];
        if (next) {
          setElementFocus(next);
          const contentEl = settingsPanel.querySelector(".customization-content");
          if (contentEl) {
            const target = next.closest(".customization-section, .settings-row, .settings-toggle, .settings-item, .hue-panel") || next;
            const cRect = contentEl.getBoundingClientRect();
            const tRect = target.getBoundingClientRect();
            const topPad = 60;
            const botPad = 60;
            if (tRect.top < cRect.top + topPad) {
              contentEl.scrollTop = Math.max(0, contentEl.scrollTop + (tRect.top - (cRect.top + topPad)));
            } else if (tRect.bottom > cRect.bottom - botPad) {
              contentEl.scrollTop += (tRect.bottom - (cRect.bottom - botPad));
            }
          }
        }
        return;
      }
      if (isLeft || isRight) {
        const step = isRight ? 1 : -1;
        const isRangeInput = focused && focused.tagName === "INPUT" && focused.type === "range";
        if (isRangeInput) {
          return;
        }
        const isTextInput = focused && focused.tagName === "INPUT" && focused.type !== "checkbox";
        if (!isTextInput) {
          const group = focused && focused.closest(GROUP_SELECTOR);
          if (group) {
            const members = Array.from(group.querySelectorAll(MEMBER_SELECTOR)).filter(isVisible);
            const target = members[members.indexOf(focused) + step];
            if (target) {
              e.preventDefault();
              setElementFocus(target);
              return;
            }
          }
          if (inNav && isRight && paneItems.length) {
            e.preventDefault();
            setElementFocus(paneItems[0]);
            return;
          }
          if (!inNav && isLeft && activeTab) {
            e.preventDefault();
            setElementFocus(activeTab);
            return;
          }
        }
        // Left/Right inside settings MUST NEVER escape to the rest of the app or open the Aero Radial wheel
        e.preventDefault();
        return;
      }
      if (isEnter && focused) {
        e.preventDefault();
        if (focused.classList.contains("customization-tab")) {
          showCustomizationTab(focused.dataset.tab);
          if (paneItems.length > 0) {
            setElementFocus(paneItems[0]);
          }
          return;
        }
        if (focused === backgroundImageInput) updateBackgroundImage(backgroundImageInput.value);
        else focused.click();
        return;
      }
      // Swallow any other key so settings panel isolates all navigation events
      return;
    }

    const isVodMode = currentModus === "vod" || currentModus === "series";
    if (vodPlaybackControls && !vodPlaybackControls.classList.contains("hidden") && isVodMode && vodPlaybackControls.contains(focused)) {
      if (isBack || isDown) {
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

    const focusedRegionItem = focused && focused.closest ? focused.closest("#regionList li") : null;
    const regionCode = focusedRegionItem && focusedRegionItem.dataset.region !== "ALL" ? focusedRegionItem.dataset.region : null;
    const focusedCategoryItem = focused && focused.closest ? focused.closest("#categoryList li[data-cat-id]") : null;

    // Holding OK on a region or category opens rename (the first press already acted as normal OK)
    if (isEnter && e.repeat && (regionCode || focusedCategoryItem)) {
      e.preventDefault();
      if (regionCode) openRenameDialog("region", regionCode, regionCode, focusedRegionItem);
      else openRenameDialog("category", focusedCategoryItem.dataset.catId, focusedCategoryItem.dataset.label || focusedCategoryItem.textContent, focusedCategoryItem);
      return;
    }

    // GELE KNOP HANDLER (FAVORIET TOGGLE - KEY 405)
    if (isYellow) {
      e.preventDefault();
      if (regionCode) {
        toggleRegionFavorite(regionCode);
        return;
      }
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
      if (regionCode) {
        toggleRegionMove(regionCode);
        return;
      }
      let targetStreamId = null;
      if (focused && focused.dataset && focused.dataset.streamId) {
        targetStreamId = focused.dataset.streamId;
      } else if (currentActiveStreams[currentStreamIndex]) {
        targetStreamId = currentActiveStreams[currentStreamIndex].stream_id;
      }
      if (targetStreamId || moveMode) toggleMoveMode();
      return;
    }

    // BLAUWE KNOP: HIDE CATEGORY
    if (isBlue) {
      e.preventDefault();
      if (regionCode) {
        hideRegion(regionCode);
        return;
      }
      const item = focused && focused.closest ? focused.closest("#categoryList li") : null;
      if (item && item.dataset.catId) {
        const items = Array.from(categoryList.querySelectorAll(":scope > li"));
        const index = items.indexOf(item);
        hiddenCategories[categoryKind()].push(String(item.dataset.catId));
        saveHiddenCategories();
        filterCategories();
        const remaining = categoryList.querySelectorAll(":scope > li");
        if (remaining.length > 0) setElementFocus(remaining[Math.min(index, remaining.length - 1)]);
        showToast(t("categoryHidden"));
      }
      return;
    }

    // GROENE KNOP: SEARCH
    if (isGreen && !isFitScreen && (currentModus === "live" || currentModus === "favorites")) {
      e.preventDefault();
      openSearch();
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

    if (focused && focused.classList.contains("header-nav-tab")) {
      const tabs = [headerTabIptv, headerTabStremio, headerTabSettings].filter(Boolean);
      const tIdx = tabs.indexOf(focused);
      if (isLeft && tIdx > 0) {
        e.preventDefault();
        setElementFocus(tabs[tIdx - 1]);
        return;
      }
      if (isRight && tIdx < tabs.length - 1) {
        e.preventDefault();
        setElementFocus(tabs[tIdx + 1]);
        return;
      }
      if (isDown) {
        e.preventDefault();
        if (focused === headerTabIptv) {
          if (window.AeroRadial) window.AeroRadial.open();
        } else if (focused === headerTabStremio) {
          const targetCard = (stremioStripLive && stremioStripLive.offsetParent !== null ? stremioStripLive.querySelector(".stremio-card.focusable") : null) || (stremioStripPopular ? stremioStripPopular.querySelector(".stremio-card.focusable") : null);
          if (targetCard) setElementFocus(targetCard);
          else if (sideTv) setElementFocus(sideTv);
          else if (sideMovies) setElementFocus(sideMovies);
        } else if (focused === headerTabSettings) {
          const firstTab = document.querySelector(".customization-tab.active") || document.querySelector(".customization-tab.focusable");
          if (firstTab) setElementFocus(firstTab);
        }
        return;
      }
      if (isEnter) {
        e.preventDefault();
        focused.click();
        return;
      }
      if (isBack) {
        e.preventDefault();
        if (currentAppSection === "settings") {
          switchAppSection(previousAppSection || "iptv");
        } else if (currentAppSection === "stremio") {
          switchAppSection("iptv");
        } else {
          if (window.AeroRadial) window.AeroRadial.open();
        }
        return;
      }
    }

    if (currentAppSection === "stremio" && stremioPage && !stremioPage.classList.contains("hidden")) {
      const inSideDock = isElementInSidebar(focused);
      const inPillsGrid = Boolean(focused && (focused.classList.contains("category-pill-btn") || (focused.closest && focused.closest(".category-pills-grid"))));
      const inLiveCatBar = Boolean(focused && (focused.classList.contains("stremio-live-cat-pill") || (focused.closest && focused.closest(".stremio-live-cat-bar"))));
      const inTvGrid = Boolean(focused && (focused.closest ? focused.closest("#stremioGridLive") : (focused.parentElement && focused.parentElement.id === "stremioGridLive")));

      let inStrip = null;
      if (!inPillsGrid && !inTvGrid && !inLiveCatBar && !inSideDock) {
        let currStripEl = focused;
        while (currStripEl && currStripEl !== document.body) {
          if (currStripEl.classList && currStripEl.classList.contains("stremio-cards-strip")) {
            inStrip = currStripEl;
            break;
          }
          currStripEl = currStripEl.parentElement;
        }
      }

      if (isBack) {
        e.preventDefault();
        if (inStrip || inPillsGrid || inTvGrid || inLiveCatBar) {
          const targetSide = currentStremioSubpage === "tv" ? sideTv : (currentStremioSubpage === "series" ? sideSeries : sideMovies);
          if (targetSide) setElementFocus(targetSide);
        } else {
          switchAppSection("iptv");
        }
        return;
      }

      // 1. Navigation in Pill-shaped Categories Grid
      if (inPillsGrid) {
        const grid = (focused.closest && focused.closest(".category-pills-grid")) || focused.parentElement;
        const pills = Array.from(grid.querySelectorAll(".category-pill-btn.focusable"));
        const pIdx = pills.indexOf(focused);

        function getPillsCols() {
          if (!pills || pills.length < 2) return 1;
          const firstTop = pills[0].offsetTop;
          for (let i = 1; i < pills.length; i++) {
            if (pills[i].offsetTop > firstTop + 15) return i;
          }
          return pills.length;
        }
        const pCols = getPillsCols();

        if (isLeft) {
          e.preventDefault();
          if (pIdx % pCols === 0 || pIdx === 0) {
            const targetSide = currentStremioSubpage === "series" ? sideSeries : sideMovies;
            if (targetSide) setElementFocus(targetSide);
          } else if (pIdx > 0) {
            setElementFocus(pills[pIdx - 1]);
          }
          return;
        }

        if (isRight) {
          e.preventDefault();
          if ((pIdx + 1) % pCols !== 0 && pIdx < pills.length - 1) {
            setElementFocus(pills[pIdx + 1]);
          }
          return;
        }

        if (isUp) {
          e.preventDefault();
          if (pIdx >= pCols) {
            setElementFocus(pills[pIdx - pCols]);
          } else {
            const currentStrips = currentStremioSubpage === "series" 
              ? [stremioStripSeries, stremioStripAnimationSeries, stremioStripCrimeSeries, stremioStripComedySeries].filter(Boolean)
              : [stremioStripPopular, stremioStripNewlyAdded, stremioStripAction, stremioStripComedy, stremioStripSciFi].filter(Boolean);
            const lastStrip = currentStrips[currentStrips.length - 1];
            const targetCard = lastStrip ? lastStrip.querySelector(".stremio-card.focusable") : null;
            if (targetCard) setElementFocus(targetCard);
          }
          return;
        }

        if (isDown) {
          e.preventDefault();
          if (pIdx + pCols < pills.length) {
            setElementFocus(pills[pIdx + pCols]);
          } else if (pIdx < pills.length - 1) {
            setElementFocus(pills[pills.length - 1]);
          }
          return;
        }

        if (isEnter) {
          e.preventDefault();
          focused.click();
          return;
        }
      }

      // 2. Navigation in Live TV Category Bar
      if (inLiveCatBar) {
        const catBar = document.getElementById("stremioLiveCatBar");
        const pills = Array.from(catBar.querySelectorAll(".stremio-live-cat-pill.focusable"));
        const pIdx = pills.indexOf(focused);

        if (isLeft) {
          e.preventDefault();
          if (pIdx > 0) {
            setElementFocus(pills[pIdx - 1]);
          } else if (sideTv) {
            setElementFocus(sideTv);
          }
          return;
        }

        if (isRight) {
          e.preventDefault();
          if (pIdx < pills.length - 1) {
            setElementFocus(pills[pIdx + 1]);
          }
          return;
        }

        if (isUp) {
          e.preventDefault();
          if (headerTabStremio) setElementFocus(headerTabStremio);
          return;
        }

        if (isDown) {
          e.preventDefault();
          const firstCard = stremioGridLive ? stremioGridLive.querySelector(".stremio-card.focusable") : null;
          if (firstCard) setElementFocus(firstCard);
          return;
        }

        if (isEnter) {
          e.preventDefault();
          focused.click();
          return;
        }
      }

      // 3. Navigation in Live TV Channel Grid (Dedicated Separate Page)
      if (inTvGrid) {
        const grid = document.getElementById("stremioGridLive");
        const cards = Array.from(grid.querySelectorAll(".stremio-card.focusable"));
        const currentCard = (focused.closest && focused.closest(".stremio-card")) || focused;
        const cIdx = cards.indexOf(currentCard);

        function getGridCols() {
          if (!cards || cards.length < 2) return 1;
          const firstTop = cards[0].offsetTop;
          for (let i = 1; i < cards.length; i++) {
            if (cards[i].offsetTop > firstTop + 15) return i;
          }
          return cards.length;
        }
        const cols = getGridCols();

        if (isLeft) {
          e.preventDefault();
          if (cIdx % cols === 0 || cIdx === 0) {
            if (sideTv) setElementFocus(sideTv);
          } else if (cIdx > 0) {
            setElementFocus(cards[cIdx - 1]);
          }
          return;
        }

        if (isRight) {
          e.preventDefault();
          if ((cIdx + 1) % cols !== 0 && cIdx < cards.length - 1) {
            setElementFocus(cards[cIdx + 1]);
          }
          return;
        }

        if (isUp) {
          e.preventDefault();
          const currentRect = currentCard.getBoundingClientRect();
          // Find all cards strictly in a row above the current card
          const cardsAbove = cards.filter(c => c.getBoundingClientRect().bottom <= currentRect.top + 30);
          if (cardsAbove.length > 0) {
            const curCenterX = currentRect.left + currentRect.width / 2;
            let bestCard = cardsAbove[0];
            let minDiff = Infinity;
            cardsAbove.forEach(c => {
              const r = c.getBoundingClientRect();
              const diff = Math.abs((r.left + r.width / 2) - curCenterX);
              if (diff < minDiff) {
                minDiff = diff;
                bestCard = c;
              }
            });
            setElementFocus(bestCard);
          } else {
            // First row of channels! Move UP to category selection bar!
            const activeCatPill = stremioLiveCatBar ? (stremioLiveCatBar.querySelector(".stremio-live-cat-pill.active") || stremioLiveCatBar.querySelector(".stremio-live-cat-pill.focusable")) : null;
            if (activeCatPill) {
              setElementFocus(activeCatPill);
              if (stremioScrollContainer) stremioScrollContainer.scrollTop = 0;
            } else if (headerTabStremio) {
              setElementFocus(headerTabStremio);
            }
          }
          return;
        }

        if (isDown) {
          e.preventDefault();
          const currentRect = currentCard.getBoundingClientRect();
          // Find all cards strictly in a row below the current card
          const cardsBelow = cards.filter(c => c.getBoundingClientRect().top >= currentRect.bottom - 30);
          if (cardsBelow.length > 0) {
            const curCenterX = currentRect.left + currentRect.width / 2;
            let bestCard = cardsBelow[0];
            let minDiff = Infinity;
            cardsBelow.forEach(c => {
              const r = c.getBoundingClientRect();
              const diff = Math.abs((r.left + r.width / 2) - curCenterX);
              if (diff < minDiff) {
                minDiff = diff;
                bestCard = c;
              }
            });
            setElementFocus(bestCard);
          }
          return;
        }

        if (isEnter) {
          e.preventDefault();
          currentCard.click();
          return;
        }
      }

      // 4. Navigation within Horizontal Cards Strips
      if (inStrip) {
        const strip = inStrip;
        const cards = Array.from(strip.querySelectorAll(".stremio-card.focusable"));
        const idx = cards.indexOf(focused);

        const movieStrips = [stremioStripPopular, stremioStripNewlyAdded, stremioStripAction, stremioStripComedy, stremioStripSciFi].filter(Boolean);
        const seriesStrips = [stremioStripSeries, stremioStripAnimationSeries, stremioStripCrimeSeries, stremioStripComedySeries].filter(Boolean);
        const currentStrips = currentStremioSubpage === "series" ? seriesStrips : movieStrips;
        const sIdx = currentStrips.indexOf(strip);

        if (isLeft) {
          e.preventDefault();
          if (idx > 0) {
            setElementFocus(cards[idx - 1]);
          } else {
            const targetSide = currentStremioSubpage === "series" ? sideSeries : sideMovies;
            if (targetSide) setElementFocus(targetSide);
          }
          return;
        }

        if (isRight) {
          e.preventDefault();
          if (idx < cards.length - 1) {
            setElementFocus(cards[idx + 1]);
          }
          return;
        }

        if (isUp) {
          e.preventDefault();
          if (sIdx > 0) {
            const prevCards = Array.from(currentStrips[sIdx - 1].querySelectorAll(".stremio-card.focusable"));
            const target = prevCards[Math.min(idx, prevCards.length - 1)] || prevCards[0];
            if (target) setElementFocus(target);
          } else {
            if (headerTabStremio) setElementFocus(headerTabStremio);
          }
          return;
        }

        if (isDown) {
          e.preventDefault();
          if (sIdx >= 0 && sIdx < currentStrips.length - 1) {
            const nextCards = Array.from(currentStrips[sIdx + 1].querySelectorAll(".stremio-card.focusable"));
            const target = nextCards[Math.min(idx, nextCards.length - 1)] || nextCards[0];
            if (target) setElementFocus(target);
          } else {
            const targetGrid = currentStremioSubpage === "series" ? stremioSeriesPillsGrid : stremioMoviePillsGrid;
            const firstPill = targetGrid ? targetGrid.querySelector(".category-pill-btn.focusable") : null;
            if (firstPill) setElementFocus(firstPill);
          }
          return;
        }
      }

      // 4. Navigation in 3-Icon Left Sidebar Dock (Live TV, Movies, Series)
      if (inSideDock) {
        const dockBtns = [document.getElementById("sideBackToIptv"), sideTv, sideMovies, sideSeries].filter(Boolean);
        const bIdx = dockBtns.indexOf(focused);

        if (isRight) {
          e.preventDefault();
          let targetCard = null;
          if (focused === sideTv) {
            targetCard = stremioGridLive ? stremioGridLive.querySelector(".stremio-card.focusable") : null;
          } else if (focused === sideSeries) {
            targetCard = stremioStripSeries ? stremioStripSeries.querySelector(".stremio-card.focusable") : null;
          } else {
            targetCard = stremioStripPopular ? stremioStripPopular.querySelector(".stremio-card.focusable") : null;
          }
          if (!targetCard) targetCard = document.querySelector("#stremioPage .stremio-card.focusable, #stremioPage .category-pill-btn.focusable");
          if (targetCard) setElementFocus(targetCard);
          return;
        }

        if (isUp) {
          e.preventDefault();
          if (bIdx > 0) {
            setElementFocus(dockBtns[bIdx - 1]);
          } else {
            if (headerTabStremio) setElementFocus(headerTabStremio);
          }
          return;
        }

        if (isDown) {
          e.preventDefault();
          if (bIdx < dockBtns.length - 1) {
            setElementFocus(dockBtns[bIdx + 1]);
          }
          return;
        }

        if (isEnter) {
          e.preventDefault();
          focused.click();
          return;
        }
      }
    }

    if (isDown && focused === settingsButton) {
      e.preventDefault();
      if (window.AeroRadial) window.AeroRadial.open();
      return;
    }

    if (isUp && focused && focused.dataset && focused.dataset.modus && !moveMode) {
      let prev = focused.previousElementSibling;
      while (prev && (!prev.classList.contains("focusable") || prev.classList.contains("hidden"))) {
        prev = prev.previousElementSibling;
      }
      if (!prev) {
        e.preventDefault();
        if (headerTabIptv) setElementFocus(headerTabIptv);
        return;
      }
    }

    // FULLSCREEN SPELER HANDLING
    const isRadialOpen = window.AeroRadial && window.AeroRadial.isOpen();
    if (isFitScreen || !isRadialOpen) {
      if (currentAppSection === "stremio") {
        if (isUp || isPageUp) {
          e.preventDefault();
          if (stremioAllLiveChannels && stremioAllLiveChannels.length > 0) {
            currentStreamIndex = (currentStreamIndex + 1) % stremioAllLiveChannels.length;
            const target = stremioAllLiveChannels[currentStreamIndex];
            playStremioLiveChannel(target.id || target.stream_id, target.name, target.stream_icon, currentStreamIndex, target.directUrl || target.url);
          }
          return;
        } else if (isDown || isPageDown) {
          e.preventDefault();
          if (stremioAllLiveChannels && stremioAllLiveChannels.length > 0) {
            currentStreamIndex = (currentStreamIndex - 1 + stremioAllLiveChannels.length) % stremioAllLiveChannels.length;
            const target = stremioAllLiveChannels[currentStreamIndex];
            playStremioLiveChannel(target.id || target.stream_id, target.name, target.stream_icon, currentStreamIndex, target.directUrl || target.url);
          }
          return;
        } else if (isLeft || isEnter || isBack || key === 461 || key === 10009 || key === 27) {
          e.preventDefault();
          deactiveerFitScreen();
          return;
        }
        return;
      }

      if (currentModus === "vod" || currentModus === "series") {
        if (isUp) {
          e.preventDefault();
          openVodSettings("audio");
          return;
        } else if (isRight) {
          e.preventDefault();
          queueVodSeek(1);
          return;
        } else if (isLeft) {
          e.preventDefault();
          queueVodSeek(-1);
          return;
        } else if (isEnter) {
          e.preventDefault();
          togglePlayPauseVod();
          return;
        } else if (isDown) {
          e.preventDefault();
          if (window.AeroRadial && !window.AeroRadial.isOpen()) {
            window.AeroRadial.open();
          } else {
            showVodOSD();
          }
          return;
        } else if (isBack) {
          e.preventDefault();
          destroyStreamPlayers();
          try {
            video.pause();
            video.removeAttribute("src");
            video.load();
          } catch (e) {}
          playerWrapper.classList.add("hidden");
          playerWrapper.classList.remove("vod-playback");
          deactiveerFitScreen();
          if (window.AeroRadial) {
            window.AeroRadial.open();
          }
          return;
        }
      } else {
        if (isPageUp || isUp) {
          e.preventDefault();
          if (currentActiveStreams && currentActiveStreams.length > 0) {
            currentStreamIndex = (currentStreamIndex + 1) % currentActiveStreams.length;
            const target = currentActiveStreams[currentStreamIndex];
            playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex, target.url);
          }
        } else if (isPageDown || isDown) {
          e.preventDefault();
          if (currentActiveStreams && currentActiveStreams.length > 0) {
            currentStreamIndex = (currentStreamIndex - 1 + currentActiveStreams.length) % currentActiveStreams.length;
            const target = currentActiveStreams[currentStreamIndex];
            playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex, target.url);
          }
        } else if (isRight || isGuideKey) {
          e.preventDefault();
          openGuide();
        } else if (isYellow) {
          e.preventDefault();
          if (currentActiveStreams && currentActiveStreams[currentStreamIndex]) {
            toggleFavorite(currentActiveStreams[currentStreamIndex].stream_id);
          }
        } else if (isLeft || isEnter) {
          e.preventDefault();
          if (window.AeroRadial) {
            window.AeroRadial.open();
          } else {
            showLiveOSD();
          }
        } else if (isBack) {
          e.preventDefault();
          if (window.AeroRadial && !window.AeroRadial.isOpen()) {
            window.AeroRadial.open();
          } else {
            deactiveerFitScreen();
          }
        }
      }
      return;
    }
    
    if (movingRegion && (isUp || isDown || isEnter)) {
      e.preventDefault();
      if (isEnter) {
        const done = movingRegion;
        movingRegion = null;
        setupRegions(true);
        focusRegion(done);
      } else {
        stepRegion(isUp ? -1 : 1);
      }
      return;
    }

    // BACK: step out one level at a time, and leave the app from the first column
    if (isBack) {
      e.preventDefault();
      if (currentAppSection === "settings" || (settingsPanel && !settingsPanel.classList.contains("hidden"))) {
        switchAppSection(previousAppSection || "iptv");
        return;
      }
      if (movingRegion) {
        const done = movingRegion;
        movingRegion = null;
        setupRegions(true);
        focusRegion(done);
        return;
      }
      if (moveMode) {
        cancelMoveMode();
        return;
      }
      if (selectedSeries) {
        selectedSeries = null;
        filterChannels();
        setElementFocus(channelList.querySelector(".poster-card"));
        return;
      }
      const column = focused && focused.closest ? focused.closest(".col-nav") : null;
      if (!column) {
        if (window.AeroRadial && !window.AeroRadial.isOpen()) {
          window.AeroRadial.open();
        } else if (window.webOS && typeof webOS.platformBack === "function") {
          webOS.platformBack();
        } else if (window.webOSSystem && typeof webOSSystem.platformBack === "function") {
          webOSSystem.platformBack();
        } else if (window.tizen && window.tizen.application && typeof window.tizen.application.getCurrentApplication === "function") {
          window.tizen.application.getCurrentApplication().exit();
        } else {
          window.close();
        }
      } else if (column.id !== "colModus") {
        navigateColumn(focused, "left");
      } else if (window.webOS && typeof webOS.platformBack === "function") {
        webOS.platformBack();
      } else if (window.webOSSystem && typeof webOSSystem.platformBack === "function") {
        webOSSystem.platformBack();
      } else if (window.tizen && window.tizen.application && typeof window.tizen.application.getCurrentApplication === "function") {
        window.tizen.application.getCurrentApplication().exit();
      } else {
        window.close();
      }
      return;
    }

    // VERPLAATS MODUS IN FAVORİETEN: OK picks up, Up/Down move the held stack.
    if (moveMode && currentModus === "favorites") {
      if (isEnter) {
        e.preventDefault();
        pickUpMove(focused);
        return;
      }
      if (moveStack.length && (isUp || isDown)) {
        e.preventDefault();
        stepMoveSlot(isUp ? -1 : 1);
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
        }
        return;
      }

    // MENU NAVIGATIE
    if (!focused || !focused.classList.contains("focusable")) {
      const fallback = pickFallbackFocus();
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

    // A wrap glides for 150 ms before focus moves. A key pressed during that glide lands the wrap first,
    // so holding Up or Down keeps looping instead of stopping at the copy.
    const wrapHost = focused && focused.parentElement;
    if (wrapHost && wrapHost._wrapPending) {
      const landed = wrapHost._wrapPending;
      wrapHost._wrapPending = null;
      clearTimeout(wrapHost._wrapTimer);
      setElementFocus(landed, true);
      focused = landed;
    }

    if (isUp) {
      e.preventDefault();
      let prev = focused.previousElementSibling;
      while (prev && (!prev.classList.contains("focusable") || prev.classList.contains("hidden"))) {
        prev = prev.previousElementSibling;
      }
      if (prev) {
        setElementFocus(prev);
      } else if (focused.closest("#modusList") && headerTabIptv) {
        setElementFocus(headerTabIptv);
      } else if (focused.closest("#regionList, #categoryList, #channelList.channel-grid")) {
        const container = focused.parentElement;
        const items = wheelItems(container);
        if (items.length) {
          const last = items[items.length - 1];
          if (!wrapWheel(container, last, false)) setElementFocus(last);
        }
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
      } else if (focused.closest("#regionList, #categoryList, #channelList.channel-grid")) {
        const container = focused.parentElement;
        const items = wheelItems(container);
        if (items.length) {
          const first = items[0];
          if (!wrapWheel(container, first, true)) setElementFocus(first);
        }
      } else if (focused.closest("#modusList")) {
        const items = wheelItems(focused.parentElement);
        if (items.length) setElementFocus(items[0]);
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

  // ==================== AERO RADIAL WHEEL BRIDGES ====================
  window.kcGetModes = function() {
    return [
      { id: "favorites", title: "Favoriler", icon: "⭐" },
      { id: "live", title: "Canlı TV", icon: "📺" },
      { id: "vod", title: "Filmler", icon: "🎬" },
      { id: "series", title: "Diziler", icon: "🍿" }
    ];
  };

  window.kcGetRegions = function() {
    var isVod = (currentModus === "vod" || currentModus === "series");
    var cats = currentModus === "series" ? (seriesCategories.length ? seriesCategories : vodCategories) : (isVod ? vodCategories : allCategories);
    var regMap = {};
    var regList = ["ALL"];
    if (cats && cats.length) {
      for (var i = 0; i < cats.length; i++) {
        var r = extractRegionFromCategory(cats[i].category_name, isVod);
        if (r && !regMap[r]) {
          regMap[r] = true;
          regList.push(r);
        }
      }
    }
    return regList;
  };

  window.kcGetCategories = function(reg) {
    var isVod = (currentModus === "vod" || currentModus === "series");
    var cats = currentModus === "series" ? (seriesCategories.length ? seriesCategories : vodCategories) : (isVod ? vodCategories : allCategories);
    if (!cats || !cats.length) return [{ category_id: "all", category_name: "Tüm Kanallar" }];
    var hidden = hiddenCategories[categoryKind()] || [];
    var result = [];
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      if (hidden.indexOf(String(c.category_id)) !== -1) continue;
      if (reg && reg !== "ALL" && extractRegionFromCategory(c.category_name, isVod) !== reg) continue;
      result.push(c);
    }
    return result.length ? result : [{ category_id: "all", category_name: "Tüm Kanallar" }];
  };

  window.kcGetModus = function() {
    return currentModus;
  };

  window.kcGetChannels = function() {
    if (currentModus === "favorites") {
      var favStreams = [];
      if (favorites && favorites.length) {
        for (var f = 0; f < favorites.length; f++) {
          var item = streamByIdMap[String(favorites[f])];
          if (item) favStreams.push(item);
        }
      }
      return favStreams;
    }
    if (currentModus === "vod") {
      var vStreams = (typeof vodStreams !== "undefined" && vodStreams) ? vodStreams : [];
      var filteredV = vStreams.filter(function(s) { return String(s.category_id) === String(currentCategoryId); });
      if (!filteredV.length) filteredV = vStreams.slice(0, 60);
      return filteredV;
    }
    if (currentModus === "series") {
      var sStreams = (typeof seriesStreams !== "undefined" && seriesStreams) ? seriesStreams : [];
      var filteredS = sStreams.filter(function(s) { return String(s.category_id) === String(currentCategoryId); });
      if (!filteredS.length) filteredS = sStreams.slice(0, 60);
      return filteredS;
    }
    if (currentActiveStreams && currentActiveStreams.length) {
      return currentActiveStreams;
    }
    return allStreams || [];
  };

  window.kcGetCurrentPlayingStreamId = function() {
    return currentPlayingStreamId;
  };

  window.kcPlayStream = function(id, name, icon, idx, url, ext) {
    if (currentModus === "vod") {
      playVodMovie(id, name, ext || "mp4");
    } else if (currentModus === "series") {
      playSeriesEpisode(id, name, ext || "mp4");
    } else {
      playStream(id, name, icon, idx, url);
    }
  };

  window.kcOpenSettings = function() {
    switchAppSection("settings");
  };

  window.kcActivateFitScreen = function() {
    activeerFitScreen();
  };

  window.kcDeactivateFitScreen = function() {
    deactiveerFitScreen();
  };

  window.kcSwitchModus = function(m) {
    switchModus(m);
    setupRegions();
    if (m === "live") {
      var savedReg = store.getItem("iptv_last_live_region");
      if (savedReg) currentLiveRegion = savedReg;
      var cats = window.kcGetCategories(currentLiveRegion);
      var savedCat = store.getItem("iptv_last_live_cat");
      if (savedCat) {
        var foundSaved = cats.find(function(c) { return String(c.category_id) === String(savedCat); });
        if (foundSaved) currentCategoryId = savedCat;
      }
      if (cats && cats.length) {
        var foundCurrent = cats.find(function(c) { return String(c.category_id) === String(currentCategoryId); });
        if (!foundCurrent) currentCategoryId = cats[0].category_id;
      }
    } else if (m === "vod" || m === "series") {
      var savedVodReg = store.getItem("iptv_last_vod_region");
      if (savedVodReg) currentVodRegion = savedVodReg;
      if (currentModus !== "favorites") filterCategories();
      var activeReg = currentVodRegion || "ALL";
      var cats = window.kcGetCategories(activeReg);
      var savedVodCat = store.getItem("iptv_last_vod_cat");
      if (savedVodCat) {
        var foundSavedVod = cats.find(function(c) { return String(c.category_id) === String(savedVodCat); });
        if (foundSavedVod) currentCategoryId = savedVodCat;
      }
      if (cats && cats.length) {
        var foundCurrentVod = cats.find(function(c) { return String(c.category_id) === String(currentCategoryId); });
        if (!foundCurrentVod) currentCategoryId = cats[0].category_id;
      }
    } else {
      if (currentModus !== "favorites") filterCategories();
      var cats = window.kcGetCategories("ALL");
      if (cats && cats.length) {
        currentCategoryId = cats[0].category_id;
      }
    }
    filterChannels();
    if (window.AeroRadial) window.AeroRadial.refresh();
  };

  window.kcSetRegion = function(r) {
    var isVod = (currentModus === "vod" || currentModus === "series");
    if (isVod) {
      currentVodRegion = r;
      try { store.setItem("iptv_last_vod_region", r); } catch (e) {}
    } else {
      currentLiveRegion = r;
      try { store.setItem("iptv_last_live_region", r); } catch (e) {}
    }
    if (currentModus !== "favorites") filterCategories();
    var cats = window.kcGetCategories(r);
    var savedCat = isVod ? store.getItem("iptv_last_vod_cat") : store.getItem("iptv_last_live_cat");
    var foundSaved = savedCat ? cats.find(function(c) { return String(c.category_id) === String(savedCat); }) : null;
    if (foundSaved) {
      currentCategoryId = savedCat;
    } else if (cats && cats.length) {
      currentCategoryId = cats[0].category_id;
    }
    filterChannels();
    if (window.AeroRadial) window.AeroRadial.refresh();
  };

  window.kcSetCategory = function(catId) {
    currentCategoryId = catId;
    var isVod = (currentModus === "vod" || currentModus === "series");
    try {
      if (isVod) store.setItem("iptv_last_vod_cat", String(catId));
      else store.setItem("iptv_last_live_cat", String(catId));
    } catch (e) {}
    filterChannels();
    if (window.AeroRadial) window.AeroRadial.refresh();
  };

  window.kcToggleFavorite = function(id) {
    toggleFavorite(id);
    if (window.AeroRadial) window.AeroRadial.refresh();
  };

  window.kcMoveFavorite = function(dir) {
    if (!favorites || favorites.length < 2) return 0;
    var total = favorites.length;
    var fromIdx = ((currentStreamIndex % total) + total) % total;
    var toIdx = ((fromIdx + dir) % total + total) % total;
    var item = favorites.splice(fromIdx, 1)[0];
    favorites.splice(toIdx, 0, item);
    saveFavorites(favorites);
    currentStreamIndex = toIdx;
    filterChannels();
    return toIdx;
  };

  window.kcCommitMoveStack = function(stackIds, targetIdx) {
    if (!favorites || !favorites.length || !stackIds || !stackIds.length) return;
    var remaining = favorites.filter(function(id) {
      return stackIds.indexOf(String(id)) === -1;
    });
    var insertAt = Math.max(0, Math.min(remaining.length, targetIdx));
    remaining.splice.apply(remaining, [insertAt, 0].concat(stackIds));
    favorites.splice(0, favorites.length);
    for (var i = 0; i < remaining.length; i++) {
      favorites.push(remaining[i]);
    }
    saveFavorites(favorites);
    filterChannels();
    if (window.AeroRadial) window.AeroRadial.refresh();
  };

  window.kcOpenStremio = function() {
    switchAppSection("stremio");
  };

  window.kcOpenGuide = function() {
    openGuide();
  };

  window.kcFetchSeriesInfo = async function(seriesId) {
    if (!xtreamAuth) return null;
    try {
      const url = `${xtreamAuth.server}/player_api.php?username=${xtreamAuth.username}&password=${xtreamAuth.password}&action=get_series_info&series_id=${encodeURIComponent(seriesId)}`;
      const response = await requestText(url);
      if (response.status !== 200 || !response.body.trim()) return null;
      const info = JSON.parse(response.body);
      const episodes = info.episodes || {};
      const seasonKeys = Array.isArray(episodes) ? ["1"] : Object.keys(episodes).sort((a, b) => Number(a) - Number(b));
      return {
        info: info.info || {},
        seasons: seasonKeys.map(seasonKey => {
          const seasonEpisodes = Array.isArray(episodes) ? episodes : episodes[seasonKey];
          return {
            number: seasonKey,
            name: `Sezon ${seasonKey}`,
            episodes: (Array.isArray(seasonEpisodes) ? seasonEpisodes : []).map(ep => ({
              id: ep.id || ep.stream_id,
              title: ep.title || ep.name || `Bölüm ${ep.episode_num || ""}`,
              episode_num: ep.episode_num || 1,
              container_extension: ep.container_extension || "mp4",
              info: ep.info || {}
            }))
          };
        }).filter(s => s.episodes.length > 0)
      };
    } catch (e) {
      console.error("kcFetchSeriesInfo error:", e);
      return null;
    }
  };

  window.kcPlaySeriesEpisode = function(episodeId, title, ext) {
    if (window.AeroRadial) window.AeroRadial.close();
    playSeriesEpisode(episodeId, title, ext);
  };

  window.kcShowToast = function(msg) {
    showToast(msg);
  };

  // FIRST LAUNCH WELCOME SCREEN FOR TIZEN
  const welcomeScreen = document.getElementById("welcomeScreen");
  const welcomePrompt = document.getElementById("wcPrompt");
  const welcomeFlickerLayer = document.getElementById("wcFlicker");
  const welcomeTop = document.getElementById("wcTop");
  const welcomeBottom = document.getElementById("wcBottom");
  const welcomeLine = document.getElementById("wcLine");
  const welcomeBlack = document.getElementById("wcBlack");
  const appPageEl = document.getElementById("appPage");
  const welcomeSeenKey = "iptv_welcome_seen";
  const welcomeTexts = {
    tr: { prompt: "Başlamak için OK'e bas", loading: "Yükleniyor..." },
    en: { prompt: "Press OK to get started", loading: "Loading..." }
  };
  let welcomeActive = false;
  let welcomeLeaving = false;
  let welcomeTimers = [];

  function welcomeLater(fn, ms) {
    welcomeTimers.push(setTimeout(fn, ms));
  }
  function welcomeRandom(min, max) {
    return min + Math.random() * (max - min);
  }

  function welcomeFlickerOnce() {
    if (!welcomeActive) return;
    const dim = Math.random() < 0.55;
    welcomeScreen.style.setProperty("--wc-flick", dim ? welcomeRandom(0.45, 0.9).toFixed(2) : "1");
    welcomeFlickerLayer.style.opacity = dim ? welcomeRandom(0, 0.12).toFixed(3) : "0";
    welcomeLater(() => {
      welcomeScreen.style.setProperty("--wc-flick", "1");
      welcomeFlickerLayer.style.opacity = "0";
      welcomeLater(welcomeFlickerLoop, welcomeRandom(40, 500));
    }, welcomeRandom(40, 180));
  }
  function welcomeFlickerLoop() {
    welcomeLater(welcomeFlickerOnce, welcomeRandom(400, 3500));
  }

  function welcomeFinish() {
    welcomeTimers.forEach(clearTimeout);
    welcomeTimers = [];
    welcomeActive = false;
    welcomeScreen.classList.add("wc-hidden");
    applyAnimationsSetting();
  }

  function welcomeRevealSettings() {
    welcomeBlack.classList.add("wc-show");
    if (appPageEl) appPageEl.style.visibility = "";
    toggleSettingsMenu(true);
    showCustomizationTab("source");
    const sourceTab = settingsPanel ? settingsPanel.querySelector(".customization-tab[data-tab='source']") : null;
    if (sourceTab) setElementFocus(sourceTab);
    welcomeScreen.classList.add("wc-slim");
    welcomeScreen.classList.add("wc-fade");
    welcomeLater(welcomeFinish, 750);
  }

  let welcomeAudio = null;
  function welcomeGetAudio() {
    if (welcomeAudio) return welcomeAudio;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      welcomeAudio = new Ctx();
    } catch (error) {
      welcomeAudio = null;
    }
    return welcomeAudio;
  }
  function welcomeTone(ctx, type, freq, start, dur, gain, freqEnd) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, start + dur);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }
  function welcomePlayIntro() {
    const ctx = welcomeGetAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const t = ctx.currentTime + 0.05;
    welcomePianoNote(ctx, 130.81, t, 5.0, 0.6);
    welcomePianoNote(ctx, 98.0, t + 0.9, 6.0, 0.6);
  }
  function welcomePianoNote(ctx, freq, start, dur, gain) {
    const partials = [
      { mult: 1, level: 1.0, decay: 1.0 },
      { mult: 2, level: 0.45, decay: 0.6 },
      { mult: 3, level: 0.2, decay: 0.35 },
      { mult: 4, level: 0.09, decay: 0.2 },
      { mult: 5, level: 0.04, decay: 0.12 }
    ];
    const total = partials.reduce((sum, p) => sum + p.level, 0);
    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      const peak = (gain * p.level) / total;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * p.mult, start);
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(peak, start + 0.008);
      env.gain.exponentialRampToValueAtTime(0.0001, start + dur * p.decay);
      osc.connect(env);
      env.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }
  function welcomePlayTvClose() {
    const ctx = welcomeGetAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const t = ctx.currentTime + 0.01;
    welcomeTone(ctx, "sawtooth", 900, t, 0.28, 0.5, 40);
    const len = Math.floor(ctx.sampleRate * 0.02);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    const clickGain = ctx.createGain();
    clickGain.gain.value = 0.9;
    src.buffer = buf;
    src.connect(clickGain);
    clickGain.connect(ctx.destination);
    src.start(t);
  }

  function welcomeStart() {
    if (welcomeLeaving) return;
    welcomeLeaving = true;
    store.setItem(welcomeSeenKey, "1");
    const texts = welcomeTexts[currentLang] || welcomeTexts.en;
    welcomePrompt.textContent = texts.loading;
    welcomeTop.classList.add("wc-close");
    welcomeBottom.classList.add("wc-close");
    welcomeLater(() => welcomeLine.classList.add("wc-show"), 420);
    welcomeLater(() => {
      welcomeLine.classList.add("wc-collapse");
      welcomePlayTvClose();
    }, 620);
    welcomeLater(welcomeRevealSettings, 900);
  }

  window.addEventListener("keydown", (e) => {
    if (!welcomeActive) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const key = e.keyCode || e.which;
    if (key === 13 || e.key === "Enter") welcomeStart();
  }, true);

  function maybeShowWelcome() {
    document.documentElement.classList.remove("wc-pending");
    if (!welcomeScreen || window.KC_DEFAULT_LOGIN || store.getItem(welcomeSeenKey)) return;
    const texts = welcomeTexts[currentLang] || welcomeTexts.en;
    welcomePrompt.textContent = texts.prompt;
    welcomeActive = true;
    if (appPageEl) appPageEl.style.visibility = "hidden";
    document.body.classList.remove("no-animations");
    welcomeScreen.classList.remove("wc-hidden");
    welcomeFlickerLoop();
    requestAnimationFrame(() => requestAnimationFrame(welcomePlayIntro));
  }

  if (window.AeroRadial) {
    window.AeroRadial.init();
  }

  initProfile();
  scheduleListRefresh();
  maybeShowWelcome();
});


