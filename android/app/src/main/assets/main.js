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
  const vodProgressBuffered = document.getElementById("vodProgressBuffered");
  const vodProgressThumb = document.getElementById("vodProgressThumb");
  const vodTimelineWrapper = document.getElementById("vodTimelineWrapper");
  const vodTimelineTooltip = document.getElementById("vodTimelineTooltip");
  const vodProgressBarContainer = document.getElementById("vodProgressBarContainer");
  const vodCurrentTime = document.getElementById("vodCurrentTime");
  const vodDuration = document.getElementById("vodDuration");
  const vodDoubleTapLeft = document.getElementById("vodDoubleTapLeft");
  const vodDoubleTapRight = document.getElementById("vodDoubleTapRight");
  const vodDoubleTapLeftText = document.getElementById("vodDoubleTapLeftText");
  const vodDoubleTapRightText = document.getElementById("vodDoubleTapRightText");
  const pipDismissHint = document.getElementById("pipDismissHint");
  const liveSwipePreview = document.getElementById("liveSwipePreview");
  const liveSwipeLogoImg = document.getElementById("liveSwipeLogoImg");
  const liveSwipeLogoFallback = document.getElementById("liveSwipeLogoFallback");
  const liveSwipeChName = document.getElementById("liveSwipeChName");

  const numZapOverlay = document.getElementById("numZapOverlay");
  const numZapText = document.getElementById("numZapText");
  const settingsButton = document.getElementById("settingsButton");
  const settingsPage = document.getElementById("settingsPage");
  const settingsDone = document.getElementById("settingsDone");
  const customizationPage = document.getElementById("customizationPage");
  const autoplayNextToggle = document.getElementById("autoplayNextToggle");
  const backgroundImageInput = document.getElementById("backgroundImageInput");
  const vodPlaybackControls = document.getElementById("vodPlaybackControls");
  const vodPlayPauseIcon = document.getElementById("vodPlayPauseIcon");
  const vodCenterPlayPauseBtn = document.getElementById("vodCenterPlayPauseBtn");
  const vodCenterPlayPauseSvg = document.getElementById("vodCenterPlayPauseSvg");
  const vodSeekPreview = document.getElementById("vodSeekPreview");

  // Dynamic UI feedback elementen
  let toastMsg = document.getElementById("toastMsg") || createUIElement("toastMsg", "toast-msg");
  let moveBanner = document.getElementById("moveBanner") || createUIElement("moveBanner", "move-banner hidden", "VERPLAATS-MODUS ACTIEF: Gebruik ⬆/⬇ om te verplaatsen, druk ROOD om te bewaren");
  let currentLoginState = "failed";
  const appTranslations = {
    en: {
      settings: "Settings", language: "Language", autoplayNext: "Play next episode automatically", customization: "Customization", switchProfile: "Change source", resetApp: "Reset app", close: "Close menu", back: "Back", accentColor: "Accent color", highlightColor: "Highlight color", backgroundColor: "Background color", bgDefault: "Default", bgAmoled: "AMOLED Black", done: "Done", previous: "Previous", next: "Next", playPause: "Pause / play", serverUrl: "Server URL", username: "Username", password: "Password", login: "Sign in", connecting: "Connecting to IPTV server...", loginFailed: "Login failed.", modes: "MODES", modeFavorites: "Favorites", modeLive: "Live TV", modeMovies: "Movies", modeSeries: "Series", region: "REGION", categories: "CATEGORIES", allRegions: "All regions", channels: "CHANNELS", movies: "MOVIES", series: "SERIES", liveNow: "Live TV", noNextProgram: "No upcoming program", vodHint: "Up: controls | Play/Pause: toggle | Left/Right: seek", backToSeries: "← Back to series", noEpisodes: "No episodes found", loadingEpisodes: "Loading episodes...", unableLoad: "Unable to load episodes", favoritesRemoved: "Removed from favorites", favoritesAdded: "Added to favorites", moveOnlyFavorites: "Move mode is only available in Favorites", moveStarted: "Move mode started", positionSaved: "Position saved", channelNotFound: "Channel #{number} not found", autoplay: "Autoplay next episode", colors: "Colors", previousEpisode: "Previous episode", nextEpisode: "Next episode", profileChanged: "Profile changed", appReset: "App reset", zapped: "Playing channel #{number}: {title}", colorRed: "Red", colorBlue: "Blue", colorGreen: "Green", colorRose: "Rose", colorOrange: "Orange", colorGold: "Gold", colorTurquoise: "Turquoise", colorLime: "Lime", colorSky: "Sky blue"
    },
    tr: {
      settings: "Ayarlar", language: "Dil", autoplayNext: "Sonraki bölümü otomatik oynat", customization: "Özelleştirme", switchProfile: "Kaynağı değiştir", resetApp: "Uygulamayı sıfırla", close: "Menüyü kapat", back: "Geri", accentColor: "Vurgu rengi", highlightColor: "Öne çıkan renk", backgroundColor: "Arka plan rengi", bgDefault: "Varsayılan", bgAmoled: "AMOLED Siyah", done: "Tamam", previous: "Önceki", next: "Sonraki", playPause: "Duraklat / oynat", serverUrl: "Sunucu URL'si", username: "Kullanıcı adı", password: "Şifre", login: "Giriş yap", connecting: "IPTV sunucusuna bağlanılıyor...", loginFailed: "Giriş başarısız.", modes: "MODLAR", modeFavorites: "Favoriler", modeLive: "Canlı TV", modeMovies: "Filmler", modeSeries: "Diziler", region: "BÖLGE", categories: "KATEGORİLER", allRegions: "Tüm bölgeler", channels: "KANALLAR", movies: "FİLMLER", series: "DİZİLER", liveNow: "Canlı yayın", noNextProgram: "Sonraki program yok", vodHint: "Yukarı: kontroller | Oynat/Duraklat: değiştir | Sol/Sağ: sar", backToSeries: "← Dizi listesine dön", noEpisodes: "Bölüm bulunamadı", loadingEpisodes: "Bölümler yükleniyor...", unableLoad: "Bölümler yüklenemedi", favoritesRemoved: "Favorilerden çıkarıldı", favoritesAdded: "Favorilere eklendi", moveOnlyFavorites: "Taşıma modu yalnızca Favorilerde kullanılabilir", moveStarted: "Taşıma başladı", positionSaved: "Sıralama kaydedildi", channelNotFound: "#{number} numaralı kanal bulunamadı", autoplay: "Sonraki bölümü otomatik oynat", colors: "Renkler", previousEpisode: "Önceki bölüm", nextEpisode: "Sonraki bölüm", profileChanged: "Profil değiştirildi", appReset: "Uygulama sıfırlandı", zapped: "Kanal #{number} açılıyor: {title}", colorRed: "Kırmızı", colorBlue: "Mavi", colorGreen: "Yeşil", colorRose: "Pembe", colorOrange: "Turuncu", colorGold: "Altın", colorTurquoise: "Turkuaz", colorLime: "Fıstık yeşili", colorSky: "Gök mavisi"
    },
    nl: {
      settings: "Instellingen", language: "Taal", autoplayNext: "Volgende aflevering automatisch afspelen", customization: "Aanpassen", switchProfile: "Bron wijzigen", resetApp: "App resetten", close: "Menu sluiten", back: "Terug", accentColor: "Accentkleur", highlightColor: "Markeringskleur", backgroundColor: "Achtergrondkleur", bgDefault: "Standaard", bgAmoled: "AMOLED Zwart", done: "Gereed", previous: "Vorige", next: "Volgende", playPause: "Pauzeren / afspelen", serverUrl: "Server-URL", username: "Gebruikersnaam", password: "Wachtwoord", login: "Inloggen", connecting: "Verbinden met IPTV-server...", loginFailed: "Inloggen mislukt.", modes: "MODI", modeFavorites: "Favorieten", modeLive: "Live-tv", modeMovies: "Films", modeSeries: "Series", region: "REGIO", categories: "CATEGORIEËN", allRegions: "Alle regio's", channels: "KANALEN", movies: "FILMS", series: "SERIES", liveNow: "Live-uitzending", noNextProgram: "Geen volgend programma", vodHint: "Omhoog: bediening | Afspelen/Pauze: wisselen | Links/Rechts: zoeken", backToSeries: "← Terug naar series", noEpisodes: "Geen afleveringen gevonden", loadingEpisodes: "Afleveringen laden...", unableLoad: "Afleveringen laden mislukt", favoritesRemoved: "Verwijderd uit favorieten", favoritesAdded: "Toegevoegd aan favorieten", moveOnlyFavorites: "Verplaatsen kan alleen in Favorieten", moveStarted: "Verplaatsen gestart", positionSaved: "Positie opgeslagen", channelNotFound: "Kanaal #{number} niet gevonden", autoplay: "Volgende aflevering automatisch afspelen", colors: "Kleuren", previousEpisode: "Vorige aflevering", nextEpisode: "Volgende aflevering", profileChanged: "Profiel gewijzigd", appReset: "App gereset", zapped: "Kanaal #{number} wordt afgespeeld: {title}", colorRed: "Rood", colorBlue: "Blauw", colorGreen: "Groen", colorRose: "Roze", colorOrange: "Oranje", colorGold: "Goud", colorTurquoise: "Turquoise", colorLime: "Limoen", colorSky: "Hemelsblauw"
    },
    fr: {
      settings: "Paramètres", language: "Langue", autoplayNext: "Lire automatiquement l’épisode suivant", customization: "Personnalisation", switchProfile: "Changer de source", resetApp: "Réinitialiser l’application", close: "Fermer le menu", back: "Retour", accentColor: "Couleur d’accentuation", highlightColor: "Couleur de surbrillance", backgroundColor: "Couleur d'arrière-plan", bgDefault: "Par défaut", bgAmoled: "Noir AMOLED", done: "Terminé", previous: "Précédent", next: "Suivant", playPause: "Pause / lecture", serverUrl: "URL du serveur", username: "Nom d’utilisateur", password: "Mot de passe", login: "Connexion", connecting: "Connexion au serveur IPTV...", loginFailed: "Échec de la connexion.", modes: "MODES", modeFavorites: "Favoris", modeLive: "TV en direct", modeMovies: "Films", modeSeries: "Séries", region: "RÉGION", categories: "CATÉGORIES", allRegions: "Toutes les régions", channels: "CHAÎNES", movies: "FILMS", series: "SÉRIES", liveNow: "En direct", noNextProgram: "Aucun programme suivant", vodHint: "Haut : commandes | Lecture/Pause : basculer | Gauche/Droite : avancer", backToSeries: "← Retour aux séries", noEpisodes: "Aucun épisode trouvé", loadingEpisodes: "Chargement des épisodes...", unableLoad: "Impossible de charger les épisodes", favoritesRemoved: "Retiré des favoris", favoritesAdded: "Ajouté aux favoris", moveOnlyFavorites: "Le déplacement est réservé aux Favoris", moveStarted: "Déplacement commencé", positionSaved: "Position enregistrée", channelNotFound: "Chaîne #{number} introuvable", autoplay: "Lire automatiquement l’épisode suivant", colors: "Couleurs", previousEpisode: "Épisode précédent", nextEpisode: "Épisode suivant", profileChanged: "Profil modifié", appReset: "Application réinitialisée", zapped: "Lecture de la chaîne #{number} : {title}", colorRed: "Rouge", colorBlue: "Bleu", colorGreen: "Vert", colorRose: "Rose", colorOrange: "Orange", colorGold: "Or", colorTurquoise: "Turquoise", colorLime: "Citron vert", colorSky: "Bleu ciel"
    }
  };

  function getSystemLanguage() {
    try {
      let sysLang = "";
      if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.getSystemLanguage === "function") {
        sysLang = window.AndroidExternalPlayer.getSystemLanguage();
      } else if (navigator.language) {
        sysLang = navigator.language.split("-")[0].toLowerCase();
      }
      if (sysLang && appTranslations[sysLang]) {
        return sysLang;
      }
    } catch (e) {}
    return "en";
  }

  let currentLang = getSystemLanguage();
  window.updateSystemLanguage = function() {
    const newLang = getSystemLanguage();
    if (newLang !== currentLang) {
      applyAppLanguage(newLang);
    }
  };

  Object.assign(appTranslations.en, { moveBanner: "MOVE MODE: Use Up/Down to reorder, Red to save", season: "Season {number}", episode: "Episode {number}", channelZap: "CHANNEL ZAP" });
  Object.assign(appTranslations.tr, { moveBanner: "TAŞIMA MODU: Yukarı/Aşağı ile sırala, kaydetmek için Kırmızı tuşa bas", season: "{number}. Sezon", episode: "{number}. Bölüm", channelZap: "KANAL DEĞİŞTİR" });
  Object.assign(appTranslations.nl, { moveBanner: "VERPLAATSEN: Gebruik Omhoog/Omlaag om te sorteren, druk op Rood om op te slaan", season: "Seizoen {number}", episode: "Aflevering {number}", channelZap: "KANAAL ZAPPEN" });
  Object.assign(appTranslations.fr, { moveBanner: "DÉPLACEMENT : utilisez Haut/Bas pour réorganiser, appuyez sur Rouge pour enregistrer", season: "Saison {number}", episode: "Épisode {number}", channelZap: "CHANGEMENT DE CHAÎNE" });

  Object.assign(appTranslations.en, { providerLogin: "Provider login", loginMethod: "Login method", xtreamCodes: "Xtream (Movies & Series)", m3uPlaylist: "M3U playlist (Live TV)", m3uUrl: "Playlist URL", loggingIn: "Logging in", loggedIn: "Logged in", loginRequired: "Login failed", noSavedProfile: "No saved profile. Enter your provider details.", invalidCredentials: "The provider rejected the username or password.", playlistUnavailable: "The playlist could not be loaded.", playlistInvalid: "The URL did not return a valid M3U playlist.", loginErrorToast: "Login failed: {reason}" });
  Object.assign(appTranslations.tr, { providerLogin: "Sağlayıcı girişi", loginMethod: "Giriş yöntemi", xtreamCodes: "Xtream (Film ve Dizi)", m3uPlaylist: "M3U listesi (Canlı TV)", m3uUrl: "Oynatma listesi URL'si", loggingIn: "Giriş yapılıyor", loggedIn: "Giriş başarılı", loginRequired: "Giriş başarısız", noSavedProfile: "Kayıtlı profil yok. Sağlayıcı bilgilerini girin.", invalidCredentials: "Sağlayıcı kullanıcı adı veya parolayı kabul etmedi.", playlistUnavailable: "Oynatma listesi yüklenemedi.", playlistInvalid: "URL geçerli bir M3U oynatma listesi döndürmedi.", loginErrorToast: "Giriş başarısız: {reason}" });
  Object.assign(appTranslations.nl, { providerLogin: "Provider aanmelden", loginMethod: "Aanmeldmethode", xtreamCodes: "Xtream (Films & Series)", m3uPlaylist: "M3U-afspeellijst (Live-tv)", m3uUrl: "Afspeellijst-URL", loggingIn: "Aanmelden", loggedIn: "Aangemeld", loginRequired: "Aanmelden mislukt", noSavedProfile: "Geen opgeslagen profiel. Vul je providergegevens in.", invalidCredentials: "De provider heeft de gebruikersnaam of het wachtwoord geweigerd.", playlistUnavailable: "De afspeellijst kon niet worden geladen.", playlistInvalid: "De URL bevat geen geldige M3U-afspeellijst.", loginErrorToast: "Aanmelden mislukt: {reason}" });
  Object.assign(appTranslations.fr, { providerLogin: "Connexion au fournisseur", loginMethod: "Méthode de connexion", xtreamCodes: "Xtream (Films et séries)", m3uPlaylist: "Playlist M3U (TV en direct)", m3uUrl: "URL de la playlist", loggingIn: "Connexion en cours", loggedIn: "Connecté", loginRequired: "Échec de connexion", noSavedProfile: "Aucun profil enregistré. Saisissez vos identifiants fournisseur.", invalidCredentials: "Le fournisseur a refusé le nom d’utilisateur ou le mot de passe.", playlistUnavailable: "Impossible de charger la playlist.", playlistInvalid: "L’URL ne renvoie pas une playlist M3U valide.", loginErrorToast: "Échec de connexion : {reason}" });
  Object.assign(appTranslations.en, { m3uProfiles: "Saved playlists", m3uProfileNew: "+ New playlist", m3uProfileName: "Playlist name", generateM3uPrompt: "Generate the M3U playlist from your Xtream login?" });
  Object.assign(appTranslations.tr, { m3uProfiles: "Kayıtlı listeler", m3uProfileNew: "+ Yeni liste", m3uProfileName: "Liste adı", generateM3uPrompt: "M3U listesi Xtream girişinizden oluşturulsun mu?" });
  Object.assign(appTranslations.nl, { m3uProfiles: "Opgeslagen afspeellijsten", m3uProfileNew: "+ Nieuwe afspeellijst", m3uProfileName: "Naam afspeellijst", generateM3uPrompt: "Zal de M3U-afspeellijst maken op basis van je Xtream-login?" });
  Object.assign(appTranslations.fr, { m3uProfiles: "Playlists enregistrées", m3uProfileNew: "+ Nouvelle playlist", m3uProfileName: "Nom de la playlist", generateM3uPrompt: "Générer la playlist M3U à partir de votre connexion Xtream ?" });
  Object.assign(appTranslations.en, { m3uGenerateXtream: "Generate from Xtream", clockFormat: "Clock format", colorTab: "Color", clockTab: "Clock" });
  Object.assign(appTranslations.tr, { m3uGenerateXtream: "Xtream'den oluştur", clockFormat: "Saat biçimi", colorTab: "Renk", clockTab: "Saat" });
  Object.assign(appTranslations.nl, { m3uGenerateXtream: "Genereren uit Xtream", clockFormat: "Klokweergave", colorTab: "Kleur", clockTab: "Klok" });
  Object.assign(appTranslations.fr, { m3uGenerateXtream: "Générer depuis Xtream", clockFormat: "Format de l'horloge", colorTab: "Couleur", clockTab: "Horloge" });
  const languageOptions = { en: "EN", tr: "TR", nl: "NL", fr: "FR" };
  Object.assign(appTranslations.en, { generalTab: "General", playbackTab: "Playback", profileTab: "Source" });
  Object.assign(appTranslations.tr, { generalTab: "Genel", playbackTab: "Oynatma", profileTab: "Kaynak" });
  Object.assign(appTranslations.nl, { generalTab: "Algemeen", playbackTab: "Afspelen", profileTab: "Bron" });
  Object.assign(appTranslations.fr, { generalTab: "Général", playbackTab: "Lecture", profileTab: "Source" });

  function t(key, values = {}) {
    let text = (appTranslations[currentLang] && appTranslations[currentLang][key]) || appTranslations.en[key] || key;
    Object.keys(values).forEach(name => {
      text = text.replace(`{${name}}`, values[name]);
    });
    return text;
  }
  Object.assign(appTranslations.en, {"hintFavorite": "Favorite", "hintReorder": "Reorder", "hintHide": "Hide category", "favoritesRemove": "Remove favorite", "hintSearch": "Search", "searchTitle": "Search channels", "searchPlaceholder": "Type a channel name", "searchNoResults": "No channels found", "categoryHidden": "Category hidden", "resetHidden": "Show hidden categories", "hiddenReset": "Hidden categories restored", "refreshInterval": "Refresh lists", "refreshOff": "Off", uiScale: "Interface scale", uiScaleCompact: "Compact", uiScaleDefault: "Normal", uiScaleLarge: "Large", menuStyle: "Menu display mode", menuOneAtATime: "One menu open at a time", menuAllVisible: "Multi-column cascading", materialTheme: "Material You palette", paletteSystem: "System (Material You, default)", androidExternalPlayer: "Use Android external player", emptyFavorites: "No favorites added yet", deviceLayout: "Device layout", layoutMobile: "Mobile (Portrait)", layoutTablet: "Tablet (Auto-rotate)", layoutTv: "TV (Landscape)", navHome: "Home", navSearch: "Search", navLiveTv: "Live TV", navProfile: "Profile", copyPlaylist: "Copy playlist URL", regionSetting: "Region", allRegions: "All regions"});
  Object.assign(appTranslations.tr, {"hintFavorite": "Favori", "hintReorder": "Sırala", "hintHide": "Kategoriyi gizle", "favoritesRemove": "Favoriden çıkar", "hintSearch": "Ara", "searchTitle": "Kanal ara", "searchPlaceholder": "Kanal adını yazın", "searchNoResults": "Kanal bulunamadı", "categoryHidden": "Kategori gizlendi", "resetHidden": "Gizli kategorileri göster", "hiddenReset": "Gizli kategoriler geri yüklendi", "refreshInterval": "Listeleri yenile", "refreshOff": "Kapalı", uiScale: "Arayüz boyutu", uiScaleCompact: "Küçük", uiScaleDefault: "Normal", uiScaleLarge: "Büyük", menuStyle: "Menü görünüm modu", menuOneAtATime: "Tek menü açık", menuAllVisible: "Çoklu sütun", materialTheme: "Material You paleti", paletteSystem: "Sistem (Material You, varsayılan)", androidExternalPlayer: "Harici oynatıcı kullan", emptyFavorites: "Henüz favori eklenmedi", deviceLayout: "Cihaz düzeni", layoutMobile: "Mobil (Dikey)", layoutTablet: "Tablet (Otomatik Döndürme)", layoutTv: "TV (Yatay)", navHome: "Ana Sayfa", navSearch: "Ara", navLiveTv: "Canlı TV", navProfile: "Profil", copyPlaylist: "Oynatma listesini kopyala", regionSetting: "Bölge", allRegions: "Tüm bölgeler"});
  Object.assign(appTranslations.nl, {"hintFavorite": "Favoriet", "hintReorder": "Verplaatsen", "hintHide": "Categorie verbergen", "favoritesRemove": "Favoriet verwijderen", "hintSearch": "Zoeken", "searchTitle": "Zoek kanalen", "searchPlaceholder": "Typ een kanaalnaam", "searchNoResults": "Geen kanalen gevonden", "categoryHidden": "Categorie verborgen", "resetHidden": "Verborgen categorieën tonen", "hiddenReset": "Verborgen categorieën hersteld", "refreshInterval": "Lijsten vernieuwen", "refreshOff": "Uit", uiScale: "Interface-schaal", uiScaleCompact: "Compact", uiScaleDefault: "Normaal", uiScaleLarge: "Groot", menuStyle: "Menuweergave", menuOneAtATime: "Eén menu tegelijk open", menuAllVisible: "Meerdere kolommen", materialTheme: "Material You-palet", paletteSystem: "Systeem (Material You, standaard)", androidExternalPlayer: "Externe speler gebruiken", emptyFavorites: "Nog geen favorieten toegevoegd", deviceLayout: "Apparaatindeling", layoutMobile: "Mobiel (Staand)", layoutTablet: "Tablet (Automatisch draaien)", layoutTv: "TV (Liggend)", navHome: "Start", navSearch: "Zoeken", navLiveTv: "Live TV", navProfile: "Profiel", copyPlaylist: "Afspeellijst kopiëren", regionSetting: "Regio", allRegions: "Alle regio's"});
  Object.assign(appTranslations.fr, {"hintFavorite": "Favori", "hintReorder": "Déplacer", "hintHide": "Masquer la catégorie", "favoritesRemove": "Supprimer favori", "hintSearch": "Rechercher", "searchTitle": "Rechercher des chaînes", "searchPlaceholder": "Saisissez un nom de chaîne", "searchNoResults": "Aucune chaîne trouvée", "categoryHidden": "Catégorie masquée", "resetHidden": "Afficher les catégories masquées", "hiddenReset": "Catégories masquées restaurées", "refreshInterval": "Actualiser les listes", "refreshOff": "Désactivé", uiScale: "Échelle de l'interface", uiScaleCompact: "Compact", uiScaleDefault: "Normal", uiScaleLarge: "Grand", menuStyle: "Mode d'affichage du menu", menuOneAtATime: "Un seul menu ouvert à la fois", menuAllVisible: "Colonnes multiples", materialTheme: "Palette Material You", paletteSystem: "Système (Material You, par défaut)", androidExternalPlayer: "Utiliser le lecteur externe", emptyFavorites: "Aucun favori ajouté pour l'instant", deviceLayout: "Disposition", layoutMobile: "Mobile (Portrait)", layoutTablet: "Tablette (Rotation auto)", layoutTv: "TV (Paysage)", navHome: "Accueil", navSearch: "Recherche", navLiveTv: "Direct", navProfile: "Profil", copyPlaylist: "Copier l'URL de la playlist", regionSetting: "Région", allRegions: "Toutes les régions"});
  Object.assign(appTranslations.en, {
    offlineTitle: "You're offline", offlineSubtitle: "Check your internet connection and try again.", retry: "Retry", backOnline: "Back online", streamPlaybackFailed: "Unable to play stream. Check format or try external player.", vodLoading: "Loading {title}...", buffering: "Buffering...", xtreamRequiredForVod: "Xtream account required to play movies and series.", skipDurationSetting: "Double-tap skip / rewind", osdStyleSetting: "Player OSD style", osdStyleGlass: "Liquid Glass", osdStyleBlack: "Black Opacity", osdOpacitySetting: "Player OSD transparency",
    vodPlayerSettings: "Playback Settings", vodAudioTab: "Audio", vodSubtitlesTab: "Subtitles", vodVideoTab: "Video",
    vodAudioTrackLabel: "Audio Source / Language", vodSubtitleTrackLabel: "Subtitle Track", vodSubtitleSizeLabel: "Subtitle Size",
    sizeSmall: "Small", sizeNormal: "Normal", sizeLarge: "Large",
    vodAspectRatioLabel: "Aspect Ratio / Fit", aspectFit: "Fit", aspectFill: "Fill / Crop", aspectStretch: "16:9 Stretch", aspectZoom: "Zoom",
    vodSpeedLabel: "Playback Speed", openExternalPlayer: "Open in External Player",
    accountActive: "Active", accountExpDateLabel: "Expiration Date", accountTimeLeftLabel: "Time Remaining", accountConnectionsLabel: "Connections", accountTypeLabel: "Account Type", accountServerLabel: "Server & Formats",
    testConnection: "Test connection", checkingConnection: "Checking...", filterBtn: "Filter"
  });
  Object.assign(appTranslations.tr, {
    offlineTitle: "Çevrimdışısınız", offlineSubtitle: "İnternet bağlantınızı kontrol edip tekrar deneyin.", retry: "Tekrar dene", backOnline: "Tekrar çevrimiçi", streamPlaybackFailed: "Akış oynatılamadı. Formatı kontrol edin veya harici oynatıcı deneyin.", vodLoading: "{title} yükleniyor...", buffering: "Ara belleğe alınıyor...", xtreamRequiredForVod: "Film ve dizileri oynatmak için Xtream hesabı gereklidir.", skipDurationSetting: "Çift dokunuş ileri / geri sarma", osdStyleSetting: "Oynatıcı OSD stili", osdStyleGlass: "Liquid Glass (Sıvı Cam)", osdStyleBlack: "Siyah Opaklık", osdOpacitySetting: "Oynatıcı OSD saydamlığı",
    vodPlayerSettings: "Oynatma Ayarları", vodAudioTab: "Ses", vodSubtitlesTab: "Altyazılar", vodVideoTab: "Video",
    vodAudioTrackLabel: "Ses Kaynağı / Dili", vodSubtitleTrackLabel: "Altyazı Parçası", vodSubtitleSizeLabel: "Altyazı Boyutu",
    sizeSmall: "Küçük", sizeNormal: "Normal", sizeLarge: "Büyük",
    vodAspectRatioLabel: "En Boy Oranı / Sığdırma", aspectFit: "Sığdır", aspectFill: "Doldur / Kırp", aspectStretch: "16:9 Uzat", aspectZoom: "Yakınlaştır",
    vodSpeedLabel: "Oynatma Hızı", openExternalPlayer: "Harici Oynatıcıda Aç",
    accountActive: "Aktif", accountExpDateLabel: "Bitiş Tarihi", accountTimeLeftLabel: "Kalan Süre", accountConnectionsLabel: "Bağlantılar", accountTypeLabel: "Hesap Türü", accountServerLabel: "Sunucu & Formatlar",
    testConnection: "Bağlantıyı test et", checkingConnection: "Kontrol ediliyor...", filterBtn: "Filtrele"
  });
  Object.assign(appTranslations.nl, {
    offlineTitle: "Je bent offline", offlineSubtitle: "Controleer je internetverbinding en probeer het opnieuw.", retry: "Opnieuw", backOnline: "Weer online", streamPlaybackFailed: "Kan stream niet afspelen. Controleer het formaat of probeer een externe speler.", vodLoading: "{title} laden...", buffering: "Bufferen...", xtreamRequiredForVod: "Xtream-account vereist voor films en series.", skipDurationSetting: "Dubbeltik vooruit / achteruit", osdStyleSetting: "Speler OSD-stijl", osdStyleGlass: "Liquid Glass", osdStyleBlack: "Zwarte dekking", osdOpacitySetting: "Speler OSD-transparantie",
    vodPlayerSettings: "Afspeelinstellingen", vodAudioTab: "Audio", vodSubtitlesTab: "Ondertitels", vodVideoTab: "Video",
    vodAudioTrackLabel: "Audiobron / Taal", vodSubtitleTrackLabel: "Ondertitelspoor", vodSubtitleSizeLabel: "Ondertitelgrootte",
    sizeSmall: "Klein", sizeNormal: "Normaal", sizeLarge: "Groot",
    vodAspectRatioLabel: "Beeldverhouding / Pasvorm", aspectFit: "Passend", aspectFill: "Vullen / Bijsnijden", aspectStretch: "16:9 Uitrekken", aspectZoom: "Zoomen",
    vodSpeedLabel: "Afspeelsnelheid", openExternalPlayer: "Openen in externe speler",
    accountActive: "Actief", accountExpDateLabel: "Vervaldatum", accountTimeLeftLabel: "Resterende tijd", accountConnectionsLabel: "Verbindingen", accountTypeLabel: "Accounttype", accountServerLabel: "Server & Formaten",
    testConnection: "Verbinding testen", checkingConnection: "Controleren...", filterBtn: "Filter"
  });
  Object.assign(appTranslations.fr, {
    offlineTitle: "Vous êtes hors ligne", offlineSubtitle: "Vérifiez votre connexion Internet et réessayez.", retry: "Réessayer", backOnline: "De nouveau en ligne", streamPlaybackFailed: "Impossible de lire le flux. Vérifiez le format ou essayez un lecteur externe.", vodLoading: "Chargement de {title}...", buffering: "Mise en mémoire tampon...", xtreamRequiredForVod: "Compte Xtream requis pour les films et séries.", skipDurationSetting: "Double-tap avancer / reculer", osdStyleSetting: "Style OSD du lecteur", osdStyleGlass: "Liquid Glass", osdStyleBlack: "Opacité noire", osdOpacitySetting: "Transparence OSD du lecteur",
    vodPlayerSettings: "Paramètres de lecture", vodAudioTab: "Audio", vodSubtitlesTab: "Sous-titres", vodVideoTab: "Vidéo",
    vodAudioTrackLabel: "Source audio / Langue", vodSubtitleTrackLabel: "Piste de sous-titres", vodSubtitleSizeLabel: "Taille des sous-titres",
    sizeSmall: "Petit", sizeNormal: "Normal", sizeLarge: "Grand",
    vodAspectRatioLabel: "Format d'image", aspectFit: "Ajuster", aspectFill: "Remplir", aspectStretch: "16:9 Étirer", aspectZoom: "Zoom",
    vodSpeedLabel: "Vitesse de lecture", openExternalPlayer: "Ouvrir dans le lecteur externe",
    accountActive: "Actif", accountExpDateLabel: "Date d'expiration", accountTimeLeftLabel: "Temps restant", accountConnectionsLabel: "Connexions", accountTypeLabel: "Type de compte", accountServerLabel: "Serveur & Formats",
    testConnection: "Tester la connexion", checkingConnection: "Vérification...", filterBtn: "Filtrer"
  });
  let vodSkipSeconds = parseInt(store.getItem("iptv_vod_skip_sec") || "10", 10);
  if (![5, 10, 15, 30, 60].includes(vodSkipSeconds)) vodSkipSeconds = 10;
  let osdStyle = store.getItem("iptv_osd_style") || "glass";
  if (osdStyle !== "glass" && osdStyle !== "black") osdStyle = "glass";
  let osdOpacity = parseInt(store.getItem("iptv_osd_opacity") || "25", 10);
  if (![15, 25, 40, 60, 80].includes(osdOpacity)) osdOpacity = 25;

  function applyOsdAppearance() {
    document.body.classList.toggle("osd-style-black", osdStyle === "black");
    document.body.classList.toggle("osd-style-glass", osdStyle === "glass");
    const alpha = Math.max(0.08, Math.min(0.92, osdOpacity / 100));
    const btnAlpha = Math.max(0.06, Math.min(0.85, alpha * 0.64));
    const blurPx = osdStyle === "black" ? 0 : Math.round(4 + alpha * 14);
    const btnBlurPx = osdStyle === "black" ? 0 : Math.round(2 + alpha * 10);
    const root = document.documentElement;
    root.style.setProperty("--osd-alpha", alpha.toFixed(2));
    root.style.setProperty("--osd-btn-alpha", btnAlpha.toFixed(2));
    root.style.setProperty("--osd-blur", `${blurPx}px`);
    root.style.setProperty("--osd-btn-blur", `${btnBlurPx}px`);
  }
  let isPipMode = false;
  let singleMenuMode = store.getItem("iptv_single_menu") !== "false";
  let uiScale = store.getItem("iptv_ui_scale") || "default";
  let materialPalette = store.getItem("iptv_palette") || "system";
  let mobileActiveSection = "home";
  let appSelectedRegion = store.getItem("iptv_app_region") || "ALL";
  var homeFeaturedItem = null;
  var homeFeaturedCycleTimer = null;
  var isFetchingHomeShelves = false;
  var currentViewAllType = "vod";
  var currentViewAllCatId = "all";
  function detectDeviceType() {
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.getDeviceType === "function") {
      try {
        const type = window.AndroidExternalPlayer.getDeviceType();
        if (type === "mobile" || type === "tablet" || type === "tv") return type;
      } catch (e) {}
    }
    if (window.tizen || window.webOS) return "tv";
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!hasTouch) return "tv";
    const minDim = Math.min(window.screen.width || window.innerWidth, window.screen.height || window.innerHeight);
    if (minDim >= 600) return "tablet";
    return "mobile";
  }

  function detectDeviceLayout() {
    const saved = store.getItem("iptv_device_layout");
    if (saved === "mobile" || saved === "tablet" || saved === "tv") return saved;
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.getDeviceLayout === "function") {
      try {
        const nativeLayout = window.AndroidExternalPlayer.getDeviceLayout();
        if (nativeLayout === "mobile" || nativeLayout === "tablet" || nativeLayout === "tv") return nativeLayout;
      } catch (e) {}
    }
    return detectDeviceType();
  }
  let deviceLayout = detectDeviceLayout();

  function isTouchLayout() {
    return deviceLayout === "mobile" || deviceLayout === "tablet";
  }

  const NON_REGION_WORDS = new Set([
    "VIP", "HEVC", "FHD", "UHD", "4K", "SD", "HD", "KINO", "FILM", "SERIES", "MOVIES",
    "VOD", "LIVE", "CINEMA", "TV", "NEW", "TOP", "ALL", "XXX", "ADULT", "FOR", "AND", "THE"
  ]);

  const REGION_SYNONYMS = {
    "TUR": "TR", "TURK": "TR", "TURKEY": "TR", "TURKIYE": "TR",
    "DEU": "DE", "GER": "DE", "GERMANY": "DE",
    "NLD": "NL", "NED": "NL", "NETHERLANDS": "NL",
    "BEL": "BE", "BELGIUM": "BE",
    "FRA": "FR", "FRANCE": "FR",
    "ENG": "EN", "GBR": "UK",
    "USA": "US",
    "POL": "PL", "POLAND": "PL",
    "ESP": "ES", "SPAIN": "ES",
    "ITA": "IT", "ITALY": "IT",
    "RUS": "RU", "RUSSIA": "RU"
  };

  function normalizeRegionCode(code) {
    if (!code) return "";
    let r = String(code).trim().toUpperCase();
    r = r.replace(/^[^A-Z]+/, "");
    if (/^VI[-_]?([A-Z]{2,})/i.test(r)) {
      r = r.replace(/^VI[-_]?/i, "");
    }
    let clean = r.replace(/[^A-Z]/g, "");
    // User instruction: "remove v and s if its the first letter and if its more or same than 3 letters"
    if (clean.length >= 3 && (clean.startsWith("V") || clean.startsWith("S"))) {
      clean = clean.substring(1);
    }
    if (REGION_SYNONYMS[clean]) {
      clean = REGION_SYNONYMS[clean];
    }
    return clean;
  }

  function extractRegionFromCategory(catName, isVod) {
    if (!catName) return "";
    const str = String(catName).trim();

    // 1. Check parenthesized or bracketed codes like (VTR), [VTR], [STR], (TR), [TR]
    const bracketMatches = str.matchAll(/[([]([A-Za-z0-9_ -]{2,10})[)\]]/g);
    for (const match of bracketMatches) {
      const norm = normalizeRegionCode(match[1]);
      if (norm.length >= 2 && norm.length <= 6 && !NON_REGION_WORDS.has(norm)) {
        return norm;
      }
    }

    // 2. Check prefix before delimiter: "VTR | ...", "STR: ...", "VTR - ...", "VTR / ..."
    const prefixMatch = str.match(/^([A-Za-z0-9_-]{2,10})\s*[|:_\-\/]/);
    if (prefixMatch) {
      const norm = normalizeRegionCode(prefixMatch[1]);
      if (norm.length >= 2 && norm.length <= 6 && !NON_REGION_WORDS.has(norm)) {
        return norm;
      }
    }

    // 3. Check tokens separated by space, pipe, dash, colon, underscore, slash, parenthesis, brackets
    const tokens = str.split(/[\s|:_\-\/()\[\]]+/).filter(Boolean);
    for (let token of tokens) {
      const upper = token.toUpperCase();
      if (NON_REGION_WORDS.has(upper)) continue;
      const norm = normalizeRegionCode(token);
      if (norm.length >= 2 && norm.length <= 6 && !NON_REGION_WORDS.has(norm)) {
        return norm;
      }
    }

    return "";
  }

  function isCategoryInRegion(cat, isVod, region) {
    if (!region || region === "ALL") return true;
    if (!cat || !cat.category_name) return false;
    const r = extractRegionFromCategory(cat.category_name, isVod);
    if (r && (r === region || normalizeRegionCode(r) === region)) return true;

    // Direct token check with normalization
    const tokens = String(cat.category_name).split(/[\s|:_\-\/()\[\]]+/).filter(Boolean);
    for (let t of tokens) {
      const norm = normalizeRegionCode(t);
      if (norm === region) return true;
    }
    return false;
  }

  // CATEGORY GROUPING HELPER (groups categories ending in years or numbers, e.g. "Action 2024", "Action 2025")
  var activeCategoryGroupData = null; // { parentName, subCategories: [{ label, catId }], activeSubCatId }
  var activeSubCategoryId = null;

  function parseCategoryTrailingGroup(name) {
    if (!name) return null;
    const clean = cleanTitle(name, ["HEVC", "VIP"]).trim();
    // Match trailing 4-digit year (19xx, 20xx) or trailing numbers/parenthesized year
    const match = clean.match(/^(.*?)\s*(?:[\(\[\-:]?\s*(20\d\d|19\d\d|\d{1,3})\s*[\)\]]?)$/i);
    if (match && match[1] && match[1].trim().length >= 3) {
      return {
        baseName: match[1].trim(),
        subLabel: match[2].trim()
      };
    }
    return null;
  }

  function groupCategoriesByTrailingNumber(catList) {
    if (!Array.isArray(catList)) return [];
    const baseMap = new Map();

    catList.forEach(cat => {
      const parsed = parseCategoryTrailingGroup(cat.category_name);
      if (parsed) {
        const key = parsed.baseName.toLowerCase();
        if (!baseMap.has(key)) baseMap.set(key, []);
        baseMap.get(key).push({ cat, parsed });
      }
    });

    const result = [];
    const handledCatIds = new Set();

    catList.forEach(cat => {
      if (handledCatIds.has(String(cat.category_id))) return;
      const parsed = parseCategoryTrailingGroup(cat.category_name);
      if (parsed) {
        const key = parsed.baseName.toLowerCase();
        const cluster = baseMap.get(key) || [];
        if (cluster.length >= 2) {
          // Found grouped category!
          const subCats = cluster.map(item => ({
            label: item.parsed.subLabel,
            category_id: item.cat.category_id,
            category_name: item.cat.category_name
          })).sort((a, b) => b.label.localeCompare(a.label, undefined, { numeric: true }));

          cluster.forEach(item => handledCatIds.add(String(item.cat.category_id)));

          result.push({
            category_id: subCats[0].category_id, // default to newest
            category_name: cluster[0].parsed.baseName,
            isGrouped: true,
            subCategories: subCats
          });
          return;
        }
      }
      result.push(cat);
    });

    return result;
  }

  function updateCategorySubFilterBar(groupedCat) {
    const filterBtn = document.getElementById("categorySubFilterBtn");
    const chipsContainer = document.getElementById("categorySubFilterChips");
    if (!filterBtn || !chipsContainer) return;

    if (!groupedCat || !groupedCat.isGrouped || !groupedCat.subCategories || groupedCat.subCategories.length <= 1) {
      filterBtn.classList.add("hidden");
      chipsContainer.classList.add("hidden");
      chipsContainer.innerHTML = "";
      activeCategoryGroupData = null;
      return;
    }

    activeCategoryGroupData = {
      parentName: groupedCat.category_name,
      subCategories: groupedCat.subCategories,
      activeSubCatId: activeSubCategoryId || "all"
    };

    filterBtn.classList.remove("hidden");
    chipsContainer.innerHTML = "";

    // "All" sub-filter chip
    const allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = "sub-filter-chip" + (activeCategoryGroupData.activeSubCatId === "all" ? " active" : "");
    allChip.textContent = t("allRegions") || "All";
    allChip.onclick = () => {
      activeSubCategoryId = "all";
      activeCategoryGroupData.activeSubCatId = "all";
      updateCategorySubFilterBar(groupedCat);
      filterChannels();
    };
    chipsContainer.appendChild(allChip);

    groupedCat.subCategories.forEach(sub => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "sub-filter-chip" + (String(activeCategoryGroupData.activeSubCatId) === String(sub.category_id) ? " active" : "");
      chip.textContent = sub.label;
      chip.onclick = () => {
        activeSubCategoryId = sub.category_id;
        activeCategoryGroupData.activeSubCatId = sub.category_id;
        updateCategorySubFilterBar(groupedCat);
        filterChannels();
      };
      chipsContainer.appendChild(chip);
    });

    filterBtn.onclick = () => {
      const isHidden = chipsContainer.classList.contains("hidden");
      chipsContainer.classList.toggle("hidden", !isHidden);
      filterBtn.classList.toggle("active", isHidden);
    };
  }

  function isStreamInRegion(stream, kind, region) {
    if (!region || region === "ALL") return true;
    if (!stream) return false;
    const catList = kind === "series" ? seriesCategories : (kind === "vod" ? vodCategories : allCategories);
    const cat = (catList || []).find(c => String(c.category_id) === String(stream.category_id));
    if (cat) return isCategoryInRegion(cat, kind !== "live", region);
    return false;
  }

  function getAllAvailableRegions() {
    const regions = new Set(["ALL"]);
    const topRegions = ["TR", "NL", "DE", "FR", "EN", "EXYU", "US", "IT", "ES", "AR"];
    [vodCategories, seriesCategories, allCategories].forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(cat => {
          const r = extractRegionFromCategory(cat.category_name, true) || extractRegionFromCategory(cat.category_name, false);
          if (r && r.length >= 2 && r.length <= 6) regions.add(r);
        });
      }
    });
    const found = Array.from(regions);
    return ["ALL"].concat(
      topRegions.filter(r => regions.has(r)),
      found.filter(r => r !== "ALL" && !topRegions.includes(r)).sort()
    );
  }

  function renderSettingsRegions() {
    const container = document.getElementById("settingsRegionList");
    if (!container) return;
    container.innerHTML = "";
    const available = getAllAvailableRegions();
    available.forEach(reg => {
      const btn = document.createElement("button");
      btn.className = "settings-item focusable" + (reg === appSelectedRegion ? " active" : "");
      btn.dataset.setting = "appRegion";
      btn.dataset.value = reg;
      btn.type = "button";
      btn.tabIndex = 0;
      btn.textContent = reg === "ALL" ? t("allRegions") : reg;
      container.appendChild(btn);
    });
  }

  function setAppRegion(reg) {
    appSelectedRegion = reg || "ALL";
    store.setItem("iptv_app_region", appSelectedRegion);
    currentVodRegion = appSelectedRegion;
    currentLiveRegion = appSelectedRegion;
    homeFeaturedItem = null;
    updateSettingsSelection();
    renderSettingsRegions();
    setupRegions();
    filterCategories();
    renderMobileHomeScreen();
    initMobileHomeScreen();
  }

  function updateHeaderBackButton() {
    const btn = document.getElementById("headerBackBtn");
    if (!btn) return;
    if (isTouchLayout()) {
      const homeViewAll = document.getElementById("homeViewAllPage");
      const viewAllOpen = homeViewAll && !homeViewAll.classList.contains("hidden");
      const searchOpen = searchPanel && !searchPanel.classList.contains("hidden");
      const settingsOpen = settingsPage && !settingsPage.classList.contains("hidden");
      const customOpen = customizationPage && !customizationPage.classList.contains("hidden");
      const hasPlayer = isFitScreen || (currentPlayingStreamId && playerWrapper && !playerWrapper.classList.contains("hidden"));
      const hasSeries = !!selectedSeries;

      const canGoBack = viewAllOpen || searchOpen || settingsOpen || customOpen || hasPlayer || hasSeries;
      btn.classList.toggle("hidden", !canGoBack);
    } else {
      btn.classList.remove("hidden");
    }
  }

  // Canvas lens: draws an edge-only refraction rim on the nav thumb. The centre stays clear;
  // the rim bends toward the direction of motion and updates every frame while moving.
  const navLens = (() => {
    let canvas = null;
    let ctx = null;
    let raf = 0;
    let until = 0;
    let dragging = false;
    let lastLeft = null;
    let vel = 0;
    const indicator = () => document.querySelector("#mobileBottomNav .mobile-nav-indicator");
    const draw = (ind) => {
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "mobile-nav-lens";
        ind.appendChild(canvas);
        ctx = canvas.getContext("2d");
      }
      const w = ind.offsetWidth;
      const h = ind.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const r = h / 2;
      const speedAbs = Math.min(1, Math.abs(vel) / 12);
      const shift = Math.max(-18, Math.min(18, vel * 1.2));
      const band = 7 + speedAbs * 8;
      const inset = 1.5;
      const rimPath = (dx, dy, pad) => {
        const x = inset + dx - pad / 2;
        const y = inset + dy - pad / 2;
        const rw = w - inset * 2 + pad;
        const rh = h - inset * 2 + pad;
        ctx.beginPath();
        ctx.roundRect(x, y, rw, rh, Math.max(0, r - inset + pad / 2));
      };
      // Soft centre-to-edge falloff: transparent middle, brighter rim.
      const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.12, w / 2, h / 2, Math.max(w, h) * 0.55);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(1, "rgba(255,255,255,0.10)");
      ctx.fillStyle = g;
      rimPath(0, 0, 0);
      ctx.fill();
      // Refraction band: wide edge strokes displaced toward the motion, with chromatic split.
      const strokes = [
        { dx: shift - 2.5, color: "rgba(255,80,110,0.35)", lw: band },
        { dx: shift + 2.5, color: "rgba(80,160,255,0.35)", lw: band },
        { dx: shift, color: "rgba(255,255,255,0.2)", lw: 1.5 + speedAbs * 1.5 },
      ];
      for (const s of strokes) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.lw;
        rimPath(s.dx, 0, 0);
        ctx.stroke();
      }
    };
    // Sets --mag (0..1) on each nav item from its distance to the lens centre; 0 when the lens is at rest.
    const magnify = (ind, live) => {
      const rect = ind.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      document.querySelectorAll("#mobileBottomNav .mobile-nav-item").forEach(btn => {
        let m = 0;
        if (live) {
          const b = btn.getBoundingClientRect();
          const t = Math.max(0, 1 - Math.abs(b.left + b.width / 2 - cx) / (rect.width * 0.75));
          m = t * t * (3 - 2 * t);
        }
        btn.style.setProperty("--mag", m.toFixed(3));
      });
    };
    const loop = () => {
      const ind = indicator();
      raf = 0;
      if (!ind) return;
      const left = ind.getBoundingClientRect().left;
      const dx = lastLeft === null ? 0 : left - lastLeft;
      lastLeft = left;
      vel = vel * 0.8 + dx * 0.2;
      draw(ind);
      const live = dragging || performance.now() < until || Math.abs(vel) > 0.05;
      magnify(ind, true);
      if (live) {
        raf = requestAnimationFrame(loop);
      } else {
        vel = 0;
        draw(ind);
        lastLeft = null;
      }
    };
    const kick = (ms = 700) => {
      until = Math.max(until, performance.now() + ms);
      if (!raf) raf = requestAnimationFrame(loop);
    };
    return {
      kick,
      setDragging(value) {
        dragging = value;
        kick(0);
      },
    };
  })();

  function isTabletLandscapeNav() {
    return document.body.classList.contains("layout-tablet") && window.matchMedia("(orientation: landscape)").matches;
  }

  function moveMobileNavIndicator(item, animate = true) {
    const indicator = document.querySelector("#mobileBottomNav .mobile-nav-indicator");
    if (!indicator || !item) return;
    const isVertical = isTabletLandscapeNav();
    if (!animate) indicator.style.transition = "none";
    if (isVertical) {
      indicator.style.width = "";
      indicator.style.height = `${item.offsetHeight}px`;
      indicator.style.transform = `translateY(${item.offsetTop}px)`;
    } else {
      indicator.style.height = "";
      indicator.style.width = `${item.offsetWidth}px`;
      indicator.style.transform = `translateX(${item.offsetLeft}px)`;
    }
    if (!animate) {
      void indicator.offsetWidth;
      indicator.style.transition = "";
    }
    navLens.kick();
  }

  function syncMobileNavState(activeTab) {
    if (activeTab) mobileActiveSection = activeTab;
    document.body.classList.remove("mobile-sec-home", "mobile-sec-live", "mobile-sec-search", "mobile-sec-profile");
    document.body.classList.add(`mobile-sec-${mobileActiveSection}`);
    document.querySelectorAll("#mobileBottomNav .mobile-nav-item").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mobileTab === mobileActiveSection);
    });
    moveMobileNavIndicator(document.querySelector(`#mobileBottomNav .mobile-nav-item[data-mobile-tab="${mobileActiveSection}"]`));
    if (mobileActiveSection === "home" && typeof renderMobileHomeScreen === "function") {
      renderMobileHomeScreen();
    }
    updateHeaderBackButton();
  }

  function applyDeviceLayout(layout, notifyNative = true) {
    deviceLayout = layout || "mobile";
    store.setItem("iptv_device_layout", deviceLayout);
    document.body.classList.remove("layout-mobile", "layout-tv", "layout-tablet");
    if (deviceLayout === "tv") {
      document.body.classList.add("layout-tv");
    } else if (deviceLayout === "tablet") {
      document.body.classList.add("layout-mobile", "layout-tablet");
    } else {
      document.body.classList.add("layout-mobile");
    }
    try {
      document.body.dataset.deviceType = detectDeviceType();
    } catch (e) {}
    syncMobileNavState(mobileActiveSection);

    if (notifyNative && window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.setDeviceLayout === "function") {
      window.AndroidExternalPlayer.setDeviceLayout(deviceLayout);
    }

    if (settingsPage) {
      settingsPage.querySelectorAll(".settings-item[data-setting='deviceLayout']").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.value === deviceLayout);
      });
    }
  }

  const MATERIAL_PALETTES = {
    "dynamic-blue": {
      primary: "#a8c7fa",
      onPrimary: "#043063",
      primaryContainer: "#1c4479",
      onPrimaryContainer: "#d3e3fd",
      surface: "#121318",
      surfaceVariant: "#1a1b21",
      surfaceContainer: "#202127",
      surfaceContainerHigh: "#2b2c34",
      accent: "#a8c7fa",
      highlight: "#ffd700"
    },
    "dynamic-purple": {
      primary: "#d0bcff",
      onPrimary: "#381e72",
      primaryContainer: "#4f378b",
      onPrimaryContainer: "#eaddff",
      surface: "#141218",
      surfaceVariant: "#1d192b",
      surfaceContainer: "#231f32",
      surfaceContainerHigh: "#2e293f",
      accent: "#d0bcff",
      highlight: "#7bdcb5"
    },
    "dynamic-teal": {
      primary: "#7bdcb5",
      onPrimary: "#00382f",
      primaryContainer: "#005144",
      onPrimaryContainer: "#98f8d0",
      surface: "#0e1514",
      surfaceVariant: "#192725",
      surfaceContainer: "#1f302e",
      surfaceContainerHigh: "#2a3e3b",
      accent: "#7bdcb5",
      highlight: "#a8c7fa"
    },
    "dynamic-green": {
      primary: "#a1d399",
      onPrimary: "#0c390f",
      primaryContainer: "#235123",
      onPrimaryContainer: "#bdf0b3",
      surface: "#111410",
      surfaceVariant: "#1a2018",
      surfaceContainer: "#21281e",
      surfaceContainerHigh: "#2d3729",
      accent: "#a1d399",
      highlight: "#ffd700"
    },
    "dynamic-amber": {
      primary: "#ffd080",
      onPrimary: "#432c00",
      primaryContainer: "#604100",
      onPrimaryContainer: "#ffdfa0",
      surface: "#16130e",
      surfaceVariant: "#262015",
      surfaceContainer: "#30281b",
      surfaceContainerHigh: "#3f3524",
      accent: "#ffd080",
      highlight: "#a8c7fa"
    },
    "dynamic-crimson": {
      primary: "#ffb4ab",
      onPrimary: "#690005",
      primaryContainer: "#93000a",
      onPrimaryContainer: "#ffdad6",
      surface: "#161111",
      surfaceVariant: "#261818",
      surfaceContainer: "#311f1f",
      surfaceContainerHigh: "#412b2b",
      accent: "#ffb4ab",
      highlight: "#ffd700"
    }
  };

  function applyUiScale(scale) {
    uiScale = scale || "default";
    store.setItem("iptv_ui_scale", uiScale);
    document.body.classList.remove("ui-scale-compact", "ui-scale-large");
    if (uiScale === "compact") {
      document.body.classList.add("ui-scale-compact");
    } else if (uiScale === "large") {
      document.body.classList.add("ui-scale-large");
    }
    updateSettingsSelection();
  }

  function getSystemMaterialColors() {
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.getSystemMaterialYouColors === "function") {
      try {
        const raw = window.AndroidExternalPlayer.getSystemMaterialYouColors();
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (data && data.available) {
          return data;
        }
      } catch (e) {
        console.warn("Failed to get system Material You colors:", e);
      }
    }
    return null;
  }

  function applyMaterialPalette(paletteName) {
    if (!paletteName || (paletteName !== "system" && !MATERIAL_PALETTES[paletteName])) {
      paletteName = "system";
    }
    materialPalette = paletteName;
    store.setItem("iptv_palette", materialPalette);

    let pal;
    if (materialPalette === "system") {
      const sys = getSystemMaterialColors();
      if (sys) {
        pal = {
          primary: sys.primary || "#a8c7fa",
          onPrimary: sys.onPrimary || "#043063",
          primaryContainer: sys.primaryContainer || "#1c4479",
          onPrimaryContainer: sys.onPrimaryContainer || "#d3e3fd",
          secondary: sys.secondary || "#bec6dc",
          onSecondary: sys.onSecondary || "#283141",
          secondaryContainer: sys.secondaryContainer || "#3e4759",
          onSecondaryContainer: sys.onSecondaryContainer || "#dae2f9",
          tertiary: sys.tertiary || "#ddbcde",
          surface: sys.surface || "#121318",
          surfaceDim: sys.surfaceDim || "#0c0d12",
          surfaceVariant: sys.surfaceVariant || "#1a1b21",
          surfaceContainer: sys.surfaceContainer || "#202127",
          surfaceContainerHigh: sys.surfaceContainerHigh || "#2b2c34",
          surfaceContainerHighest: sys.surfaceContainerHighest || "#31333a",
          onSurface: sys.onSurface || "#e2e2e9",
          onSurfaceVariant: sys.onSurfaceVariant || "#c4c6cf",
          outline: sys.outline || "#8e9099",
          outlineVariant: sys.outlineVariant || "#44474f",
          accent: sys.accent || sys.primary || "#a8c7fa",
          highlight: sys.highlight || sys.tertiary || "#ffd700"
        };
      } else {
        pal = MATERIAL_PALETTES["dynamic-blue"];
      }
    } else {
      pal = MATERIAL_PALETTES[materialPalette];
    }

    const root = document.documentElement;
    const toRgb = (color, fallback = "168, 199, 250") => {
      const m = String(color || "").match(/[0-9a-f]{2}/gi);
      return m && m.length >= 3 ? m.slice(0, 3).map(v => parseInt(v, 16)).join(", ") : fallback;
    };
    root.style.setProperty("--md-sys-color-primary", pal.primary);
    root.style.setProperty("--md-sys-color-primary-rgb", toRgb(pal.primary, "168, 199, 250"));
    root.style.setProperty("--md-sys-color-on-primary", pal.onPrimary);
    root.style.setProperty("--md-sys-color-primary-container", pal.primaryContainer);
    root.style.setProperty("--md-sys-color-on-primary-container", pal.onPrimaryContainer);
    if (pal.secondary) {
      root.style.setProperty("--md-sys-color-secondary", pal.secondary);
      root.style.setProperty("--md-sys-color-secondary-rgb", toRgb(pal.secondary, "190, 198, 220"));
    }
    if (pal.onSecondary) root.style.setProperty("--md-sys-color-on-secondary", pal.onSecondary);
    if (pal.secondaryContainer) root.style.setProperty("--md-sys-color-secondary-container", pal.secondaryContainer);
    if (pal.onSecondaryContainer) root.style.setProperty("--md-sys-color-on-secondary-container", pal.onSecondaryContainer);
    if (pal.tertiary) {
      root.style.setProperty("--md-sys-color-tertiary", pal.tertiary);
      root.style.setProperty("--md-sys-color-tertiary-rgb", toRgb(pal.tertiary, "221, 188, 222"));
    }
    root.style.setProperty("--md-sys-color-surface", pal.surface);
    if (pal.surfaceDim) root.style.setProperty("--md-sys-color-surface-dim", pal.surfaceDim);
    root.style.setProperty("--md-sys-color-surface-variant", pal.surfaceVariant);
    root.style.setProperty("--md-sys-color-surface-container", pal.surfaceContainer);
    root.style.setProperty("--md-sys-color-surface-container-high", pal.surfaceContainerHigh);
    if (pal.surfaceContainerHighest) root.style.setProperty("--md-sys-color-surface-container-highest", pal.surfaceContainerHighest);
    if (pal.onSurface) root.style.setProperty("--md-sys-color-on-surface", pal.onSurface);
    if (pal.onSurfaceVariant) root.style.setProperty("--md-sys-color-on-surface-variant", pal.onSurfaceVariant);
    if (pal.outline) root.style.setProperty("--md-sys-color-outline", pal.outline);
    if (pal.outlineVariant) root.style.setProperty("--md-sys-color-outline-variant", pal.outlineVariant);

    if (typeof themeConfig !== "undefined") {
      themeConfig.accent = pal.accent || pal.primary;
      themeConfig.highlight = pal.highlight || pal.tertiary || "#ffd700";
      applyThemeConfig();
    }
    syncStatusBarColor();
    updateSettingsSelection();
  }

  window.updateSystemMaterialYouColors = function() {
    if (materialPalette === "system") {
      applyMaterialPalette("system");
    }
  };
  let autoplayNext = store.getItem("iptv_autoplay_next") === "true";
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

  let categoryFavorites = { live: [], vod: [], series: [] };
  try {
    const savedCatFavs = JSON.parse(store.getItem("iptv_cat_favs") || "{}");
    Object.keys(categoryFavorites).forEach((kind) => {
      if (Array.isArray(savedCatFavs[kind])) categoryFavorites[kind] = savedCatFavs[kind].map(String);
    });
  } catch (error) {}

  function saveCategoryFavorites() {
    store.setItem("iptv_cat_favs", JSON.stringify(categoryFavorites));
  }

  function toggleCategoryFavorite(catId) {
    if (!catId) return;
    const kind = categoryKind();
    const sId = String(catId);
    const idx = categoryFavorites[kind].indexOf(sId);
    if (idx >= 0) {
      categoryFavorites[kind].splice(idx, 1);
      showToast(t("favoritesRemoved") || "Removed from favorites");
    } else {
      categoryFavorites[kind].push(sId);
      showToast(t("favoritesAdded") || "Added to favorites");
    }
    saveCategoryFavorites();
    filterCategories();
    const targetLi = categoryList ? categoryList.querySelector(`[data-cat-id="${escapeAttr(sId)}"]`) : null;
    if (targetLi) setElementFocus(targetLi);
  }

  function hideCategory(catId) {
    if (!catId) return;
    const kind = categoryKind();
    const sId = String(catId);
    if (hiddenCategories[kind].indexOf(sId) === -1) {
      hiddenCategories[kind].push(sId);
      saveHiddenCategories();
      filterCategories();
      showToast(t("categoryHidden") || "Category hidden");
    }
  }
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
  let xtreamAuth = null;
  let allStreams = [];
  let vodStreams = [];
  let vodCategories = [];
  let seriesCategories = [];
  let seriesStreams = [];
  let selectedSeries = null;
  let currentVodItems = [];
  let currentVodMovieId = null;
  let allCategories = [];
  let favoritesNs = "";

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

  let currentLiveRegion = appSelectedRegion !== "ALL" ? appSelectedRegion : "TR";
  let currentVodRegion = appSelectedRegion !== "ALL" ? appSelectedRegion : "TR";

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
      const sources = [];
      if (currentAuth) sources.push("M3U");
      if (xtreamAuth) sources.push("Xtream");
      if (state === "logged-in" && sources.length) loginStatus.textContent += " · " + sources.join(" + ");
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
    const shouldShow = show === undefined ? (settingsPage ? settingsPage.classList.contains("hidden") : true) : show;
    if (shouldShow) {
      showSettingsPage(true);
      showSettingsTab("profile");
      if (focusInput && serverUrlInput) {
        setTimeout(() => setElementFocus(serverUrlInput), 100);
      }
    } else {
      showSettingsPage(false);
    }
  }

  function showSettingsTab(name) {
    if (!settingsPage) return;
    settingsPage.querySelectorAll(".customization-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === name);
    });
    settingsPage.querySelectorAll(".customization-pane").forEach(pane => {
      pane.classList.toggle("hidden", pane.dataset.pane !== name);
    });
  }

  function showSettingsPage(show) {
    if (!settingsPage) return;
    settingsPage.classList.toggle("hidden", !show);
    if (show) {
      if (isFitScreen) {
        isFitScreen = false;
        document.body.classList.remove("speler-fit-screen");
      }
      settingsPage.classList.remove("hidden");
      if (isTouchLayout()) {
        syncMobileNavState("profile");
      }
      showSettingsTab("general");
      renderSettingsRegions();
      setElementFocus(settingsPage.querySelector(".customization-tab"));
    } else {
      settingsPage.classList.add("hidden");
      if (isTouchLayout() && mobileActiveSection === "profile") {
        syncMobileNavState((currentModus === "vod" || currentModus === "series") ? "home" : "live");
      }
      setElementFocus(settingsButton);
    }
    updateHeaderBackButton();
  }

  function nextLanguage(lang) {
    const codes = Object.keys(languageOptions);
    return codes[(codes.indexOf(lang) + 1) % codes.length];
  }

  function updateFavoritesTab() {
    const tab = document.querySelector("#modusList [data-modus='favorites']");
    if (!tab) return;
    const hasFavorites = Array.isArray(favorites) && favorites.length > 0;
    tab.classList.toggle("hidden", !hasFavorites);
    if (!hasFavorites && currentModus === "favorites") switchModus("live");
  }

  function updateSettingsSelection() {
    if (!settingsPage) return;
    renderSettingsRegions();
    settingsPage.querySelectorAll(".settings-item[data-setting='language']").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === currentLang);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='uiScale']").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === uiScale);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='backgroundColor']").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === currentBgColor);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='deviceLayout']").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === deviceLayout);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='singleMenu']").forEach(btn => {
      btn.classList.toggle("active", (btn.dataset.value === "true") === singleMenuMode);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='materialPalette']").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === materialPalette);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='refreshCycle']").forEach(btn => {
      btn.classList.toggle("active", parseInt(btn.dataset.value, 10) === refreshHours);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='skipSeconds']").forEach(btn => {
      btn.classList.toggle("active", parseInt(btn.dataset.value, 10) === vodSkipSeconds);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='osdStyle']").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === osdStyle);
    });
    settingsPage.querySelectorAll(".settings-item[data-setting='osdOpacity']").forEach(btn => {
      btn.classList.toggle("active", parseInt(btn.dataset.value, 10) === osdOpacity);
    });
    updateFavoritesTab();
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
    if (settingsButton) {
      const sLabel = settingsButton.querySelector("span[data-i18n='settings']");
      if (sLabel) sLabel.textContent = t("settings");
    }
    if (headerModeIndicator) {
      const modeKeys = { favorites: "modeFavorites", live: "modeLive", vod: "modeMovies", series: "modeSeries" };
      const modeSvgs = {
        favorites: '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        live: '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>',
        vod: '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
        series: '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>'
      };
      headerModeIndicator.innerHTML = (modeSvgs[currentModus] || "") + ` <span>${t(modeKeys[currentModus])}</span>`;
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
      return {
        accent: /^#[0-9a-f]{6}$/i.test(saved.accent || "") ? saved.accent : "#e50914",
        highlight: /^#[0-9a-f]{6}$/i.test(saved.highlight || "") ? saved.highlight : "#ffd700"
      };
    } catch (error) {
      return { accent: "#e50914", highlight: "#ffd700" };
    }
  }

  let themeConfig = loadThemeConfig();
  let currentBgColor = store.getItem("iptv_bg_color") || "default";

  function applyBackgroundColor(mode) {
    currentBgColor = mode === "amoled" ? "amoled" : "default";
    store.setItem("iptv_bg_color", currentBgColor);
    document.body.classList.toggle("theme-amoled", currentBgColor === "amoled");
    document.documentElement.classList.toggle("theme-amoled", currentBgColor === "amoled");
    updateSettingsSelection();
    if (currentBgColor === "amoled") {
      if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.setStatusBarColor === "function") {
        window.AndroidExternalPlayer.setStatusBarColor("#000000");
      }
    } else {
      syncStatusBarColor();
    }
  }

  function syncStatusBarColor() {
    if (isTouchLayout() || currentBgColor === "amoled") {
      if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.setStatusBarColor === "function") {
        window.AndroidExternalPlayer.setStatusBarColor("#000000");
      }
      return;
    }
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.setStatusBarColor === "function") {
      setTimeout(() => {
        const header = document.querySelector(".app-header");
        if (header) {
          const bg = window.getComputedStyle(header).backgroundColor;
          const match = bg.match(/\d+/g);
          if (match && match.length >= 3) {
            const hex = "#" + match.slice(0, 3).map(n => parseInt(n, 10).toString(16).padStart(2, "0")).join("");
            window.AndroidExternalPlayer.setStatusBarColor(hex);
          }
        }
      }, 50);
    }
  }

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

    store.setItem("iptv_theme", JSON.stringify(themeConfig));
    syncStatusBarColor();
  }

  function updateThemeColor(role, color) {
    if ((role !== "accent" && role !== "highlight") || !/^#[0-9a-f]{6}$/i.test(color || "")) return;
    themeConfig[role] = color;
    applyThemeConfig();
  }

  function updateBackgroundImage() {}

  function centerCustomizationNav(item) {
    const nav = customizationPage && customizationPage.querySelector(".customization-nav");
    const list = nav && nav.querySelector(".customization-nav-list");
    if (!item || !list) return;
    nav.scrollTop = 0;
    const offset = nav.clientHeight / 2 - (item.offsetTop + item.offsetHeight / 2);
    list.style.transform = `translateY(${offset}px)`;
  }

  function showCustomizationTab(name) {
    if (!customizationPage) return;
    customizationPage.querySelectorAll(".customization-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === name);
    });
    customizationPage.querySelectorAll(".customization-pane").forEach(pane => {
      pane.classList.toggle("hidden", pane.dataset.pane !== name);
    });
  }

  function showCustomizationPage(show) {
    if (!customizationPage) return;
    customizationPage.classList.toggle("hidden", !show);
    if (show) {
      showSettingsPage(false);
      customizationPage.classList.remove("hidden");
      showCustomizationTab("color");
      setElementFocus(customizationPage.querySelector(".customization-tab"));
    } else {
      customizationPage.classList.add("hidden");
      if (settingsPage && !settingsPage.classList.contains("hidden")) {
        setElementFocus(settingsPage.querySelector(".customization-tab"));
      } else {
        setElementFocus(settingsButton);
      }
    }
    updateHeaderBackButton();
  }

  function handleSettingsAction(action, value = null) {
    switch (action) {
      case "appRegion": {
        setAppRegion(value);
        showToast(`${t("regionSetting") || "Region"}: ${value === "ALL" ? t("allRegions") : value}`);
        return;
      }
      case "language": {
        const next = appTranslations[value] ? value : nextLanguage(currentLang);
        applyAppLanguage(next);
        showToast(`${languageOptions[next]} ${next.toUpperCase()}`);
        return;
      }
      case "uiScale": {
        applyUiScale(value);
        showToast(`${t("uiScale")}: ${value}`);
        return;
      }
      case "backgroundColor": {
        applyBackgroundColor(value);
        showToast(value === "amoled" ? (t("bgAmoled") || "AMOLED Black") : (t("bgDefault") || "Default"));
        return;
      }
      case "deviceLayout": {
        applyDeviceLayout(value, true);
        const layoutLabels = {
          tv: t("layoutTv"),
          tablet: t("layoutTablet"),
          mobile: t("layoutMobile")
        };
        showToast(`${t("deviceLayout")}: ${layoutLabels[value] || value}`);
        return;
      }
      case "singleMenu": {
        singleMenuMode = (value === "true");
        store.setItem("iptv_single_menu", String(singleMenuMode));
        updateSettingsSelection();
        setColumnFocus(findCurrentColumnIndex());
        showToast(singleMenuMode ? t("menuOneAtATime") : t("menuAllVisible"));
        return;
      }
      case "materialPalette": {
        applyMaterialPalette(value);
        showToast(value === "system" ? t("paletteSystem") : value);
        return;
      }
      case "customization":
      case "openCustomization":
        showSettingsPage(false);
        showCustomizationPage(true);
        return;
      case "refreshCycle": {
        const hours = value !== null ? parseInt(value, 10) : (() => {
          const options = [0, 3, 6, 12, 24];
          return options[(options.indexOf(refreshHours) + 1) % options.length];
        })();
        refreshHours = hours;
        store.setItem("iptv_refresh_hours", String(refreshHours));
        updateSettingsSelection();
        scheduleListRefresh();
        showToast(`${t("refreshInterval")}: ${refreshHours ? refreshHours + " h" : t("refreshOff")}`);
        return;
      }
      case "skipSeconds": {
        const sec = parseInt(value, 10);
        if ([5, 10, 15, 30, 60].includes(sec)) {
          vodSkipSeconds = sec;
          store.setItem("iptv_vod_skip_sec", String(vodSkipSeconds));
          updateSettingsSelection();
          showToast(`${t("skipDurationSetting")}: ${vodSkipSeconds}s`);
        }
        return;
      }
      case "osdStyle": {
        if (value === "glass" || value === "black") {
          osdStyle = value;
          store.setItem("iptv_osd_style", osdStyle);
          applyOsdAppearance();
          updateSettingsSelection();
          showToast(`${t("osdStyleSetting")}: ${osdStyle === "black" ? t("osdStyleBlack") : t("osdStyleGlass")}`);
        }
        return;
      }
      case "osdOpacity": {
        const op = parseInt(value, 10);
        if ([15, 25, 40, 60, 80].includes(op)) {
          osdOpacity = op;
          store.setItem("iptv_osd_opacity", String(osdOpacity));
          applyOsdAppearance();
          updateSettingsSelection();
          showToast(`${t("osdOpacitySetting")}: ${osdOpacity}%`);
        }
        return;
      }
      case "supportDev": {
        const supportUrl = "https://ko-fi.com/kaecr";
        if (window.AndroidExternalPlayer && window.AndroidExternalPlayer.openUrl) {
          window.AndroidExternalPlayer.openUrl(supportUrl);
        } else {
          window.open(supportUrl, "_blank");
        }
        return;
      }
      case "resetHidden":
        hiddenCategories = { live: [], vod: [], series: [] };
        regionPrefs.hidden = { live: [], vod: [] };
        saveHiddenCategories();
        saveRegionPrefs();
        if (currentModus !== "favorites") {
          setupRegions();
          filterCategories();
        }
        showToast(t("hiddenReset"));
        return;
      case "switchProfile":
        showSettingsPage(false);
        toggleLoginPanel(true, true);
        return;
      case "copyPlaylist": {
        const url = currentAuth && currentAuth.playlistUrl ? currentAuth.playlistUrl : "";
        if (url && window.AndroidExternalPlayer && window.AndroidExternalPlayer.copyToClipboard) {
          window.AndroidExternalPlayer.copyToClipboard(url);
          showToast("Playlist URL copied");
        }
        return;
      }
      case "close":
      default:
        showSettingsPage(false);
        setElementFocus(document.querySelector("#modusList [data-modus='favorites']"));
        return;
    }
    showSettingsPage(false);
  }

  const QUALITY_TAGS = ["HD", "FHD", "UHD", "4K"];
  const TITLE_TAGS = ["HEVC", "VIP", "UHD", "FHD", "HD", "SD", "4K", "H265", "H264"];

  // Tags listed in `keep` stay visible in the cleaned title.
  function cleanTitle(str, keep) {
    if (!str) return "";
    const kept = keep || [];
    const tags = TITLE_TAGS.filter((tag) => kept.indexOf(tag) === -1);
    let text = str
      .replace(/\([^)]*\)/g, "")
      .replace(/^([A-Za-z0-9]{2,6})\s*[|:_\-]\s*/i, "")
      .replace(/^[A-Z0-9]{2,5}\s*:\s*/i, "");
    if (tags.length) text = text.replace(new RegExp("\\b(" + tags.join("|") + ")\\b", "gi"), "");
    return text.replace(/\s{2,}/g, " ").trim();
  }

  let clock24h = store.getItem("iptv_clock_24h") !== "0";

  function updateClockFormatButton() {
    const textEl = document.getElementById("clockFormatText");
    if (textEl) {
      textEl.textContent = `${clock24h ? "24" : "12"} h`;
    } else {
      const button = document.getElementById("clockFormatButton");
      if (button) button.textContent = `${clock24h ? "24" : "12"} h`;
    }
  }

  const updateClocks = () => {
    const now = new Date();
    const clockStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: !clock24h });
    if (headerClock) headerClock.textContent = clockStr;
    if (osdClock) osdClock.textContent = clockStr;
    if (vodOsdClock) vodOsdClock.textContent = clockStr;
  };
  updateClockFormatButton();
  updateClocks();
  setInterval(updateClocks, 1000);

  let isTimelineScrubbing = false;
  let wasPlayingBeforeScrub = false;
  let pendingVodSeekTime = null;
  let vodHasLoadedMetadata = false;
  let isVodSeeking = false;
  let vodSeekWatchdogTimer = null;
  let activeVodResolvedUrl = "";
  let vodNativeAudioActive = false;
  let vodDiscoveredTracks = { audioTracks: [], subtitleTracks: [] };
  let selectedVodAudioGroup = -1;
  let selectedVodAudioTrack = -1;
  let selectedVodSubtitleGroup = -1;
  let selectedVodSubtitleTrack = -1;
  let vodAspectRatio = "contain";
  let vodPlaybackSpeed = 1.0;
  let vodSubtitleSize = "normal";

  // Native ExoPlayer callbacks for audio/subtitle track updates and cue text
  window.onNativeVodTracksUpdated = function(tracksData) {
    try {
      const data = typeof tracksData === "string" ? JSON.parse(tracksData) : tracksData;
      if (data && typeof data === "object") {
        vodDiscoveredTracks = {
          audioTracks: Array.isArray(data.audioTracks) ? data.audioTracks : [],
          subtitleTracks: Array.isArray(data.subtitleTracks) ? data.subtitleTracks : []
        };
        renderVodAudioTrackList();
        renderVodSubtitleTrackList();
      }
    } catch (e) {
      console.warn("onNativeVodTracksUpdated parse error:", e);
    }
  };

  window.onNativeSubtitleCue = function(cueText) {
    const overlay = document.getElementById("vodSubtitleOverlay");
    if (!overlay) return;
    if (cueText && typeof cueText === "string" && cueText.trim()) {
      overlay.innerHTML = `<span>${escapeAttr(cueText.trim())}</span>`;
      overlay.classList.remove("hidden");
    } else {
      overlay.innerHTML = "";
      overlay.classList.add("hidden");
    }
  };

  function checkVodAudioSupportAndFallback() {
    if (vodNativeAudioActive) return;
    if ((currentModus !== "vod" && currentModus !== "series") || (!currentVodMovieId && !currentEpisodeId)) return;
    if (!window.AndroidExternalPlayer || typeof window.AndroidExternalPlayer.startVodAudioFallback !== "function") return;
    if (!activeVodResolvedUrl) return;
    if (video.paused || video.currentTime < 0.35) return;

    let decodedAudioBytes = null;
    if (typeof video.webkitAudioDecodedByteCount === "number") {
      decodedAudioBytes = video.webkitAudioDecodedByteCount;
    }
    let hasAudioTrack = null;
    if (typeof video.mozHasAudio === "boolean") {
      hasAudioTrack = video.mozHasAudio;
    } else if (video.audioTracks && typeof video.audioTracks.length === "number") {
      hasAudioTrack = video.audioTracks.length > 0;
    }

    const webViewFailedAudio = (decodedAudioBytes !== null && decodedAudioBytes === 0 && video.currentTime >= 0.45) ||
      (hasAudioTrack === false && video.currentTime >= 0.45);

    if (webViewFailedAudio) {
      vodNativeAudioActive = true;
      video.muted = true;
      try {
        window.AndroidExternalPlayer.startVodAudioFallback(
          activeVodResolvedUrl,
          video.currentTime || 0,
          !video.paused
        );
      } catch (e) {
        console.warn("startVodAudioFallback error:", e);
      }
    }
  }

  function syncVodAudioCompanion() {
    if (!vodNativeAudioActive) return;
    if (!window.AndroidExternalPlayer || typeof window.AndroidExternalPlayer.syncVodAudioFallback !== "function") return;
    try {
      window.AndroidExternalPlayer.syncVodAudioFallback(
        video.currentTime || 0,
        !video.paused && !video.ended
      );
    } catch (e) {}
  }

  function stopVodAudioCompanion() {
    if (vodNativeAudioActive) {
      vodNativeAudioActive = false;
      video.muted = false;
    }
    const overlay = document.getElementById("vodSubtitleOverlay");
    if (overlay) {
      overlay.innerHTML = "";
      overlay.classList.add("hidden");
    }
    vodDiscoveredTracks = { audioTracks: [], subtitleTracks: [] };
    selectedVodAudioGroup = -1;
    selectedVodAudioTrack = -1;
    selectedVodSubtitleGroup = -1;
    selectedVodSubtitleTrack = -1;
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.stopVodAudioFallback === "function") {
      try {
        window.AndroidExternalPlayer.stopVodAudioFallback();
      } catch (e) {}
    }
  }

  function performReliableVodSeek(targetSeconds) {
    if (!video) return;
    const dur = video.duration;
    const hasValidDuration = dur && isFinite(dur) && dur > 0;
    const clamped = hasValidDuration
      ? Math.max(0, Math.min(Math.max(0, dur - 0.25), targetSeconds))
      : Math.max(0, targetSeconds);

    clearVodLoadTimer();
    if (vodSeekWatchdogTimer) {
      clearTimeout(vodSeekWatchdogTimer);
      vodSeekWatchdogTimer = null;
    }

    if (video.readyState < 1) {
      pendingVodSeekTime = clamped;
      showPlayerLoading(t("buffering"));
      return;
    }

    pendingVodSeekTime = null;
    isVodSeeking = true;
    showPlayerLoading(t("buffering"));

    // Inform native companion of explicit user seek immediately so it seeks directly without waiting for drift sync
    if (vodNativeAudioActive && window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.seekVodAudioFallback === "function") {
      try {
        window.AndroidExternalPlayer.seekVodAudioFallback(clamped, !video.paused);
      } catch (_) {}
    }

    // Always use standard currentTime assignment so Chromium/Exo media pipeline issues an exact HTTP 206 Range request
    try {
      video.currentTime = clamped;
    } catch (e) {}

    if (hlsPlayer && typeof hlsPlayer.startLoad === "function") {
      try { hlsPlayer.startLoad(clamped); } catch (_) {}
    }

    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }

    // Watchdog: if the server takes a moment to respond to the Range request, nudge play() without resetting the source
    vodSeekWatchdogTimer = setTimeout(() => {
      vodSeekWatchdogTimer = null;
      if (!isVodSeeking) return;
      if ((currentModus === "vod" || currentModus === "series") && (currentVodMovieId || currentEpisodeId)) {
        if (video.paused && wasPlayingBeforeScrub !== false) {
          const retryPlay = video.play();
          if (retryPlay && typeof retryPlay.catch === "function") retryPlay.catch(() => {});
        }
        if (video.readyState >= 3) {
          isVodSeeking = false;
          hidePlayerLoading();
        }
      }
    }, 3500);

    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    updateVodPlayPauseIcon();
  }

  function updateVodTimelineVisuals(displayedTime, duration) {
    if (!duration || !isFinite(duration)) return;
    const clamped = Math.max(0, Math.min(duration, displayedTime));
    const pct = (clamped / duration) * 100;
    if (vodProgressBar) vodProgressBar.style.width = `${pct}%`;
    if (vodProgressThumb) vodProgressThumb.style.left = `${pct}%`;
    if (vodCurrentTime) vodCurrentTime.textContent = formatTime(clamped);
    if (vodDuration) vodDuration.textContent = formatTime(duration);
    if (vodProgressBuffered && video.buffered && video.buffered.length > 0) {
      try {
        let bufEnd = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          const start = video.buffered.start(i);
          const end = video.buffered.end(i);
          if (clamped >= start - 1 && clamped <= end + 1) {
            bufEnd = end;
            break;
          }
          if (end > bufEnd) bufEnd = end;
        }
        const bufPct = Math.min(100, Math.max(0, (bufEnd / duration) * 100));
        vodProgressBuffered.style.width = `${bufPct}%`;
      } catch (e) {}
    }
  }

  video.addEventListener("loadedmetadata", () => {
    if ((currentModus === "vod" || currentModus === "series") && (currentVodMovieId || currentEpisodeId)) {
      vodHasLoadedMetadata = true;
      clearVodLoadTimer();
      if (pendingVodSeekTime !== null) {
        const target = pendingVodSeekTime;
        pendingVodSeekTime = null;
        try { video.currentTime = target; } catch (_) {}
      }
    }
  });

  video.addEventListener("timeupdate", () => {
    if (isTimelineScrubbing) return;
    if (!video.paused && video.readyState >= 2) {
      isVodSeeking = false;
      hidePlayerLoading();
    }
    if ((currentModus === "vod" || currentModus === "series") && (currentVodMovieId || currentEpisodeId)) {
      if (!vodNativeAudioActive && video.currentTime >= 0.45 && video.currentTime <= 8.0) {
        checkVodAudioSupportAndFallback();
      } else if (vodNativeAudioActive) {
        syncVodAudioCompanion();
      }
    }
    if (video.duration && isFinite(video.duration)) {
      const displayedTime = seekPreviewTime === null ? video.currentTime : seekPreviewTime;
      updateVodTimelineVisuals(displayedTime, video.duration);
    }
  });
  video.addEventListener("seeked", () => {
    isVodSeeking = false;
    if (vodSeekWatchdogTimer) {
      clearTimeout(vodSeekWatchdogTimer);
      vodSeekWatchdogTimer = null;
    }
    if (video.readyState >= 2) {
      hidePlayerLoading();
    }
    if ((currentModus === "vod" || currentModus === "series") && (currentVodMovieId || currentEpisodeId)) {
      if (video.paused && wasPlayingBeforeScrub !== false) {
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
      if (vodNativeAudioActive) {
        syncVodAudioCompanion();
      }
      updateVodPlayPauseIcon();
    }
  });
  video.addEventListener("loadeddata", hidePlayerLoading);

  if (vodTimelineWrapper) {
    let lastScrubInfo = null;
    const computeTimeFromPointer = (clientX) => {
      if (!video.duration || !isFinite(video.duration)) return null;
      const rect = (vodProgressBarContainer || vodTimelineWrapper).getBoundingClientRect();
      if (!rect.width) return null;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return { time: ratio * video.duration, pct: ratio * 100 };
    };

    vodTimelineWrapper.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (!video.duration || !isFinite(video.duration)) return;
      isTimelineScrubbing = true;
      wasPlayingBeforeScrub = !video.paused;
      vodTimelineWrapper.classList.add("is-scrubbing");
      try { vodTimelineWrapper.setPointerCapture(e.pointerId); } catch (err) {}
      const info = computeTimeFromPointer(e.clientX);
      if (info) {
        lastScrubInfo = info;
        updateVodTimelineVisuals(info.time, video.duration);
        if (vodTimelineTooltip) {
          vodTimelineTooltip.textContent = formatTime(info.time);
          vodTimelineTooltip.style.left = `${Math.max(6, Math.min(94, info.pct))}%`;
          vodTimelineTooltip.classList.remove("hidden");
        }
      }
      showVodOSD();
    });

    vodTimelineWrapper.addEventListener("pointermove", (e) => {
      if (!isTimelineScrubbing) return;
      e.stopPropagation();
      const info = computeTimeFromPointer(e.clientX);
      if (info && video.duration && isFinite(video.duration)) {
        lastScrubInfo = info;
        updateVodTimelineVisuals(info.time, video.duration);
        if (vodTimelineTooltip) {
          vodTimelineTooltip.textContent = formatTime(info.time);
          vodTimelineTooltip.style.left = `${Math.max(6, Math.min(94, info.pct))}%`;
          vodTimelineTooltip.classList.remove("hidden");
        }
      }
      showVodOSD();
    });

    const endScrub = (e) => {
      if (!isTimelineScrubbing) return;
      e.stopPropagation();
      isTimelineScrubbing = false;
      vodTimelineWrapper.classList.remove("is-scrubbing");
      if (vodTimelineTooltip) vodTimelineTooltip.classList.add("hidden");
      try { vodTimelineWrapper.releasePointerCapture(e.pointerId); } catch (err) {}
      const info = computeTimeFromPointer(e.clientX) || lastScrubInfo;
      lastScrubInfo = null;
      if (info && video.duration && isFinite(video.duration)) {
        seekPreviewTime = null;
        updateVodTimelineVisuals(info.time, video.duration);
        performReliableVodSeek(info.time);
      }
      showVodOSD();
    };

    vodTimelineWrapper.addEventListener("pointerup", endScrub);
    vodTimelineWrapper.addEventListener("pointercancel", endScrub);
    vodTimelineWrapper.addEventListener("click", (e) => e.stopPropagation());
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  const loginDraftFields = {
    server: serverUrlInput,
    username: usernameInput,
    password: passwordInput,
    m3uUrl: m3uUrlInput,
    m3uProfileName: m3uProfileNameInput,
    method: loginMethod
  };

  function saveLoginDraft() {
    const draft = {};
    Object.keys(loginDraftFields).forEach((name) => {
      const field = loginDraftFields[name];
      if (field) draft[name] = field.value;
    });
    store.setItem("iptv_login_draft", JSON.stringify(draft));
  }

  function restoreLoginDraft() {
    try {
      const draft = JSON.parse(store.getItem("iptv_login_draft") || "{}");
      Object.keys(loginDraftFields).forEach((name) => {
        const field = loginDraftFields[name];
        if (field && draft[name] !== undefined) field.value = draft[name];
      });
    } catch (error) {}
  }

  function normalizeServerUrl(value) {
    let server = (value || "").trim();
    if (server && !/^https?:\/\//i.test(server)) server = `http://${server}`;
    return server.replace(/\/+$/, "");
  }

  function buildXtreamM3uUrl(server, username, password) {
    return `${server}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=ts`;
  }

  function buildXtreamPlaylistFromForm() {
    return buildXtreamM3uUrl(
      normalizeServerUrl(serverUrlInput ? serverUrlInput.value : ""),
      usernameInput ? usernameInput.value.trim() : "",
      passwordInput ? passwordInput.value.trim() : ""
    );
  }

  const XTREAM_OPTION = "__xtream__";

  function getM3uProfiles() {
    try {
      return JSON.parse(store.getItem("iptv_m3u_profiles") || "[]").filter((p) => p && p.url);
    } catch (error) {
      return [];
    }
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
      generateOption.textContent = t("m3uGenerateXtream") || "Xtream M3U";
      m3uProfileSelect.appendChild(generateOption);
    }
    profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.url;
      option.textContent = profile.name;
      m3uProfileSelect.appendChild(option);
    });
    m3uProfileSelect.value = profiles.some((p) => p.url === selectedUrl) ? selectedUrl : "";
  }

  function saveM3uProfile(url, name = "") {
    if (!url) return;
    const profiles = getM3uProfiles();
    const existing = profiles.find((p) => p.url === url);
    if (existing) {
      if (name) existing.name = name;
    } else {
      profiles.push({ name: name || `${t("m3uProfiles")} ${profiles.length + 1}`, url });
    }
    store.setItem("iptv_m3u_profiles", JSON.stringify(profiles));
    renderM3uProfileOptions(url);
  }

  function initProfile() {
    showAppPage();
    if (isTouchLayout()) {
      syncMobileNavState("home");
      initMobileHomeScreen();
    }
    restoreLoginDraft();
    renderM3uProfileOptions();
    let liveProfile = null;
    let vodProfile = null;
    try { liveProfile = JSON.parse(store.getItem("iptv_profile") || "null"); } catch (error) {}
    try { vodProfile = JSON.parse(store.getItem("iptv_xtream_profile") || "null"); } catch (error) {}

    // Clean up legacy auto-generated M3U URL which pointed to /get.php
    if (liveProfile && liveProfile.provider === "m3u" && liveProfile.playlistUrl && liveProfile.playlistUrl.includes("/get.php?")) {
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

    if (liveProfile && liveProfile.provider === "xtream") {
      loginXtream(liveProfile.server, liveProfile.username, liveProfile.password, false);
    } else if (vodProfile && (!liveProfile || liveProfile.provider !== "m3u")) {
      loginXtream(vodProfile.server, vodProfile.username, vodProfile.password, false);
    } else if (liveProfile && liveProfile.provider === "m3u") {
      currentAuth = liveProfile;
      setFavoritesProvider("m3u");
      if (m3uUrlInput) m3uUrlInput.value = currentAuth.playlistUrl || "";
      saveM3uProfile(currentAuth.playlistUrl);
      const cachedFavorites = loadFavoriteCache();
      const fastStart = cachedFavorites.length > 0 && favorites.length > 0;
      if (fastStart) {
        allStreams = cachedFavorites;
        allCategories = [];
        currentLiveRegion = "ALL";
        setLoginState("logging");
        switchModus("favorites");
        if (currentActiveStreams.length > 0 && !isTouchLayout()) {
          const first = currentActiveStreams[0];
          playStream(first.stream_id, first.name, first.stream_icon, 0, first.url);
          activeerFitScreen();
        }
      }
      login(currentAuth.playlistUrl, "", "", true, "m3u", fastStart);
      if (vodProfile) loginXtream(vodProfile.server, vodProfile.username, vodProfile.password, true);
    } else {
      if (loginMethod) {
        loginMethod.value = "xtream";
        loginMethod.dispatchEvent(new Event("change"));
      }
      setLoginState("failed");
      setLoginErrorMessage(t("noSavedProfile"));
    }
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
      const optionalList = async (action) => {
        try {
          const value = await fetchApi(action);
          return Array.isArray(value) ? value : [];
        } catch (error) {
          return [];
        }
      };

      const account = await fetchApi("");
      if (!account || !account.user_info || Number(account.user_info.auth) === 0) {
        throw new Error(t("invalidCredentials"));
      }
      displayAccountInfo(account);

      const liveCats = await optionalList("get_live_categories");
      const vodCats = await optionalList("get_vod_categories");
      const seriesCats = await optionalList("get_series_categories");

      allCategories = Array.isArray(liveCats) ? liveCats : [];
      vodCategories = Array.isArray(vodCats) ? vodCats : [];
      seriesCategories = Array.isArray(seriesCats) ? seriesCats : [];
      try {
        store.setItem("iptv_xtream_cats_cache", JSON.stringify({
          account,
          allCategories,
          vodCategories,
          seriesCategories
        }));
      } catch (e) {}
      vodStreams = [];
      seriesStreams = [];
      Object.keys(loadedCategories).forEach((key) => { delete loadedCategories[key]; });
      xtreamAuth = { server, username, password };
      store.setItem("iptv_xtream_profile", JSON.stringify({ server, username, password }));

      currentAuth = { provider: "xtream", server, username, password };
      store.setItem("iptv_profile", JSON.stringify(currentAuth));
      setFavoritesProvider("xtream");

      setLoginState("logged-in");
      if (background) {
        if (currentModus === "vod" || currentModus === "series" || currentModus === "live") setupRegions();
      } else {
        showAppPage();
        showToast(t("loggedIn"));
        setupRegions();
        if (isTouchLayout()) {
          syncMobileNavState("home");
          initMobileHomeScreen();
        } else {
          switchModus(favorites.length ? "favorites" : "live");
        }
      }
    } catch (error) {
      let restoredFromCache = false;
      try {
        const cached = JSON.parse(store.getItem("iptv_xtream_cats_cache") || "null");
        if (cached && Array.isArray(cached.allCategories) && cached.allCategories.length > 0 && server && username && password) {
          if (cached.account) displayAccountInfo(cached.account);
          allCategories = cached.allCategories || [];
          vodCategories = cached.vodCategories || [];
          seriesCategories = cached.seriesCategories || [];
          xtreamAuth = { server, username, password };
          currentAuth = { provider: "xtream", server, username, password };
          setFavoritesProvider("xtream");
          allStreams = loadFavoriteCache();
          setLoginState("logged-in");
          showAppPage();
          setupRegions();
          if (isTouchLayout()) {
            syncMobileNavState("home");
            initMobileHomeScreen();
          } else {
            switchModus(favorites.length ? "favorites" : "live");
          }
          restoredFromCache = true;
        }
      } catch (e) {}
      if (!restoredFromCache) {
        setLoginState(currentAuth ? "logged-in" : "failed");
        showLoginError(error.message || t("playlistUnavailable"));
        toggleLoginPanel(true);
      }
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
    setElementFocus(document.querySelector("#modusList [data-modus='favorites']"));
  }

  if (settingsButton && settingsPage) {
    settingsButton.addEventListener("click", () => {
      showSettingsPage(true);
    });

    settingsPage.addEventListener("click", (e) => {
      const btn = e.target.closest(".settings-item");
      if (!btn) return;
      const setting = btn.dataset.setting;
      const value = btn.dataset.value || null;
      if (setting) {
        handleSettingsAction(setting, value);
      }
    });

    settingsPage.querySelectorAll(".customization-tab").forEach(tab => {
      tab.addEventListener("focus", () => showSettingsTab(tab.dataset.tab));
      tab.addEventListener("click", () => showSettingsTab(tab.dataset.tab));
    });
  }

  const settingsBack = document.getElementById("settingsBack");
  if (settingsBack) {
    settingsBack.addEventListener("click", () => showSettingsPage(false));
  }

  const headerBackBtn = document.getElementById("headerBackBtn");
  if (headerBackBtn) {
    headerBackBtn.addEventListener("click", () => {
      window.handleAppBack();
    });
  }

  const hintBackBtn = document.getElementById("hintBackBtn");
  if (hintBackBtn) {
    hintBackBtn.addEventListener("click", () => {
      window.handleAppBack();
    });
  }

  const searchCloseBtn = document.getElementById("searchCloseBtn");
  if (searchCloseBtn) {
    searchCloseBtn.addEventListener("click", () => {
      closeSearch();
    });
  }

  const osdFavBtn = document.getElementById("osdFavBtn");
  if (osdFavBtn) {
    osdFavBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentPlayingStreamId) {
        toggleFavorite(currentPlayingStreamId);
      }
    });
  }

  const osdExternalPlayerBtn = document.getElementById("osdExternalPlayerBtn");
  if (osdExternalPlayerBtn) {
    osdExternalPlayerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const liveAuth = currentAuth || xtreamAuth;
      const url = (lastLive && lastLive.directUrl)
        || (lastLive && liveAuth ? `${liveAuth.server}/live/${liveAuth.username}/${liveAuth.password}/${lastLive.streamId}.ts` : "")
        || (currentPlayingStreamId && liveAuth ? `${liveAuth.server}/live/${liveAuth.username}/${liveAuth.password}/${currentPlayingStreamId}.ts` : "");
      if (url && window.AndroidExternalPlayer) {
        window.AndroidExternalPlayer.openPlayer(url);
        showToast("Harici oynatıcıda açılıyor...");
      } else {
        showToast("Oynatılacak akış URL'si bulunamadı");
      }
    });
  }

  const vodExternalPlayerBtn = document.getElementById("vodExternalPlayerBtn");
  if (vodExternalPlayerBtn) {
    vodExternalPlayerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const url = (activeVodCandidates && activeVodCandidates[activeVodCandidateIdx])
        || (activeVodCandidates && activeVodCandidates[0])
        || video.getAttribute("src")
        || "";
      if (url && window.AndroidExternalPlayer) {
        try { video.pause(); } catch (err) {}
        hidePlayerLoading();
        window.AndroidExternalPlayer.openPlayer(url);
        showToast("Harici oynatıcıda açılıyor...");
      } else {
        showToast(t("streamPlaybackFailed"));
      }
    });
  }

  // VOD 3-DOTS PLAYBACK SETTINGS POPOVER LOGIC
  const vodSettingsBtn = document.getElementById("vodSettingsBtn");
  const vodSettingsPopover = document.getElementById("vodSettingsPopover");
  const vodSettingsCloseBtn = document.getElementById("vodSettingsCloseBtn");

  function openVodSettings(show = true) {
    if (!vodSettingsPopover) return;
    if (show) {
      probeNativeVodTracks();
      vodSettingsPopover.classList.remove("hidden");
      if (vodSettingsBtn) vodSettingsBtn.classList.add("active");
    } else {
      vodSettingsPopover.classList.add("hidden");
      if (vodSettingsBtn) vodSettingsBtn.classList.remove("active");
    }
  }

  function probeNativeVodTracks() {
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.getVodTracksJson === "function") {
      try {
        const rawJson = window.AndroidExternalPlayer.getVodTracksJson();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          vodDiscoveredTracks = {
            audioTracks: Array.isArray(parsed.audioTracks) ? parsed.audioTracks : [],
            subtitleTracks: Array.isArray(parsed.subtitleTracks) ? parsed.subtitleTracks : []
          };
        }
      } catch (e) {}
    }
    renderVodAudioTrackList();
    renderVodSubtitleTrackList();
  }

  function renderVodAudioTrackList() {
    const list = document.getElementById("vodAudioTrackList");
    if (!list) return;
    list.innerHTML = "";

    // Default / Stream Native Audio Option (WebView / HTML5)
    const defaultItem = document.createElement("button");
    defaultItem.type = "button";
    defaultItem.className = "vod-track-item" + (!vodNativeAudioActive ? " active" : "");
    defaultItem.innerHTML = `
      <span>Default Stream Audio</span>
      ${!vodNativeAudioActive ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' : ''}
    `;
    defaultItem.onclick = () => {
      vodNativeAudioActive = false;
      video.muted = false;
      if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.stopVodAudioFallback === "function") {
        try { window.AndroidExternalPlayer.stopVodAudioFallback(); } catch (_) {}
      }
      renderVodAudioTrackList();
      showToast("Audio: Default Stream");
    };
    list.appendChild(defaultItem);

    const tracks = vodDiscoveredTracks.audioTracks || [];
    tracks.forEach((track) => {
      const isSelected = vodNativeAudioActive && selectedVodAudioGroup === track.groupIndex && selectedVodAudioTrack === track.trackIndex;
      const item = document.createElement("button");
      item.type = "button";
      item.className = "vod-track-item" + (isSelected ? " active" : "");
      item.innerHTML = `
        <span>${escapeAttr(track.label || `Track ${track.trackIndex + 1}`)}</span>
        ${isSelected ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' : ''}
      `;
      item.onclick = () => {
        selectedVodAudioGroup = track.groupIndex;
        selectedVodAudioTrack = track.trackIndex;
        vodNativeAudioActive = true;
        video.muted = true;
        if (window.AndroidExternalPlayer) {
          try {
            if (typeof window.AndroidExternalPlayer.startVodAudioFallback === "function") {
              window.AndroidExternalPlayer.startVodAudioFallback(activeVodResolvedUrl, video.currentTime || 0, !video.paused);
            }
            if (typeof window.AndroidExternalPlayer.selectVodAudioTrack === "function") {
              window.AndroidExternalPlayer.selectVodAudioTrack(track.groupIndex, track.trackIndex);
            }
          } catch (e) {}
        }
        renderVodAudioTrackList();
        showToast(`Audio: ${track.label}`);
      };
      list.appendChild(item);
    });

    if (tracks.length === 0 && activeVodResolvedUrl) {
      const hint = document.createElement("div");
      hint.style.cssText = "font-size:0.8rem;color:rgba(255,255,255,0.6);padding:6px 0;";
      hint.textContent = "Multi-track audio enabled. ExoPlayer companion active.";
      list.appendChild(hint);
    }
  }

  function renderVodSubtitleTrackList() {
    const list = document.getElementById("vodSubtitleTrackList");
    if (!list) return;
    list.innerHTML = "";

    // Off Option
    const isOff = selectedVodSubtitleGroup === -1 && selectedVodSubtitleTrack === -1;
    const offItem = document.createElement("button");
    offItem.type = "button";
    offItem.className = "vod-track-item" + (isOff ? " active" : "");
    offItem.innerHTML = `
      <span>${t("off") || "Off"}</span>
      ${isOff ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' : ''}
    `;
    offItem.onclick = () => {
      selectedVodSubtitleGroup = -1;
      selectedVodSubtitleTrack = -1;
      const overlay = document.getElementById("vodSubtitleOverlay");
      if (overlay) {
        overlay.innerHTML = "";
        overlay.classList.add("hidden");
      }
      if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.selectVodSubtitleTrack === "function") {
        try { window.AndroidExternalPlayer.selectVodSubtitleTrack(-1, -1); } catch (_) {}
      }
      renderVodSubtitleTrackList();
      showToast("Subtitles: Off");
    };
    list.appendChild(offItem);

    const tracks = vodDiscoveredTracks.subtitleTracks || [];
    tracks.forEach((track) => {
      const isSelected = selectedVodSubtitleGroup === track.groupIndex && selectedVodSubtitleTrack === track.trackIndex;
      const item = document.createElement("button");
      item.type = "button";
      item.className = "vod-track-item" + (isSelected ? " active" : "");
      item.innerHTML = `
        <span>${escapeAttr(track.label || `Subtitle ${track.trackIndex + 1}`)}</span>
        ${isSelected ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' : ''}
      `;
      item.onclick = () => {
        selectedVodSubtitleGroup = track.groupIndex;
        selectedVodSubtitleTrack = track.trackIndex;
        if (window.AndroidExternalPlayer) {
          try {
            if (!vodNativeAudioActive && typeof window.AndroidExternalPlayer.startVodAudioFallback === "function") {
              // Prepare ExoPlayer in background with companion volume 0 so subtitle cues are extracted without hijacking audio
              window.AndroidExternalPlayer.startVodAudioFallback(activeVodResolvedUrl, video.currentTime || 0, !video.paused);
            }
            if (typeof window.AndroidExternalPlayer.selectVodSubtitleTrack === "function") {
              window.AndroidExternalPlayer.selectVodSubtitleTrack(track.groupIndex, track.trackIndex);
            }
          } catch (e) {}
        }
        renderVodSubtitleTrackList();
        showToast(`Subtitles: ${track.label}`);
      };
      list.appendChild(item);
    });

    if (tracks.length === 0) {
      const hint = document.createElement("div");
      hint.style.cssText = "font-size:0.8rem;color:rgba(255,255,255,0.6);padding:6px 0;";
      hint.textContent = "No embedded subtitle tracks found in this stream.";
      list.appendChild(hint);
    }
  }

  function applyVodAspectRatio(aspect) {
    vodAspectRatio = aspect || "contain";
    if (!video) return;
    video.classList.remove("aspect-contain", "aspect-cover", "aspect-fill", "aspect-zoom");
    video.classList.add(`aspect-${vodAspectRatio}`);
    document.querySelectorAll("#vodAspectGroup .vod-option-chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.aspect === vodAspectRatio);
    });
  }

  function applyVodPlaybackSpeed(speed) {
    vodPlaybackSpeed = parseFloat(speed) || 1.0;
    if (video) {
      try { video.playbackRate = vodPlaybackSpeed; } catch (_) {}
    }
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.setVodPlaybackSpeed === "function") {
      try { window.AndroidExternalPlayer.setVodPlaybackSpeed(vodPlaybackSpeed); } catch (_) {}
    }
    document.querySelectorAll("#vodSpeedGroup .vod-option-chip").forEach(chip => {
      chip.classList.toggle("active", parseFloat(chip.dataset.speed) === vodPlaybackSpeed);
    });
  }

  function applyVodSubtitleSize(size) {
    vodSubtitleSize = size || "normal";
    const overlay = document.getElementById("vodSubtitleOverlay");
    if (overlay) {
      overlay.classList.remove("sub-size-small", "sub-size-normal", "sub-size-large");
      overlay.classList.add(`sub-size-${vodSubtitleSize}`);
    }
    document.querySelectorAll("#vodSubtitleSizeGroup .vod-option-chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.subSize === vodSubtitleSize);
    });
  }

  if (vodSettingsBtn) {
    vodSettingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openVodSettings(vodSettingsPopover && vodSettingsPopover.classList.contains("hidden"));
    });
  }

  if (vodSettingsCloseBtn) {
    vodSettingsCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openVodSettings(false);
    });
  }

  document.querySelectorAll(".vod-settings-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.stopPropagation();
      const tabName = tab.dataset.vodTab;
      document.querySelectorAll(".vod-settings-tab").forEach(t => t.classList.toggle("active", t === tab));
      document.querySelectorAll(".vod-settings-pane").forEach(p => p.classList.toggle("hidden", p.dataset.vodPane !== tabName));
    });
  });

  document.querySelectorAll("#vodAspectGroup .vod-option-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      applyVodAspectRatio(chip.dataset.aspect);
    });
  });

  document.querySelectorAll("#vodSpeedGroup .vod-option-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      applyVodPlaybackSpeed(chip.dataset.speed);
    });
  });

  document.querySelectorAll("#vodSubtitleSizeGroup .vod-option-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      applyVodSubtitleSize(chip.dataset.subSize);
    });
  });

  window.handleAppBack = function() {
    if (isFitScreen) {
      enterPipMode();
      return "true";
    }
    const homeViewAll = document.getElementById("homeViewAllPage");
    if (homeViewAll && !homeViewAll.classList.contains("hidden")) {
      if (typeof closeHomeViewAll === "function") closeHomeViewAll();
      else homeViewAll.classList.add("hidden");
      return "true";
    }
    if (customizationPage && !customizationPage.classList.contains("hidden")) {
      showCustomizationPage(false);
      return "true";
    }
    if (settingsPage && !settingsPage.classList.contains("hidden")) {
      showSettingsPage(false);
      return "true";
    }
    if (searchPanel && !searchPanel.classList.contains("hidden")) {
      closeSearch();
      return "true";
    }
    if (selectedSeries) {
      selectedSeries = null;
      filterChannels();
      const poster = channelList.querySelector(".poster-card");
      if (poster) setElementFocus(poster);
      return "true";
    }
    if (movingRegion) {
      const done = movingRegion;
      movingRegion = null;
      setupRegions(true);
      focusRegion(done);
      return "true";
    }
    if (movingStreamId) {
      toggleMoveMode(movingStreamId);
      return "true";
    }
    let colIdx = -1;
    const focused = document.activeElement;
    const parentCol = focused && focused.closest ? focused.closest(".col-nav") : null;
    if (parentCol && parentCol.dataset.col !== undefined) {
      colIdx = parseInt(parentCol.dataset.col, 10);
    } else {
      const openCols = Array.from(document.querySelectorAll(".col-nav:not(.collapsed)"));
      const lastOpen = openCols[openCols.length - 1];
      if (lastOpen && lastOpen.dataset.col !== undefined) {
        colIdx = parseInt(lastOpen.dataset.col, 10);
      }
    }
    if (colIdx > 0) {
      const targetIdx = (currentModus === "favorites") ? 0 : colIdx - 1;
      enterColumn(targetIdx);
      return "true";
    }
    return "false";
  };

  if (loginStateButton) {
    loginStateButton.addEventListener("click", () => {
      const shouldOpen = loginForm.classList.contains("hidden");
      toggleLoginPanel(shouldOpen, shouldOpen);
    });
  }

  if (loginPanelClose) loginPanelClose.addEventListener("click", () => toggleLoginPanel(false));

  const loginTestBtn = document.getElementById("loginTestBtn");
  const testBtnSpinner = document.getElementById("testBtnSpinner");
  const testBtnText = document.getElementById("testBtnText");
  const accountInfoCard = document.getElementById("accountInfoCard");

  function setTestLoading(loading) {
    if (loginTestBtn) loginTestBtn.disabled = loading;
    if (testBtnSpinner) testBtnSpinner.classList.toggle("hidden", !loading);
    if (testBtnText) testBtnText.textContent = loading ? (t("checkingConnection") || "Checking connection...") : (t("testConnection") || "Test connection");
  }

  function displayAccountInfo(data) {
    if (!accountInfoCard) return;
    accountInfoCard.classList.remove("hidden");
    const statusBadge = document.getElementById("accountStatusBadge");
    const expiresBadge = document.getElementById("accountExpiresBadge");
    const expDateEl = document.getElementById("accountExpDate");
    const timeLeftEl = document.getElementById("accountTimeLeft");
    const connEl = document.getElementById("accountConnections");
    const typeEl = document.getElementById("accountType");
    const serverDetailsEl = document.getElementById("accountServerDetails");

    const userInfo = (data && data.user_info) || {};
    const serverInfo = (data && data.server_info) || {};

    const status = userInfo.status || (currentLang === "tr" ? "Aktif" : "Active");
    const isActive = status.toLowerCase() === "active" || status.toLowerCase() === "aktif";
    if (statusBadge) {
      statusBadge.textContent = status;
      statusBadge.classList.toggle("expired", !isActive);
    }

    let expDateStr = currentLang === "tr" ? "Sınırsız / Unlimited" : "Unlimited";
    let timeLeftStr = currentLang === "tr" ? "Sınırsız" : "Unlimited";
    let isExpired = false;

    if (userInfo.exp_date && userInfo.exp_date !== "null" && userInfo.exp_date !== "0") {
      const expSec = Number(userInfo.exp_date);
      if (!isNaN(expSec) && expSec > 0) {
        const expDate = new Date(expSec * 1000);
        expDateStr = expDate.toLocaleDateString(currentLang === "tr" ? "tr-TR" : "en-US", {
          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        });
        const nowSec = Math.floor(Date.now() / 1000);
        const diffSec = expSec - nowSec;
        if (diffSec <= 0) {
          timeLeftStr = currentLang === "tr" ? "Süresi doldu" : "Expired";
          isExpired = true;
        } else {
          const days = Math.floor(diffSec / 86400);
          const hours = Math.floor((diffSec % 86400) / 3600);
          timeLeftStr = currentLang === "tr" ? `${days} gün ${hours} saat kaldı` : `${days} d ${hours} h left`;
        }
      }
    }

    if (isExpired && statusBadge) statusBadge.classList.add("expired");
    if (expiresBadge) {
      expiresBadge.textContent = timeLeftStr;
      expiresBadge.style.color = isExpired ? "var(--md-sys-color-error, #ffb4ab)" : "var(--highlight, #ffd700)";
    }
    if (expDateEl) expDateEl.textContent = expDateStr;
    if (timeLeftEl) {
      timeLeftEl.textContent = timeLeftStr;
      timeLeftEl.style.color = isExpired ? "var(--md-sys-color-error, #ffb4ab)" : "var(--md-sys-color-primary, #a8c7fa)";
    }

    const activeCons = userInfo.active_cons !== undefined ? userInfo.active_cons : "0";
    const maxCons = userInfo.max_connections !== undefined ? userInfo.max_connections : "1";
    if (connEl) connEl.textContent = `${activeCons} / ${maxCons} ${currentLang === "tr" ? "aktif bağlantı" : "active connections"}`;

    const isTrial = userInfo.is_trial === "1";
    if (typeEl) typeEl.textContent = isTrial ? (currentLang === "tr" ? "Deneme (Trial)" : "Trial Account") : (currentLang === "tr" ? "Standart Hesap" : "Standard Account");

    const formats = Array.isArray(userInfo.allowed_output_formats) ? userInfo.allowed_output_formats.join(", ") : "ts, m3u8";
    const srvUrl = serverInfo.url ? `${serverInfo.server_protocol || "http"}://${serverInfo.url}:${serverInfo.port || "8080"}` : (serverUrlInput ? serverUrlInput.value.trim() : "");
    const tz = serverInfo.timezone || "UTC";
    if (serverDetailsEl) serverDetailsEl.textContent = `${srvUrl} (${tz}) · ${currentLang === "tr" ? "Çıktı" : "Output"}: [${formats}]`;
  }

  if (loginTestBtn) {
    loginTestBtn.addEventListener("click", async () => {
      setLoginErrorMessage("");
      if (loginMethod && loginMethod.value === "m3u") {
        const m3uUrl = m3uUrlInput ? m3uUrlInput.value.trim() : "";
        if (!m3uUrl) {
          showLoginError(currentLang === "tr" ? "Lütfen bir M3U URL'si girin." : "Please enter an M3U playlist URL.");
          return;
        }
        setTestLoading(true);
        try {
          const res = await requestText(m3uUrl, 25000);
          if (res.status === 200 && res.body.trim().startsWith("#EXTM3U")) {
            showToast(currentLang === "tr" ? "M3U bağlantısı başarılı!" : "M3U connection successful!");
            if (accountInfoCard) {
              accountInfoCard.classList.remove("hidden");
              const statusBadge = document.getElementById("accountStatusBadge");
              if (statusBadge) { statusBadge.textContent = "Active (M3U)"; statusBadge.classList.remove("expired"); }
              const expiresBadge = document.getElementById("accountExpiresBadge");
              if (expiresBadge) expiresBadge.textContent = currentLang === "tr" ? "Geçerli liste" : "Valid playlist";
              const expDateEl = document.getElementById("accountExpDate");
              if (expDateEl) expDateEl.textContent = "M3U Stream";
              const timeLeftEl = document.getElementById("accountTimeLeft");
              const lineCount = res.body.split("\n").length;
              if (timeLeftEl) timeLeftEl.textContent = `${lineCount} ${currentLang === "tr" ? "satır" : "lines"}`;
              const connEl = document.getElementById("accountConnections");
              if (connEl) connEl.textContent = currentLang === "tr" ? "Doğrudan akış" : "Direct stream";
              const typeEl = document.getElementById("accountType");
              if (typeEl) typeEl.textContent = "M3U Playlist";
              const serverDetailsEl = document.getElementById("accountServerDetails");
              if (serverDetailsEl) serverDetailsEl.textContent = m3uUrl.slice(0, 50) + "...";
            }
          } else {
            showLoginError(`M3U error: ${res.failed || "HTTP " + res.status}`);
          }
        } catch (e) {
          showLoginError(e.message || (currentLang === "tr" ? "Ağ hatası" : "Network error"));
        } finally {
          setTestLoading(false);
        }
        return;
      }

      const server = normalizeServerUrl(serverUrlInput.value);
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!server || !username || !password) {
        showLoginError(currentLang === "tr" ? "Lütfen sunucu adresi, kullanıcı adı ve şifreyi doldurun." : "Please fill in Server URL, Username, and Password.");
        return;
      }

      setTestLoading(true);
      try {
        const apiUrl = `${server}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        const res = await requestText(apiUrl, 25000);
        if (res.status === 200 && res.body.trim()) {
          try {
            const data = JSON.parse(res.body);
            if (data && data.user_info) {
              if (Number(data.user_info.auth) === 0) {
                showLoginError(t("invalidCredentials"));
                return;
              }
              displayAccountInfo(data);
              showToast(currentLang === "tr" ? "Bağlantı başarılı!" : "Connection successful!");
              return;
            }
          } catch (pe) {
            showLoginError((currentLang === "tr" ? "Geçersiz API yanıtı: " : "Invalid API response: ") + res.body.slice(0, 60));
            return;
          }
        }
        showLoginError(`${t("playlistUnavailable")} (${res.failed || "HTTP " + res.status})`);
      } catch (err) {
        showLoginError((currentLang === "tr" ? "Bağlantı kurulamadı: " : "Could not connect: ") + (err.message || "Network error"));
      } finally {
        setTestLoading(false);
      }
    });
  }

  // LOGIN METHOD SLIDER LOGIC
  const loginMethodSlider = document.getElementById("loginMethodSlider");
  function syncLoginMethodSlider(method) {
    if (!loginMethodSlider) return;
    loginMethodSlider.setAttribute("data-active-method", method);
    loginMethodSlider.querySelectorAll(".login-method-option").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.method === method);
    });
  }

  if (loginMethodSlider) {
    loginMethodSlider.querySelectorAll(".login-method-option").forEach(btn => {
      btn.addEventListener("click", () => {
        const method = btn.dataset.method;
        if (loginMethod && loginMethod.value !== method) {
          loginMethod.value = method;
          loginMethod.dispatchEvent(new Event("change"));
        }
      });
    });
  }

  if (loginMethod) {
    loginMethod.addEventListener("change", () => {
      const useM3u = loginMethod.value === "m3u";
      syncLoginMethodSlider(loginMethod.value);
      if (m3uLoginFields) m3uLoginFields.classList.toggle("hidden", !useM3u);
      if (xtreamLoginFields) xtreamLoginFields.classList.toggle("hidden", useM3u);
      if (useM3u) renderM3uProfileOptions(m3uUrlInput ? m3uUrlInput.value.trim() : "");
      setLoginErrorMessage("");
    });
    syncLoginMethodSlider(loginMethod.value);
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

  const androidExternalPlayerToggle = document.getElementById("androidExternalPlayerToggle");
  let useAndroidExternalPlayer = localStorage.getItem("iptv_external_player") === "true";
  if (androidExternalPlayerToggle) {
    androidExternalPlayerToggle.checked = useAndroidExternalPlayer;
    androidExternalPlayerToggle.addEventListener("change", () => {
      useAndroidExternalPlayer = androidExternalPlayerToggle.checked;
      localStorage.setItem("iptv_external_player", String(useAndroidExternalPlayer));
    });
  }

  if (customizationPage) {
    customizationPage.addEventListener("click", e => {
      const swatch = e.target.closest(".color-swatch");
      if (swatch) {
        updateThemeColor(swatch.dataset.colorRole, swatch.dataset.color);
      }
    });
    customizationPage.querySelectorAll(".customization-tab").forEach(tab => {
      tab.addEventListener("focus", () => showCustomizationTab(tab.dataset.tab));
      tab.addEventListener("click", () => showCustomizationTab(tab.dataset.tab));
    });
    customizationPage.querySelectorAll(".customization-nav .settings-item").forEach(item => {
      item.addEventListener("focus", () => centerCustomizationNav(item));
    });
  }

  const customizationDone = document.getElementById("customizationDone");
  if (customizationDone) customizationDone.addEventListener("click", () => showCustomizationPage(false));

  applyThemeConfig();
  applyBackgroundColor(currentBgColor);
  applyMaterialPalette(materialPalette);
  applyUiScale(uiScale);
  applyOsdAppearance();
  applyDeviceLayout(deviceLayout, false);
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

  // Native HTTP bridge on Android bypasses WebView file:// CORS restrictions and header filters
  function requestText(url, timeout = 60000) {
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.fetchHttp === "function") {
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const raw = window.AndroidExternalPlayer.fetchHttp(url, "IPTVSmartersPro", timeout);
            const res = JSON.parse(raw);
            const isOk = res.status >= 200 && res.status < 300;
            resolve({
              status: res.status || 0,
              body: res.body || "",
              failed: isOk ? undefined : (res.failed || (res.status === 0 ? "network" : "http_" + res.status))
            });
          } catch (e) {
            resolve({ status: 0, body: "", failed: e.message || "network" });
          }
        }, 0);
      });
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.timeout = timeout;
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
            list.forEach((s) => {
              if (!known[String(s.stream_id)]) {
                if (!s.url) s.url = `${xtreamAuth.server}/live/${xtreamAuth.username}/${xtreamAuth.password}/${s.stream_id}.ts`;
                allStreams.push(s);
              }
            });
          } else if (kind === "vod") {
            vodStreams = vodStreams.concat(list);
          } else {
            seriesStreams = seriesStreams.concat(list);
          }
          loadedCategories[key] = true;
          if (isTouchLayout() && mobileActiveSection === "home" && typeof renderMobileHomeScreen === "function") {
            renderMobileHomeScreen();
          }
          return true;
        }
        return false;
      } finally {
        delete pendingCategoryLoads[key];
      }
    })();
    return pendingCategoryLoads[key];
  }

  // Temporary diagnostic: shows what the TV really receives from the Xtream API.
  async function runApiProbe(server, username, password) {
    const box = document.createElement("div");
    box.style.cssText = "position:fixed;left:20px;bottom:20px;z-index:9999;max-width:90vw;padding:16px 20px;background:rgba(0,0,0,0.92);border:2px solid #ffd200;color:#fff;font:22px/1.4 monospace;white-space:pre-wrap";
    box.textContent = "API probe running...";
    document.body.appendChild(box);
    const base = `${server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const tests = [["account", ""], ["live_cat", "&action=get_live_categories"], ["vod_cat", "&action=get_vod_categories"]];
    const lines = [];
    const show = () => { box.textContent = "API probe\n" + lines.join("\n"); };
    const describe = (label, started, status, body) => `${label}: HTTP ${status}, ${body.length}B, ${Date.now() - started}ms, "${body.slice(0, 24).replace(/\s+/g, " ")}"`;
    for (const [name, suffix] of tests) {
      const url = base + suffix;
      let started = Date.now();
      try {
        const result = await new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.timeout = 30000;
          xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText || "" });
          xhr.onerror = () => resolve({ status: "net-error", body: "" });
          xhr.ontimeout = () => resolve({ status: "timeout", body: "" });
          xhr.send();
        });
        lines.push(describe(`${name} xhr`, started, result.status, result.body));
      } catch (error) {
        lines.push(`${name} xhr: ${error.message}`);
      }
      started = Date.now();
      try {
        const response = await fetch(url);
        const body = await response.text();
        lines.push(describe(`${name} fetch`, started, response.status, body));
      } catch (error) {
        lines.push(`${name} fetch: ${error.message}`);
      }
      show();
    }
    const playlistStart = Date.now();
    await new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${server.replace(/\/+$/, "")}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=ts`, true);
      xhr.timeout = 30000;
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 2) {
          lines.push(`playlist: HTTP ${xhr.status}, ${xhr.getResponseHeader("content-length") || "?"}B, ${Date.now() - playlistStart}ms`);
          xhr.abort();
          resolve();
        }
      };
      xhr.onerror = () => { lines.push("playlist: net-error"); resolve(); };
      xhr.ontimeout = () => { lines.push("playlist: timeout"); resolve(); };
      xhr.send();
    });
    lines.push(`login: ${username} / ${password.length} chars / ${password.charAt(0)}...${password.slice(-1)}`);
    lines.push("(closes in 40s)");
    show();
    setTimeout(() => box.remove(), 40000);
  }

  async function login(server, username, password, isAuto = false, provider = "xtream", background = false) {
    if (provider === "xtream") return loginXtream(server, username, password, background);
    if (loginErrorToast) loginErrorToast.classList.add("hidden");
    if (loginBtn) loginBtn.disabled = true;
    setLoginState("logging");

    try {
      let startMode = "favorites";
      if (provider === "m3u") {
        if (!server) throw new Error(t("playlistUnavailable"));
        const response = await requestText(server, 180000);
        if (response.status !== 200) throw new Error(`${t("playlistUnavailable")} (${response.status || response.failed})`);
        const content = response.body;
        if (content.replace(/^\s+/, "").indexOf("#EXTM3U") !== 0) throw new Error(t("playlistInvalid"));
        const playlist = parseM3UPlaylist(content);
        if (playlist.streams.length === 0) throw new Error(t("playlistInvalid"));

        allStreams = playlist.streams;
        allCategories = playlist.categories;
        setFavoritesProvider("m3u");
        seedM3uFavorites(playlist.streams);
        currentAuth = { provider: "m3u", playlistUrl: server };
        currentLiveRegion = "ALL";
        startMode = "favorites";
      }

      store.setItem("iptv_profile", JSON.stringify(currentAuth));
      if (provider === "m3u") saveM3uProfile(server, m3uProfileNameInput ? m3uProfileNameInput.value.trim() : "");
      cacheFavoriteStreams();
      if (!favorites.length && startMode === "favorites") startMode = "live";
      updateFavoritesTab();
      setLoginState("logged-in");
      if (background) {
        setupRegions();
        if (currentModus === "favorites") filterChannels();
        return;
      }
      showAppPage();
      switchModus(startMode);

      if (currentActiveStreams.length > 0 && !isTouchLayout()) {
        const firstStream = currentActiveStreams[0];
        playStream(firstStream.stream_id, firstStream.name, firstStream.stream_icon, 0, firstStream.url);
        activeerFitScreen();
      }
    } catch (error) {
      setLoginState("failed");
      showLoginError(error.message || t("playlistUnavailable"));
      toggleLoginPanel(true);
    } finally {
      if (loginBtn) loginBtn.disabled = false;
    }
  }

  function activeerFitScreen() {
    isPipMode = false;
    document.body.classList.remove("player-pip-mode");
    if (playerWrapper) {
      playerWrapper.classList.remove("is-pip-dragging");
      playerWrapper.style.transform = "";
      playerWrapper.style.opacity = "";
    }
    if (pipDismissHint) pipDismissHint.classList.add("hidden");
    isFitScreen = true;
    document.body.classList.add("speler-fit-screen");
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.setFullscreen === "function") {
      window.AndroidExternalPlayer.setFullscreen(true);
    }
    if (deviceLayout === "mobile") {
      if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.requestOrientation === "function") {
        window.AndroidExternalPlayer.requestOrientation("landscape");
      }
    }
    const isVodPlaying = !!(currentVodMovieId || currentEpisodeId);
    if (isVodPlaying && !currentPlayingStreamId) {
      currentModus = currentEpisodeId ? "series" : "vod";
      showVodOSD();
    } else if (currentModus === "live" || currentModus === "favorites") {
      showLiveOSD();
    } else if (currentModus === "vod" || currentModus === "series") {
      showVodOSD();
    }
  }

  function enterPipMode() {
    if (!isFitScreen) return;
    isFitScreen = false;
    isPipMode = true;
    document.body.classList.remove("speler-fit-screen");
    document.body.classList.add("player-pip-mode");
    document.body.classList.add("has-active-stream");
    if (playerWrapper) {
      playerWrapper.classList.remove("hidden", "is-pip-dragging");
      playerWrapper.style.transform = "";
      playerWrapper.style.opacity = "";
    }
    if (pipDismissHint) pipDismissHint.classList.add("hidden");
    if (vodOsdContainer) vodOsdContainer.classList.add("hidden");
    if (vodCenterPlayPauseBtn) vodCenterPlayPauseBtn.classList.add("hidden");
    if (vodPlaybackControls) vodPlaybackControls.classList.add("hidden");
    if (osdContainer) osdContainer.classList.add("hidden");
    if (osdClockBubble) osdClockBubble.classList.add("hidden");
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.setFullscreen === "function") {
      window.AndroidExternalPlayer.setFullscreen(false);
    }
    if (deviceLayout === "mobile") {
      if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.requestOrientation === "function") {
        window.AndroidExternalPlayer.requestOrientation("portrait");
      }
    }
    updateHeaderBackButton();
  }

  function closePipMode() {
    isPipMode = false;
    isFitScreen = false;
    document.body.classList.remove("player-pip-mode", "speler-fit-screen", "has-active-stream");
    if (playerWrapper) {
      playerWrapper.classList.remove("is-pip-dragging");
      playerWrapper.style.transform = "";
      playerWrapper.style.opacity = "";
      playerWrapper.classList.add("hidden");
    }
    if (pipDismissHint) pipDismissHint.classList.add("hidden");
    currentVodMovieId = null;
    currentEpisodeId = null;
    currentPlayingStreamId = null;
    destroyStreamPlayers();
    try {
      video.pause();
      video.removeAttribute("src");
    } catch (e) {}
    if (vodOsdContainer) vodOsdContainer.classList.add("hidden");
    if (vodCenterPlayPauseBtn) vodCenterPlayPauseBtn.classList.add("hidden");
    if (vodPlaybackControls) vodPlaybackControls.classList.add("hidden");
    if (osdContainer) osdContainer.classList.add("hidden");
    if (osdClockBubble) osdClockBubble.classList.add("hidden");
    updateHeaderBackButton();
  }

  function deactiveerFitScreen() {
    isFitScreen = false;
    isPipMode = false;
    document.body.classList.remove("speler-fit-screen", "player-pip-mode");
    if (playerWrapper) {
      playerWrapper.classList.remove("is-pip-dragging");
      playerWrapper.style.transform = "";
      playerWrapper.style.opacity = "";
    }
    if (pipDismissHint) pipDismissHint.classList.add("hidden");
    if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.setFullscreen === "function") {
      window.AndroidExternalPlayer.setFullscreen(false);
    }
    if (deviceLayout === "mobile") {
      if (window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.requestOrientation === "function") {
        window.AndroidExternalPlayer.requestOrientation("portrait");
      }
    }
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
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
      currentVodMovieId = null;
      currentEpisodeId = null;
      destroyStreamPlayers();
      try {
        video.pause();
        video.removeAttribute("src");
      } catch (e) {}
      document.body.classList.remove("has-active-stream");
      playerWrapper.classList.add("hidden");
      if (vodOsdContainer) vodOsdContainer.classList.add("hidden");
      if (vodCenterPlayPauseBtn) vodCenterPlayPauseBtn.classList.add("hidden");
      if (vodPlaybackControls) vodPlaybackControls.classList.add("hidden");
      setTimeout(() => {
        const targetFocus = lastFocusedPoster || document.querySelector("#channelList .poster-card") || document.querySelector(".focusable");
        if (targetFocus) setElementFocus(targetFocus);
      }, 50);
    }
    updateHeaderBackButton();
  }

  function findCurrentColumnIndex() {
    const focused = document.activeElement;
    const parentCol = focused && focused.closest ? focused.closest(".col-nav") : null;
    if (parentCol && parentCol.dataset.col !== undefined) {
      return parseInt(parentCol.dataset.col, 10);
    }
    return 0;
  }

  function setColumnFocus(activeColIdx) {
    if (isTouchLayout()) return;
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
      if (singleMenuMode) {
        col.classList.toggle("collapsed", idx !== activeColIdx);
      } else {
        col.classList.toggle("collapsed", idx < activeColIdx);
      }
    });
  }

  function setupRegions(keepCategories) {
    if (!regionList) return;
    const isVod = (currentModus === "vod" || currentModus === "series");
    let categoriesToUse = currentModus === "series"
      ? (seriesCategories.length ? seriesCategories : vodCategories)
      : (isVod ? vodCategories : allCategories);

    if (appSelectedRegion !== "ALL") {
      const regionFiltered = categoriesToUse.filter(c => isCategoryInRegion(c, isVod, appSelectedRegion));
      if (regionFiltered.length > 0) {
        categoriesToUse = regionFiltered;
      }
    }

    const regions = new Set();
    categoriesToUse.forEach(cat => {
      const reg = extractRegionFromCategory(cat.category_name, isVod);
      if (reg) regions.add(reg);
    });

    let currentActiveRegion = isVod ? currentVodRegion : currentLiveRegion;
    if (appSelectedRegion !== "ALL") {
      currentActiveRegion = appSelectedRegion;
      if (isVod) currentVodRegion = currentActiveRegion;
      else currentLiveRegion = currentActiveRegion;
    } else if (currentActiveRegion !== "ALL" && !regions.has(currentActiveRegion)) {
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

    regionList.innerHTML = `<li class="nav-item focusable${currentActiveRegion === "ALL" ? " active" : ""}" data-region="ALL" tabindex="0">${t("allRegions")}</li>`;

    visible.forEach(reg => {
      const li = document.createElement("li");
      li.className = "nav-item focusable" + (reg === currentActiveRegion ? " active" : "") + (movingRegion === reg ? " moving-region" : "");
      li.dataset.region = reg;
      li.tabIndex = 0;
      const marker = favoriteRegions.indexOf(reg) !== -1 ? "\u2665 " : (topRegions.includes(reg) ? "\u2B50 " : "");
      li.textContent = marker + reg;
      regionList.appendChild(li);
    });
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
    const items = Array.from(regionList.querySelectorAll("li"));
    const position = items.findIndex(li => li.dataset.region === region);
    regionPrefs.hidden[kind].push(region);
    saveRegionPrefs();
    const wasActive = (kind === "vod" ? currentVodRegion : currentLiveRegion) === region;
    setupRegions(!wasActive);
    const remaining = regionList.querySelectorAll("li");
    if (remaining.length) setElementFocus(remaining[Math.min(position, remaining.length - 1)]);
    showToast(t("categoryHidden"));
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
  let searchScope = "all";
  const searchBackBtn = document.getElementById("searchBackBtn");
  const searchClearBtn = document.getElementById("searchClearBtn");

  function openSearch() {
    if (!searchPanel) return;
    searchPanel.classList.remove("hidden");
    if (searchInput) {
      searchInput.value = "";
      if (searchClearBtn) searchClearBtn.classList.add("hidden");
      setElementFocus(searchInput);
    }
    renderSearchResults();
    updateHeaderBackButton();
  }

  function closeSearch() {
    if (!searchPanel) return;
    searchPanel.classList.add("hidden");
    if (searchInput) searchInput.blur();
    if (isTouchLayout() && mobileActiveSection === "search") {
      syncMobileNavState((currentModus === "vod" || currentModus === "series") ? "home" : "live");
    }
    const card = channelList.querySelector(".channel-card.active") || channelList.querySelector(".channel-card");
    setElementFocus(card || document.querySelector("#modusList [data-modus='favorites']"));
    updateHeaderBackButton();
  }

  function normalizeSearchText(str) {
    if (!str) return "";
    return String(str)
      .replace(/[İIı]/g, "i")
      .replace(/[Çç]/g, "c")
      .replace(/[Ğğ]/g, "g")
      .replace(/[Öö]/g, "o")
      .replace(/[Şş]/g, "s")
      .replace(/[Üü]/g, "u")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function damerauLevenshtein(a, b) {
    if (a === b) return 0;
    var la = a.length;
    var lb = b.length;
    if (Math.abs(la - lb) > 2) return 99;
    var d = [];
    for (var i = 0; i <= la; i++) d[i] = [i];
    for (var j = 0; j <= lb; j++) d[0][j] = j;
    for (var i = 1; i <= la; i++) {
      for (var j = 1; j <= lb; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[la][lb];
  }

  function fuzzyWordMatch(qWord, tWords) {
    if (qWord.length <= 2) return false;
    var maxDist = qWord.length <= 4 ? 1 : 2;
    for (var i = 0; i < tWords.length; i++) {
      var tw = tWords[i];
      if (tw.length < 2) continue;
      if (tw.indexOf(qWord) !== -1 || qWord.indexOf(tw) !== -1) return true;
      if (Math.abs(tw.length - qWord.length) <= maxDist) {
        if (damerauLevenshtein(qWord, tw) <= maxDist) return true;
      }
    }
    return false;
  }

  function searchScore(targetName, qNorm, qWords, qCompact) {
    if (!targetName) return 0;
    var tNorm = normalizeSearchText(targetName);
    if (tNorm.indexOf(qNorm) !== -1) return 3;
    if (qWords.every(function(w) { return tNorm.indexOf(w) !== -1; })) return 2;
    var tCompact = tNorm.replace(/[^a-z0-9]/g, "");
    if (qCompact.length >= 3 && tCompact.indexOf(qCompact) !== -1) return 2;
    var tWords = tNorm.split(/[^a-z0-9]+/).filter(Boolean);
    if (qWords.every(function(w) { return tNorm.indexOf(w) !== -1 || fuzzyWordMatch(w, tWords); })) return 1;
    return 0;
  }

  function renderSearchResults() {
    const rawVal = searchInput ? searchInput.value.trim() : "";
    if (searchClearBtn) searchClearBtn.classList.toggle("hidden", !rawVal);
    const qNorm = normalizeSearchText(rawVal);
    const qWords = qNorm.split(/\s+/).filter(Boolean);
    const qCompact = qNorm.replace(/[^a-z0-9]/g, "");
    searchHits = [];

    if (qWords.length > 0 && qWords.join("").length >= 2) {
      // 1. Live TV channels
      if (searchScope === "all" || searchScope === "live") {
        for (let i = 0; i < allStreams.length && searchHits.length < 50; i++) {
          const item = allStreams[i];
          const score = searchScore(item.name, qNorm, qWords, qCompact);
          if (score > 0) {
            searchHits.push({ type: "live", item: item, rawIndex: i, score: score });
          }
        }
      }

      // 2. Movies (VOD)
      if (searchScope === "all" || searchScope === "vod") {
        for (let i = 0; i < vodStreams.length && searchHits.length < 100; i++) {
          const item = vodStreams[i];
          const score = searchScore(item.name || item.title, qNorm, qWords, qCompact);
          if (score > 0) {
            searchHits.push({ type: "vod", item: item, score: score });
          }
        }
      }

      // 3. Series
      if (searchScope === "all" || searchScope === "series") {
        for (let i = 0; i < seriesStreams.length && searchHits.length < 150; i++) {
          const item = seriesStreams[i];
          const score = searchScore(item.name || item.title, qNorm, qWords, qCompact);
          if (score > 0) {
            searchHits.push({ type: "series", item: item, score: score });
          }
        }
      }

      // Rank exact & substring matches before typo matches
      searchHits.sort(function(a, b) { return b.score - a.score; });
    }

    if (!searchResults) return;
    searchResults.innerHTML = "";

    searchHits.forEach((entry, index) => {
      const item = entry.item;
      const li = document.createElement("li");
      li.className = "search-result-card focusable";
      li.tabIndex = 0;
      li.dataset.searchIndex = index;

      const title = cleanTitle(item.name || item.title || "", QUALITY_TAGS);
      const iconUrl = item.stream_icon || item.cover || "";
      const typeBadges = {
        live: '<svg class="ui-svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg> Live TV',
        vod: '<svg class="ui-svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg> Movie',
        series: '<svg class="ui-svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg> Series'
      };
      const fallbackSvg = entry.type === "vod"
        ? '<svg class="ui-svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>'
        : entry.type === "series"
        ? '<svg class="ui-svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>'
        : '<svg class="ui-svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>';
      const thumbHtml = iconUrl
        ? `<img src="${iconUrl}" class="search-result-thumb" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="search-result-thumb" style="display:none;">${fallbackSvg}</div>`
        : `<div class="search-result-thumb">${fallbackSvg}</div>`;

      li.innerHTML = `
        ${thumbHtml}
        <div class="search-result-info">
          <span class="search-result-title">${title}</span>
          <span class="search-result-badge">${typeBadges[entry.type] || entry.type}</span>
        </div>
      `;
      searchResults.appendChild(li);
    });

    if (searchEmpty) {
      searchEmpty.classList.toggle("hidden", searchHits.length > 0 || rawVal.length < 2);
    }
  }

  function playSearchResult(index) {
    const entry = searchHits[index];
    if (!entry) return;
    const item = entry.item;
    closeSearch();

    if (entry.type === "live") {
      currentActiveStreams = [item];
      playStream(item.stream_id, item.name, item.stream_icon, 0, item.url);
      activeerFitScreen();
    } else if (entry.type === "vod") {
      playVodMovie(item.stream_id, item.name || item.title, item.container_extension || "mp4", item.url || item.direct_source || "");
    } else if (entry.type === "series") {
      const fakeCard = { dataset: { seriesId: item.series_id || item.stream_id, title: item.name || item.title } };
      openSeries(fakeCard);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(renderSearchResults, 200);
    });
    searchInput.addEventListener("focus", () => {
      const wrapper = searchInput.closest(".search-input-wrapper");
      if (wrapper) wrapper.classList.add("focused");
    });
    searchInput.addEventListener("blur", () => {
      const wrapper = searchInput.closest(".search-input-wrapper");
      if (wrapper) wrapper.classList.remove("focused");
    });
  }
  if (searchResults) {
    searchResults.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (li && li.dataset.searchIndex !== undefined) {
        playSearchResult(parseInt(li.dataset.searchIndex, 10));
      }
    });
  }
  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchClearBtn.classList.add("hidden");
        renderSearchResults();
        searchInput.focus();
      }
    });
  }
  if (searchBackBtn) {
    searchBackBtn.addEventListener("click", () => closeSearch());
  }
  document.querySelectorAll(".search-scope-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".search-scope-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      searchScope = chip.dataset.scope || "all";
      renderSearchResults();
    });
  });

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
    categoryList.innerHTML = "";

    const isVod = (currentModus === "vod" || currentModus === "series");
    let categoriesToUse = currentModus === "series"
      ? (seriesCategories.length ? seriesCategories : vodCategories)
      : (isVod ? vodCategories : allCategories);

    if (appSelectedRegion !== "ALL") {
      const regionFiltered = categoriesToUse.filter(c => isCategoryInRegion(c, isVod, appSelectedRegion));
      if (regionFiltered.length > 0) {
        categoriesToUse = regionFiltered;
      }
    }

    const activeRegion = isVod ? currentVodRegion : currentLiveRegion;

    const hiddenIds = hiddenCategories[categoryKind()];
    let filtered = categoriesToUse.filter(cat => {
      if (hiddenIds.indexOf(String(cat.category_id)) !== -1) return false;
      if (activeRegion !== "ALL" && !isCategoryInRegion(cat, isVod, activeRegion)) return false;
      if (categorySearchQuery) {
        const cqNorm = normalizeSearchText(categorySearchQuery);
        const cqWords = cqNorm.split(/\s+/).filter(Boolean);
        const cqCompact = cqNorm.replace(/[^a-z0-9]/g, "");
        if (searchScore(cleanTitle(cat.category_name, ["HEVC", "VIP"]), cqNorm, cqWords, cqCompact) === 0) return false;
      }
      return true;
    });

    // Group categories with trailing numbers/years
    filtered = groupCategoriesByTrailingNumber(filtered);

    // Sort favorite categories to top
    const favCatIds = (categoryFavorites && categoryFavorites[categoryKind()]) ? categoryFavorites[categoryKind()] : [];
    filtered.sort((a, b) => {
      const aFav = favCatIds.indexOf(String(a.category_id)) !== -1 ? 1 : 0;
      const bFav = favCatIds.indexOf(String(b.category_id)) !== -1 ? 1 : 0;
      return bFav - aFav;
    });

    filtered.forEach((cat, index) => {
      const li = document.createElement("li");
      const isFav = favCatIds.indexOf(String(cat.category_id)) !== -1;
      li.className = "nav-item focusable" + (index === 0 ? " active" : "") + (isFav ? " is-favorite-category" : "");
      li.dataset.catId = cat.category_id;
      li.tabIndex = 0;
      const baseLabel = cleanTitle(cat.category_name, ["HEVC", "VIP"]);
      if (cat.isGrouped && cat.subCategories) {
        li.innerHTML = `<span>${escapeAttr(baseLabel)}</span><span class="cat-group-badge">${cat.subCategories.length}</span>`;
      } else {
        li.textContent = baseLabel;
      }
      categoryList.appendChild(li);
    });

    if (filtered.length > 0) {
      currentCategoryId = filtered[0].category_id;
      activeSubCategoryId = "all";
      updateCategorySubFilterBar(filtered[0]);
      filterChannels();
    } else if (channelList) {
      channelList.innerHTML = "";
      updateCategorySubFilterBar(null);
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
        if (episode.url || episode.direct_source) {
          card.dataset.directUrl = episode.url || episode.direct_source;
        }
        card.dataset.title = episode.title || episode.name || `Episode ${episode.episode_num || ""}`;
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

  function renderTouchSeriesModal(isLoading = false) {
    const page = document.getElementById("homeViewAllPage");
    const titleEl = document.getElementById("viewAllTitle");
    const catBar = document.getElementById("viewAllCategoriesBar");
    const grid = document.getElementById("viewAllGrid");
    if (!page || !grid || !selectedSeries) return;

    if (titleEl) titleEl.textContent = cleanTitle(selectedSeries.title || t("series"));
    grid.innerHTML = "";
    grid.className = "home-view-all-grid series-episodes-grid";

    if (catBar) {
      catBar.innerHTML = "";
    }

    if (isLoading) {
      const loading = document.createElement("div");
      loading.className = "season-heading";
      loading.textContent = t("loadingEpisodes");
      grid.appendChild(loading);
      page.classList.remove("hidden");
      updateHeaderBackButton();
      return;
    }

    if (!selectedSeries.seasons || selectedSeries.seasons.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "season-heading";
      emptyState.textContent = t("noEpisodes");
      grid.appendChild(emptyState);
      page.classList.remove("hidden");
      updateHeaderBackButton();
      return;
    }

    let activeSeasonIndex = 0;

    const renderSeasonEpisodes = (seasonIdx) => {
      grid.innerHTML = "";
      const seasonsToShow = seasonIdx === -1 ? selectedSeries.seasons : [selectedSeries.seasons[seasonIdx]].filter(Boolean);
      seasonsToShow.forEach(season => {
        if (seasonsToShow.length > 1) {
          const heading = document.createElement("div");
          heading.className = "season-heading";
          heading.textContent = season.name;
          grid.appendChild(heading);
        }
        (season.episodes || []).forEach(episode => {
          const episodeId = episode.id || episode.stream_id;
          if (!episodeId) return;
          const card = document.createElement("button");
          card.type = "button";
          card.className = "episode-card focusable";
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
          card.appendChild(episodeNumber);
          card.appendChild(episodeTitle);

          card.addEventListener("click", () => {
            playSeriesEpisode(episodeId, card.dataset.title, card.dataset.containerExtension, episode.url || episode.direct_source || "");
          });
          grid.appendChild(card);
        });
      });
    };

    if (catBar && selectedSeries.seasons.length > 1) {
      selectedSeries.seasons.forEach((season, idx) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "home-view-all-cat-chip" + (idx === activeSeasonIndex ? " active" : "");
        chip.textContent = season.name;
        chip.onclick = () => {
          activeSeasonIndex = idx;
          catBar.querySelectorAll(".home-view-all-cat-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          renderSeasonEpisodes(idx);
        };
        catBar.appendChild(chip);
      });
    }

    renderSeasonEpisodes(activeSeasonIndex);
    page.classList.remove("hidden");
    updateHeaderBackButton();
  }

  async function openSeries(seriesCard) {
    const seriesId = seriesCard && seriesCard.dataset ? seriesCard.dataset.seriesId : null;
    const auth = xtreamAuth || (currentAuth && currentAuth.provider === "xtream" ? currentAuth : null);
    if (!auth) {
      showToast(t("xtreamRequiredForVod"));
      return;
    }
    if (!seriesId) {
      showToast(t("unableLoad"));
      return;
    }

    currentModus = "series";
    selectedSeries = { id: seriesId, title: seriesCard.dataset.title, seasons: [] };
    if (isTouchLayout()) {
      renderTouchSeriesModal(true);
    } else {
      channelList.innerHTML = "";
      contentTitle.textContent = selectedSeries.title;
      const loading = document.createElement("div");
      loading.className = "season-heading";
      loading.textContent = t("loadingEpisodes");
      channelList.appendChild(loading);
    }

    try {
      const url = `${auth.server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(auth.username)}&password=${encodeURIComponent(auth.password)}&action=get_series_info&series_id=${encodeURIComponent(seriesId)}`;
      const response = await requestText(url);
      if (response.status !== 200 || !response.body.trim()) throw new Error("Series details unavailable");
      const info = JSON.parse(response.body);
      const episodes = info.episodes || {};
      const seasonKeys = Array.isArray(episodes) ? ["Episodes"] : Object.keys(episodes).sort((a, b) => Number(a) - Number(b));

      selectedSeries.seasons = seasonKeys.map(seasonKey => {
        const seasonEpisodes = Array.isArray(episodes) ? episodes : episodes[seasonKey];
        return {
          number: Array.isArray(episodes) ? "" : seasonKey,
          name: Array.isArray(episodes) ? "Episodes" : t("season", { number: seasonKey }) || `Season ${seasonKey}`,
          episodes: Array.isArray(seasonEpisodes) ? seasonEpisodes : []
        };
      }).filter(season => season.episodes.length > 0);
      if (isTouchLayout()) {
        renderTouchSeriesModal(false);
      } else {
        renderSeriesEpisodes();
        const firstEpisode = channelList.querySelector(".episode-card");
        setElementFocus(firstEpisode || channelList.querySelector(".series-back"));
      }
    } catch (error) {
      selectedSeries = null;
      if (isTouchLayout()) {
        closeHomeViewAll();
      } else {
        filterChannels();
      }
      showToast(`${t("unableLoad")}: ${error && error.message ? error.message : error}`);
    }
  }

  // Posters load only near the viewport; thousands of image requests stall the TV.
  function loadVisiblePosters() {
    const height = window.innerHeight || 720;
    const images = channelList ? channelList.querySelectorAll("img[data-src]") : [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const rect = img.getBoundingClientRect();
      if (rect.bottom > -height * 0.5 && rect.top < height * 1.5) {
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

  function filterChannels() {
    if (!channelList) return;
    channelList.innerHTML = "";

    const loadKind = currentModus === "vod" ? "vod"
      : (currentModus === "series" && !selectedSeries) ? "series"
      : (currentModus === "live" && xtreamAuth) ? "live" : null;
    if (loadKind && xtreamAuth && currentCategoryId !== null
        && !loadedCategories[`${loadKind}:${currentCategoryId}`]) {
      const requestedModus = currentModus;
      const requestedCategory = currentCategoryId;
      const note = document.createElement(channelList.tagName === "UL" ? "li" : "div");
      note.className = "season-heading";
      note.textContent = t("connecting");
      channelList.appendChild(note);
      loadXtreamCategory(loadKind, requestedCategory).then((ok) => {
        if (!ok) {
          loadedCategories[`${loadKind}:${requestedCategory}`] = true;
          showToast(t("playlistUnavailable"));
        }
        if (currentModus === requestedModus && currentCategoryId === requestedCategory) filterChannels();
      });
      return;
    }

    if (currentModus === "vod" || currentModus === "series") {
      if (!isPipMode && !isFitScreen) playerWrapper.classList.add("hidden");
      colContent.classList.add("vod-mode-active");
      channelList.className = "netflix-grid";
      contentTitle.textContent = t(currentModus === "vod" ? "movies" : "series");

      if (currentModus === "series" && selectedSeries) {
        renderSeriesEpisodes();
        return;
      }

      let streamsToUse = (currentModus === "vod") ? vodStreams : seriesStreams;
      let targetCatIds = new Set();
      if (activeCategoryGroupData && activeCategoryGroupData.subCategories) {
        if (activeSubCategoryId && activeSubCategoryId !== "all") {
          targetCatIds.add(String(activeSubCategoryId));
        } else {
          activeCategoryGroupData.subCategories.forEach(sub => targetCatIds.add(String(sub.category_id)));
        }
      } else {
        targetCatIds.add(String(currentCategoryId));
      }

      let filteredVod = streamsToUse.filter(s => targetCatIds.has(String(s.category_id)));
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
        if (item.url || item.direct_source) {
          div.dataset.directUrl = item.url || item.direct_source;
        }
        const displayTitle = cleanTitle(item.name || item.title || "");
        div.dataset.title = displayTitle;

        const posterSrc = item.stream_icon || item.cover || "";
        const fallbackIcon = currentModus === "series"
          ? '<svg class="ui-svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>'
          : '<svg class="ui-svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>';
        div.innerHTML = `
          <div class="poster-img-container">
            ${posterSrc ? `<img src="${posterSrc}" class="poster-img" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}
            <div class="poster-fallback-icon" style="${posterSrc ? 'display:none;' : 'display:flex;'}">${fallbackIcon}</div>
          </div>
          <div class="poster-info">
            <div class="poster-title">${displayTitle}</div>
          </div>
        `;
        channelList.appendChild(div);
      });
      setTimeout(loadVisiblePosters, 0);
      applyPendingFocus();
      return;
    }

    playerWrapper.classList.remove("hidden");
    colContent.classList.remove("vod-mode-active");
    channelList.className = "channel-grid";
    contentTitle.textContent = t("channels");

    currentActiveStreams = currentModus === "favorites"
      ? favorites.map(id => allStreams.find(s => s.stream_id.toString() === id.toString())).filter(Boolean)
      : allStreams.filter(s => String(s.category_id) === String(currentCategoryId));

    if (currentModus === "favorites" && currentActiveStreams.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.className = "season-heading";
      emptyLi.style.padding = "24px";
      emptyLi.style.textAlign = "center";
      emptyLi.style.color = "var(--text-dim)";
      emptyLi.textContent = t("emptyFavorites");
      channelList.appendChild(emptyLi);
      return;
    }

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
        ? `<img data-src="${s.stream_icon}" class="channel-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="channel-logo-placeholder" style="display:none;">TV</div>`
        : `<div class="channel-logo-placeholder">TV</div>`;

      const favBtnHtml = `
        <button type="button" class="channel-fav-btn ${isFav ? 'active' : ''}" data-stream-id="${s.stream_id}" title="${t(isFav ? 'favoritesRemoved' : 'favoritesAdded')}" aria-label="${t(isFav ? 'favoritesRemoved' : 'favoritesAdded')}">
          <svg style="width:22px;height:22px;" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </button>
      `;

      li.innerHTML = `
        <span class="channel-number">${numStr}</span>
        ${logoHtml}
        <span class="channel-name">${cleanTitle(s.name, currentModus === "favorites" ? [] : QUALITY_TAGS)}</span>
        ${favBtnHtml}
      `;
      channelList.appendChild(li);
    });
    const activeCard = channelList.querySelector(".channel-card.active");
    if (activeCard) centerInList(activeCard, true);
    loadVisiblePosters();
    applyPendingFocus();

    if (!currentPlayingStreamId && !isPipMode && currentActiveStreams.length > 0 && currentModus === "live" && !isTouchLayout()) {
      const first = currentActiveStreams[0];
      playStream(first.stream_id, first.name, first.stream_icon, 0, first.url);
    }
  }

  function switchModus(modus) {
    if (modus !== currentModus) selectedSeries = null;
    currentModus = modus;
    document.body.classList.toggle("favorites-mode", modus === "favorites");
    document.querySelectorAll("#modusList .nav-item").forEach(el => el.classList.toggle("active", el.dataset.modus === modus));

    if (isTouchLayout()) {
      if (modus === "vod" || modus === "series") {
        syncMobileNavState("home");
      } else if (modus === "live" || modus === "favorites") {
        syncMobileNavState("live");
      }
    }

    if (headerModeIndicator) {
      const modeKeys = { favorites: "modeFavorites", live: "modeLive", vod: "modeMovies", series: "modeSeries" };
      const modeSvgs = {
        favorites: '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        live: '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>',
        vod: '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
        series: '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>'
      };
      headerModeIndicator.innerHTML = (modeSvgs[modus] || "") + ` <span>${t(modeKeys[modus]) || "TV"}</span>`;
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
    const focusedNow = document.activeElement;
    const wasInList = !!(focusedNow && focusedNow.closest && focusedNow.closest("#channelList"));
    const listPosition = wasInList ? Array.prototype.indexOf.call(channelList.children, focusedNow) : -1;
    if (idx >= 0) {
      favorites.splice(idx, 1);
      showToast(t("favoritesRemoved"));
    } else {
      favorites.push(sId);
      showToast(t("favoritesAdded"));
    }
    saveFavorites(favorites);
    cacheFavoriteStreams();
    updateFavoritesTab();
    const osdFavBtn = document.getElementById("osdFavBtn");
    if (osdFavBtn && currentPlayingStreamId) {
      const isFav = favorites.includes(String(currentPlayingStreamId));
      osdFavBtn.classList.toggle("active", isFav);
      osdFavBtn.setAttribute("aria-pressed", String(isFav));
    }
    filterChannels();
    if (wasInList) {
      const cards = channelList.querySelectorAll(".focusable");
      const sameCard = channelList.querySelector(`[data-stream-id="${escapeAttr(sId)}"]`);
      const target = sameCard || cards[Math.max(0, Math.min(cards.length - 1, listPosition))];
      if (target) setElementFocus(target);
    }
  }

  function toggleMoveMode(streamId) {
    if (currentModus !== "favorites") {
      showToast(t("moveOnlyFavorites"));
      return;
    }
    if (!streamId) return;
    const sId = streamId.toString();
    if (!movingStreamId) {
      movingStreamId = sId;
      moveBanner.classList.remove("hidden");
      showToast(t("moveStarted"));
    } else {
      movingStreamId = null;
      moveBanner.classList.add("hidden");
      showToast(t("positionSaved"));
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
      }
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
    if (osdEpgCurrTime) osdEpgCurrTime.textContent = "--:--";
    if (osdEpgNextTitle) osdEpgNextTitle.textContent = t("noNextProgram");
    if (osdEpgNextTime) osdEpgNextTime.textContent = "--:--";
  }

  async function fetchEPGData(streamId) {
    resetEpgTexts();
    const epgId = epgStreamIdFor(streamId);
    if (!epgId) return;
    try {
      const result = await requestText(`${xtreamAuth.server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(xtreamAuth.username)}&password=${encodeURIComponent(xtreamAuth.password)}&action=get_short_epg&stream_id=${epgId}&limit=3`, 15000);
      if (result.status !== 200 || !result.body.trim()) return;
      // Ignore a late reply for a channel the user already left.
      if (String(currentPlayingStreamId) !== String(streamId)) return;
      const data = JSON.parse(result.body);
      if (!data || !data.epg_listings || data.epg_listings.length === 0) return;
      const epgs = data.epg_listings;
      const b64 = (str) => { try { return decodeURIComponent(escape(atob(str))); } catch (e) { return str; } };
      const pad2 = (n) => (n < 10 ? "0" : "") + n;
      const clock = (listing, field) => {
        const stamp = Number(listing[field + "_timestamp"]);
        if (stamp) {
          const d = new Date(stamp * 1000);
          return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
        }
        return listing[field] ? listing[field].substring(11, 16) : "";
      };

      const cTitle = b64(epgs[0].title || t("liveNow"));
      const cTime = `${clock(epgs[0], "start")} - ${clock(epgs[0], "end")}`;
      document.getElementById("epgCurrTitle").textContent = cTitle;
      document.getElementById("epgCurrTime").textContent = cTime;
      if (osdEpgCurrTitle) osdEpgCurrTitle.textContent = cTitle;
      if (osdEpgCurrTime) osdEpgCurrTime.textContent = cTime;

      if (epgs[1]) {
        const nTitle = b64(epgs[1].title || t("noNextProgram"));
        const nTime = clock(epgs[1], "start");
        document.getElementById("epgNextTitle").textContent = nTitle;
        document.getElementById("epgNextTime").textContent = nTime;
        if (osdEpgNextTitle) osdEpgNextTitle.textContent = nTitle;
        if (osdEpgNextTime) osdEpgNextTime.textContent = nTime;
      }
    } catch (error) {}
  }

  let lastLive = null;
  let liveReconnectTimer = null;
  let liveReconnectAttempts = 0;
  let watchdogTime = -1;
  let watchdogTicks = 0;

  function scheduleLiveReconnect() {
    if (!lastLive || liveReconnectTimer) return;
    liveReconnectAttempts += 1;
    const delay = Math.min(2000 * liveReconnectAttempts, 10000);
    liveReconnectTimer = setTimeout(() => {
      liveReconnectTimer = null;
      if (!lastLive) return;
      const s = lastLive;
      playStream(s.streamId, s.name, s.icon, s.index, s.directUrl, true);
    }, delay);
  }

  // Live streams that freeze without raising an error are restarted after ~12s.
  setInterval(() => {
    if (!lastLive || liveReconnectTimer || video.paused) {
      watchdogTicks = 0;
      return;
    }
    if (video.currentTime === watchdogTime) {
      watchdogTicks += 1;
      if (watchdogTicks >= 3) {
        watchdogTicks = 0;
        scheduleLiveReconnect();
      }
    } else {
      watchdogTime = video.currentTime;
      watchdogTicks = 0;
    }
  }, 4000);

  const playerLoadingOverlay = document.getElementById("playerLoadingOverlay");
  const playerLoadingText = document.getElementById("playerLoadingText");
  let vodLoadTimer = null;
  let vodFallbackAttempted = false;
  let activeVodCandidates = [];
  let activeVodCandidateIdx = 0;

  function clearVodLoadTimer() {
    if (vodLoadTimer) {
      clearTimeout(vodLoadTimer);
      vodLoadTimer = null;
    }
  }

  function showPlayerLoading(text) {
    if (playerLoadingOverlay) {
      if (playerLoadingText && text) playerLoadingText.textContent = text;
      playerLoadingOverlay.classList.remove("hidden");
    }
  }

  function hidePlayerLoading() {
    clearVodLoadTimer();
    if (playerLoadingOverlay) {
      playerLoadingOverlay.classList.add("hidden");
    }
  }

  function tryNextVodCandidateOrFail(reason = "") {
    if (currentModus !== "vod" && currentModus !== "series") return;
    if (!currentVodMovieId && !currentEpisodeId) return;

    if (activeVodCandidates.length > 0 && activeVodCandidateIdx + 1 < activeVodCandidates.length) {
      activeVodCandidateIdx += 1;
      const nextUrl = activeVodCandidates[activeVodCandidateIdx];
      startVodUrlPlayback(nextUrl, false);
      return;
    }

    if (currentModus === "vod" && currentVodMovieId && !vodFallbackAttempted && xtreamAuth) {
      vodFallbackAttempted = true;
      const infoUrl = `${xtreamAuth.server.replace(/\/+$/, "")}/player_api.php?username=${encodeURIComponent(xtreamAuth.username)}&password=${encodeURIComponent(xtreamAuth.password)}&action=get_vod_info&vod_id=${encodeURIComponent(currentVodMovieId)}`;
      requestText(infoUrl, 10000).then((res) => {
        if (currentModus !== "vod" || !currentVodMovieId) return;
        if (res && res.status === 200 && res.body) {
          try {
            const data = JSON.parse(res.body);
            const md = (data && data.movie_data) || {};
            const infoDirect = md.direct_source || (data && data.info && data.info.direct_source) || "";
            const infoExt = md.container_extension || "";
            const extra = buildVodCandidateUrls("movie", currentVodMovieId, infoExt, infoDirect, xtreamAuth);
            const unseen = extra.filter(u => !activeVodCandidates.includes(u));
            if (unseen.length > 0) {
              activeVodCandidates = activeVodCandidates.concat(unseen);
              activeVodCandidateIdx += 1;
              startVodUrlPlayback(activeVodCandidates[activeVodCandidateIdx], false);
              return;
            }
          } catch (e) {}
        }
        hidePlayerLoading();
        const errDetail = reason ? ` (${reason})` : "";
        showToast(`${t("streamPlaybackFailed")}${errDetail}`);
      }).catch(() => {
        hidePlayerLoading();
        const errDetail = reason ? ` (${reason})` : "";
        showToast(`${t("streamPlaybackFailed")}${errDetail}`);
      });
      return;
    }

    hidePlayerLoading();
    const errDetail = reason ? ` (${reason})` : "";
    showToast(`${t("streamPlaybackFailed")}${errDetail}`);
  }

  let vodPlaybackSessionId = 0;

  function startVodUrlPlayback(url, resetCandidates = false) {
    if (!url) {
      hidePlayerLoading();
      showToast(t("streamPlaybackFailed"));
      return;
    }

    vodHasLoadedMetadata = false;
    isVodSeeking = false;
    pendingVodSeekTime = null;
    stopVodAudioCompanion();
    activeVodResolvedUrl = url;
    const sessionId = ++vodPlaybackSessionId;

    clearVodLoadTimer();
    vodLoadTimer = setTimeout(() => {
      if (sessionId !== vodPlaybackSessionId) return;
      if ((currentModus === "vod" || currentModus === "series") && (currentVodMovieId || currentEpisodeId)) {
        if (!vodHasLoadedMetadata && video.readyState < 1) {
          tryNextVodCandidateOrFail("timeout");
        }
      }
    }, 12000);

    if (hlsPlayer) {
      try { hlsPlayer.destroy(); } catch (e) {}
      hlsPlayer = null;
    }
    if (mpegTsPlayer) {
      try { mpegTsPlayer.destroy(); } catch (e) {}
      mpegTsPlayer = null;
    }

    try {
      video.pause();
    } catch (e) {}

    const beginStreamWithUrl = (finalUrl) => {
      if (sessionId !== vodPlaybackSessionId) return;
      activeVodResolvedUrl = finalUrl;
      if (window.Hls && Hls.isSupported() && /\.m3u8(?:$|[?#])/i.test(finalUrl)) {
        playWithHls(finalUrl);
      } else if (/\.ts(?:$|[?#])/i.test(finalUrl) && window.mpegts && mpegts.isSupported()) {
        mpegTsPlayer = mpegts.createPlayer({ type: "mpegts", isLive: false, url: finalUrl });
        mpegTsPlayer.on(mpegts.Events.ERROR, () => {
          if (!vodHasLoadedMetadata) tryNextVodCandidateOrFail("format");
        });
        mpegTsPlayer.attachMediaElement(video);
        mpegTsPlayer.load();
        Promise.resolve(mpegTsPlayer.play()).catch(() => {
          if (!vodHasLoadedMetadata) tryNextVodCandidateOrFail("play");
        });
      } else {
        video.preload = "auto";
        video.src = finalUrl;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch((err) => {
            if (err && err.name === "AbortError") return;
            console.warn("VOD play() rejected:", err);
            if (!vodHasLoadedMetadata) {
              tryNextVodCandidateOrFail(err && err.message ? err.message : "");
            }
          });
        }
      }
    };

    // Resolve Xtream 302 redirect URL up front so WebView's native media player can send direct HTTP Range requests to the storage server
    if (
      window.AndroidExternalPlayer &&
      typeof window.AndroidExternalPlayer.resolveRedirectUrl === "function" &&
      !/\.m3u8(?:$|[?#])/i.test(url)
    ) {
      setTimeout(() => {
        if (sessionId !== vodPlaybackSessionId) return;
        let resolvedUrl = url;
        try {
          const r = window.AndroidExternalPlayer.resolveRedirectUrl(url);
          if (r && typeof r === "string" && /^https?:\/\//i.test(r)) {
            resolvedUrl = r;
          }
        } catch (e) {}
        beginStreamWithUrl(resolvedUrl);
      }, 0);
    } else {
      beginStreamWithUrl(url);
    }
  }

  video.addEventListener("loadstart", () => {
    if ((currentModus === "vod" || currentModus === "series") && (currentVodMovieId || currentEpisodeId)) {
      const label = vodOsdTitle && vodOsdTitle.textContent ? vodOsdTitle.textContent : t("movies");
      showPlayerLoading(t("vodLoading", { title: label }));
    }
  });
  video.addEventListener("playing", () => {
    liveReconnectAttempts = 0;
    vodHasLoadedMetadata = true;
    isVodSeeking = false;
    hidePlayerLoading();
    updateVodPlayPauseIcon();
    if ((currentModus === "vod" || currentModus === "series") && (currentVodMovieId || currentEpisodeId)) {
      if (vodNativeAudioActive) {
        syncVodAudioCompanion();
      } else {
        setTimeout(checkVodAudioSupportAndFallback, 550);
      }
    }
  });
  video.addEventListener("pause", () => {
    if (vodNativeAudioActive && window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.pauseVodAudioFallback === "function") {
      try { window.AndroidExternalPlayer.pauseVodAudioFallback(); } catch (e) {}
    }
  });
  video.addEventListener("canplay", () => {
    vodHasLoadedMetadata = true;
    isVodSeeking = false;
    hidePlayerLoading();
  });
  video.addEventListener("waiting", () => {
    showPlayerLoading(t("buffering"));
    if (vodNativeAudioActive && window.AndroidExternalPlayer && typeof window.AndroidExternalPlayer.pauseVodAudioFallback === "function") {
      try { window.AndroidExternalPlayer.pauseVodAudioFallback(); } catch (e) {}
    }
  });
  video.addEventListener("error", () => {
    const mediaErr = video.error;
    // Ignore spurious error events when src was intentionally cleared
    if (!video.getAttribute("src") && !hlsPlayer && !mpegTsPlayer) {
      return;
    }
    if (lastLive) {
      hidePlayerLoading();
      scheduleLiveReconnect();
      return;
    }
    if ((currentModus === "vod" || currentModus === "series") && (currentVodMovieId || currentEpisodeId)) {
      if (vodHasLoadedMetadata && isVodSeeking) {
        // Transient range seek error: recover at current position without wiping the movie
        isVodSeeking = false;
        hidePlayerLoading();
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
        return;
      }
      const codeMap = { 1: "aborted", 2: "network", 3: "decode", 4: "format unsupported" };
      const codeReason = mediaErr && mediaErr.code ? (codeMap[mediaErr.code] || `code ${mediaErr.code}`) : "error";
      tryNextVodCandidateOrFail(codeReason);
    } else {
      hidePlayerLoading();
    }
  });
  video.addEventListener("ended", () => {
    hidePlayerLoading();
    if (lastLive) scheduleLiveReconnect();
  });

  function destroyStreamPlayers() {
    lastLive = null;
    vodFallbackAttempted = false;
    vodHasLoadedMetadata = false;
    isVodSeeking = false;
    pendingVodSeekTime = null;
    activeVodResolvedUrl = "";
    stopVodAudioCompanion();
    vodPlaybackSessionId++;
    if (vodSeekWatchdogTimer) {
      clearTimeout(vodSeekWatchdogTimer);
      vodSeekWatchdogTimer = null;
    }
    activeVodCandidates = [];
    activeVodCandidateIdx = 0;
    hidePlayerLoading();
    if (liveReconnectTimer) {
      clearTimeout(liveReconnectTimer);
      liveReconnectTimer = null;
    }
    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }
    if (mpegTsPlayer) {
      mpegTsPlayer.destroy();
      mpegTsPlayer = null;
    }
  }

  function playWithHls(url) {
    if (hlsPlayer) {
      try { hlsPlayer.destroy(); } catch (e) {}
      hlsPlayer = null;
    }
    hlsPlayer = new Hls({
      enableWorker: false,
      lowLatencyMode: false,
      backBufferLength: 30,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 20000,
      levelLoadingTimeOut: 20000
    });
    hlsPlayer.loadSource(url);
    hlsPlayer.attachMedia(video);
    hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch((err) => {
        if (err && err.name === "AbortError") return;
        if (currentModus === "vod" || currentModus === "series") {
          tryNextVodCandidateOrFail("HLS play");
        }
      });
    });
    hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
      if (data && data.fatal) {
        try { hlsPlayer.destroy(); } catch (e) {}
        hlsPlayer = null;
        if (lastLive) {
          scheduleLiveReconnect();
        } else if (currentModus === "vod" || currentModus === "series") {
          tryNextVodCandidateOrFail(data.details || "HLS error");
        }
      }
    });
  }

  function buildVodCandidateUrls(kind, id, ext, directUrl, auth) {
    const urls = [];
    const add = (u) => {
      if (u && !urls.includes(u)) urls.push(u);
    };
    if (directUrl) add(directUrl);
    if (auth && auth.server && auth.username && auth.password && id) {
      const base = `${auth.server.replace(/\/+$/, "")}/${kind}/${encodeURIComponent(auth.username)}/${encodeURIComponent(auth.password)}/${id}`;
      const cleanExt = (ext || "mp4").replace(/^\./, "").toLowerCase();
      add(`${base}.${cleanExt}`);
      if (cleanExt !== "mp4") add(`${base}.mp4`);
      if (cleanExt !== "mkv") add(`${base}.mkv`);
      if (cleanExt !== "m3u8") add(`${base}.m3u8`);
    }
    return urls;
  }

  function playVodMovie(streamId, title, ext, directUrl = "") {
    if (!streamId && !directUrl) {
      showToast(t("streamPlaybackFailed"));
      return;
    }
    const auth = xtreamAuth || (currentAuth && currentAuth.provider === "xtream" ? currentAuth : null);
    const candidates = buildVodCandidateUrls("movie", streamId, ext, directUrl, auth);
    if (candidates.length === 0) {
      showToast(t("xtreamRequiredForVod"));
      return;
    }

    currentModus = "vod";
    currentPlayingStreamId = null;
    currentVodMovieId = String(streamId);
    currentEpisodeId = null;

    destroyStreamPlayers();
    activeVodCandidates = candidates;
    activeVodCandidateIdx = 0;

    if (osdTimeout) {
      clearTimeout(osdTimeout);
      osdTimeout = null;
    }
    if (osdContainer) osdContainer.classList.add("hidden");
    if (osdClockBubble) osdClockBubble.classList.add("hidden");

    const cleanName = cleanTitle(title) || title || "Movie";
    document.body.classList.add("has-active-stream");
    playerWrapper.classList.remove("hidden");
    activeerFitScreen();
    if (vodOsdTitle) vodOsdTitle.textContent = cleanName;
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    showVodOSD();
    showPlayerLoading(t("vodLoading", { title: cleanName }));

    video.muted = false;
    video.volume = 1.0;

    if (useAndroidExternalPlayer && window.AndroidExternalPlayer) {
      hidePlayerLoading();
      window.AndroidExternalPlayer.openPlayer(candidates[0]);
      return;
    }

    startVodUrlPlayback(candidates[0], true);
  }

  function playSeriesEpisode(episodeId, title, ext, directUrl = "") {
    if (!episodeId && !directUrl) {
      showToast(t("streamPlaybackFailed"));
      return;
    }
    const auth = xtreamAuth || (currentAuth && currentAuth.provider === "xtream" ? currentAuth : null);
    const candidates = buildVodCandidateUrls("series", episodeId, ext, directUrl, auth);
    if (candidates.length === 0) {
      showToast(t("xtreamRequiredForVod"));
      return;
    }

    currentModus = "series";
    currentPlayingStreamId = null;
    currentEpisodeId = String(episodeId);
    currentVodMovieId = null;

    destroyStreamPlayers();
    activeVodCandidates = candidates;
    activeVodCandidateIdx = 0;

    if (osdTimeout) {
      clearTimeout(osdTimeout);
      osdTimeout = null;
    }
    if (osdContainer) osdContainer.classList.add("hidden");
    if (osdClockBubble) osdClockBubble.classList.add("hidden");

    const cleanName = cleanTitle(title) || title || "Episode";
    document.body.classList.add("has-active-stream");
    playerWrapper.classList.remove("hidden");
    activeerFitScreen();
    if (vodOsdTitle) vodOsdTitle.textContent = cleanName;
    if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    showVodOSD();
    showPlayerLoading(t("vodLoading", { title: cleanName }));

    video.muted = false;
    video.volume = 1.0;

    if (useAndroidExternalPlayer && window.AndroidExternalPlayer) {
      hidePlayerLoading();
      window.AndroidExternalPlayer.openPlayer(candidates[0]);
      return;
    }

    startVodUrlPlayback(candidates[0], true);
  }

  async function playStream(streamId, name, icon, index, directUrl = "", isReconnect = false) {
    if (currentModus === "vod" || currentModus === "series") {
      currentModus = "live";
    }
    currentVodMovieId = null;
    currentEpisodeId = null;
    if (index !== undefined) currentStreamIndex = index;
    currentPlayingStreamId = String(streamId);
    document.body.classList.add("has-active-stream");
    playerWrapper.classList.remove("hidden");

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

    showPlayerLoading(`${cleanTitle(name) || "Kanal"} yükleniyor...`);

    const liveAuth = currentAuth || xtreamAuth;
    const streamUrl = directUrl || (liveAuth ? `${liveAuth.server}/live/${liveAuth.username}/${liveAuth.password}/${streamId}.ts` : "");
    if (useAndroidExternalPlayer && window.AndroidExternalPlayer && streamUrl) {
      window.AndroidExternalPlayer.openPlayer(streamUrl);
      return;
    }

    const hlsStreamUrl = directUrl || (liveAuth ? `${liveAuth.server}/live/${liveAuth.username}/${liveAuth.password}/${streamId}.m3u8` : "");
    const isTransportStream = Boolean(directUrl && /\.ts(?:$|[?#])/i.test(directUrl));
    const hlsUrl = isTransportStream ? hlsStreamUrl.replace(/\.ts(?=([?#]|$))/i, ".m3u8") : hlsStreamUrl;

    destroyStreamPlayers();
    lastLive = { streamId, name, icon, index, directUrl };

    video.muted = false;
    video.volume = 1.0;

    if (isTransportStream && window.mpegts && mpegts.isSupported()) {
      mpegTsPlayer = mpegts.createPlayer({ type: "mpegts", isLive: true, url: streamUrl });
      mpegTsPlayer.on(mpegts.Events.ERROR, (type, detail) => {
        console.error("MPEG-TS playback error", type, detail);
        // Codec fallback: Try HLS if MPEG-TS fails
        if (window.Hls && Hls.isSupported() && hlsUrl) {
          console.log("Codec fallback from MPEG-TS to HLS:", hlsUrl);
          if (mpegTsPlayer) {
            try { mpegTsPlayer.destroy(); } catch (e) {}
            mpegTsPlayer = null;
          }
          playWithHls(hlsUrl);
          return;
        }
        scheduleLiveReconnect();
      });
      mpegTsPlayer.attachMediaElement(video);
      mpegTsPlayer.load();
      Promise.resolve(mpegTsPlayer.play()).catch(error => {
        console.error("MPEG-TS play error, falling back to HLS", error);
        if (window.Hls && Hls.isSupported() && hlsUrl) {
          destroyStreamPlayers();
          playWithHls(hlsUrl);
        } else {
          showToast(t("streamPlaybackFailed"));
        }
      });
    } else if (window.Hls && Hls.isSupported() && /\.m3u8(?:$|[?#])/i.test(hlsUrl)) {
      playWithHls(hlsUrl);
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
    const osdFavBtn = document.getElementById("osdFavBtn");
    if (osdFavBtn) {
      const isFav = favorites.includes(String(currentPlayingStreamId));
      osdFavBtn.classList.toggle("active", isFav);
      osdFavBtn.setAttribute("aria-pressed", String(isFav));
    }
  }

  function hideLiveOSD() {
    if (osdTimeout) {
      clearTimeout(osdTimeout);
      osdTimeout = null;
    }
    if (osdContainer) osdContainer.classList.add("hidden");
    if (osdClockBubble) osdClockBubble.classList.add("hidden");
  }

  function hideVodOSD() {
    if (vodOsdTimeout) {
      clearTimeout(vodOsdTimeout);
      vodOsdTimeout = null;
    }
    if (vodOsdContainer) vodOsdContainer.classList.add("hidden");
    if (vodCenterPlayPauseBtn) vodCenterPlayPauseBtn.classList.add("hidden");
    if (vodPlaybackControls) {
      vodPlaybackControls.classList.add("hidden");
      if (vodPlaybackControls.contains(document.activeElement)) {
        document.activeElement.blur();
        document.activeElement.classList.remove("focused");
      }
    }
  }

  function toggleLiveOSD() {
    if (osdContainer && !osdContainer.classList.contains("hidden")) {
      hideLiveOSD();
    } else {
      showLiveOSD();
    }
  }

  function toggleVodControls() {
    const isOsdVisible = (vodOsdContainer && !vodOsdContainer.classList.contains("hidden")) ||
      (vodCenterPlayPauseBtn && !vodCenterPlayPauseBtn.classList.contains("hidden"));
    if (isOsdVisible) {
      hideVodOSD();
    } else {
      showVodControls();
    }
  }

  function showLiveOSD() {
    if (vodOsdTimeout) {
      clearTimeout(vodOsdTimeout);
      vodOsdTimeout = null;
    }
    if (vodOsdContainer) vodOsdContainer.classList.add("hidden");
    if (vodCenterPlayPauseBtn) vodCenterPlayPauseBtn.classList.add("hidden");
    if (vodPlaybackControls) vodPlaybackControls.classList.add("hidden");
    if (osdContainer) osdContainer.classList.remove("hidden");
    if (osdClockBubble) osdClockBubble.classList.remove("hidden");
    if (osdTimeout) clearTimeout(osdTimeout);
    osdTimeout = setTimeout(() => {
      hideLiveOSD();
    }, 4500);
  }

  function showVodOSD() {
    if (osdTimeout) {
      clearTimeout(osdTimeout);
      osdTimeout = null;
    }
    if (osdContainer) osdContainer.classList.add("hidden");
    if (osdClockBubble) osdClockBubble.classList.add("hidden");
    if (vodOsdContainer) vodOsdContainer.classList.remove("hidden");
    if (vodCenterPlayPauseBtn && !isPipMode) {
      updateVodPlayPauseIcon();
      vodCenterPlayPauseBtn.classList.remove("hidden");
    }
    if (vodOsdTimeout) clearTimeout(vodOsdTimeout);
    vodOsdTimeout = setTimeout(() => {
      hideVodOSD();
    }, 5000);
  }

  function togglePlayPauseVod() {
    if (video.paused) {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
      if (vodPauseIcon) vodPauseIcon.classList.add("hidden");
    } else {
      video.pause();
      if (vodPauseIcon) vodPauseIcon.classList.remove("hidden");
    }
    updateVodPlayPauseIcon();
    showVodOSD();
  }

  function updateVodPlayPauseIcon() {
    const isPaused = video.paused;
    if (vodPlayPauseIcon) {
      vodPlayPauseIcon.innerHTML = isPaused
        ? '<svg class="ui-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg class="ui-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }
    if (vodCenterPlayPauseSvg) {
      vodCenterPlayPauseSvg.innerHTML = isPaused
        ? '<path d="M8 5v14l11-7z"/>'
        : '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    }
  }

  if (vodCenterPlayPauseBtn) {
    vodCenterPlayPauseBtn.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });
    vodCenterPlayPauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlayPauseVod();
    });
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
    const stepSec = vodSkipSeconds || 10;
    seekPreviewTime = Math.max(0, Math.min(video.duration, baseTime + direction * stepSec));
    if (vodSeekPreview) {
      const seekIconSvg = direction < 0
        ? '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>'
        : '<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>';
      vodSeekPreview.innerHTML = `${seekIconSvg} <span>${formatTime(seekPreviewTime)}</span>`;
      vodSeekPreview.classList.remove("hidden");
    }
    updateVodTimelineVisuals(seekPreviewTime, video.duration);
    if (seekTimer) clearTimeout(seekTimer);
    seekTimer = setTimeout(commitVodSeek, 450);
    showVodOSD();
  }

  let doubleTapAccum = 0;
  let doubleTapDirection = 0;
  let doubleTapResetTimer = null;

  function triggerVodDoubleTap(direction) {
    if (!video.duration || !isFinite(video.duration)) return;
    const stepSec = vodSkipSeconds || 10;
    if (doubleTapDirection !== direction) {
      doubleTapAccum = 0;
      doubleTapDirection = direction;
    }
    doubleTapAccum += stepSec;
    const delta = direction * stepSec;
    const baseTime = seekPreviewTime !== null ? seekPreviewTime : video.currentTime;
    const targetTime = Math.max(0, Math.min(video.duration, baseTime + delta));
    seekPreviewTime = null;
    updateVodTimelineVisuals(targetTime, video.duration);
    performReliableVodSeek(targetTime);
    showVodOSD();

    const indicator = direction < 0 ? vodDoubleTapLeft : vodDoubleTapRight;
    const otherIndicator = direction < 0 ? vodDoubleTapRight : vodDoubleTapLeft;
    const label = direction < 0 ? vodDoubleTapLeftText : vodDoubleTapRightText;
    if (otherIndicator) {
      otherIndicator.classList.remove("active", "show");
      otherIndicator.classList.add("hidden");
    }
    if (label) label.textContent = `${direction < 0 ? "-" : "+"}${doubleTapAccum}s`;
    if (indicator) {
      indicator.classList.remove("hidden", "active", "show");
      void indicator.offsetWidth;
      indicator.classList.add("active", "show");
    }
    if (doubleTapResetTimer) clearTimeout(doubleTapResetTimer);
    doubleTapResetTimer = setTimeout(() => {
      doubleTapAccum = 0;
      doubleTapDirection = 0;
      if (vodDoubleTapLeft) {
        vodDoubleTapLeft.classList.remove("active", "show");
        vodDoubleTapLeft.classList.add("hidden");
      }
      if (vodDoubleTapRight) {
        vodDoubleTapRight.classList.remove("active", "show");
        vodDoubleTapRight.classList.add("hidden");
      }
    }, 650);
  }

  function commitVodSeek() {
    if (seekPreviewTime === null) return;
    const target = seekPreviewTime;
    seekPreviewTime = null;
    if (vodSeekPreview) vodSeekPreview.classList.add("hidden");
    performReliableVodSeek(target);
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
    performReliableVodSeek(targetTime);
    showVodOSD();
  }

  function zapToNumber(num) {
    if (currentActiveStreams.length === 0) return;
    const targetIdx = parseInt(num, 10) - 1;
    if (targetIdx >= 0 && targetIdx < currentActiveStreams.length) {
      const target = currentActiveStreams[targetIdx];
      playStream(target.stream_id, target.name, target.stream_icon, targetIdx, target.url);
      showToast(t("zapped", { number: num, title: cleanTitle(target.name) }));
    } else {
      showToast(t("channelNotFound", { number: num }));
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
      if (memory.element && document.body.contains(memory.element)) return memory.element;
      if (memory.attr) {
        const found = column.querySelector(`[${memory.attr}="${escapeAttr(memory.value)}"]`);
        if (found) return found;
      }
    }
    return column.querySelector(".focusable.active") || column.querySelector(".focusable");
  }

  function enterColumn(index) {
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

  function isFocusableVisible(el) {
    return !!el && el.classList.contains("focusable") && !el.classList.contains("hidden") && el.offsetParent !== null;
  }

  function pickFallbackFocus() {
    const visible = (el) => isFocusableVisible(el) && el.getClientRects().length > 0;
    if (visible(lastFocusedPoster)) return lastFocusedPoster;
    const candidates = [
      channelList.querySelector(".channel-card.active"),
      channelList.querySelector(".focusable"),
      document.querySelector(".tv-grid .nav-item.active"),
      document.querySelector("#modusList .focusable:not(.hidden)"),
      document.querySelector(".tv-grid .focusable")
    ];
    for (let i = 0; i < candidates.length; i++) {
      if (visible(candidates[i])) return candidates[i];
    }
    return document.querySelector(".focusable:not(.hidden)");
  }

  function animateScroll(container, target, instant) {
    const max = container.scrollHeight - container.clientHeight;
    const to = Math.max(0, Math.min(max, target));
    if (container._scrollFrame) cancelAnimationFrame(container._scrollFrame);
    if (instant) {
      container.scrollTop = to;
      return;
    }
    const from = container.scrollTop;
    const started = Date.now();
    const step = () => {
      const progress = Math.min(1, (Date.now() - started) / 140);
      container.scrollTop = from + (to - from) * (1 - Math.pow(1 - progress, 3));
      if (progress < 1) container._scrollFrame = requestAnimationFrame(step);
    };
    step();
  }

  function markWheel(container, element) {
    (container._wheelItems || []).forEach((item) => item.classList.remove("wheel-0", "wheel-1", "wheel-2", "wheel-3"));
    const marked = [element];
    element.classList.add("wheel-0");
    let before = element;
    let after = element;
    for (let distance = 1; distance <= 3; distance++) {
      before = before && before.previousElementSibling;
      after = after && after.nextElementSibling;
      if (before) { before.classList.add("wheel-" + distance); marked.push(before); }
      if (after) { after.classList.add("wheel-" + distance); marked.push(after); }
    }
    container._wheelItems = marked;
  }

  // Vertical lists behave like a picker wheel: the focused row stays in the middle.
  function centerInList(element, instant) {
    const container = element.parentElement;
    if (!container) return;
    if (document.body.classList.contains("layout-mobile")) {
      if (container._wheelPad) {
        container.style.paddingTop = "";
        container.style.paddingBottom = "";
        container._wheelPad = null;
      }
      return;
    }
    const isWheel = (container.classList.contains("nav-list") && container.id !== "modusList") || container.classList.contains("channel-grid");
    if (!isWheel || container.clientHeight === 0) return;
    const pad = Math.max(0, Math.round(container.clientHeight / 2 - element.offsetHeight / 2));
    if (container._wheelPad !== pad) {
      container.style.paddingTop = pad + "px";
      container.style.paddingBottom = pad + "px";
      container._wheelPad = pad;
    }
    container.classList.add("wheel");
    markWheel(container, element);
    const offset = (element.getBoundingClientRect().top + element.offsetHeight / 2) - (container.getBoundingClientRect().top + container.clientHeight / 2);
    animateScroll(container, container.scrollTop + offset, instant);
  }

  function setElementFocus(element) {
    if (!element) return;
    document.querySelectorAll(".focused").forEach(el => el.classList.remove("focused"));
    element.classList.add("focused");
    if (element.classList.contains("search-input-field")) {
      const searchWrapper = element.closest(".search-input-wrapper");
      if (searchWrapper) searchWrapper.classList.add("focused");
    }

    // Expand the column first: a collapsed column is display:none and cannot take focus.
    const parentCol = element.closest(".col-nav");
    if (parentCol && parentCol.dataset.col !== undefined) {
      setColumnFocus(parseInt(parentCol.dataset.col, 10));
    }
    // Centre the list before focusing so the focus box never paints at the old position.
    centerInList(element, true);
    element.focus();

    if (element.classList.contains("grid-item")) {
      lastFocusedPoster = element;
      setTimeout(loadVisiblePosters, 300);
    }
    rememberFocus(element, parentCol);
    updateHintBar(element);
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
      const targetIndex = (currentModus === "favorites") ? 0 : currentIndex - 1;
      if (targetIndex >= 0 && targetIndex < cols.length) enterColumn(targetIndex);
      return;
    }

    let targetIndex = currentIndex + 1;
    if (targetIndex >= 0 && targetIndex < cols.length) {
      if (currentModus === "favorites" && targetIndex === 1) {
        targetIndex = 3;
      }
      enterColumn(targetIndex);
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
      enterColumn(2);
    } else if (direction === "up" && settingsButton && (deviceLayout === "tv" || (!document.body.classList.contains("layout-mobile") && settingsButton.offsetParent !== null))) {
      setElementFocus(settingsButton);
    }
  }

  function getAdjacentLiveChannel(delta) {
    if (!currentActiveStreams || currentActiveStreams.length === 0) return null;
    const nextIdx = (currentStreamIndex + delta + currentActiveStreams.length) % currentActiveStreams.length;
    return currentActiveStreams[nextIdx] || null;
  }

  function changeLiveChannel(delta) {
    if (!currentActiveStreams || currentActiveStreams.length === 0) return;
    currentStreamIndex = (currentStreamIndex + delta + currentActiveStreams.length) % currentActiveStreams.length;
    const target = currentActiveStreams[currentStreamIndex];
    if (target) {
      playStream(target.stream_id, target.name, target.stream_icon, currentStreamIndex, target.url);
      showLiveOSD();
    }
  }

  let liveSwipePreviewDelta = 0;
  let liveSwipeAnimTimer = null;

  function updateLiveSwipePreviewTarget(delta) {
    if (!liveSwipePreview) return;
    const target = getAdjacentLiveChannel(delta);
    if (!target) return;
    liveSwipePreview.classList.toggle("side-right", delta > 0);
    liveSwipePreview.classList.toggle("side-left", delta < 0);
    liveSwipePreview.classList.remove("hidden");

    if (liveSwipePreviewDelta !== delta) {
      liveSwipePreviewDelta = delta;
      const cleanName = cleanTitle(target.name || "") || "Channel";
      if (liveSwipeChName) liveSwipeChName.textContent = cleanName;
      const iconUrl = (target.stream_icon || target.logo || target.tvg_logo || target.icon || "").trim();
      if (liveSwipeLogoImg && liveSwipeLogoFallback) {
        if (iconUrl) {
          liveSwipeLogoImg.classList.remove("hidden");
          liveSwipeLogoImg.style.display = "block";
          liveSwipeLogoFallback.classList.add("hidden");
          liveSwipeLogoFallback.style.display = "none";
          liveSwipeLogoImg.onerror = () => {
            liveSwipeLogoImg.classList.add("hidden");
            liveSwipeLogoImg.style.display = "none";
            liveSwipeLogoFallback.classList.remove("hidden");
            liveSwipeLogoFallback.style.display = "flex";
          };
          liveSwipeLogoImg.src = iconUrl;
        } else {
          liveSwipeLogoImg.src = "";
          liveSwipeLogoImg.classList.add("hidden");
          liveSwipeLogoImg.style.display = "none";
          liveSwipeLogoFallback.classList.remove("hidden");
          liveSwipeLogoFallback.style.display = "flex";
        }
      }
    }
  }

  function resetLiveSwipeVisuals(animate = true) {
    if (liveSwipeAnimTimer) {
      clearTimeout(liveSwipeAnimTimer);
      liveSwipeAnimTimer = null;
    }
    liveSwipePreviewDelta = 0;
    if (video) {
      video.style.transition = animate ? "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
      video.style.transform = "translate3d(0, 0, 0)";
      if (animate) {
        setTimeout(() => {
          if (video) {
            video.style.transition = "";
            video.style.transform = "";
          }
        }, 260);
      }
    }
    if (liveSwipePreview) {
      liveSwipePreview.style.transition = animate ? "opacity 0.22s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
      liveSwipePreview.style.opacity = "0";
      liveSwipePreview.style.transform = "translate3d(0, 0, 0)";
      if (animate) {
        liveSwipeAnimTimer = setTimeout(() => {
          if (liveSwipePreview) {
            liveSwipePreview.classList.add("hidden");
            liveSwipePreview.style.transition = "";
            liveSwipePreview.style.transform = "";
          }
        }, 240);
      } else {
        liveSwipePreview.classList.add("hidden");
      }
    }
  }

  // FULLSCREEN GESTURES, DOUBLE-TAP SEEK & FLOATING PIP CONTROLS
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerStartTime = 0;
  let pointerActive = false;
  let isSwipeHandled = false;
  let isSwipeDownFromTop = false;
  let isLiveHorizontalSwiping = false;
  let isPipPointerActive = false;
  let pipDragDeltaX = 0;
  let pipDragDeltaY = 0;
  let lastVodTapTime = 0;
  let lastVodTapZone = 0;
  let singleTapVodTimer = null;

  if (playerWrapper) {
    playerWrapper.addEventListener("pointerdown", (e) => {
      if (e.target.closest("#vodOsdContainer, #vodCenterPlayPauseBtn, #vodPlaybackControls, #osdContainer, #mobileFullscreenBtn")) {
        return;
      }
      if (isPipMode) {
        isPipPointerActive = true;
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        pointerStartTime = Date.now();
        pipDragDeltaX = 0;
        pipDragDeltaY = 0;
        isSwipeHandled = false;
        playerWrapper.classList.add("is-pip-dragging");
        try { playerWrapper.setPointerCapture(e.pointerId); } catch (_) {}
        return;
      }
      if (!isFitScreen) return;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerStartTime = Date.now();
      pointerActive = true;
      isSwipeHandled = false;
      isLiveHorizontalSwiping = false;
      isSwipeDownFromTop = pointerStartY <= window.innerHeight * 0.45;
    }, { passive: true });

    playerWrapper.addEventListener("pointermove", (e) => {
      if (isPipPointerActive && isPipMode) {
        pipDragDeltaX = e.clientX - pointerStartX;
        pipDragDeltaY = e.clientY - pointerStartY;
        if (Math.hypot(pipDragDeltaX, pipDragDeltaY) > 6) {
          isSwipeHandled = true;
        }
        const scale = pipDragDeltaY > 0 ? Math.max(0.82, 1 - pipDragDeltaY / 380) : 1;
        const opacity = pipDragDeltaY > 20 ? Math.max(0.35, 1 - (pipDragDeltaY - 20) / 180) : 1;
        playerWrapper.style.transform = `translate3d(${pipDragDeltaX}px, ${pipDragDeltaY}px, 0) scale(${scale})`;
        playerWrapper.style.opacity = String(opacity);
        if (pipDismissHint) {
          pipDismissHint.classList.toggle("hidden", pipDragDeltaY < 35);
        }
        return;
      }
      if (!pointerActive || !isFitScreen) return;
      const diffX = e.clientX - pointerStartX;
      const diffY = e.clientY - pointerStartY;
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      const isLiveMode = currentModus === "live" || currentModus === "favorites";

      // Interactive horizontal channel swipe preview on Live TV
      if (isLiveMode && (isLiveHorizontalSwiping || (absX > 14 && absX > absY * 1.15))) {
        isLiveHorizontalSwiping = true;
        isSwipeHandled = true;
        playerWrapper.classList.remove("is-pip-dragging");
        playerWrapper.style.transform = "";
        playerWrapper.style.borderRadius = "";

        const w = playerWrapper.clientWidth || window.innerWidth || 360;
        const maxShift = w / 8; // Move up to 1/8th of player width
        const rawRatio = Math.min(1, absX / (w * 0.28));
        // Smooth damping curve approaching 1/8th width
        const easedProgress = 1 - Math.pow(1 - rawRatio, 1.65);
        const shiftX = Math.sign(diffX) * easedProgress * maxShift;
        const delta = diffX < 0 ? 1 : -1;

        updateLiveSwipePreviewTarget(delta);
        if (video) {
          video.style.transition = "none";
          video.style.transform = `translate3d(${shiftX}px, 0, 0)`;
        }
        if (liveSwipePreview) {
          liveSwipePreview.style.transition = "none";
          liveSwipePreview.style.opacity = String(Math.min(1, easedProgress * 1.35));
          const nudge = (1 - easedProgress) * (diffX < 0 ? 18 : -18);
          liveSwipePreview.style.transform = `translate3d(${nudge}px, 0, 0)`;
        }
        return;
      }

      if (!isLiveHorizontalSwiping && isSwipeDownFromTop && diffY > 12 && diffY > absX * 1.15) {
        isSwipeHandled = true;
        playerWrapper.classList.add("is-pip-dragging");
        const progress = Math.min(1, diffY / (window.innerHeight * 0.55));
        const scale = 1 - progress * 0.42;
        const translateY = diffY * 0.55;
        playerWrapper.style.transform = `translate3d(${diffX * 0.25}px, ${translateY}px, 0) scale(${scale})`;
        playerWrapper.style.borderRadius = `${Math.round(progress * 22)}px`;
      }
    }, { passive: true });

    playerWrapper.addEventListener("pointerup", (e) => {
      if (isPipPointerActive) {
        isPipPointerActive = false;
        try { playerWrapper.releasePointerCapture(e.pointerId); } catch (_) {}
        playerWrapper.classList.remove("is-pip-dragging");
        if (pipDismissHint) pipDismissHint.classList.add("hidden");
        const totalMove = Math.hypot(pipDragDeltaX, pipDragDeltaY);
        if (totalMove < 10) {
          isSwipeHandled = true;
          activeerFitScreen();
          return;
        }
        if (pipDragDeltaY > 55) {
          playerWrapper.style.transform = `translate3d(${pipDragDeltaX}px, ${pipDragDeltaY + 140}px, 0) scale(0.65)`;
          playerWrapper.style.opacity = "0";
          setTimeout(() => {
            closePipMode();
          }, 220);
        } else {
          playerWrapper.style.transform = "";
          playerWrapper.style.opacity = "";
        }
        return;
      }

      if (!pointerActive || !isFitScreen) return;
      pointerActive = false;
      const diffX = e.clientX - pointerStartX;
      const diffY = e.clientY - pointerStartY;
      const elapsed = Date.now() - pointerStartTime;
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      const minSwipeDistance = 35;

      playerWrapper.classList.remove("is-pip-dragging");
      playerWrapper.style.borderRadius = "";

      if (isLiveHorizontalSwiping) {
        isLiveHorizontalSwiping = false;
        isSwipeHandled = true;
        const w = playerWrapper.clientWidth || window.innerWidth || 360;
        const commitThreshold = Math.max(42, w * 0.11);
        if (absX >= commitThreshold) {
          const delta = diffX < 0 ? 1 : -1;
          const enterFrom = diffX < 0 ? Math.round(w / 8) : -Math.round(w / 8);
          const previewCenterShift = diffX < 0 ? -Math.round(w * 0.18) : Math.round(w * 0.18);
          if (liveSwipePreview) {
            liveSwipePreview.style.transition = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.26s ease";
            liveSwipePreview.style.transform = `translate3d(${previewCenterShift}px, 0, 0) scale(1.06)`;
            liveSwipePreview.style.opacity = "0";
          }
          changeLiveChannel(delta);
          if (video) {
            video.style.transition = "none";
            video.style.transform = `translate3d(${enterFrom}px, 0, 0)`;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (video) {
                  video.style.transition = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)";
                  video.style.transform = "translate3d(0, 0, 0)";
                }
              });
            });
          }
          liveSwipeAnimTimer = setTimeout(() => {
            resetLiveSwipeVisuals(false);
          }, 300);
        } else {
          resetLiveSwipeVisuals(true);
        }
        return;
      }

      // Swipe down from top -> animate out of fullscreen into Picture-in-Picture (PiP)
      if (isSwipeDownFromTop && diffY >= 50 && absY > absX * 1.15) {
        isSwipeHandled = true;
        enterPipMode();
        return;
      }
      playerWrapper.style.transform = "";

      if ((absX >= minSwipeDistance || absY >= minSwipeDistance) && elapsed < 800) {
        isSwipeHandled = true;
        if (currentModus === "live" || currentModus === "favorites") {
          if (absY >= absX) {
            // Swiping up from bottom only wakes/shows the Live TV OSD instead of changing channels
            if (diffY < 0) {
              showLiveOSD();
            }
          } else {
            changeLiveChannel(diffX < 0 ? 1 : -1);
          }
        } else if (currentModus === "vod" || currentModus === "series") {
          if (absX > absY) {
            queueVodSeek(diffX > 0 ? 1 : -1);
          }
        }
      }
    }, { passive: true });

    playerWrapper.addEventListener("pointercancel", () => {
      pointerActive = false;
      isPipPointerActive = false;
      isLiveHorizontalSwiping = false;
      resetLiveSwipeVisuals(true);
      if (playerWrapper) {
        playerWrapper.classList.remove("is-pip-dragging");
        playerWrapper.style.transform = "";
        playerWrapper.style.opacity = "";
        playerWrapper.style.borderRadius = "";
      }
      if (pipDismissHint) pipDismissHint.classList.add("hidden");
    }, { passive: true });

    playerWrapper.addEventListener("click", (e) => {
      if (e.target.closest("#vodOsdContainer, #vodCenterPlayPauseBtn, #vodPlaybackControls, #osdContainer, #mobileFullscreenBtn")) {
        return;
      }
      if (isSwipeHandled) {
        isSwipeHandled = false;
        e.stopPropagation();
        return;
      }
      if (isPipMode) {
        activeerFitScreen();
        return;
      }
      if (!isFitScreen) {
        if (currentModus === "live" || currentModus === "favorites") {
          activeerFitScreen();
        }
      } else {
        if (currentModus === "live" || currentModus === "favorites") {
          toggleLiveOSD();
        } else if (currentModus === "vod" || currentModus === "series") {
          const rect = playerWrapper.getBoundingClientRect();
          const relX = e.clientX - rect.left;
          const zone = relX <= rect.width / 3 ? -1 : (relX >= (rect.width * 2) / 3 ? 1 : 0);
          const now = Date.now();
          if (zone !== 0 && (now - lastVodTapTime < 320) && lastVodTapZone === zone) {
            if (singleTapVodTimer) {
              clearTimeout(singleTapVodTimer);
              singleTapVodTimer = null;
            }
            lastVodTapTime = now;
            triggerVodDoubleTap(zone);
            return;
          }
          lastVodTapTime = now;
          lastVodTapZone = zone;
          if (zone !== 0) {
            if (singleTapVodTimer) clearTimeout(singleTapVodTimer);
            singleTapVodTimer = setTimeout(() => {
              singleTapVodTimer = null;
              toggleVodControls();
            }, 250);
          } else {
            toggleVodControls();
          }
        }
      }
    });

    const mobileFullscreenBtn = document.getElementById("mobileFullscreenBtn");
    if (mobileFullscreenBtn) {
      mobileFullscreenBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        activeerFitScreen();
      });
    }

    window.handleOrientationChange = function(isLandscape) {
      if (deviceLayout !== "mobile") return;
      if (!isLandscape && isFitScreen) {
        enterPipMode();
      }
    };
  }

  const mobileBottomNav = document.getElementById("mobileBottomNav");
  if (mobileBottomNav) {
    const navIndicator = mobileBottomNav.querySelector(".mobile-nav-indicator");
    let navDrag = null;

    const navItems = () => Array.from(mobileBottomNav.querySelectorAll(".mobile-nav-item"));
    const nearestNavItem = (clientX, clientY) => {
      let best = null;
      let bestDist = Infinity;
      const vertical = isTabletLandscapeNav();
      navItems().forEach(item => {
        const r = item.getBoundingClientRect();
        const d = vertical
          ? Math.abs(clientY - (r.top + r.height / 2))
          : Math.abs(clientX - (r.left + r.width / 2));
        if (d < bestDist) { bestDist = d; best = item; }
      });
      return best;
    };

    mobileBottomNav.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || !e.target.closest(".mobile-nav-item")) return;
      navDrag = { id: e.pointerId, startX: e.clientX, startY: e.clientY, dragging: false };
    });
    mobileBottomNav.addEventListener("pointermove", (e) => {
      if (!navDrag || e.pointerId !== navDrag.id) return;
      const vertical = isTabletLandscapeNav();
      if (!navDrag.dragging) {
        const delta = vertical ? Math.abs(e.clientY - navDrag.startY) : Math.abs(e.clientX - navDrag.startX);
        if (delta < 6) return;
        navDrag.dragging = true;
        mobileBottomNav.classList.add("is-dragging");
        mobileBottomNav.setPointerCapture(e.pointerId);
      }
      const items = navItems();
      const navRect = mobileBottomNav.getBoundingClientRect();
      if (vertical) {
        const height = items[0].offsetHeight;
        const minY = items[0].offsetTop;
        const maxY = items[items.length - 1].offsetTop;
        const y = Math.min(maxY, Math.max(minY, e.clientY - navRect.top - height / 2));
        navIndicator.style.width = "";
        navIndicator.style.height = `${height}px`;
        navIndicator.style.transform = `translateY(${y}px)`;
        const speed = Math.abs(e.clientY - (navDrag.lastY ?? e.clientY));
        navDrag.lastY = e.clientY;
        navLens.setDragging(true);
        setNavGlassScale(8 + Math.min(14, speed * 2));
      } else {
        const width = items[0].offsetWidth;
        const minX = items[0].offsetLeft;
        const maxX = items[items.length - 1].offsetLeft;
        const x = Math.min(maxX, Math.max(minX, e.clientX - navRect.left - width / 2));
        navIndicator.style.height = "";
        navIndicator.style.width = `${width}px`;
        navIndicator.style.transform = `translateX(${x}px)`;
        const speed = Math.abs(e.clientX - (navDrag.lastX ?? e.clientX));
        navDrag.lastX = e.clientX;
        navLens.setDragging(true);
        setNavGlassScale(8 + Math.min(14, speed * 2));
      }
    });
    const setNavGlassScale = (value) => {
      const disp = document.getElementById("kcGlassDisp");
      if (disp) disp.setAttribute("scale", String(value));
    };
    const endNavDrag = (e) => {
      if (!navDrag || e.pointerId !== navDrag.id) return;
      const wasDragging = navDrag.dragging;
      navDrag = null;
      navLens.setDragging(false);
      setNavGlassScale(8);
      if (!wasDragging) return;
      mobileBottomNav.classList.remove("is-dragging");
      const target = nearestNavItem(e.clientX, e.clientY);
      if (!target) return;
      if (target.classList.contains("active")) {
        moveMobileNavIndicator(target);
      } else {
        target.click();
      }
    };
    mobileBottomNav.addEventListener("pointerup", endNavDrag);
    mobileBottomNav.addEventListener("pointercancel", endNavDrag);
    const handleNavResize = () => {
      moveMobileNavIndicator(mobileBottomNav.querySelector(".mobile-nav-item.active"), false);
    };
    window.addEventListener("resize", handleNavResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleNavResize, 80);
    });

    mobileBottomNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".mobile-nav-item");
      if (!btn || !btn.dataset.mobileTab) return;
      const tab = btn.dataset.mobileTab;

      closeHomeViewAll();
      if (tab === "home") {
        showSettingsPage(false);
        closeSearch();
        syncMobileNavState("home");
        initMobileHomeScreen();
      } else if (tab === "search") {
        showSettingsPage(false);
        syncMobileNavState("search");
        openSearch();
      } else if (tab === "live") {
        showSettingsPage(false);
        closeSearch();
        syncMobileNavState("live");
        if (currentModus !== "live" && currentModus !== "favorites") {
          switchModus(favorites && favorites.length > 0 ? "favorites" : "live");
        }
      } else if (tab === "profile") {
        closeSearch();
        syncMobileNavState("profile");
        showSettingsPage(true);
        showSettingsTab("profile");
      }
    });
  }

  // NETFLIX-STYLE HOME SCREEN & VIEW ALL LOGIC

  function closeHomeViewAll() {
    const page = document.getElementById("homeViewAllPage");
    if (page) page.classList.add("hidden");
    const grid = document.getElementById("viewAllGrid");
    if (grid && grid.classList.contains("series-episodes-grid")) {
      selectedSeries = null;
      grid.className = "home-view-all-grid";
    }
    updateHeaderBackButton();
  }

  function renderHomeViewAllGrid() {
    const grid = document.getElementById("viewAllGrid");
    if (!grid) return;
    grid.className = "home-view-all-grid";
    grid.innerHTML = "";

    let items = currentViewAllType === "series" ? (seriesStreams || []) : (vodStreams || []);
    if (currentViewAllCatId !== "all") {
      items = items.filter(it => String(it.category_id) === String(currentViewAllCatId));
    } else if (appSelectedRegion !== "ALL") {
      const rawCategories = currentViewAllType === "series" ? (seriesCategories || []) : (vodCategories || []);
      const regionCatIds = new Set(rawCategories.filter(c => isCategoryInRegion(c, true, appSelectedRegion)).map(c => String(c.category_id)));
      if (regionCatIds.size > 0) {
        items = items.filter(it => regionCatIds.has(String(it.category_id)));
      }
    }

    if (items.length === 0) {
      if (xtreamAuth) {
        if (currentViewAllCatId && currentViewAllCatId !== "all" && !loadedCategories[`${currentViewAllType}:${currentViewAllCatId}`]) {
          const loading = document.createElement("div");
          loading.className = "season-heading";
          loading.textContent = t("connecting");
          grid.appendChild(loading);
          loadXtreamCategory(currentViewAllType, currentViewAllCatId).then((ok) => {
            if (!ok) showToast(t("playlistUnavailable"));
            renderHomeViewAllGrid();
          });
          return;
        }
        if (currentViewAllCatId === "all") {
          const rawCategories = currentViewAllType === "series" ? (seriesCategories || []) : (vodCategories || []);
          const regionCats = appSelectedRegion === "ALL" ? rawCategories : rawCategories.filter(c => isCategoryInRegion(c, true, appSelectedRegion));
          const catsToLoad = (regionCats.length ? regionCats : rawCategories)
            .filter(c => !loadedCategories[`${currentViewAllType}:${c.category_id}`])
            .slice(0, 3);
          if (catsToLoad.length > 0) {
            const loading = document.createElement("div");
            loading.className = "season-heading";
            loading.textContent = t("connecting");
            grid.appendChild(loading);
            Promise.all(catsToLoad.map(c => loadXtreamCategory(currentViewAllType, c.category_id))).then((results) => {
              if (!results.some(Boolean)) showToast(t("playlistUnavailable"));
              renderHomeViewAllGrid();
            });
            return;
          }
        }
      }
      for (let i = 1; i <= 15; i++) {
        const card = document.createElement("div");
        card.className = "poster-card focusable";
        card.tabIndex = 0;
        const fallbackIcon = currentViewAllType === "series"
          ? '<svg class="ui-svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>'
          : '<svg class="ui-svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>';
        const itemTitle = currentViewAllType === "series" ? `Series ${i}` : `Movie ${i}`;
        card.innerHTML = `
          <div class="poster-img-container">
            <div class="poster-fallback-icon">${fallbackIcon}</div>
          </div>
          <div class="poster-info">
            <div class="poster-title">${itemTitle}</div>
          </div>
        `;
        card.addEventListener("click", () => {
          showToast(xtreamAuth ? t("playlistUnavailable") : t("xtreamRequiredForVod"));
        });
        grid.appendChild(card);
      }
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "poster-card focusable";
      card.tabIndex = 0;
      const displayTitle = cleanTitle(item.name || item.title || "");
      const posterSrc = item.stream_icon || item.cover || "";
      const fallbackIcon = currentViewAllType === "series"
        ? '<svg class="ui-svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>'
        : '<svg class="ui-svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>';

      card.innerHTML = `
        <div class="poster-img-container">
          ${posterSrc ? `<img src="${posterSrc}" class="poster-img" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}
          <div class="poster-fallback-icon" style="${posterSrc ? 'display:none;' : 'display:flex;'}">${fallbackIcon}</div>
        </div>
        <div class="poster-info">
          <div class="poster-title">${displayTitle}</div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (currentViewAllType === "vod") {
          playVodMovie(item.stream_id, item.name || item.title, item.container_extension, item.url || item.direct_source || "");
        } else {
          openSeries({ dataset: { seriesId: item.series_id || item.stream_id, title: item.name || item.title } });
        }
      });

      grid.appendChild(card);
    });
  }

  function openHomeViewAll(type, selectedCatId = "all", selectedCatName = "") {
    currentViewAllType = type || "vod";
    currentViewAllCatId = selectedCatId || "all";
    const page = document.getElementById("homeViewAllPage");
    const titleEl = document.getElementById("viewAllTitle");
    const catBar = document.getElementById("viewAllCategoriesBar");
    if (!page) return;

    if (titleEl) {
      if (selectedCatName) {
        titleEl.textContent = cleanTitle(selectedCatName, ["HEVC", "VIP"]);
      } else {
        titleEl.textContent = currentViewAllType === "series" ? "Series" : "Movies";
      }
    }

    if (catBar) {
      catBar.innerHTML = "";
      const rawCategories = currentViewAllType === "series" ? (seriesCategories || []) : (vodCategories || []);
      const categories = rawCategories.filter(c => isCategoryInRegion(c, true, appSelectedRegion));
      const groupedCategories = groupCategoriesByTrailingNumber(categories.length ? categories : rawCategories);

      const allChip = document.createElement("button");
      allChip.className = "home-view-all-cat-chip" + (currentViewAllCatId === "all" ? " active" : "");
      allChip.textContent = t("allRegions") || "All";
      allChip.dataset.catId = "all";
      allChip.onclick = () => {
        catBar.querySelectorAll(".home-view-all-cat-chip").forEach(c => c.classList.remove("active"));
        allChip.classList.add("active");
        currentViewAllCatId = "all";
        const subBar = document.getElementById("viewAllSubFilterBar");
        if (subBar) { subBar.innerHTML = ""; subBar.classList.add("hidden"); }
        if (titleEl) titleEl.textContent = currentViewAllType === "series" ? "Series" : "Movies";
        renderHomeViewAllGrid();
      };
      catBar.appendChild(allChip);

      groupedCategories.slice(0, 30).forEach(cat => {
        const chip = document.createElement("button");
        chip.className = "home-view-all-cat-chip" + (String(cat.category_id) === String(currentViewAllCatId) ? " active" : "");
        const catBaseLabel = cleanTitle(cat.category_name, ["HEVC", "VIP"]);
        if (cat.isGrouped && cat.subCategories) {
          chip.innerHTML = `<span>${escapeAttr(catBaseLabel)}</span><span class="cat-group-badge">${cat.subCategories.length}</span>`;
        } else {
          chip.textContent = catBaseLabel;
        }
        chip.dataset.catId = cat.category_id;
        chip.onclick = async () => {
          catBar.querySelectorAll(".home-view-all-cat-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          currentViewAllCatId = cat.category_id;
          if (titleEl) titleEl.textContent = catBaseLabel;

          const subBar = document.getElementById("viewAllSubFilterBar");
          if (subBar) {
            if (cat.isGrouped && cat.subCategories && cat.subCategories.length > 1) {
              subBar.innerHTML = "";
              subBar.classList.remove("hidden");
              const allSub = document.createElement("button");
              allSub.className = "sub-filter-chip active";
              allSub.textContent = t("allRegions") || "All";
              allSub.onclick = () => {
                subBar.querySelectorAll(".sub-filter-chip").forEach(sc => sc.classList.remove("active"));
                allSub.classList.add("active");
                currentViewAllCatId = cat.category_id;
                renderHomeViewAllGrid();
              };
              subBar.appendChild(allSub);

              cat.subCategories.forEach(sub => {
                const subChip = document.createElement("button");
                subChip.className = "sub-filter-chip";
                subChip.textContent = sub.label;
                subChip.onclick = async () => {
                  subBar.querySelectorAll(".sub-filter-chip").forEach(sc => sc.classList.remove("active"));
                  subChip.classList.add("active");
                  currentViewAllCatId = sub.category_id;
                  if (typeof loadXtreamCategory === "function") {
                    await loadXtreamCategory(currentViewAllType, sub.category_id);
                  }
                  renderHomeViewAllGrid();
                };
                subBar.appendChild(subChip);
              });
            } else {
              subBar.innerHTML = "";
              subBar.classList.add("hidden");
            }
          }

          if (typeof loadXtreamCategory === "function") {
            await loadXtreamCategory(currentViewAllType, cat.category_id);
          }
          renderHomeViewAllGrid();
        };
        catBar.appendChild(chip);
      });
    }

    renderHomeViewAllGrid();
    page.classList.remove("hidden");
    updateHeaderBackButton();
  }

  const viewAllBackBtn = document.getElementById("viewAllBackBtn");
  if (viewAllBackBtn) {
    viewAllBackBtn.addEventListener("click", closeHomeViewAll);
  }

  function pickRandomFeaturedItem() {
    let candidateCategories = [];
    if (appSelectedRegion === "ALL") {
      candidateCategories = (vodCategories || []).concat(seriesCategories || []);
    } else {
      const regVod = (vodCategories || []).filter(c => isCategoryInRegion(c, true, appSelectedRegion));
      const regSeries = (seriesCategories || []).filter(c => isCategoryInRegion(c, true, appSelectedRegion));
      candidateCategories = regVod.concat(regSeries);
    }
    const catIds = new Set(candidateCategories.map(c => String(c.category_id)));

    let candidates = [];
    (vodStreams || []).forEach(m => {
      if (appSelectedRegion === "ALL" || (catIds.size > 0 && catIds.has(String(m.category_id)))) {
        candidates.push({ ...m, type: "vod" });
      }
    });
    (seriesStreams || []).forEach(s => {
      if (appSelectedRegion === "ALL" || (catIds.size > 0 && catIds.has(String(s.category_id)))) {
        candidates.push({ ...s, type: "series" });
      }
    });

    if (candidates.length === 0 && appSelectedRegion === "ALL") {
      candidates = (vodStreams || []).map(m => ({ ...m, type: "vod" })).concat(
        (seriesStreams || []).map(s => ({ ...s, type: "series" }))
      );
    }

    const withPosters = candidates.filter(c => c.stream_icon || c.cover);
    const pool = withPosters.length > 0 ? withPosters : candidates;

    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      homeFeaturedItem = pool[randomIndex];
    }
  }

  function updateHomeHeroBanner() {
    const heroBackdrop = document.getElementById("homeHeroBackdrop");
    const heroTitle = document.getElementById("homeHeroTitle");
    const heroRating = document.getElementById("homeHeroRating");
    const heroYear = document.getElementById("homeHeroYear");
    const heroCategory = document.getElementById("homeHeroCategory");
    const heroPlayBtn = document.getElementById("homeHeroPlayBtn");
    const heroInfoBtn = document.getElementById("homeHeroInfoBtn");

    if (homeFeaturedItem) {
      const displayTitle = cleanTitle(homeFeaturedItem.name || homeFeaturedItem.title || "Featured Movie");
      if (heroTitle) heroTitle.textContent = displayTitle;
      const posterSrc = homeFeaturedItem.stream_icon || homeFeaturedItem.cover || "";
      if (heroBackdrop) {
        if (posterSrc) {
          heroBackdrop.src = posterSrc;
          heroBackdrop.style.display = "block";
        } else {
          heroBackdrop.src = "";
          heroBackdrop.style.display = "none";
        }
      }
      const ratingVal = document.getElementById("homeHeroRatingValue");
      if (ratingVal) {
        ratingVal.textContent = homeFeaturedItem.rating || "8.8";
      } else if (heroRating) {
        heroRating.innerHTML = `<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> <span>${homeFeaturedItem.rating || "8.8"}</span>`;
      }
      if (heroYear) heroYear.textContent = String(homeFeaturedItem.year || homeFeaturedItem.release_date || "2025").substring(0, 4);
      if (heroCategory) heroCategory.textContent = homeFeaturedItem.type === "series" ? "TV Series" : "Cinema";

      if (heroPlayBtn) {
        heroPlayBtn.onclick = () => {
          if (homeFeaturedItem.type === "vod") {
            playVodMovie(homeFeaturedItem.stream_id, homeFeaturedItem.name || homeFeaturedItem.title, homeFeaturedItem.container_extension, homeFeaturedItem.url || homeFeaturedItem.direct_source || "");
          } else if (homeFeaturedItem.type === "series") {
            openSeries({ dataset: { seriesId: homeFeaturedItem.series_id || homeFeaturedItem.stream_id, title: homeFeaturedItem.name || homeFeaturedItem.title } });
          } else {
            playStream(homeFeaturedItem.stream_id, homeFeaturedItem.name, homeFeaturedItem.stream_icon, 0, homeFeaturedItem.url);
          }
        };
      }

      if (heroInfoBtn) {
        heroInfoBtn.onclick = () => {
          if (homeFeaturedItem.type === "series") {
            openSeries({ dataset: { seriesId: homeFeaturedItem.series_id || homeFeaturedItem.stream_id, title: homeFeaturedItem.name || homeFeaturedItem.title } });
          } else {
            showToast(`${displayTitle} • ${homeFeaturedItem.year || "2025"}`);
          }
        };
      }
    } else {
      if (heroBackdrop) {
        heroBackdrop.src = "";
        heroBackdrop.style.display = "none";
      }
      if (heroTitle) heroTitle.textContent = "KC IPTV";
      const ratingVal = document.getElementById("homeHeroRatingValue");
      if (ratingVal) {
        ratingVal.textContent = "8.8";
      } else if (heroRating) {
        heroRating.innerHTML = `<svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> <span>8.8</span>`;
      }
      if (heroYear) heroYear.textContent = "2025";
      if (heroCategory) heroCategory.textContent = "Cinema";
      if (heroPlayBtn) {
        heroPlayBtn.onclick = () => {
          if (!xtreamAuth && (!vodStreams || vodStreams.length === 0)) {
            showToast(t("xtreamRequiredForVod"));
            return;
          }
          pickRandomFeaturedItem();
          if (homeFeaturedItem) {
            updateHomeHeroBanner();
            if (homeFeaturedItem.type === "vod") {
              playVodMovie(homeFeaturedItem.stream_id, homeFeaturedItem.name || homeFeaturedItem.title, homeFeaturedItem.container_extension, homeFeaturedItem.url || homeFeaturedItem.direct_source || "");
            } else if (homeFeaturedItem.type === "series") {
              openSeries({ dataset: { seriesId: homeFeaturedItem.series_id || homeFeaturedItem.stream_id, title: homeFeaturedItem.name || homeFeaturedItem.title } });
            }
          } else {
            openHomeViewAll("vod");
          }
        };
      }
      if (heroInfoBtn) {
        heroInfoBtn.onclick = () => showToast("KC IPTV • 2025");
      }
    }
  }

  function startFeaturedCycle() {
    if (homeFeaturedCycleTimer) clearInterval(homeFeaturedCycleTimer);
    homeFeaturedCycleTimer = setInterval(() => {
      if (isTouchLayout() && mobileActiveSection === "home") {
        pickRandomFeaturedItem();
        updateHomeHeroBanner();
      }
    }, 10000);
  }

  async function initMobileHomeScreen() {
    const homeScreen = document.getElementById("mobileHomeScreen");
    if (!homeScreen) return;
    homeScreen.classList.remove("hidden");

    renderMobileHomeScreen();

    if (!xtreamAuth || isFetchingHomeShelves) return;
    isFetchingHomeShelves = true;

    try {
      const loadPromises = [];

      // Load top VOD categories for region (Movies)
      const rawVod = (vodCategories || []);
      const regionVod = appSelectedRegion === "ALL" ? rawVod : rawVod.filter(c => isCategoryInRegion(c, true, appSelectedRegion));
      const topVod = regionVod.slice(0, 5);
      topVod.forEach(cat => {
        loadPromises.push(loadXtreamCategory("vod", cat.category_id));
      });

      // Load top Series categories for region
      const rawSeries = (seriesCategories || []);
      const regionSeries = appSelectedRegion === "ALL" ? rawSeries : rawSeries.filter(c => isCategoryInRegion(c, true, appSelectedRegion));
      const topSeries = regionSeries.slice(0, 4);
      topSeries.forEach(cat => {
        loadPromises.push(loadXtreamCategory("series", cat.category_id));
      });

      // Load top Live categories if empty
      if (Array.isArray(allCategories) && allCategories.length > 0 && allStreams.length === 0) {
        const rawLive = allCategories;
        const regionLive = appSelectedRegion === "ALL" ? rawLive : rawLive.filter(c => isCategoryInRegion(c, false, appSelectedRegion));
        const firstCat = regionLive.length ? regionLive[0] : (appSelectedRegion === "ALL" ? rawLive[0] : null);
        if (firstCat) loadPromises.push(loadXtreamCategory("live", firstCat.category_id));
      }

      if (loadPromises.length > 0) {
        await Promise.all(loadPromises);
      }
    } catch (e) {
      console.warn("Failed loading some home shelves:", e);
    } finally {
      isFetchingHomeShelves = false;
      pickRandomFeaturedItem();
      renderMobileHomeScreen();
    }
  }

  function renderMobileHomeScreen() {
    const homeScreen = document.getElementById("mobileHomeScreen");
    if (!homeScreen) return;

    if (!homeFeaturedItem) {
      pickRandomFeaturedItem();
    }
    updateHomeHeroBanner();
    startFeaturedCycle();

    const shelvesContainer = document.getElementById("homeShelvesContainer");
    if (!shelvesContainer) return;
    shelvesContainer.innerHTML = "";

    function renderShelf(title, rawItems, type, catId, catName) {
      const shelf = document.createElement("section");
      shelf.className = "home-shelf";

      const shelfIconSvg = type === "series"
        ? '<svg class="ui-svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>'
        : '<svg class="ui-svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>';

      const header = document.createElement("div");
      header.className = "home-shelf-header";
      header.innerHTML = `
        <div class="home-shelf-title-wrap">
          <h2 class="home-shelf-title">${shelfIconSvg} <span>${title}</span></h2>
        </div>
        <button class="home-shelf-view-all-btn" type="button">
          <span>View All</span>
          <svg class="ui-svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </button>
      `;
      header.addEventListener("click", () => openHomeViewAll(type, catId, catName));
      shelf.appendChild(header);

      const scrollRow = document.createElement("div");
      scrollRow.className = "home-shelf-scroll";

      // If category has no streams yet, load in background
      if (catId && catId !== "all" && (!rawItems || rawItems.length === 0) && xtreamAuth) {
        loadXtreamCategory(type, catId).then(() => {
          if (isTouchLayout() && mobileActiveSection === "home") {
            const updated = (type === "vod" ? vodStreams : seriesStreams).filter(s => String(s.category_id) === String(catId));
            if (updated.length > 0) renderMobileHomeScreen();
          }
        }).catch(() => {});
      }

      // Prepare exactly 10 items (real or placeholder)
      const displayItems = [];
      const count = Math.min((rawItems || []).length, 10);
      for (let i = 0; i < count; i++) {
        displayItems.push(rawItems[i]);
      }
      // If fewer than 10, fill with styled placeholder cards
      while (displayItems.length < 10) {
        const num = displayItems.length + 1;
        displayItems.push({
          name: type === "series" ? `Series ${num}` : `Movie ${num}`,
          stream_icon: "",
          cover: "",
          isPlaceholder: true
        });
      }

      displayItems.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "home-shelf-card focusable";
        card.tabIndex = 0;
        const itemTitle = cleanTitle(item.name || item.title || "");
        const posterSrc = item.stream_icon || item.cover || "";
        const fallbackIcon = type === "series"
          ? '<svg class="ui-svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>'
          : '<svg class="ui-svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>';

        card.innerHTML = `
          <div class="home-card-poster-container">
            ${posterSrc ? `<img src="${posterSrc}" class="home-card-poster-img" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}
            <div class="home-card-fallback-icon" style="${posterSrc ? 'display:none;' : 'display:flex;'}">${fallbackIcon}</div>
            <div class="home-card-title-overlay">
              <div class="home-card-title">${itemTitle}</div>
            </div>
          </div>
        `;

        card.addEventListener("click", () => {
          if (item.isPlaceholder) {
            if (!xtreamAuth) {
              showToast(t("xtreamRequiredForVod"));
              return;
            }
            openHomeViewAll(type, catId, catName);
            return;
          }
          if (type === "vod") {
            playVodMovie(item.stream_id, item.name || item.title, item.container_extension, item.url || item.direct_source || "");
          } else if (type === "series") {
            openSeries({ dataset: { seriesId: item.series_id || item.stream_id, title: item.name || item.title } });
          }
        });

        scrollRow.appendChild(card);
      });

      // 11th CARD: View All Card
      const viewAllCard = document.createElement("div");
      viewAllCard.className = "home-shelf-view-all-card focusable";
      viewAllCard.tabIndex = 0;
      viewAllCard.innerHTML = `
        <div class="home-card-view-all-container">
          <div class="home-card-view-all-icon"><svg class="ui-svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg></div>
          <span class="home-card-view-all-text">View All</span>
        </div>
      `;
      viewAllCard.addEventListener("click", () => openHomeViewAll(type, catId, catName));
      scrollRow.appendChild(viewAllCard);

      shelf.appendChild(scrollRow);
      shelvesContainer.appendChild(shelf);
    }

    // Determine category shelves for selected region
    const rawVod = (vodCategories || []);
    const rawSeries = (seriesCategories || []);
    const activeVodCats = appSelectedRegion === "ALL" ? rawVod : rawVod.filter(c => isCategoryInRegion(c, true, appSelectedRegion));
    const activeSeriesCats = appSelectedRegion === "ALL" ? rawSeries : rawSeries.filter(c => isCategoryInRegion(c, true, appSelectedRegion));

    const shelvesToRender = [];

    // Top Movie categories
    activeVodCats.slice(0, 4).forEach(cat => {
      const catStreams = (vodStreams || []).filter(s => String(s.category_id) === String(cat.category_id));
      shelvesToRender.push({
        title: cleanTitle(cat.category_name, ["HEVC", "VIP"]),
        items: catStreams,
        type: "vod",
        categoryId: cat.category_id,
        categoryName: cat.category_name
      });
    });

    // Top Series categories
    activeSeriesCats.slice(0, 3).forEach(cat => {
      const catStreams = (seriesStreams || []).filter(s => String(s.category_id) === String(cat.category_id));
      shelvesToRender.push({
        title: cleanTitle(cat.category_name, ["HEVC", "VIP"]),
        items: catStreams,
        type: "series",
        categoryId: cat.category_id,
        categoryName: cat.category_name
      });
    });

    // Fallback if no categories exist for selected region
    if (shelvesToRender.length === 0) {
      const regionLabel = appSelectedRegion === "ALL" ? "" : ` ${appSelectedRegion}`;
      shelvesToRender.push({
        title: `${regionLabel} Movies`.trim(),
        items: (vodStreams || []).filter(s => isStreamInRegion(s, "vod", appSelectedRegion)).slice(0, 10),
        type: "vod",
        categoryId: "all",
        categoryName: `${regionLabel} Movies`.trim()
      });
      shelvesToRender.push({
        title: `${regionLabel} Series`.trim(),
        items: (seriesStreams || []).filter(s => isStreamInRegion(s, "series", appSelectedRegion)).slice(0, 10),
        type: "series",
        categoryId: "all",
        categoryName: `${regionLabel} Series`.trim()
      });
    }

    shelvesToRender.forEach(shelfDef => {
      renderShelf(shelfDef.title, shelfDef.items, shelfDef.type, shelfDef.categoryId, shelfDef.categoryName);
    });

    updateHeaderBackButton();
  }

  // OFFLINE STATE: native ConnectivityManager pushes via window.kcSetOnline; browser events as fallback.
  const offlineState = document.getElementById("offlineState");
  const offlineRetryBtn = document.getElementById("offlineRetryBtn");
  let isAppOnline = navigator.onLine !== false;

  function applyOnlineState(online, announce) {
    const wasOnline = isAppOnline;
    isAppOnline = !!online;
    if (offlineState) offlineState.classList.toggle("hidden", isAppOnline);
    document.body.classList.toggle("is-offline", !isAppOnline);
    if (isAppOnline && !wasOnline && announce) {
      showToast(t("backOnline"));
      if (!xtreamAuth && !currentAuth) initProfile();
    }
  }

  window.kcSetOnline = (online) => applyOnlineState(online, true);
  window.addEventListener("online", () => applyOnlineState(true, true));
  window.addEventListener("offline", () => applyOnlineState(false, true));
  applyOnlineState(isAppOnline, false);

  if (offlineRetryBtn) {
    offlineRetryBtn.addEventListener("click", () => {
      if (navigator.onLine !== false) {
        applyOnlineState(true, true);
        if (xtreamAuth) loginXtream(xtreamAuth.server, xtreamAuth.username, xtreamAuth.password, true);
      } else {
        showToast(t("offlineTitle"));
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
      setElementFocus(li);
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
      setElementFocus(li);
      document.querySelectorAll("#categoryList .nav-item").forEach(el => el.classList.remove("active"));
      li.classList.add("active");
      currentCategoryId = li.dataset.catId;
      filterChannels();
      navigateColumn(li, "right");
    });
  }

  if (channelList) {
    channelList.addEventListener("click", e => {
      const favBtn = e.target.closest(".channel-fav-btn");
      if (favBtn && favBtn.dataset.streamId) {
        e.stopPropagation();
        toggleFavorite(favBtn.dataset.streamId);
        return;
      }

      const li = e.target.closest("li, .channel-card, .grid-item");
      if (!li) return;
      setElementFocus(li);

      if (li.dataset.action === "series-back") {
        selectedSeries = null;
        filterChannels();
        setElementFocus(channelList.querySelector(".poster-card"));
        return;
      }

      if (li.dataset.episodeId) {
        lastFocusedPoster = li;
        playSeriesEpisode(li.dataset.episodeId, li.dataset.title, li.dataset.containerExtension, li.dataset.directUrl || "");
        return;
      }

      if (li.dataset.seriesId || currentModus === "series") {
        lastFocusedPoster = li;
        openSeries(li);
        return;
      }

      if (!li.dataset.streamId) return;
      if (currentModus === "vod" || li.classList.contains("poster-card")) {
        lastFocusedPoster = li;
        playVodMovie(li.dataset.streamId, li.dataset.title, li.dataset.containerExtension, li.dataset.directUrl || "");
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

  // Intuitive tap-to-switch for column navigation headers
  document.querySelectorAll(".col-nav").forEach(col => {
    const label = col.querySelector(".tab-label");
    if (label) {
      label.addEventListener("click", () => {
        const idx = parseInt(col.dataset.col, 10);
        if (!isNaN(idx)) {
          enterColumn(idx);
        }
      });
    }
  });

  // TV D-PAD CONTEXT ACTION SELECTOR
  const tvDpadModal = document.getElementById("tvDpadModal");
  const tvDpadBackdrop = document.getElementById("tvDpadBackdrop");
  const tvDpadCenterTitle = document.getElementById("tvDpadCenterTitle");
  let tvDpadCurrentOptions = null;
  let tvDpadTargetElement = null;
  let enterPressTimer = null;
  let enterPressTarget = null;
  let isLongPressTriggered = false;

  function isDpadMenuOpen() {
    return !!(tvDpadModal && !tvDpadModal.classList.contains("hidden"));
  }

  function closeDpadMenu() {
    if (!isDpadMenuOpen()) return;
    tvDpadModal.classList.add("hidden");
    tvDpadModal.setAttribute("aria-hidden", "true");
    const toFocus = tvDpadTargetElement;
    tvDpadCurrentOptions = null;
    tvDpadTargetElement = null;
    if (toFocus && document.body.contains(toFocus)) {
      setElementFocus(toFocus);
    }
  }

  function getDpadOptions(target) {
    if (!target) return null;

    // 1. Channel item:
    const channelCard = target.closest("#channelList .channel-card, #channelList .grid-item, #channelList [data-stream-id], #channelList [data-series-id], #channelList [data-episode-id], #channelList li");
    if (channelCard) {
      const streamId = channelCard.dataset.streamId || channelCard.dataset.seriesId || channelCard.dataset.episodeId;
      const titleEl = channelCard.querySelector(".channel-name, .poster-title, .episode-title");
      const name = titleEl ? titleEl.textContent.trim() : (channelCard.getAttribute("aria-label") || channelCard.dataset.title || "Channel");
      const isFav = streamId && favorites.includes(streamId.toString());
      const inFavModus = currentModus === "favorites";

      return {
        title: name,
        up: {
          icon: isFav ? "★" : "☆",
          label: isFav ? (t("favoritesRemove") || "Remove favorite") : (t("hintFavorite") || "Favorite"),
          action: () => {
            if (streamId) toggleFavorite(streamId);
          }
        },
        down: inFavModus && streamId ? {
          icon: "↕️",
          label: t("hintReorder") || "Reorder",
          action: () => toggleMoveMode(streamId)
        } : null,
        left: null,
        right: null
      };
    }

    // 2. Category item:
    const catItem = target.closest("#categoryList [data-cat-id], #categoryList .nav-item, #categoryList li");
    if (catItem) {
      const catId = catItem.dataset.catId;
      const rawText = catItem.textContent.trim().replace(/^⭐\s*/, "");
      const name = rawText || "Category";
      const kind = categoryKind();
      const isCatFav = catId && categoryFavorites[kind] && categoryFavorites[kind].indexOf(String(catId)) !== -1;

      return {
        title: name,
        up: catId ? {
          icon: isCatFav ? "★" : "☆",
          label: isCatFav ? (t("favoritesRemove") || "Remove favorite") : (t("hintFavorite") || "Favorite"),
          action: () => toggleCategoryFavorite(catId)
        } : null,
        down: catId ? {
          icon: "🚫",
          label: t("hintHide") || "Hide category",
          action: () => hideCategory(catId)
        } : null,
        left: null,
        right: null
      };
    }

    // 3. Region item:
    const regItem = target.closest("#regionList [data-region], #regionList .nav-item, #regionList li");
    if (regItem) {
      const region = regItem.dataset.region || regItem.textContent.trim().replace(/^[♥⭐]\s*/, "");
      const kind = regionKind();
      const isRegFav = region && regionPrefs.fav[kind] && regionPrefs.fav[kind].indexOf(region) !== -1;

      return {
        title: region || "Region",
        up: region ? {
          icon: isRegFav ? "★" : "☆",
          label: isRegFav ? (t("favoritesRemove") || "Remove favorite") : (t("hintFavorite") || "Favorite"),
          action: () => toggleRegionFavorite(region)
        } : null,
        down: null,
        left: null,
        right: null
      };
    }

    return null;
  }

  function isValidDpadTarget(target) {
    if (!target) return false;
    if (target.closest("#channelList .channel-card, #channelList .grid-item, #channelList [data-stream-id], #channelList [data-series-id], #channelList [data-episode-id], #channelList li")) return true;
    if (target.closest("#categoryList [data-cat-id], #categoryList .nav-item, #categoryList li")) return true;
    if (target.closest("#regionList [data-region], #regionList .nav-item, #regionList li")) return true;
    return false;
  }

  function openDpadMenu(target) {
    const opts = getDpadOptions(target);
    if (!opts) return;

    tvDpadCurrentOptions = opts;
    tvDpadTargetElement = target;

    if (tvDpadCenterTitle) tvDpadCenterTitle.textContent = opts.title || "Item";

    ["up", "down", "left", "right"].forEach(dir => {
      const btn = document.getElementById(`tvDpadBtn_${dir}`);
      const icon = document.getElementById(`tvDpadIcon_${dir}`);
      const label = document.getElementById(`tvDpadLabel_${dir}`);
      const opt = opts[dir];

      if (btn) {
        if (opt) {
          btn.classList.remove("is-blank");
          if (icon) icon.textContent = opt.icon || "";
          if (label) label.textContent = opt.label || "";
        } else {
          btn.classList.add("is-blank");
          if (icon) icon.textContent = "";
          if (label) label.textContent = "";
        }
      }
    });

    if (tvDpadModal) {
      tvDpadModal.classList.remove("hidden");
      tvDpadModal.setAttribute("aria-hidden", "false");
    }
  }

  function triggerDpadSector(direction) {
    if (!isDpadMenuOpen() || !tvDpadCurrentOptions) return;
    const opt = tvDpadCurrentOptions[direction];
    if (opt && typeof opt.action === "function") {
      const btn = document.getElementById(`tvDpadBtn_${direction}`);
      if (btn) btn.classList.add("sector-selected");
      setTimeout(() => {
        if (btn) btn.classList.remove("sector-selected");
        closeDpadMenu();
        opt.action();
      }, 140);
    }
  }

  if (tvDpadBackdrop) {
    tvDpadBackdrop.addEventListener("click", closeDpadMenu);
  }
  ["up", "down", "left", "right"].forEach(dir => {
    const btn = document.getElementById(`tvDpadBtn_${dir}`);
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerDpadSector(dir);
      });
    }
  });

  function isEnterKey(e) {
    if (!e) return false;
    const key = e.keyCode || e.which;
    return (
      key === 13 || key === 23 || key === 66 || key === 160 ||
      e.key === "Enter" || e.key === "Select" || e.key === "Ok" ||
      e.code === "Enter" || e.code === "NumpadEnter" || e.code === "Select"
    );
  }

  let pointerPressTimer = null;
  let pointerPressTarget = null;
  let dpadPointerStartX = 0;
  let dpadPointerStartY = 0;
  let pointerLongPressed = false;

  function handlePointerDown(e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const target = e.target && e.target.closest
      ? e.target.closest(
          "#channelList .channel-card, #channelList .grid-item, #channelList [data-stream-id], #channelList [data-series-id], #channelList [data-episode-id], #channelList li, #categoryList [data-cat-id], #categoryList .nav-item, #categoryList li, #regionList [data-region], #regionList .nav-item, #regionList li"
        )
      : null;
    if (!target || !isValidDpadTarget(target)) return;
    pointerLongPressed = false;
    pointerPressTarget = target;
    dpadPointerStartX = e.clientX;
    dpadPointerStartY = e.clientY;
    if (pointerPressTimer) clearTimeout(pointerPressTimer);
    pointerPressTimer = setTimeout(() => {
      if (pointerPressTarget) {
        pointerLongPressed = true;
        openDpadMenu(pointerPressTarget);
        pointerPressTarget = null;
      }
    }, 320);
  }

  function handlePointerUp() {
    if (pointerPressTimer) {
      clearTimeout(pointerPressTimer);
      pointerPressTimer = null;
    }
    pointerPressTarget = null;
  }

  function handlePointerMove(e) {
    if (pointerPressTarget) {
      const dist = Math.hypot(e.clientX - dpadPointerStartX, e.clientY - dpadPointerStartY);
      if (dist > 16) {
        handlePointerUp();
      }
    }
  }

  ["#channelList", "#categoryList", "#regionList"].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.addEventListener("pointerdown", handlePointerDown);
      el.addEventListener("pointerup", handlePointerUp);
      el.addEventListener("pointercancel", handlePointerUp);
      el.addEventListener("pointermove", handlePointerMove);
    }
  });

  window.addEventListener("click", (e) => {
    if (pointerLongPressed) {
      pointerLongPressed = false;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }, true);

  // KEYBOARD & NUMPAD HANDLER
  document.addEventListener("keydown", (e) => {
    const key = e.keyCode || e.which;
    const isBack = key === 10009 || key === 461 || key === 27 || e.key === "Back" || e.key === "Escape";

    const isUp = key === 38 || e.key === "ArrowUp";
    const isDown = key === 40 || e.key === "ArrowDown";
    const isLeft = key === 37 || e.key === "ArrowLeft";
    const isRight = key === 39 || e.key === "ArrowRight";
    const isEnter = isEnterKey(e);

    if (isDpadMenuOpen()) {
      e.preventDefault();
      e.stopPropagation();
      if (isUp) triggerDpadSector("up");
      else if (isDown) triggerDpadSector("down");
      else if (isLeft) triggerDpadSector("left");
      else if (isRight) triggerDpadSector("right");
      else if (isBack) closeDpadMenu();
      else if (isEnter && !isLongPressTriggered && !e.repeat) closeDpadMenu();
      return;
    }

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

    const active = document.activeElement;
    let focused = (active && active !== document.body && active.classList.contains("focusable"))
      ? active
      : (document.querySelector(".focused") || active);
    if (!focused || !focused.classList.contains("focusable")) {
      const fallback = pickFallbackFocus();
      if (fallback) {
        setElementFocus(fallback);
        focused = fallback;
      }
    }

    if (isEnter && isValidDpadTarget(focused)) {
      if (!enterPressTimer && !isLongPressTriggered) {
        enterPressTarget = focused;
        enterPressTimer = setTimeout(() => {
          isLongPressTriggered = true;
          openDpadMenu(enterPressTarget);
        }, 320);
      }
    }

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

    if (customizationPage && !customizationPage.classList.contains("hidden")) {
      if (isBack) {
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

    if (settingsPage && !settingsPage.classList.contains("hidden")) {
      if (isBack) {
        e.preventDefault();
        showSettingsPage(false);
      } else if (isUp || isDown || isLeft || isRight) {
        e.preventDefault();
        moveFocusByDirection(focused, isUp ? "up" : isDown ? "down" : isLeft ? "left" : "right", settingsPage);
      } else if (isEnter && focused) {
        e.preventDefault();
        focused.click();
      }
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

    if (e.key === "s" || e.key === "S" || e.key === "Settings" || key === 83 || key === 115 || key === 457) {
      e.preventDefault();
      showSettingsPage(!settingsPage || settingsPage.classList.contains("hidden"));
      return;
    }

    if (isUp && focused && (focused.dataset.modus === "favorites" || focused.dataset.modus === "live") && !movingStreamId) {
      let prev = focused.previousElementSibling;
      while (prev && !isFocusableVisible(prev)) {
        prev = prev.previousElementSibling;
      }
      if (!prev) {
        e.preventDefault();
        if (settingsButton) {
          setElementFocus(settingsButton);
        } else {
          showSettingsPage(true);
        }
        return;
      }
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
        } else if (isEnter || isBack) {
          e.preventDefault();
          video.pause();
          deactiveerFitScreen();
        }
      } else {
        if (isUp || isPageUp) {
          e.preventDefault();
          changeLiveChannel(1);
        } else if (isDown || isPageDown) {
          e.preventDefault();
          changeLiveChannel(-1);
        } else if (isLeft || isEnter || isBack) {
          e.preventDefault();
          deactiveerFitScreen();
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

    // BACK: centralized back handler
    if (isBack) {
      e.preventDefault();
      const handled = window.handleAppBack();
      if (handled === "false") {
        if (window.tizen && window.tizen.application && typeof window.tizen.application.getCurrentApplication === "function") {
          window.tizen.application.getCurrentApplication().exit();
        } else {
          window.close();
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
    if (focused && focused.classList.contains("grid-item")) {
      e.preventDefault();
      if (isRight) navigatePosterGrid(focused, "right");
      else if (isLeft) navigatePosterGrid(focused, "left");
      else if (isDown) navigatePosterGrid(focused, "down");
      else if (isUp) navigatePosterGrid(focused, "up");
      else if (isEnter) {
        if (!isValidDpadTarget(focused)) focused.click();
      }
      return;
    }

    if (isUp) {
      e.preventDefault();
      let prev = focused.previousElementSibling;
      while (prev && !isFocusableVisible(prev)) {
        prev = prev.previousElementSibling;
      }
      if (prev) {
        setElementFocus(prev);
      } else if (settingsButton && (deviceLayout === "tv" || (!document.body.classList.contains("layout-mobile") && settingsButton.offsetParent !== null))) {
        setElementFocus(settingsButton);
      }
      return;
    }

    if (isDown) {
      e.preventDefault();
      if (focused === settingsButton) {
        const fallback = pickFallbackFocus();
        if (fallback) setElementFocus(fallback);
        return;
      }
      let next = focused.nextElementSibling;
      while (next && !isFocusableVisible(next)) {
        next = next.nextElementSibling;
      }
      if (next) {
        setElementFocus(next);
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
      if (!isValidDpadTarget(focused)) {
        focused.click();
      }
      return;
    }
  });

  document.addEventListener("keyup", e => {
    const isEnter = isEnterKey(e);
    if (isEnter) {
      if (enterPressTimer) {
        clearTimeout(enterPressTimer);
        enterPressTimer = null;
      }
      if (isLongPressTriggered) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setTimeout(() => {
          isLongPressTriggered = false;
        }, 80);
        return;
      }
      if (enterPressTarget && isValidDpadTarget(enterPressTarget)) {
        const target = enterPressTarget;
        enterPressTarget = null;
        e.preventDefault();
        target.click();
        return;
      }
      enterPressTarget = null;
    }
    if (seekPreviewTime === null || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    if (seekTimer) clearTimeout(seekTimer);
    commitVodSeek();
  });

  // Welcome screen: first start only, skipped when credentials.local.js is present (testing builds)
  var welcomeScreen = document.getElementById("welcomeScreen");
  var welcomeFlickerLayer = document.getElementById("wcFlicker");
  var welcomeScreenEl = document.getElementById("wcScreen");
  var welcomePrompt = document.getElementById("wcPrompt");
  var welcomeTop = document.getElementById("wcTop");
  var welcomeBottom = document.getElementById("wcBottom");
  var welcomeLine = document.getElementById("wcLine");
  var welcomeBlack = document.getElementById("wcBlack");
  var appPageEl = document.getElementById("appPage");
  var welcomeSeenKey = "iptv_welcome_seen";
  var welcomeTexts = {
    tr: { prompt: "Başlamak için OK'e bas", loading: "Yükleniyor..." },
    en: { prompt: "Press OK to get started", loading: "Loading..." },
    nl: { prompt: "Druk op OK om te beginnen", loading: "Laden..." },
    fr: { prompt: "Appuyez sur OK pour commencer", loading: "Chargement..." }
  };
  var welcomeActive = false;
  var welcomeLeaving = false;
  var welcomeTimers = [];
  var welcomeFadeInMs = 1400;
  var welcomeIntroBus = null;

  function welcomeLater(fn, ms) {
    welcomeTimers.push(setTimeout(fn, ms));
  }
  function welcomeRandom(min, max) {
    return min + Math.random() * (max - min);
  }

  function welcomeFlickerOnce() {
    if (!welcomeActive) return;
    var dim = Math.random() < 0.55;
    if (welcomeScreen) welcomeScreen.style.setProperty("--wc-flick", dim ? welcomeRandom(0.45, 0.9).toFixed(2) : "1");
    if (welcomeFlickerLayer) welcomeFlickerLayer.style.opacity = dim ? welcomeRandom(0, 0.12).toFixed(3) : "0";
    welcomeLater(function() {
      if (welcomeScreen) welcomeScreen.style.setProperty("--wc-flick", "1");
      if (welcomeFlickerLayer) welcomeFlickerLayer.style.opacity = "0";
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
    if (welcomeScreen) welcomeScreen.classList.add("wc-hidden");
  }

  function welcomeRevealSettings() {
    if (welcomeBlack) {
      welcomeBlack.classList.remove("wc-intro");
      welcomeBlack.classList.add("wc-show");
    }
    if (appPageEl) appPageEl.style.visibility = "";
    if (settingsButton) settingsButton.setAttribute("aria-expanded", "true");
    showSettingsPage(true);
    showSettingsTab("profile");
    var sourceTab = settingsPage ? settingsPage.querySelector(".customization-tab[data-tab='profile']") : null;
    if (sourceTab) setElementFocus(sourceTab);
    // Only the black layer is left, so the fade doesn't repaint the animated welcome on the TV
    if (welcomeScreen) {
      welcomeScreen.classList.add("wc-slim");
      welcomeScreen.classList.add("wc-fade");
    }
    welcomeLater(welcomeFinish, 750);
  }

  // Original sounds, synthesized with Web Audio so no licensed asset is needed.
  var welcomeAudio = null;
  function welcomeGetAudio() {
    if (welcomeAudio) return welcomeAudio;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      welcomeAudio = new Ctx();
    } catch (error) {
      welcomeAudio = null;
    }
    return welcomeAudio;
  }
  function welcomePlayIntro() {
    if (welcomeLeaving) return;
    var ctx = welcomeGetAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(function() {});
    var t = ctx.currentTime + 0.15;
    welcomeIntroBus = ctx.createGain();
    welcomeIntroBus.connect(ctx.destination);
    // Two low notes that ring out like a piano with the sustain pedal down
    welcomePianoNote(ctx, welcomeIntroBus, 130.81, t, 8.0, 0.6);
    welcomePianoNote(ctx, welcomeIntroBus, 98.0, t + 1.0, 9.0, 0.6);
  }
  // Fades the intro out when the welcome is dismissed, instead of cutting it off
  function welcomeFadeIntro() {
    if (!welcomeIntroBus || !welcomeAudio) return;
    var now = welcomeAudio.currentTime;
    welcomeIntroBus.gain.cancelScheduledValues(now);
    welcomeIntroBus.gain.setTargetAtTime(0, now, 0.25);
  }
  // Struck-string tone: higher partials die away faster, so the note softens into a long tail
  function welcomePianoNote(ctx, out, freq, start, dur, gain) {
    var partials = [
      { mult: 1, level: 1.0, decay: 1.0 },
      { mult: 2, level: 0.45, decay: 0.6 },
      { mult: 3, level: 0.2, decay: 0.35 }
    ];
    var total = partials.reduce(function(sum, p) { return sum + p.level; }, 0);
    partials.forEach(function(p) {
      var osc = ctx.createOscillator();
      var env = ctx.createGain();
      var peak = (gain * p.level) / total;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * p.mult, start);
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(peak, start + 0.008);
      env.gain.exponentialRampToValueAtTime(0.0001, start + dur * p.decay);
      osc.connect(env);
      env.connect(out);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }
  function welcomePlayTvClose() {
    var ctx = welcomeGetAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(function() {});
    var t = ctx.currentTime + 0.01;
    // Downward sweep, like a CRT losing its high voltage: attack, short hold, then a long fade out
    var sweepDur = 0.9;
    var osc = ctx.createOscillator();
    var amp = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + sweepDur);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    amp.gain.setValueAtTime(0.25, t + 0.3);
    amp.gain.linearRampToValueAtTime(0, t + sweepDur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + sweepDur + 0.05);
    // Short click at the moment the line collapses
    var len = Math.floor(ctx.sampleRate * 0.02);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    var clickGain = ctx.createGain();
    clickGain.gain.value = 0.45;
    src.buffer = buf;
    src.connect(clickGain);
    clickGain.connect(ctx.destination);
    src.start(t);
  }

  function welcomeStart() {
    if (welcomeLeaving) return;
    welcomeLeaving = true;
    welcomeFadeIntro();
    store.setItem(welcomeSeenKey, "1");
    var texts = welcomeTexts[currentLang] || welcomeTexts.en;
    if (welcomePrompt) welcomePrompt.textContent = texts.loading;
    if (welcomeTop) welcomeTop.classList.add("wc-close");
    if (welcomeBottom) welcomeBottom.classList.add("wc-close");
    welcomeLater(function() {
      if (welcomeLine) welcomeLine.classList.add("wc-show");
    }, 420);
    welcomeLater(function() {
      if (welcomeLine) welcomeLine.classList.add("wc-collapse");
      welcomePlayTvClose();
    }, 620);
    welcomeLater(welcomeRevealSettings, 900);
  }

  // Capture phase so the welcome screen consumes every key before the app handles it.
  window.addEventListener("keydown", function(e) {
    if (!welcomeActive) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var key = e.keyCode || e.which;
    if (key === 13 || e.key === "Enter") welcomeStart();
  }, true);

  if (welcomeScreen) {
    welcomeScreen.addEventListener("click", function(e) {
      if (!welcomeActive) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      welcomeStart();
    });
  }

  function maybeShowWelcome() {
    document.documentElement.classList.remove("wc-pending");
    if (!welcomeScreen || window.KC_DEFAULT_LOGIN || store.getItem(welcomeSeenKey)) return;
    var texts = welcomeTexts[currentLang] || welcomeTexts.en;
    if (welcomePrompt) welcomePrompt.textContent = texts.prompt;
    welcomeActive = true;
    // The main menu stays hidden until OK, so it can't cover the welcome
    if (appPageEl) appPageEl.style.visibility = "hidden";
    welcomeScreen.classList.remove("wc-hidden");
    // The picture starts black and fades up; the intro sound waits until it is fully visible
    if (welcomeBlack) {
      welcomeBlack.classList.add("wc-show", "wc-intro");
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          welcomeBlack.classList.remove("wc-show");
        });
      });
    }
    welcomeFlickerLoop();
    welcomeLater(welcomePlayIntro, welcomeFadeInMs);
  }

  initProfile();
  scheduleListRefresh();
  maybeShowWelcome();

  const kcSplash = document.getElementById("kcSplash");
  if (kcSplash) {
    setTimeout(() => {
      kcSplash.classList.add("kc-splash-done");
      setTimeout(() => kcSplash.remove(), 450);
    }, 1200);
  }
});
