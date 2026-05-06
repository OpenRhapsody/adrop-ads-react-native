import { NativeModules } from 'react-native'
import type { AdropTheme } from './AdropTheme'

class Adrop {
    static initialize = (
        production: boolean,
        targetCountries?: string[],
        useInAppBrowser?: boolean
    ) => {
        NativeModules.AdropAds.initialize(
            production,
            targetCountries ?? [],
            useInAppBrowser ?? false
        )
    }

    static setUID(uid: string) {
        NativeModules.AdropAds.setUID(uid)
    }

    static setTheme(theme: AdropTheme) {
        NativeModules.AdropAds.setTheme(theme)
    }

    /**
     * Sets the user's marketing consent state for push notification ad targeting.
     *
     * The consent state and its change timestamp are stored locally by the native SDK and
     * forwarded to the server via the next remote-config call. Calling this method with
     * the same value as the current state is a no-op, so `consentedAt` always represents
     * the actual decision time.
     *
     * Must be called after {@link initialize}; calls before initialization are dropped
     * with a warning by the native SDK.
     *
     * This API is independent of user data consent (GDPR): toggling GDPR off does not
     * prevent marketing consent from being sent to the server.
     *
     * @param consent - `true` for opt-in (stored as 1), `false` for opt-out (stored as 0).
     */
    static setMarketingConsent(consent: boolean): void {
        NativeModules.AdropAds.setMarketingConsent(consent)
    }

    /**
     * Registers a native WebView for the WebView API for Ads.
     *
     * To serve Google AdSense/Ad Manager ads within a WebView,
     * call this method after the WebView has been mounted.
     *
     * Requires AdropAdsBackfill to be installed for actual registration.
     * If not installed, this call is silently ignored.
     *
     * @param viewTag - The native view tag obtained via findNodeHandle() for the View wrapping the WebView.
     *                  Since react-native-webview's ref is an imperative handle and findNodeHandle does not work with it,
     *                  wrap the WebView in a View and use that View's ref instead.
     *
     * @example
     * ```tsx
     * import { findNodeHandle, View } from 'react-native';
     * import { WebView } from 'react-native-webview';
     * import { Adrop } from 'adrop-ads-react-native';
     *
     * const containerRef = useRef<View>(null);
     *
     * useEffect(() => {
     *   if (containerRef.current) {
     *     const tag = findNodeHandle(containerRef.current);
     *     if (tag != null) await Adrop.registerWebView(tag);
     *   }
     * }, []);
     *
     * <View ref={containerRef}>
     *   <WebView
     *     source={{ uri: 'https://your-website.com' }}
     *     javaScriptEnabled={true}
     *     thirdPartyCookiesEnabled={true}
     *     mediaPlaybackRequiresUserAction={false}
     *   />
     * </View>
     * ```
     */
    static registerWebView(viewTag: number): Promise<void> {
        return NativeModules.AdropAds.registerWebView(viewTag)
    }
}

export default Adrop
