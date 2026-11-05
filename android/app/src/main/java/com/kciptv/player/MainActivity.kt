package com.kciptv.player

import android.app.UiModeManager
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.common.TrackSelectionOverride
import androidx.media3.common.TrackSelectionParameters
import androidx.media3.common.Tracks
import androidx.media3.common.text.CueGroup
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import android.os.SystemClock
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val tag = "KCIPTV"
    private var isPlayerFullscreen = false
    private var networkCallback: ConnectivityManager.NetworkCallback? = null
    var lastStatusBarColor: Int? = null
    private var vodAudioPlayer: ExoPlayer? = null
    private var vodAudioCurrentUrl: String? = null
    private var lastAudioSeekRealtimeMs: Long = 0L
    private var userPlaybackSpeed: Float = 1.0f
    private var cachedTracksJson: String = "{\"audioTracks\":[],\"subtitleTracks\":[]}"

    @androidx.annotation.OptIn(androidx.media3.common.util.UnstableApi::class)
    private fun ensureVodAudioPlayer(): ExoPlayer {
        vodAudioPlayer?.let { return it }
        val renderersFactory = DefaultRenderersFactory(this)
            .setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER)
        val httpDataSourceFactory = DefaultHttpDataSource.Factory()
            .setUserAgent("IPTVSmartersPro")
            .setAllowCrossProtocolRedirects(true)
            .setConnectTimeoutMs(15000)
            .setReadTimeoutMs(30000)
        val mediaSourceFactory = DefaultMediaSourceFactory(this)
            .setDataSourceFactory(httpDataSourceFactory)
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                15000, // minBufferMs
                45000, // maxBufferMs
                600,   // bufferForPlaybackMs (fast initial start)
                1200   // bufferForPlaybackAfterRebufferMs
            )
            .setPrioritizeTimeOverSizeThresholds(true)
            .build()

        val player = ExoPlayer.Builder(this, renderersFactory)
            .setMediaSourceFactory(mediaSourceFactory)
            .setLoadControl(loadControl)
            .build()

        // Disable video renderer so only audio & optional subtitle tracks are decoded
        player.trackSelectionParameters = player.trackSelectionParameters
            .buildUpon()
            .setTrackTypeDisabled(C.TRACK_TYPE_VIDEO, true)
            .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true)
            .setTrackTypeDisabled(C.TRACK_TYPE_AUDIO, false)
            .build()

        player.addListener(object : Player.Listener {
            override fun onTracksChanged(tracks: Tracks) {
                updateAndPushVodTracks(tracks)
            }

            override fun onCues(cueGroup: CueGroup) {
                val lines = cueGroup.cues.mapNotNull { it.text?.toString()?.trim() }.filter { it.isNotEmpty() }
                val combined = lines.joinToString("\n")
                val escaped = org.json.JSONObject.quote(combined)
                if (::webView.isInitialized) {
                    webView.evaluateJavascript("window.onNativeSubtitleCue && window.onNativeSubtitleCue($escaped)", null)
                }
            }
        })

        vodAudioPlayer = player
        return player
    }

    @androidx.annotation.OptIn(androidx.media3.common.util.UnstableApi::class)
    private fun updateAndPushVodTracks(tracks: Tracks) {
        try {
            val audioArr = org.json.JSONArray()
            val subArr = org.json.JSONArray()
            var audioCounter = 1
            var subCounter = 1

            for ((groupIndex, group) in tracks.groups.withIndex()) {
                val trackType = group.type
                if (trackType != C.TRACK_TYPE_AUDIO && trackType != C.TRACK_TYPE_TEXT) continue

                for (trackIndex in 0 until group.length) {
                    val format = group.getTrackFormat(trackIndex)
                    val isSelected = group.isTrackSelected(trackIndex)
                    val isSupported = group.isTrackSupported(trackIndex)
                    val langCode = format.language ?: ""
                    val langDisplay = if (langCode.isNotEmpty() && langCode != "und") {
                        try {
                            Locale.forLanguageTag(langCode).getDisplayLanguage(Locale.ENGLISH)
                                .replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.ENGLISH) else it.toString() }
                        } catch (_: Exception) {
                            langCode.uppercase(Locale.ENGLISH)
                        }
                    } else ""
                    val rawLabel = format.label ?: ""
                    val codecShort = when {
                        format.sampleMimeType?.contains("eac3") == true -> "E-AC3"
                        format.sampleMimeType?.contains("ac3") == true -> "AC3"
                        format.sampleMimeType?.contains("dts") == true -> "DTS"
                        format.sampleMimeType?.contains("truehd") == true -> "TrueHD"
                        format.sampleMimeType?.contains("aac") == true -> "AAC"
                        format.sampleMimeType?.contains("mpeg") == true -> "MP3"
                        format.sampleMimeType?.contains("opus") == true -> "Opus"
                        format.sampleMimeType?.contains("vorbis") == true -> "Vorbis"
                        format.sampleMimeType?.contains("flac") == true -> "FLAC"
                        else -> ""
                    }
                    val channelsDesc = when (format.channelCount) {
                        6 -> "5.1"
                        8 -> "7.1"
                        2 -> "2.0"
                        1 -> "Mono"
                        else -> ""
                    }

                    if (trackType == C.TRACK_TYPE_AUDIO) {
                        val parts = mutableListOf<String>()
                        if (rawLabel.isNotEmpty()) parts.add(rawLabel)
                        if (langDisplay.isNotEmpty() && !rawLabel.contains(langDisplay, ignoreCase = true)) {
                            parts.add(langDisplay)
                        }
                        if (parts.isEmpty()) parts.add("Audio Track $audioCounter")
                        val meta = listOf(codecShort, channelsDesc).filter { it.isNotEmpty() }.joinToString(" ")
                        val displayTitle = if (meta.isNotEmpty()) "${parts.joinToString(" - ")} ($meta)" else parts.joinToString(" - ")
                        audioCounter++

                        val obj = org.json.JSONObject().apply {
                            put("groupIndex", groupIndex)
                            put("trackIndex", trackIndex)
                            put("language", langCode)
                            put("label", displayTitle)
                            put("codec", codecShort)
                            put("channels", channelsDesc)
                            put("selected", isSelected)
                            put("supported", isSupported)
                        }
                        audioArr.put(obj)
                    } else if (trackType == C.TRACK_TYPE_TEXT) {
                        val parts = mutableListOf<String>()
                        if (rawLabel.isNotEmpty()) parts.add(rawLabel)
                        if (langDisplay.isNotEmpty() && !rawLabel.contains(langDisplay, ignoreCase = true)) {
                            parts.add(langDisplay)
                        }
                        if (parts.isEmpty()) parts.add("Subtitle $subCounter")
                        subCounter++

                        val obj = org.json.JSONObject().apply {
                            put("groupIndex", groupIndex)
                            put("trackIndex", trackIndex)
                            put("language", langCode)
                            put("label", parts.joinToString(" - "))
                            put("selected", isSelected)
                            put("supported", isSupported)
                        }
                        subArr.put(obj)
                    }
                }
            }

            val root = org.json.JSONObject().apply {
                put("audioTracks", audioArr)
                put("subtitleTracks", subArr)
            }
            cachedTracksJson = root.toString()
            if (::webView.isInitialized) {
                webView.evaluateJavascript("window.onNativeVodTracksUpdated && window.onNativeVodTracksUpdated($cachedTracksJson)", null)
            }
        } catch (e: Exception) {
            Log.w(tag, "updateAndPushVodTracks error: ${e.message}")
        }
    }

    fun getVodTracksJsonInternal(): String = cachedTracksJson

    fun startNativeVodAudio(url: String, positionMs: Long, playWhenReady: Boolean) {
        runOnUiThread {
            try {
                val player = ensureVodAudioPlayer()
                val targetPos = positionMs.coerceAtLeast(0L)
                if (vodAudioCurrentUrl != url) {
                    vodAudioCurrentUrl = url
                    cachedTracksJson = "{\"audioTracks\":[],\"subtitleTracks\":[]}"
                    lastAudioSeekRealtimeMs = SystemClock.elapsedRealtime()
                    player.setMediaItem(MediaItem.fromUri(Uri.parse(url)), targetPos)
                    player.prepare()
                } else if (player.playbackState != Player.STATE_BUFFERING &&
                    Math.abs(player.currentPosition - targetPos) > 1200L
                ) {
                    lastAudioSeekRealtimeMs = SystemClock.elapsedRealtime()
                    player.seekTo(targetPos)
                }
                player.volume = 1.0f
                player.playWhenReady = playWhenReady
            } catch (e: Exception) {
                Log.w(tag, "startNativeVodAudio error: ${e.message}")
            }
        }
    }

    fun seekNativeVodAudio(positionMs: Long, isPlaying: Boolean) {
        runOnUiThread {
            val player = vodAudioPlayer ?: return@runOnUiThread
            try {
                val targetPos = positionMs.coerceAtLeast(0L)
                lastAudioSeekRealtimeMs = SystemClock.elapsedRealtime()
                player.setPlaybackParameters(PlaybackParameters(userPlaybackSpeed))
                if (player.playbackState != Player.STATE_IDLE) {
                    player.seekTo(targetPos)
                }
                if (player.playWhenReady != isPlaying) {
                    player.playWhenReady = isPlaying
                }
            } catch (e: Exception) {
                Log.w(tag, "seekNativeVodAudio error: ${e.message}")
            }
        }
    }

    fun syncNativeVodAudio(positionMs: Long, isPlaying: Boolean) {
        runOnUiThread {
            val player = vodAudioPlayer ?: return@runOnUiThread
            try {
                if (player.playWhenReady != isPlaying) {
                    player.playWhenReady = isPlaying
                }
                if (!isPlaying || player.playbackState != Player.STATE_READY) {
                    // Never seek while buffering or paused — avoids HTTP range re-requests & initial 15s choppiness
                    return@runOnUiThread
                }
                val now = SystemClock.elapsedRealtime()
                val audioPos = player.currentPosition
                val signedDiff = positionMs - audioPos // positive means video is ahead of audio
                val absDiff = Math.abs(signedDiff)

                if (absDiff > 2200L && (now - lastAudioSeekRealtimeMs) > 3000L) {
                    lastAudioSeekRealtimeMs = now
                    player.setPlaybackParameters(PlaybackParameters(userPlaybackSpeed))
                    player.seekTo(positionMs.coerceAtLeast(0L))
                } else if (absDiff in 260L..2200L) {
                    val nudge = if (signedDiff > 0) 1.035f else 0.965f
                    val desiredSpeed = (userPlaybackSpeed * nudge).coerceIn(0.5f, 2.5f)
                    if (Math.abs(player.playbackParameters.speed - desiredSpeed) > 0.01f) {
                        player.setPlaybackParameters(PlaybackParameters(desiredSpeed))
                    }
                } else if (absDiff < 140L) {
                    if (Math.abs(player.playbackParameters.speed - userPlaybackSpeed) > 0.005f) {
                        player.setPlaybackParameters(PlaybackParameters(userPlaybackSpeed))
                    }
                }
            } catch (e: Exception) {
                Log.w(tag, "syncNativeVodAudio error: ${e.message}")
            }
        }
    }

    fun selectNativeVodAudioTrack(groupIndex: Int, trackIndex: Int) {
        runOnUiThread {
            val player = vodAudioPlayer ?: return@runOnUiThread
            try {
                val groups = player.currentTracks.groups
                if (groupIndex in 0 until groups.size) {
                    val mediaTrackGroup = groups[groupIndex].mediaTrackGroup
                    val params = player.trackSelectionParameters
                        .buildUpon()
                        .setTrackTypeDisabled(C.TRACK_TYPE_AUDIO, false)
                        .clearOverridesOfType(C.TRACK_TYPE_AUDIO)
                        .setOverrideForType(TrackSelectionOverride(mediaTrackGroup, listOf(trackIndex)))
                        .build()
                    player.trackSelectionParameters = params
                }
            } catch (e: Exception) {
                Log.w(tag, "selectNativeVodAudioTrack error: ${e.message}")
            }
        }
    }

    fun selectNativeVodSubtitleTrack(groupIndex: Int, trackIndex: Int) {
        runOnUiThread {
            val player = vodAudioPlayer ?: return@runOnUiThread
            try {
                if (groupIndex < 0 || trackIndex < 0) {
                    val params = player.trackSelectionParameters
                        .buildUpon()
                        .clearOverridesOfType(C.TRACK_TYPE_TEXT)
                        .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true)
                        .build()
                    player.trackSelectionParameters = params
                    if (::webView.isInitialized) {
                        webView.evaluateJavascript("window.onNativeSubtitleCue && window.onNativeSubtitleCue(\"\")", null)
                    }
                    updateAndPushVodTracks(player.currentTracks)
                    return@runOnUiThread
                }
                val groups = player.currentTracks.groups
                if (groupIndex in 0 until groups.size) {
                    val mediaTrackGroup = groups[groupIndex].mediaTrackGroup
                    val params = player.trackSelectionParameters
                        .buildUpon()
                        .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, false)
                        .clearOverridesOfType(C.TRACK_TYPE_TEXT)
                        .setOverrideForType(TrackSelectionOverride(mediaTrackGroup, listOf(trackIndex)))
                        .build()
                    player.trackSelectionParameters = params
                    updateAndPushVodTracks(player.currentTracks)
                }
            } catch (e: Exception) {
                Log.w(tag, "selectNativeVodSubtitleTrack error: ${e.message}")
            }
        }
    }

    fun setNativeVodPlaybackSpeed(speed: Float) {
        runOnUiThread {
            userPlaybackSpeed = speed.coerceIn(0.5f, 2.5f)
            try {
                vodAudioPlayer?.setPlaybackParameters(PlaybackParameters(userPlaybackSpeed))
            } catch (_: Exception) {}
        }
    }

    fun pauseNativeVodAudio() {
        runOnUiThread {
            try {
                vodAudioPlayer?.playWhenReady = false
            } catch (_: Exception) {}
        }
    }

    fun stopNativeVodAudio() {
        runOnUiThread {
            try {
                vodAudioCurrentUrl = null
                cachedTracksJson = "{\"audioTracks\":[],\"subtitleTracks\":[]}"
                userPlaybackSpeed = 1.0f
                vodAudioPlayer?.stop()
                vodAudioPlayer?.clearMediaItems()
                if (::webView.isInitialized) {
                    webView.evaluateJavascript("window.onNativeSubtitleCue && window.onNativeSubtitleCue(\"\")", null)
                }
            } catch (_: Exception) {}
        }
    }

    private fun isNetworkOnline(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return true
        val caps = cm.getNetworkCapabilities(cm.activeNetwork) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun pushNetworkState() {
        val online = isNetworkOnline()
        runOnUiThread {
            if (::webView.isInitialized) {
                webView.evaluateJavascript("window.kcSetOnline && window.kcSetOnline($online)", null)
            }
        }
    }

    private fun registerNetworkCallback() {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) = pushNetworkState()
            override fun onLost(network: Network) = pushNetworkState()
            override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) = pushNetworkState()
        }
        try {
            cm.registerDefaultNetworkCallback(callback)
            networkCallback = callback
        } catch (e: Exception) {
            Log.w(tag, "Network callback registration failed: ${e.message}")
        }
    }

    companion object {
        const val PREFS_NAME = "kc_iptv_prefs"
        const val PREF_DEVICE_LAYOUT = "device_layout"

        @Suppress("DEPRECATION")
        fun detectDeviceType(context: Context): String {
            // 1. Android TV / Google TV / Fire TV / TV Box
            val uiModeManager = context.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
            val isTvUiMode = uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION
            val pm = context.packageManager
            val hasLeanback = pm.hasSystemFeature(PackageManager.FEATURE_LEANBACK)
            val hasTvFeature = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                pm.hasSystemFeature(PackageManager.FEATURE_TELEVISION) ||
                pm.hasSystemFeature(PackageManager.FEATURE_LEANBACK)
            } else {
                pm.hasSystemFeature("android.hardware.type.television")
            }
            val hasTouchscreen = pm.hasSystemFeature(PackageManager.FEATURE_TOUCHSCREEN)

            if (isTvUiMode || hasLeanback || hasTvFeature || !hasTouchscreen) {
                return "tv"
            }

            // 2. Tablet check (sw600dp+ or large layout with diagonal >= 6.8")
            val config = context.resources.configuration
            val isSw600 = config.smallestScreenWidthDp >= 600
            val isLargeLayout = (config.screenLayout and Configuration.SCREENLAYOUT_SIZE_MASK) >= Configuration.SCREENLAYOUT_SIZE_LARGE

            val metrics = context.resources.displayMetrics
            val diagonalInches = if (metrics.xdpi > 0f && metrics.ydpi > 0f) {
                val widthInches = metrics.widthPixels.toDouble() / metrics.xdpi.toDouble()
                val heightInches = metrics.heightPixels.toDouble() / metrics.ydpi.toDouble()
                Math.sqrt(widthInches * widthInches + heightInches * heightInches)
            } else {
                0.0
            }

            if (isSw600 || (isLargeLayout && diagonalInches >= 6.8)) {
                return "tablet"
            }

            // 3. Mobile phone
            return "mobile"
        }
    }

    fun updateSystemBars(isFullscreen: Boolean) {
        isPlayerFullscreen = isFullscreen
        runOnUiThread {
            val detectedType = detectDeviceType(this)
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val layout = prefs.getString(PREF_DEVICE_LAYOUT, detectedType) ?: detectedType
            val controller = WindowInsetsControllerCompat(window, window.decorView)
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

            if (layout.equals("tv", ignoreCase = true)) {
                requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
            } else if (layout.equals("tablet", ignoreCase = true)) {
                requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR
            } else {
                if (isFullscreen) {
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                } else {
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                }
            }

            if (isFullscreen || layout.equals("tv", ignoreCase = true)) {
                WindowCompat.setDecorFitsSystemWindows(window, false)
                controller.hide(WindowInsetsCompat.Type.systemBars())
            } else {
                WindowCompat.setDecorFitsSystemWindows(window, true)
                val barColor = android.graphics.Color.BLACK
                lastStatusBarColor = barColor
                window.statusBarColor = barColor
                window.navigationBarColor = barColor
                controller.isAppearanceLightStatusBars = false
                controller.show(WindowInsetsCompat.Type.statusBars())
                controller.hide(WindowInsetsCompat.Type.navigationBars())
            }
            if (::webView.isInitialized) {
                ViewCompat.requestApplyInsets(webView.parent as View)
            }
        }
    }

    fun applyOrientationForLayout(layout: String) {
        runOnUiThread {
            if (layout.equals("tv", ignoreCase = true)) {
                requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
            } else if (layout.equals("tablet", ignoreCase = true)) {
                requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR
            } else {
                if (isPlayerFullscreen) {
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                } else {
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                }
            }
            updateSystemBars(isPlayerFullscreen)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        val rootView = webView.parent as View
        ViewCompat.setOnApplyWindowInsetsListener(rootView) { v, insets ->
            val detected = detectDeviceType(this)
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val layout = prefs.getString(PREF_DEVICE_LAYOUT, detected) ?: detected
            if (isPlayerFullscreen || layout.equals("tv", ignoreCase = true)) {
                v.setPadding(0, 0, 0, 0)
            } else {
                val statusBars = insets.getInsets(WindowInsetsCompat.Type.statusBars())
                v.setPadding(0, statusBars.top, 0, 0)
            }
            insets
        }

        // Setup layout orientation from preferences or detected device type (mobile, tablet, tv)
        val detectedType = detectDeviceType(this)
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedLayout = prefs.getString(PREF_DEVICE_LAYOUT, detectedType) ?: detectedType
        applyOrientationForLayout(savedLayout)
        updateSystemBars(false)

        webView.addJavascriptInterface(ExternalPlayerInterface(this), "AndroidExternalPlayer")

        val webSettings: WebSettings = webView.settings
        @Suppress("SetJavaScriptEnabled")
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        @Suppress("DEPRECATION")
        webSettings.databaseEnabled = true
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        @Suppress("DEPRECATION")
        webSettings.allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        webSettings.allowUniversalAccessFromFileURLs = true
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT
        webSettings.mediaPlaybackRequiresUserGesture = false
        webSettings.loadsImagesAutomatically = true
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.setSupportZoom(false)
        webSettings.builtInZoomControls = false
        webSettings.displayZoomControls = false

        // Enable hardware acceleration for smooth video rendering
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        WebView.setWebContentsDebuggingEnabled(true)

        // Forward JavaScript console messages to Logcat & remove default grey play button poster
        webView.webChromeClient = object : WebChromeClient() {
            override fun getDefaultVideoPoster(): android.graphics.Bitmap {
                return android.graphics.Bitmap.createBitmap(1, 1, android.graphics.Bitmap.Config.ARGB_8888)
            }

            override fun onConsoleMessage(msg: android.webkit.ConsoleMessage): Boolean {
                val level = when (msg.messageLevel()) {
                    android.webkit.ConsoleMessage.MessageLevel.ERROR -> Log.ERROR
                    android.webkit.ConsoleMessage.MessageLevel.WARNING -> Log.WARN
                    else -> Log.INFO
                }
                Log.println(level, tag, "JS [${msg.sourceId()}:${msg.lineNumber()}] ${msg.message()}")
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {
            @Suppress("OVERRIDE_DEPRECATION")
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    view?.loadUrl(url)
                    return true
                }
                return false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: android.webkit.WebResourceError?
            ) {
                Log.e(tag, "WebView error: ${error?.description} on ${request?.url}")
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                Log.i(tag, "WebView page finished: $url")
                pushNetworkState()
            }

            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                val url = request?.url ?: return super.shouldInterceptRequest(view, request)
                val scheme = url.scheme?.lowercase() ?: return super.shouldInterceptRequest(view, request)
                if (scheme != "http" && scheme != "https") {
                    return super.shouldInterceptRequest(view, request)
                }
                val host = url.host ?: return super.shouldInterceptRequest(view, request)
                val path = (url.path ?: "").lowercase()
                val isMediaStream = path.contains("/movie/") ||
                        path.contains("/series/") ||
                        path.contains("/live/") ||
                        path.endsWith(".mp4") ||
                        path.endsWith(".mkv") ||
                        path.endsWith(".avi") ||
                        path.endsWith(".ts") ||
                        path.endsWith(".m3u8")

                val needsFallback = ExternalPlayerInterface.needsDnsFallback(host)
                // Never intercept media streams when system DNS works so Chromium's native C++ MediaResourceGetter can perform parallel HTTP Range seeks directly
                if (needsFallback) {
                    try {
                        var currentUrl = url.toString()
                        var redirectCount = 0
                        var conn: HttpURLConnection? = null
                        var code = 0

                        while (redirectCount < 6) {
                            val parsed = URL(currentUrl)
                            val curHost = parsed.host
                            val curNeedsFallback = ExternalPlayerInterface.needsDnsFallback(curHost)
                            val curIp = if (curNeedsFallback) ExternalPlayerInterface.resolveHost(curHost) else curHost
                            val connectUrl = if (curNeedsFallback && curIp != curHost) {
                                val portStr = if (parsed.port != -1) ":${parsed.port}" else ""
                                URL("${parsed.protocol}://$curIp$portStr${parsed.file}")
                            } else {
                                parsed
                            }

                            val c = (connectUrl.openConnection() as HttpURLConnection).apply {
                                if (this is javax.net.ssl.HttpsURLConnection) {
                                    hostnameVerifier = javax.net.ssl.HostnameVerifier { _, _ -> true }
                                }
                                connectTimeout = 15000
                                readTimeout = if (isMediaStream) 60000 else 15000
                                val hostHeader = if (parsed.port != -1 && parsed.port != 80 && parsed.port != 443) {
                                    "$curHost:${parsed.port}"
                                } else curHost
                                setRequestProperty("Host", hostHeader)
                                setRequestProperty("User-Agent", "IPTVSmartersPro")
                                setRequestProperty("Accept", "*/*")
                                // Prevent transparent gzip so Content-Length and Content-Range (206 Partial Content) remain intact for seeking
                                setRequestProperty("Accept-Encoding", "identity")
                                // Forward Range and other key headers from WebView's media player
                                request.requestHeaders?.forEach { (k, v) ->
                                    if (k.equals("Range", ignoreCase = true) ||
                                        k.equals("If-Range", ignoreCase = true)
                                    ) {
                                        setRequestProperty(k, v)
                                    }
                                }
                                instanceFollowRedirects = false
                            }
                            conn = c
                            code = c.responseCode
                            if (code in listOf(301, 302, 303, 307, 308)) {
                                val location = c.getHeaderField("Location")
                                if (!location.isNullOrBlank()) {
                                    currentUrl = URL(parsed, location).toString()
                                    redirectCount++
                                    c.disconnect()
                                    continue
                                }
                            }
                            break
                        }

                        val finalConn = conn ?: return super.shouldInterceptRequest(view, request)
                        val rawMime = finalConn.contentType?.substringBefore(";")?.trim()?.lowercase() ?: ""
                        val mimeType = when {
                            rawMime.isNotBlank() && rawMime != "application/octet-stream" && rawMime != "binary/octet-stream" -> rawMime
                            path.endsWith(".mp4") || path.contains("/movie/") || path.contains("/series/") -> "video/mp4"
                            path.endsWith(".mkv") -> "video/x-matroska"
                            path.endsWith(".m3u8") -> "application/vnd.apple.mpegurl"
                            path.endsWith(".ts") || path.contains("/live/") -> "video/mp2t"
                            else -> "image/jpeg"
                        }
                        val encoding = finalConn.contentEncoding
                        val respHeaders = mutableMapOf<String, String>()
                        finalConn.headerFields?.forEach { (k, values) ->
                            if (k != null && !values.isNullOrEmpty()) {
                                respHeaders[k] = values.joinToString(", ")
                            }
                        }
                        respHeaders["Access-Control-Allow-Origin"] = "*"
                        if (isMediaStream && !respHeaders.keys.any { it.equals("Accept-Ranges", ignoreCase = true) }) {
                            respHeaders["Accept-Ranges"] = "bytes"
                        }

                        val statusCode = if (code in 100..599) code else 200
                        val reasonPhrase = finalConn.responseMessage?.takeIf { it.isNotBlank() }
                            ?: if (statusCode == 206) "Partial Content" else "OK"
                        val stream = if (statusCode in 200..299) finalConn.inputStream else (finalConn.errorStream ?: finalConn.inputStream)

                        return WebResourceResponse(
                            mimeType,
                            encoding,
                            statusCode,
                            reasonPhrase,
                            respHeaders,
                            stream
                        )
                    } catch (e: Exception) {
                        Log.w("KCIPTV", "shouldInterceptRequest failed for $url: ${e.message}")
                    }
                }
                return super.shouldInterceptRequest(view, request)
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript(
                    "window.handleAppBack && window.handleAppBack()",
                    object : android.webkit.ValueCallback<String> {
                        override fun onReceiveValue(value: String?) {
                            val isHandled = value != null && (value == "true" || value == "\"true\"" || value.contains("true"))
                            if (!isHandled) {
                                if (webView.canGoBack()) {
                                    webView.goBack()
                                } else {
                                    isEnabled = false
                                    onBackPressedDispatcher.onBackPressed()
                                }
                            }
                        }
                    }
                )
            }
        })

        webView.loadUrl("file:///android_asset/index.html")
        registerNetworkCallback()
    }

    override fun onResume() {
        super.onResume()
        if (::webView.isInitialized) {
            webView.evaluateJavascript("window.updateSystemMaterialYouColors && window.updateSystemMaterialYouColors(); window.updateSystemLanguage && window.updateSystemLanguage();", null)
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        val isLandscape = newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE
        val detected = detectDeviceType(this)
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val layout = prefs.getString(PREF_DEVICE_LAYOUT, detected) ?: detected
        if (layout.equals("mobile", ignoreCase = true) && isPlayerFullscreen) {
            webView.evaluateJavascript("window.handleOrientationChange && window.handleOrientationChange($isLandscape)", null)
        }
        if (::webView.isInitialized) {
            webView.evaluateJavascript("window.updateSystemMaterialYouColors && window.updateSystemMaterialYouColors(); window.updateSystemLanguage && window.updateSystemLanguage();", null)
        }
    }

    class ExternalPlayerInterface(private val context: Context) {
        companion object {
            private val fallbackDns = mapOf(
                "neptunpro26.xyz" to "193.176.244.107"
            )
            private val dnsCache = java.util.concurrent.ConcurrentHashMap<String, String>()
            private val dnsFallbackNeededCache = java.util.concurrent.ConcurrentHashMap<String, Boolean>()

            fun needsDnsFallback(host: String): Boolean {
                if (host.matches(Regex("""\d+\.\d+\.\d+\.\d+"""))) return false
                dnsFallbackNeededCache[host]?.let { return it }
                return try {
                    val addr = java.net.InetAddress.getByName(host)
                    val ip = addr.hostAddress ?: ""
                    if (ip.isNotBlank()) {
                        dnsCache[host] = ip
                        dnsFallbackNeededCache[host] = false
                        false
                    } else {
                        val hasFallback = fallbackDns.containsKey(host.lowercase())
                        dnsFallbackNeededCache[host] = hasFallback
                        hasFallback
                    }
                } catch (e: Exception) {
                    val hasFallback = fallbackDns.containsKey(host.lowercase())
                    dnsFallbackNeededCache[host] = hasFallback
                    hasFallback
                }
            }

            fun resolveHost(host: String): String {
                if (host.matches(Regex("""\d+\.\d+\.\d+\.\d+"""))) return host
                dnsCache[host]?.let { return it }
                try {
                    val addr = java.net.InetAddress.getByName(host)
                    val ip = addr.hostAddress ?: ""
                    if (ip.isNotBlank()) {
                        dnsCache[host] = ip
                        dnsFallbackNeededCache[host] = false
                        return ip
                    }
                } catch (e: Exception) {
                    Log.w("KCIPTV", "System DNS failed for $host: ${e.message}, checking fallback")
                }
                val fallback = fallbackDns[host.lowercase()]
                if (fallback != null) {
                    dnsFallbackNeededCache[host] = true
                    return fallback
                }
                return host
            }
        }

        @JavascriptInterface
        fun detectDeviceType(): String {
            return MainActivity.detectDeviceType(context)
        }

        @JavascriptInterface
        fun getDeviceType(): String {
            return MainActivity.detectDeviceType(context)
        }

        @JavascriptInterface
        fun isTabletDevice(): Boolean {
            return MainActivity.detectDeviceType(context) == "tablet"
        }

        @JavascriptInterface
        fun isTvDevice(): Boolean {
            return MainActivity.detectDeviceType(context) == "tv"
        }

        @JavascriptInterface
        fun isPhoneDevice(): Boolean {
            return MainActivity.detectDeviceType(context) == "mobile"
        }

        @JavascriptInterface
        fun isMobileDevice(): Boolean {
            // Portable touch device (mobile phone or tablet)
            return MainActivity.detectDeviceType(context) != "tv"
        }

        @JavascriptInterface
        fun setDeviceLayout(layout: String) {
            Handler(Looper.getMainLooper()).post {
                val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                prefs.edit().putString(PREF_DEVICE_LAYOUT, layout).apply()
                (context as? MainActivity)?.applyOrientationForLayout(layout)
            }
        }

        @JavascriptInterface
        fun getDeviceLayout(): String {
            val detected = MainActivity.detectDeviceType(context)
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getString(PREF_DEVICE_LAYOUT, detected) ?: detected
        }

        @JavascriptInterface
        fun setFullscreen(isFullscreen: Boolean) {
            (context as? MainActivity)?.updateSystemBars(isFullscreen)
        }

        @JavascriptInterface
        fun setStatusBarColor(colorHex: String) {
            Handler(Looper.getMainLooper()).post {
                val activity = context as? MainActivity ?: return@post
                try {
                    val color = android.graphics.Color.parseColor(colorHex)
                    activity.lastStatusBarColor = color
                    activity.window.statusBarColor = color
                    activity.window.navigationBarColor = color
                } catch (e: Exception) {
                    Log.w("KCIPTV", "Invalid statusBarColor $colorHex: ${e.message}")
                }
            }
        }

        @JavascriptInterface
        fun getSystemLanguage(): String {
            return java.util.Locale.getDefault().language.lowercase()
        }

        @JavascriptInterface
        fun getSystemMaterialYouColors(): String {
            val json = org.json.JSONObject()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                try {
                    fun c(resId: Int): String {
                        val colorInt = ContextCompat.getColor(context, resId)
                        return String.format("#%06X", (0xFFFFFF and colorInt))
                    }
                    json.put("available", true)
                    json.put("primary", c(android.R.color.system_accent1_200))
                    json.put("onPrimary", c(android.R.color.system_accent1_800))
                    json.put("primaryContainer", c(android.R.color.system_accent1_700))
                    json.put("onPrimaryContainer", c(android.R.color.system_accent1_100))
                    json.put("secondary", c(android.R.color.system_accent2_200))
                    json.put("onSecondary", c(android.R.color.system_accent2_800))
                    json.put("secondaryContainer", c(android.R.color.system_accent2_700))
                    json.put("onSecondaryContainer", c(android.R.color.system_accent2_100))
                    json.put("tertiary", c(android.R.color.system_accent3_200))
                    json.put("surface", c(android.R.color.system_neutral1_900))
                    json.put("surfaceDim", c(android.R.color.system_neutral1_1000))
                    json.put("surfaceVariant", c(android.R.color.system_neutral2_800))
                    json.put("surfaceContainer", c(android.R.color.system_neutral2_800))
                    json.put("surfaceContainerHigh", c(android.R.color.system_neutral2_700))
                    json.put("surfaceContainerHighest", c(android.R.color.system_neutral2_600))
                    json.put("onSurface", c(android.R.color.system_neutral1_100))
                    json.put("onSurfaceVariant", c(android.R.color.system_neutral2_200))
                    json.put("outline", c(android.R.color.system_neutral2_400))
                    json.put("outlineVariant", c(android.R.color.system_neutral2_700))
                    json.put("accent", c(android.R.color.system_accent1_200))
                    json.put("highlight", c(android.R.color.system_accent3_200))
                    return json.toString()
                } catch (e: Exception) {
                    Log.w("KCIPTV", "Failed to retrieve Material You colors: ${e.message}")
                }
            }
            json.put("available", false)
            return json.toString()
        }

        @JavascriptInterface
        fun requestOrientation(mode: String) {
            Handler(Looper.getMainLooper()).post {
                val activity = context as? MainActivity ?: return@post
                val detected = MainActivity.detectDeviceType(context)
                val prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val layout = prefs.getString(PREF_DEVICE_LAYOUT, detected) ?: detected
                if (layout.equals("tv", ignoreCase = true)) {
                    activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                    return@post
                }
                if (layout.equals("tablet", ignoreCase = true)) {
                    activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR
                    return@post
                }
                when (mode.lowercase()) {
                    "landscape" -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                    "portrait" -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                    else -> {
                        if (activity.isPlayerFullscreen) {
                            activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                        } else {
                            activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                        }
                    }
                }
            }
        }

        @JavascriptInterface
        fun copyToClipboard(text: String) {
            Handler(Looper.getMainLooper()).post {
                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                clipboard.setPrimaryClip(ClipData.newPlainText("Playlist URL", text))
            }
        }

        @JavascriptInterface
        fun resolveHost(host: String): String {
            return ExternalPlayerInterface.resolveHost(host)
        }

        @JavascriptInterface
        fun resolveRedirectUrl(urlString: String): String {
            return try {
                var currentUrl = urlString
                var redirectCount = 0
                while (redirectCount < 6) {
                    val originalUrl = URL(currentUrl)
                    val originalHost = originalUrl.host
                    val needsFallback = needsDnsFallback(originalHost)
                    val resolvedIp = if (needsFallback) resolveHost(originalHost) else originalHost
                    val connectUrl = if (needsFallback && resolvedIp != originalHost) {
                        val portStr = if (originalUrl.port != -1) ":${originalUrl.port}" else ""
                        URL("${originalUrl.protocol}://$resolvedIp$portStr${originalUrl.file}")
                    } else {
                        originalUrl
                    }

                    val conn = (connectUrl.openConnection() as HttpURLConnection).apply {
                        if (this is javax.net.ssl.HttpsURLConnection) {
                            hostnameVerifier = javax.net.ssl.HostnameVerifier { _, _ -> true }
                        }
                        connectTimeout = 6000
                        readTimeout = 6000
                        requestMethod = "GET"
                        setRequestProperty("User-Agent", "IPTVSmartersPro")
                        setRequestProperty("Accept", "*/*")
                        setRequestProperty("Accept-Encoding", "identity")
                        setRequestProperty("Range", "bytes=0-1")
                        val hostHeader = if (originalUrl.port != -1 && originalUrl.port != 80 && originalUrl.port != 443) {
                            "$originalHost:${originalUrl.port}"
                        } else originalHost
                        setRequestProperty("Host", hostHeader)
                        instanceFollowRedirects = false
                    }
                    val code = conn.responseCode
                    val location = conn.getHeaderField("Location")
                    conn.disconnect()
                    if (code in listOf(301, 302, 303, 307, 308) && !location.isNullOrBlank()) {
                        currentUrl = URL(originalUrl, location).toString()
                        redirectCount++
                        continue
                    }
                    break
                }
                currentUrl
            } catch (e: Exception) {
                Log.w("KCIPTV", "resolveRedirectUrl failed for $urlString: ${e.message}")
                urlString
            }
        }

        @JavascriptInterface
        fun fetchHttp(urlString: String, userAgent: String?, timeoutMs: Int): String {
            return try {
                var currentUrl = urlString
                var redirectCount = 0
                var connection: HttpURLConnection? = null
                var code = 0
                val timeout = if (timeoutMs in 1..20000) timeoutMs else 15000

                while (redirectCount < 6) {
                    val originalUrl = URL(currentUrl)
                    val originalHost = originalUrl.host
                    val resolvedIp = resolveHost(originalHost)
                    val connectUrl = if (resolvedIp != originalHost) {
                        val portStr = if (originalUrl.port != -1) ":${originalUrl.port}" else ""
                        val file = originalUrl.file
                        URL("${originalUrl.protocol}://$resolvedIp$portStr$file")
                    } else {
                        originalUrl
                    }

                    val conn = (connectUrl.openConnection() as HttpURLConnection).apply {
                        connectTimeout = timeout
                        readTimeout = timeout
                        val ua = if (!userAgent.isNullOrBlank()) userAgent else "IPTVSmartersPro"
                        setRequestProperty("User-Agent", ua)
                        setRequestProperty("Accept", "*/*")
                        val hostHeader = if (originalUrl.port != -1 && originalUrl.port != 80 && originalUrl.port != 443) {
                            "$originalHost:${originalUrl.port}"
                        } else originalHost
                        setRequestProperty("Host", hostHeader)
                        setRequestProperty("Accept-Encoding", "gzip, deflate")
                        setRequestProperty("Connection", "close")
                        instanceFollowRedirects = false
                    }
                    connection = conn
                    code = conn.responseCode
                    if (code in listOf(301, 302, 303, 307, 308)) {
                        val location = conn.getHeaderField("Location")
                        if (!location.isNullOrBlank()) {
                            currentUrl = URL(originalUrl, location).toString()
                            redirectCount++
                            conn.disconnect()
                            continue
                        }
                    }
                    break
                }

                val conn = connection ?: throw IllegalStateException("No connection established")
                val isSuccess = code in 200..299
                val rawStream = if (isSuccess) conn.inputStream else (conn.errorStream ?: conn.inputStream)
                val encoding = conn.contentEncoding
                val stream = if (rawStream != null && "gzip".equals(encoding, ignoreCase = true)) {
                    java.util.zip.GZIPInputStream(rawStream)
                } else rawStream

                val body = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() } ?: ""
                val responseJson = org.json.JSONObject().apply {
                    put("status", code)
                    put("body", body)
                    put("contentType", conn.contentType ?: "")
                }
                responseJson.toString()
            } catch (e: Exception) {
                Log.e("KCIPTV", "fetchHttp error for $urlString: ${e.message}", e)
                org.json.JSONObject().apply {
                    put("status", 0)
                    put("error", e.message ?: "Network error")
                    put("failed", "network")
                }.toString()
            }
        }

        @JavascriptInterface
        fun openPlayer(url: String) {
            Handler(Looper.getMainLooper()).post {
                try {
                    val intent = Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(Uri.parse(url), "video/*")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(intent)
                } catch (e: Exception) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(intent)
                    } catch (ex: Exception) {
                        Log.e("KCIPTV", "openPlayer failed", ex)
                    }
                }
            }
        }

        @JavascriptInterface
        fun openUrl(url: String) {
            Handler(Looper.getMainLooper()).post {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(intent)
                } catch (ex: Exception) {
                    Log.e("KCIPTV", "openUrl failed", ex)
                }
            }
        }

        @JavascriptInterface
        fun startVodAudioFallback(url: String, positionSec: Double, isPlaying: Boolean) {
            (context as? MainActivity)?.startNativeVodAudio(
                url,
                (positionSec * 1000.0).toLong(),
                isPlaying
            )
        }

        @JavascriptInterface
        fun seekVodAudioFallback(positionSec: Double, isPlaying: Boolean) {
            (context as? MainActivity)?.seekNativeVodAudio(
                (positionSec * 1000.0).toLong(),
                isPlaying
            )
        }

        @JavascriptInterface
        fun syncVodAudioFallback(positionSec: Double, isPlaying: Boolean) {
            (context as? MainActivity)?.syncNativeVodAudio(
                (positionSec * 1000.0).toLong(),
                isPlaying
            )
        }

        @JavascriptInterface
        fun getVodTracksJson(): String {
            return (context as? MainActivity)?.getVodTracksJsonInternal()
                ?: "{\"audioTracks\":[],\"subtitleTracks\":[]}"
        }

        @JavascriptInterface
        fun selectVodAudioTrack(groupIndex: Int, trackIndex: Int) {
            (context as? MainActivity)?.selectNativeVodAudioTrack(groupIndex, trackIndex)
        }

        @JavascriptInterface
        fun selectVodSubtitleTrack(groupIndex: Int, trackIndex: Int) {
            (context as? MainActivity)?.selectNativeVodSubtitleTrack(groupIndex, trackIndex)
        }

        @JavascriptInterface
        fun setVodPlaybackSpeed(speed: Float) {
            (context as? MainActivity)?.setNativeVodPlaybackSpeed(speed)
        }

        @JavascriptInterface
        fun pauseVodAudioFallback() {
            (context as? MainActivity)?.pauseNativeVodAudio()
        }

        @JavascriptInterface
        fun stopVodAudioFallback() {
            (context as? MainActivity)?.stopNativeVodAudio()
        }
    }

    override fun onDestroy() {
        try {
            vodAudioPlayer?.release()
            vodAudioPlayer = null
        } catch (_: Exception) {}
        networkCallback?.let {
            try {
                (getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager)?.unregisterNetworkCallback(it)
            } catch (_: Exception) {
            }
        }
        networkCallback = null
        webView.destroy()
        super.onDestroy()
    }
}
