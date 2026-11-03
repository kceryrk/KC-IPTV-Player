package com.kciptv.player

import android.app.UiModeManager
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.net.Uri
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
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val tag = "KCIPTV"

    companion object {
        const val PREFS_NAME = "kc_iptv_prefs"
        const val PREF_DEVICE_LAYOUT = "device_layout"
    }

    fun applyOrientationForLayout(layout: String) {
        runOnUiThread {
            if (layout.equals("tv", ignoreCase = true)) {
                requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
            } else {
                requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_USER
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Setup layout orientation from preferences or device type
        val uiModeManager = getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
        val isTvDevice = uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val defaultLayout = if (isTvDevice) "tv" else "mobile"
        val savedLayout = prefs.getString(PREF_DEVICE_LAYOUT, defaultLayout) ?: defaultLayout
        applyOrientationForLayout(savedLayout)

        // Immersive full-screen
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).let { controller ->
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }

        webView = findViewById(R.id.webView)
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
            }

            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
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
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        val isLandscape = newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val layout = prefs.getString(PREF_DEVICE_LAYOUT, "mobile") ?: "mobile"
        if (layout.equals("mobile", ignoreCase = true)) {
            webView.evaluateJavascript("window.handleOrientationChange && window.handleOrientationChange($isLandscape)", null)
        }
    }

    class ExternalPlayerInterface(private val context: Context) {
        companion object {
            private val dnsCache = java.util.concurrent.ConcurrentHashMap<String, String>().apply {
                put("neptunpro26.xyz", "193.176.244.107")
            }

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
                return dnsCache[host] ?: host
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
        fun getDeviceLayout(): String {
            val uiModeManager = context.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
            val isTvDevice = uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION
            val defaultLayout = if (isTvDevice) "tv" else "mobile"
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getString(PREF_DEVICE_LAYOUT, defaultLayout) ?: defaultLayout
        }

        @JavascriptInterface
        fun requestOrientation(mode: String) {
            Handler(Looper.getMainLooper()).post {
                val activity = context as? MainActivity ?: return@post
                when (mode.lowercase()) {
                    "landscape" -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
                    "portrait" -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                    else -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_USER
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
                val timeout = if (timeoutMs > 0) timeoutMs else 35000

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
                        setRequestProperty("Connection", "keep-alive")
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
        webView.destroy()
        super.onDestroy()
    }
}
