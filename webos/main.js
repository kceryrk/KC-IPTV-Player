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

  // Dynamic UI feedback elementen
  let toastMsg = document.getElementById("toastMsg") || createUIElement("toastMsg", "toast-msg");
  let moveBanner = document.getElementById("moveBanner") || createUIElement("moveBanner", "move-banner hidden", "🔴 VERPLAATS-MODUS ACTIEF: Gebruik ⬆/⬇ om te verplaatsen, druk ROOD om te bewaren");
  let currentLang = store.getItem("iptv_lang") || "tr";
  let currentLoginState = "failed";
  const appTranslations = {
    en: {
      generalTab: "General", playbackTab: "Playback", profileTab: "Source", progressCategories: "Loading categories", progressPlaylist: "Downloading playlist", progressParsing: "Reading channels", streamFailed: "Channel error: {reason}", streamTimedOut: "Channel did not start within 20 s: {reason}", streamNoData: "no data received", settings: "Settings", language: "Language", autoplayNext: "Play next episode automatically", customization: "Customization", switchProfile: "Change source", resetApp: "Reset app", close: "Close menu", back: "Back", accentColor: "Accent color", highlightColor: "Highlight color", backgroundImage: "Background image URL", apply: "Apply", removeBackground: "Remove image", done: "Done", previous: "Previous", next: "Next", playPause: "Pause / play", serverUrl: "Server URL", username: "Username", password: "Password", login: "Sign in", connecting: "Connecting to IPTV server...", loginFailed: "Login failed.", modes: "MODES", modeFavorites: "Favorites", modeLive: "Live TV", modeMovies: "Movies", modeSeries: "Series", region: "REGION", categories: "CATEGORIES", allRegions: "ALL", channels: "CHANNELS", movies: "MOVIES", series: "SERIES", liveNow: "Live TV", noNextProgram: "No upcoming program", vodHint: "Up: controls | Play/Pause: toggle | Left/Right: seek", backToSeries: "← Back to series", noEpisodes: "No episodes found", loadingEpisodes: "Loading episodes...", unableLoad: "Unable to load episodes", favoritesRemoved: "Removed from favorites", favoritesAdded: "Added to favorites", moveOnlyFavorites: "Move mode is only available in Favorites", moveStarted: "Move mode started", positionSaved: "Position saved", channelNotFound: "Channel #{number} not found", autoplay: "Autoplay next episode", colors: "Colors", backgroundApplied: "Background updated", backgroundRemoved: "Background removed", invalidBackground: "Enter a valid HTTP or HTTPS image URL", previousEpisode: "Previous episode", nextEpisode: "Next episode", profileChanged: "Profile changed", appReset: "App reset", zapped: "Playing channel #{number}: {title}", colorRed: "Red", colorBlue: "Blue", colorGreen: "Green", colorRose: "Rose", colorOrange: "Orange", colorGold: "Gold", colorTurquoise: "Turquoise", colorLime: "Lime", colorSky: "Sky blue"
    },
    tr: {
      generalTab: "Genel", playbackTab: "Oynatma", profileTab: "Kaynak", progressCategories: "Kategoriler yükleniyor", progressPlaylist: "Playlist indiriliyor", progressParsing: "Kanallar okunuyor", streamFailed: "Kanal hatası: {reason}", streamTimedOut: "Kanal 20 sn içinde açılmadı: {reason}", streamNoData: "veri alınamadı", settings: "Ayarlar", language: "Dil", autoplayNext: "Sonraki bölümü otomatik oynat", customization: "Özelleştirme", switchProfile: "Kaynağı değiştir", resetApp: "Uygulamayı sıfırla", close: "Menüyü kapat", back: "Geri", accentColor: "Vurgu rengi", highlightColor: "Öne çıkan renk", backgroundImage: "Arka plan görseli URL'si", apply: "Uygula", removeBackground: "Görseli kaldır", done: "Tamam", previous: "Önceki", next: "Sonraki", playPause: "Duraklat / oynat", serverUrl: "Sunucu URL'si", username: "Kullanıcı adı", password: "Şifre", login: "Giriş yap", connecting: "IPTV sunucusuna bağlanılıyor...", loginFailed: "Giriş başarısız.", modes: "MODLAR", modeFavorites: "Favoriler", modeLive: "Canlı TV", modeMovies: "Filmler", modeSeries: "Diziler", region: "BÖLGE", categories: "KATEGORİLER", allRegions: "ALL", channels: "KANALLAR", movies: "FİLMLER", series: "DİZİLER", liveNow: "Canlı yayın", noNextProgram: "Sonraki program yok", vodHint: "Yukarı: kontroller | Oynat/Duraklat: değiştir | Sol/Sağ: sar", backToSeries: "← Dizi listesine dön", noEpisodes: "Bölüm bulunamadı", loadingEpisodes: "Bölümler yükleniyor...", unableLoad: "Bölümler yüklenemedi", favoritesRemoved: "Favorilerden çıkarıldı", favoritesAdded: "Favorilere eklendi", moveOnlyFavorites: "Taşıma modu yalnızca Favorilerde kullanılabilir", moveStarted: "Taşıma başladı", positionSaved: "Sıralama kaydedildi", channelNotFound: "#{number} numaralı kanal bulunamadı", autoplay: "Sonraki bölümü otomatik oynat", colors: "Renkler", backgroundApplied: "Arka plan güncellendi", backgroundRemoved: "Arka plan kaldırıldı", invalidBackground: "Geçerli bir HTTP veya HTTPS görsel URL'si girin", previousEpisode: "Önceki bölüm", nextEpisode: "Sonraki bölüm", profileChanged: "Profil değiştirildi", appReset: "Uygulama sıfırlandı", zapped: "Kanal #{number} açılıyor: {title}", colorRed: "Kırmızı", colorBlue: "Mavi", colorGreen: "Yeşil", colorRose: "Pembe", colorOrange: "Turuncu", colorGold: "Altın", colorTurquoise: "Turkuaz", colorLime: "Fıstık yeşili", colorSky: "Gök mavisi"
    },
    nl: {
      generalTab: "Algemeen", playbackTab: "Afspelen", profileTab: "Bron", settings: "Instellingen", language: "Taal", autoplayNext: "Volgende aflevering automatisch afspelen", customization: "Aanpassen", switchProfile: "Bron wijzigen", resetApp: "App resetten", close: "Menu sluiten", back: "Terug", accentColor: "Accentkleur", highlightColor: "Markeringskleur", backgroundImage: "URL van achtergrondafbeelding", apply: "Toepassen", removeBackground: "Afbeelding verwijderen", done: "Gereed", previous: "Vorige", next: "Volgende", playPause: "Pauzeren / afspelen", serverUrl: "Server-URL", username: "Gebruikersnaam", password: "Wachtwoord", login: "Inloggen", connecting: "Verbinden met IPTV-server...", loginFailed: "Inloggen mislukt.", modes: "MODI", modeFavorites: "Favorieten", modeLive: "Live-tv", modeMovies: "Films", modeSeries: "Series", region: "REGIO", categories: "CATEGORIEËN", allRegions: "ALL", channels: "KANALEN", movies: "FILMS", series: "SERIES", liveNow: "Live-uitzending", noNextProgram: "Geen volgend programma", vodHint: "Omhoog: bediening | Afspelen/Pauze: wisselen | Links/Rechts: zoeken", backToSeries: "← Terug naar series", noEpisodes: "Geen afleveringen gevonden", loadingEpisodes: "Afleveringen laden...", unableLoad: "Afleveringen laden mislukt", favoritesRemoved: "Verwijderd uit favorieten", favoritesAdded: "Toegevoegd aan favorieten", moveOnlyFavorites: "Verplaatsen kan alleen in Favorieten", moveStarted: "Verplaatsen gestart", positionSaved: "Positie opgeslagen", channelNotFound: "Kanaal #{number} niet gevonden", autoplay: "Volgende aflevering automatisch afspelen", colors: "Kleuren", backgroundApplied: "Achtergrond bijgewerkt", backgroundRemoved: "Achtergrond verwijderd", invalidBackground: "Voer een geldige HTTP- of HTTPS-afbeeldings-URL in", previousEpisode: "Vorige aflevering", nextEpisode: "Volgende aflevering", profileChanged: "Profiel gewijzigd", appReset: "App gereset", zapped: "Kanaal #{number} wordt afgespeeld: {title}", colorRed: "Rood", colorBlue: "Blauw", colorGreen: "Groen", colorRose: "Roze", colorOrange: "Oranje", colorGold: "Goud", colorTurquoise: "Turquoise", colorLime: "Limoen", colorSky: "Hemelsblauw"
    },
    fr: {
      generalTab: "Général", playbackTab: "Lecture", profileTab: "Source", settings: "Paramètres", language: "Langue", autoplayNext: "Lire automatiquement l’épisode suivant", customization: "Personnalisation", switchProfile: "Changer de source", resetApp: "Réinitialiser l’application", close: "Fermer le menu", back: "Retour", accentColor: "Couleur d’accentuation", highlightColor: "Couleur de surbrillance", backgroundImage: "URL de l’image d’arrière-plan", apply: "Appliquer", removeBackground: "Supprimer l’image", done: "Terminé", previous: "Précédent", next: "Suivant", playPause: "Pause / lecture", serverUrl: "URL du serveur", username: "Nom d’utilisateur", password: "Mot de passe", login: "Connexion", connecting: "Connexion au serveur IPTV...", loginFailed: "Échec de la connexion.", modes: "MODES", modeFavorites: "Favoris", modeLive: "TV en direct", modeMovies: "Films", modeSeries: "Séries", region: "RÉGION", categories: "CATÉGORIES", allRegions: "ALL", channels: "CHAÎNES", movies: "FILMS", series: "SÉRIES", liveNow: "En direct", noNextProgram: "Aucun programme suivant", vodHint: "Haut : commandes | Lecture/Pause : basculer | Gauche/Droite : avancer", backToSeries: "← Retour aux séries", noEpisodes: "Aucun épisode trouvé", loadingEpisodes: "Chargement des épisodes...", unableLoad: "Impossible de charger les épisodes", favoritesRemoved: "Retiré des favoris", favoritesAdded: "Ajouté aux favoris", moveOnlyFavorites: "Le déplacement est réservé aux Favoris", moveStarted: "Déplacement commencé", positionSaved: "Position enregistrée", channelNotFound: "Chaîne #{number} introuvable", autoplay: "Lire automatiquement l’épisode suivant", colors: "Couleurs", backgroundApplied: "Arrière-plan mis à jour", backgroundRemoved: "Arrière-plan supprimé", invalidBackground: "Saisissez une URL d’image HTTP ou HTTPS valide", previousEpisode: "Épisode précédent", nextEpisode: "Épisode suivant", profileChanged: "Profil modifié", appReset: "Application réinitialisée", zapped: "Lecture de la chaîne #{number} : {title}", colorRed: "Rouge", colorBlue: "Bleu", colorGreen: "Vert", colorRose: "Rose", colorOrange: "Orange", colorGold: "Or", colorTurquoise: "Turquoise", colorLime: "Citron vert", colorSky: "Bleu ciel"
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
  Object.assign(appTranslations.en, { presetBackgrounds: "Presets" });
  Object.assign(appTranslations.tr, { presetBackgrounds: "Hazır arka planlar" });
  Object.assign(appTranslations.nl, { presetBackgrounds: "Voorinstellingen" });
  Object.assign(appTranslations.fr, { presetBackgrounds: "Préréglages" });
  Object.assign(appTranslations.en, { m3uGenerateXtream: "⚡ Generate from Xtream", clockFormat: "Clock format", colorTab: "Color", backgroundTab: "Background", clockTab: "Clock" });
  Object.assign(appTranslations.tr, { m3uGenerateXtream: "⚡ Xtream'den oluştur", clockFormat: "Saat biçimi", colorTab: "Renk", backgroundTab: "Arka plan", clockTab: "Saat" });
  Object.assign(appTranslations.nl, { m3uGenerateXtream: "⚡ Genereren uit Xtream", clockFormat: "Klokweergave", colorTab: "Kleur", backgroundTab: "Achtergrond", clockTab: "Klok" });
  Object.assign(appTranslations.fr, { m3uGenerateXtream: "⚡ Générer depuis Xtream", clockFormat: "Format de l'horloge", colorTab: "Couleur", backgroundTab: "Arrière-plan", clockTab: "Horloge" });
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
  Object.assign(appTranslations.en, { categoryLoadTimeout: "This category did not load within 30 s. Check the connection and try again." });
  Object.assign(appTranslations.tr, { categoryLoadTimeout: "Bu kategori 30 sn içinde yüklenmedi. Bağlantıyı kontrol edip tekrar deneyin." });
  Object.assign(appTranslations.nl, { categoryLoadTimeout: "Deze categorie laadde niet binnen 30 s. Controleer de verbinding en probeer het opnieuw." });
  Object.assign(appTranslations.fr, { categoryLoadTimeout: "Cette catégorie ne s'est pas chargée en 30 s. Vérifiez la connexion et réessayez." });

  const CATEGORY_LOAD_TIMEOUT_MS = 30000;

  let xtreamAuth = null;
  let allStreams = [];
  let vodStreams = [];
  let vodCategories = [];
  let seriesCategories = [];
  let xtreamCategoriesLoading = false;
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
  let movingStreamId = null;

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
    const testBtn = document.getElementById("loginTestBtn");
    if (testBtn) testBtn.classList.toggle("hidden", !(state === "failed" || loginCredentialsRejected));
    if (state === "failed") toggleLoginPanel(true, true);
  }

  // One bar in the settings menu and one on the main screen; both show the same download.
  function setLoginProgress(percent, text) {
    const width = `${Math.min(100, Math.max(0, Math.round(percent)))}%`;
    document.querySelectorAll(".login-progress").forEach((box) => {
      box.classList.remove("hidden");
      const bar = box.querySelector(".login-progress-bar");
      const label = box.querySelector(".login-progress-text");
      if (bar) bar.style.width = width;
      if (label) label.textContent = text;
    });
  }

  function hideLoginProgress() {
    document.querySelectorAll(".login-progress").forEach((box) => box.classList.add("hidden"));
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
    if (!settingsPanel || !settingsButton) return;
    const shouldOpen = forceOpen !== null ? forceOpen : settingsPanel.classList.contains("hidden");
    if (shouldOpen && isFitScreen) {
      isFitScreen = false;
      document.body.classList.remove("speler-fit-screen");
    }
    settingsPanel.classList.toggle("hidden", !shouldOpen);
    settingsButton.setAttribute("aria-expanded", String(shouldOpen));
    if (shouldOpen) {
      showCustomizationTab("general");
      const firstItem = settingsPanel.querySelector(".customization-tab.active");
      if (firstItem) setElementFocus(firstItem);
    } else {
      if (appPage && !appPage.classList.contains("hidden")) setElementFocus(settingsButton);
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
      return {
        accent: /^#[0-9a-f]{6}$/i.test(saved.accent || "") ? saved.accent : "#e50914",
        highlight: /^#[0-9a-f]{6}$/i.test(saved.highlight || "") ? saved.highlight : "#ffd700",
        focusWidth: clampFocusWidth(saved.focusWidth),
        backgroundImage
      };
    } catch (error) {
      return { accent: "#e50914", highlight: "#ffd700", focusWidth: 5, backgroundImage: DEFAULT_BACKGROUND };
    }
  }

  let themeConfig = loadThemeConfig();

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
    store.setItem("iptv_theme", JSON.stringify(themeConfig));
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

  function showCustomizationPage(show, tab = "general") {
    if (!customizationPage) return;
    toggleSettingsMenu(show);
    if (show) {
      showCustomizationTab(tab);
      setElementFocus(customizationPage.querySelector(`.customization-tab[data-tab="${tab}"]`));
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
        setElementFocus(document.querySelector("#modusList [data-modus='favorites']"));
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
    let text = str.replace(/\([^)]*\)/g, "").replace(/^[A-Z0-9]{2,5}\s*:\s*/i, "");
    if (tags.length) text = text.replace(new RegExp("\\b(" + tags.join("|") + ")\\b", "gi"), "");
    return text.replace(/\s{2,}/g, " ").trim();
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

  let clock24h = store.getItem("iptv_clock_24h") !== "0";

  function updateClockFormatButton() {
    const button = document.getElementById("clockFormatButton");
    if (button) setIconLabel(button, "clock", `${clock24h ? "24" : "12"} h`);
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
        allCategories = cachedChannels.categories || [];
        currentLiveRegion = "ALL";
        setLoginState("logged-in");
        switchModus(favorites.length ? "favorites" : "live");
        if (currentActiveStreams.length > 0) {
          const first = currentActiveStreams[0];
          playStream(first.stream_id, first.name, first.stream_icon, 0, first.url);
          activeerFitScreen();
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
      } catch (error) {
        if (error.message === t("invalidCredentials")) throw error;
        transportError = transportError || error;
      }
      xtreamAuth = { server, username, password };
      loginCredentialsRejected = false;
      store.setItem("iptv_xtream_profile", JSON.stringify({ server, username, password }));
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
      vodStreams = [];
      seriesStreams = [];
      Object.keys(loadedCategories).forEach((key) => { delete loadedCategories[key]; });
      setLoginState("logged-in");
      if (background) {
        if (currentModus === "vod" || currentModus === "series") setupRegions();
      } else {
        const defaultUrl = ensureDefaultXtreamPlaylist(server, username, password);
        if (defaultUrl) {
          await login(defaultUrl, "", "", false, "m3u");
        } else {
          hideLoginProgress();
          showAppPage();
        }
      }
    } catch (error) {
      hideLoginProgress();
      if (error.message === t("invalidCredentials")) loginCredentialsRejected = true;
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

  const loginTestBtn = document.getElementById("loginTestBtn");
  if (loginTestBtn) {
    loginTestBtn.addEventListener("click", () => {
      if (loginMethod && loginMethod.value === "m3u") {
        showToast(t("playlistUnavailable"));
        return;
      }
      runApiProbe(serverUrlInput.value.trim(), usernameInput.value.trim(), passwordInput.value);
    });
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
  // Done slides the panel out, then closes it like Back. Focusing Done (Down from the last settings item) starts the same close.
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
    settingsDone.addEventListener("focus", closeSettingsAnimated);
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
        return;
      }
      showAppPage();
      switchModus(startMode);

      if (currentActiveStreams.length > 0) {
        const firstStream = currentActiveStreams[0];
        playStream(firstStream.stream_id, firstStream.name, firstStream.stream_icon, 0, firstStream.url);
      }
    } catch (error) {
      hideLoginProgress();
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
      if (isColumnSkipped(idx)) {
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
    if (currentActiveRegion !== "ALL" && (hideRegionColumn || !regions.has(currentActiveRegion))) {
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
      const marker = favoriteRegions.indexOf(reg) !== -1 ? "\u2665 " : (topRegions.includes(reg) ? "\u2B50 " : "");
      const label = document.createElement("span");
      label.className = "region-label";
      label.textContent = marker + (customNames[customNameKey("region", reg)] || reg);
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
    const card = channelList.querySelector(".channel-card.active") || channelList.querySelector(".channel-card");
    setElementFocus(card || document.querySelector("#modusList [data-modus='favorites']"));
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
    if (!seriesId || !xtreamAuth) return;

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

  function flushPosterLoads() {
    posterFlushTimer = null;
    const queue = posterLoadQueue;
    posterLoadQueue = [];
    queue.forEach((img) => {
      if (img.inBand && !img.getAttribute("src") && img.dataset.src) img.src = img.dataset.src;
    });
  }

  function schedulePosterFlush() {
    clearTimeout(posterFlushTimer);
    posterFlushTimer = setTimeout(flushPosterLoads, 200);
  }

  function unloadPoster(img) {
    if (!img.getAttribute("src")) return;
    img.removeAttribute("src");
    img.style.visibility = "";
    img.parentNode.classList.remove("is-loaded", "is-failed");
  }

  function observeVodPosters() {
    if (posterObserver) posterObserver.disconnect();
    clearTimeout(posterFlushTimer);
    posterFlushTimer = null;
    posterLoadQueue = [];
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
        if (isCurrentRequest()) filterChannels();
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
        ? `<img data-src="${s.stream_icon}" class="channel-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="channel-logo-placeholder" style="display:none;">TV</div>`
        : `<div class="channel-logo-placeholder">TV</div>`;

      const starColor = isFav ? "var(--highlight)" : "#444455";
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
        current: { title: decodeEpgText(current.title) || t("liveNow"), time: `${clock(current, "start")} - ${clock(current, "end")}` },
        next: next ? { title: decodeEpgText(next.title) || t("noNextProgram"), time: clock(next, "start") } : null
      };
  }

  async function fetchEPGData(streamId) {
    resetEpgTexts();
    if (!epgVisible) return;
    const epgs = await getEpgListings(streamId);
    // Ignore a late reply for a channel the user already left.
    if (!epgs || String(currentPlayingStreamId) !== String(streamId)) return;
    const info = nowNextFrom(epgs);
    document.getElementById("epgCurrTitle").textContent = info.current.title;
    document.getElementById("epgCurrTime").textContent = info.current.time;
    if (osdEpgCurrTitle) osdEpgCurrTitle.textContent = info.current.title;
    if (osdEpgCurrTime) osdEpgCurrTime.textContent = info.current.time;

    if (info.next) {
      document.getElementById("epgNextTitle").textContent = info.next.title;
      document.getElementById("epgNextTime").textContent = info.next.time;
      if (osdEpgNextTitle) osdEpgNextTitle.textContent = info.next.title;
      if (osdEpgNextTime) osdEpgNextTime.textContent = info.next.time;
    }
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
  let watchdogTime = -1;
  let watchdogTicks = 0;
  let nativeFallbackPending = false; // true while testing native before Hls.js/mpegts fallback

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
  function reportPlaybackError(reason) {
    lastPlaybackReason = reason;
    console.error("Playback:", reason);
    showToast(t("streamFailed", { reason }));
  }
  function startPlaybackTimeout() {
    clearTimeout(playbackTimer);
    lastPlaybackReason = "";
    playbackTimer = setTimeout(() => {
      playbackTimer = null;
      hidePlayerLoading();
      showToast(t("streamTimedOut", { reason: lastPlaybackReason || t("streamNoData") }));
    }, 20000);
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
    liveReconnectAttempts = 0;
    clearPlaybackTimeout();
    hidePlayerLoading();
  });
  video.addEventListener("canplay", hidePlayerLoading);
  video.addEventListener("error", () => {
    if (!lastLive) {
      hidePlayerLoading();
      return;
    }
    // Native attempt is still falling back to Hls.js/mpegts.js; its own handlers report errors.
    if (nativeFallbackPending) return;
    reportPlaybackError(mediaErrorReason(video.error));
    scheduleLiveReconnect();
  });
  video.addEventListener("ended", () => { if (lastLive) scheduleLiveReconnect(); });

  function destroyStreamPlayers() {
    lastLive = null;
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

  function playVodMovie(streamId, title, ext) {
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

    const directMovieUrl = `${xtreamAuth.server}/movie/${xtreamAuth.username}/${xtreamAuth.password}/${streamId}.${ext || 'mp4'}`;

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.src = directMovieUrl;
    showPlayerLoading();
    video.play().catch(console.error);
  }

  function playSeriesEpisode(episodeId, title, ext) {
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
    video.src = `${xtreamAuth.server}/series/${xtreamAuth.username}/${xtreamAuth.password}/${episodeId}.${ext || "mp4"}`;
    showPlayerLoading();
    video.play().catch(console.error);
  }

  async function playStream(streamId, name, icon, index, directUrl = "", isReconnect = false) {
    if (window.kcLibsReady) await window.kcLibsReady;
    playerWrapper.classList.remove("vod-playback");
    if (index !== undefined) currentStreamIndex = index;
    currentPlayingStreamId = String(streamId);

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

    const auth = xtreamAuth || currentAuth;
    const streamUrl = directUrl || (auth && auth.server ? `${auth.server.replace(/\/+$/, "")}/live/${auth.username}/${auth.password}/${streamId}.m3u8` : "");
    const isTransportStream = Boolean(directUrl && /\.ts(?:$|[?#])/i.test(directUrl));
    const hlsUrl = isTransportStream ? streamUrl.replace(/\.ts(?=([?#]|$))/i, ".m3u8") : streamUrl;

    destroyStreamPlayers();
    lastLive = { streamId, name, icon, index, directUrl };
    showPlayerLoading();
    startPlaybackTimeout();
    if (isTransportStream && !window.mpegts) reportPlaybackError("MPEG-TS library not loaded (CDN unreachable?)");

    // Try native playback first — the webOS TV browser handles HLS natively without
    // going through MSE/Hls.js, so segment requests carry no Origin header and avoid
    // CORS rejections from strict IPTV servers.  Mute first to satisfy the browser's
    // autoplay policy, then unmute immediately after the video starts.
    function tryNative(url, onFail) {
      nativeFallbackPending = true;
      video.src = url;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(() => {
          nativeFallbackPending = false;
          video.muted = false;
          video.volume = 1.0;
        }).catch(err => {
          nativeFallbackPending = false;
          console.warn("Native video playback failed:", err);
          video.removeAttribute("src");
          video.load();
          if (typeof onFail === "function") onFail();
        });
      } else {
        // Synchronous play (older webOS) — just unmute.
        nativeFallbackPending = false;
        video.muted = false;
        video.volume = 1.0;
      }
    }

    if (hlsUrl) {
      tryNative(hlsUrl, () => {
        // Native failed — fall back to Hls.js for .m3u8, then mpegts.js for .ts.
        if (isTransportStream && window.mpegts && mpegts.isSupported()) {
          mpegTsPlayer = mpegts.createPlayer({ type: "mpegts", isLive: true, url: streamUrl });
          mpegTsPlayer.on(mpegts.Events.ERROR, (type, detail) => {
            reportPlaybackError(`MPEG-TS ${type}: ${detail}`);
            scheduleLiveReconnect();
          });
          mpegTsPlayer.attachMediaElement(video);
          mpegTsPlayer.load();
          Promise.resolve(mpegTsPlayer.play()).catch(error => {
            reportPlaybackError(`play() ${error.name}: ${error.message}`);
          });
        } else if (window.Hls && Hls.isSupported() && /\.m3u8(?:$|[?#])/i.test(hlsUrl)) {
          hlsPlayer = new Hls({ enableWorker: true });
          hlsPlayer.loadSource(hlsUrl);
          hlsPlayer.attachMedia(video);
          hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(console.error));
          hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              reportPlaybackError(`HLS ${data.type}: ${data.details}`);
              scheduleLiveReconnect();
            }
          });
        } else {
          reportPlaybackError("No playable fallback for this stream");
        }
      });
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
    if (instant) {
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

  function markWheel(container, element) {
    (container._wheelItems || []).forEach((item) => item.classList.remove("wheel-0", "wheel-1", "wheel-2", "wheel-3"));
    (container._wheelCopies || []).forEach((copy) => copy.el.classList.remove("wheel-0", "wheel-1", "wheel-2", "wheel-3"));
    const items = wheelItems(container);
    const focusIndex = items.indexOf(element);
    if (wheelHasCopies(items.length) && focusIndex >= 0) {
      // Distance runs around the loop, so the last rows fade as neighbours of the first rows, and ghost copies fade too.
      const count = items.length;
      const distanceOf = (i) => Math.min(Math.abs(i - focusIndex), count - Math.abs(i - focusIndex));
      const marked = [];
      items.forEach((item, i) => {
        const d = distanceOf(i);
        if (d <= 3) { item.classList.add("wheel-" + d); marked.push(item); }
      });
      (container._wheelCopies || []).forEach((copy) => {
        const d = distanceOf(copy.row);
        if (d <= 3) copy.el.classList.add("wheel-" + d);
      });
      container._wheelItems = marked;
      return;
    }
    const marked = [element];
    element.classList.add("wheel-0");
    let before = element;
    let after = element;
    for (let distance = 1; distance <= 3; distance++) {
      before = before && before.previousElementSibling;
      after = after && after.nextElementSibling;
      if (after && after.classList.contains("wheel-ghost")) after = null;
      if (before) { before.classList.add("wheel-" + distance); marked.push(before); }
      if (after) { after.classList.add("wheel-" + distance); marked.push(after); }
    }
    container._wheelItems = marked;
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
    markWheel(container, element);
    syncWheelCopies(container);
    animateScroll(container, wheelScrollTop(container, element), instant);
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
    const same = layerOk
      && container._wheelCount === copyEach
      && container._wheelSources.length === count
      && container._wheelSources.every((el, i) => el === items[i]);
    if (!same) {
      if (layerOk) container._wheelLayer.remove();
      const layer = document.createElement("div");
      layer.className = "wheel-ghost";
      layer.setAttribute("aria-hidden", "true");
      const copies = [];
      for (let m = -copyEach; m < count + copyEach; m++) {
        if (m >= 0 && m < count) continue;
        const row = ((m % count) + count) % count;
        const el = items[row].cloneNode(true);
        el.removeAttribute("id");
        el.removeAttribute("tabindex");
        el.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
        el.querySelectorAll(".flag-underlay").forEach(underlay => {
          if (!underlay.style.backgroundImage) loadRegionFlag(underlay);
        });
        layer.appendChild(el);
        copies.push({ el, m, row, cycle: Math.floor(m / count) });
      }
      container.appendChild(layer);
      container._wheelLayer = layer;
      container._wheelCopies = copies;
      container._wheelSources = items.slice();
      container._wheelCount = copyEach;
    }
    container._wheelCopies.forEach(copy => {
      const src = items[copy.row];
      copy.el.style.top = (src.offsetTop + copy.cycle * period) + "px";
      copy.el.style.left = src.offsetLeft + "px";
      copy.el.style.width = src.offsetWidth + "px";
      copy.el.className = ("wheel-copy " + src.className.replace(/\b(focused|focusable)\b/g, "")).replace(/\s+/g, " ").trim();
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
    markWheel(container, target);
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
  function showWheelWindow(container, element) {
    if (!wheelWindowEl) {
      wheelWindowEl = document.createElement("div");
      wheelWindowEl.className = "wheel-focus-window";
      document.body.appendChild(wheelWindowEl);
    }
    const listRect = container.getBoundingClientRect();
    const rowRect = element.getBoundingClientRect();
    const h = element.offsetHeight;
    // The fill is copied from the row while it is focused, then the row goes transparent, so the fill stays fixed.
    wheelWindowEl.style.background = getComputedStyle(element).backgroundColor;
    wheelWindowEl.style.left = rowRect.left + "px";
    wheelWindowEl.style.width = rowRect.width + "px";
    wheelWindowEl.style.top = (listRect.top + wheelAnchor(container) - h / 2) + "px";
    wheelWindowEl.style.height = h + "px";
    wheelWindowEl.style.display = "block";
  }

  function hideWheelWindow() {
    if (wheelWindowEl) wheelWindowEl.style.display = "none";
  }

  // Short filtered noise burst, like a clock escapement. Created lazily, so the first call happens after a key press.
  let tickCtx = null;
  let tickBuffer = null;
  function playTick() {
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
      filter.frequency.value = 3500;
      filter.Q.value = 8;
      gain.gain.value = 0.05;
      src.buffer = tickBuffer;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(tickCtx.destination);
      src.start();
    } catch (e) {
      // Sound is optional.
    }
  }

  function setElementFocus(element, instant) {
    if (!element) return;
    const previous = document.querySelector(".focused");
    document.querySelectorAll(".focused").forEach(el => el.classList.remove("focused"));
    element.classList.add("focused");

    // Expand the column first: a collapsed column is display:none and cannot take focus.
    const parentCol = element.closest(".col-nav");
    if (parentCol && parentCol.dataset.col !== undefined) {
      setColumnFocus(parseInt(parentCol.dataset.col, 10));
    }
    // Centre the list before focusing so the focus box never paints at the old position.
    centerInList(element, !!instant);
    const container = element.parentElement;
    if (container && container.classList.contains("wheel") && element.offsetHeight > 0) {
      showWheelWindow(container, element);
      if (previous && previous !== element && previous.parentElement === container) playTick();
    } else {
      hideWheelWindow();
    }
    element.focus({ preventScroll: true });

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
    const isBack = key === 10009 || key === 461 || key === 27 || e.key === "Back" || e.key === "Escape";

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

    // Guide key: fullscreen first, then the overlay. Ignored for movies and series.
    const isGuideKey = key === 458 || e.key === "Guide";
    if (isGuideKey && (currentModus === "live" || currentModus === "favorites")) {
      e.preventDefault();
      if (!isFitScreen) activeerFitScreen();
      else if (guideOpen) closeGuide();
      else openGuide();
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
      const fields = Array.from(loginForm.querySelectorAll(".focusable")).filter((el) => el.offsetParent !== null);
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
        if (next) setElementFocus(next);
        return;
      }
      if (isLeft || isRight) {
        const step = isRight ? 1 : -1;
        const isTextInput = focused && focused.tagName === "INPUT" && focused.type !== "checkbox";
        if (isTextInput && focused.type === "range") return;
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
      }
      if (isEnter && focused) {
        e.preventDefault();
        if (focused === backgroundImageInput) updateBackgroundImage(backgroundImageInput.value);
        else focused.click();
        return;
      }
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
      if (targetStreamId) toggleMoveMode(targetStreamId);
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

    if (isDown && focused === settingsButton) {
      e.preventDefault();
      const firstMode = document.querySelector("#modusList .nav-item.focusable:not(.hidden)");
      if (firstMode) setElementFocus(firstMode);
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
        } else if (isEnter || isBack) {
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

    // BACK: step out one level at a time, and leave the app from the first column
    if (isBack) {
      e.preventDefault();
      if (movingRegion) {
        const done = movingRegion;
        movingRegion = null;
        setupRegions(true);
        focusRegion(done);
        return;
      }
      if (movingStreamId) {
        toggleMoveMode(movingStreamId);
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
        setElementFocus(document.querySelector("#modusList [data-modus='favorites']"));
      } else if (column.id !== "colModus") {
        navigateColumn(focused, "left");
      } else if (window.webOS && typeof webOS.platformBack === "function") {
        webOS.platformBack();
      } else if (window.webOSSystem && typeof webOSSystem.platformBack === "function") {
        webOSSystem.platformBack();
      } else {
        window.close();
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
      } else if (focused.closest("#modusList") && settingsButton) {
        setElementFocus(settingsButton);
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

  initProfile();
  scheduleListRefresh();
});
