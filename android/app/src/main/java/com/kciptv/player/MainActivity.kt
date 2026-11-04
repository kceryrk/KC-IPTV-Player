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
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val tag = "KCIPTV"
    private var isPlayerFullscreen = false
    private var networkCallback: ConnectivityManager.NetworkCallback? = null
    var lastStatusBarColor: Int? = null

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
    }

    fun updateSystemBars(isFullscreen: Boolean) {
        isPlayerFullscreen = isFullscreen
        runOnUiThread {
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val layout = prefs.getString(PREF_DEVICE_LAYOUT, "mobile") ?: "mobile"
            val controller = WindowInsetsControllerCompat(window, window.decorView)
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

            if (layout.equals("tv", ignoreCase = true)) {
                requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
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
                val barColor = lastStatusBarColor ?: android.graphics.Color.parseColor("#15221e")
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
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val layout = prefs.getString(PREF_DEVICE_LAYOUT, "mobile") ?: "mobile"
            if (isPlayerFullscreen || layout.equals("tv", ignoreCase = true)) {
                v.setPadding(0, 0, 0, 0)
            } else {
                val statusBars = insets.getInsets(WindowInsetsCompat.Type.statusBars())
                v.setPadding(0, statusBars.top, 0, 0)
            }
            insets
        }

        // Setup layout orientation from preferences or device type
        val uiModeManager = getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
        val isTvDevice = uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION ||
                         packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val defaultLayout = if (isTvDevice) "tv" else "mobile"
        val savedLayout = prefs.getString(PREF_DEVICE_LAYOUT, defaultLayout) ?: defaultLayout
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
                val host = url.host ?: return super.shouldInterceptRequest(view, request)
                val resolvedIp = ExternalPlayerInterface.resolveHost(host)
                if (resolvedIp != host) {
                    try {
                        val portStr = if (url.port != -1) ":${url.port}" else ""
                        val file = url.path ?: ""
                        val queryStr = if (url.query != null) "?${url.query}" else ""
                        val connectUrl = URL("${url.scheme}://$resolvedIp$portStr$file$queryStr")
                        val conn = (connectUrl.openConnection() as HttpURLConnection).apply {
                            if (this is javax.net.ssl.HttpsURLConnection) {
                                hostnameVerifier = javax.net.ssl.HostnameVerifier { _, _ -> true }
                            }
                            connectTimeout = 12000
                            readTimeout = 12000
                            val hostHeader = if (url.port != -1 && url.port != 80 && url.port != 443) "$host:${url.port}" else host
                            setRequestProperty("Host", hostHeader)
                            setRequestProperty("User-Agent", "IPTVSmartersPro")
                            setRequestProperty("Accept", "*/*")
                            setRequestProperty("Connection", "close")
                            instanceFollowRedirects = true
                        }
                        val mimeType = conn.contentType?.substringBefore(";")?.trim() ?: "image/jpeg"
                        val encoding = conn.contentEncoding ?: "UTF-8"
                        return WebResourceResponse(mimeType, encoding, conn.inputStream)
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
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val layout = prefs.getString(PREF_DEVICE_LAYOUT, "mobile") ?: "mobile"
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

            fun resolveHost(host: String): String {
                if (host.matches(Regex("""\d+\.\d+\.\d+\.\d+"""))) return host
                dnsCache[host]?.let { return it }
                try {
                    val addr = java.net.InetAddress.getByName(host)
                    val ip = addr.hostAddress ?: ""
                    if (ip.isNotBlank()) {
                        dnsCache[host] = ip
                        return ip
                    }
                } catch (e: Exception) {
                    Log.w("KCIPTV", "System DNS failed for $host: ${e.message}, checking fallback")
                }
                return fallbackDns[host.lowercase()] ?: host
            }
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
        fun isMobileDevice(): Boolean {
            val uiModeManager = context.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
            val isTv = uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION ||
                       context.packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)
            return !isTv
        }

        @JavascriptInterface
        fun getDeviceLayout(): String {
            val uiModeManager = context.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
            val isTvDevice = uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION ||
                             context.packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)
            val defaultLayout = if (isTvDevice) "tv" else "mobile"
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getString(PREF_DEVICE_LAYOUT, defaultLayout) ?: defaultLayout
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
                val prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val layout = prefs.getString(PREF_DEVICE_LAYOUT, "mobile") ?: "mobile"
                if (layout.equals("tv", ignoreCase = true)) {
                    activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
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
    }

    override fun onDestroy() {
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
