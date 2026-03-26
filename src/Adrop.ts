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
