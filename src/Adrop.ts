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
     * Prefer the {@link useAdropWebView} hook, which handles the timing below for you.
     *
     * The returned promise always resolves (never rejects). In development, a warning is logged
     * when no WebView could be registered for the tag.
     *
     * @param viewTag - The native view tag obtained via findNodeHandle() for the View wrapping the WebView.
     *                  Since react-native-webview's ref is an imperative handle and findNodeHandle does not work with it,
     *                  wrap the WebView in a View and use that View's ref instead.
     *                  Give that View `collapsable={false}`: on the New Architecture a View without it can be
     *                  flattened away, leaving no native view for the tag.
     *
     * @example
     * ```tsx
     * import React, { useEffect, useRef, useState } from 'react';
     * import { findNodeHandle, View } from 'react-native';
     * import { WebView } from 'react-native-webview';
     * import { Adrop } from 'adrop-ads-react-native';
     *
     * const AdWebView = () => {
     *   const containerRef = useRef<View>(null);
     *   const [ready, setReady] = useState(false);
     *
     *   useEffect(() => {
     *     const tag = findNodeHandle(containerRef.current);
     *     // Register before loading any URL.
     *     (tag != null ? Adrop.registerWebView(tag) : Promise.resolve()).then(() => setReady(true));
     *   }, []);
     *
     *   return (
     *     <View ref={containerRef} style={{ flex: 1 }} collapsable={false}>
     *       <WebView
     *         source={ready ? { uri: 'https://your-website.com' } : { html: '' }}
     *         javaScriptEnabled={true}
     *         thirdPartyCookiesEnabled={true}
     *         mediaPlaybackRequiresUserAction={false}
     *         allowsInlineMediaPlayback={true}
     *       />
     *     </View>
     *   );
     * };
     * ```
     */
    static async registerWebView(viewTag: number): Promise<void> {
        // Native resolves false when no WebView was found (or the core call failed); the reason is
        // in the native log. Surfaced here because native logs never reach Metro/LogBox.
        const registered = await NativeModules.AdropAds.registerWebView(viewTag)
        if (__DEV__ && registered === false) {
            console.warn(
                `[Adrop] registerWebView(${viewTag}): WebView was not registered. ` +
                    'On the New Architecture, add collapsable={false} to the View wrapping the WebView. ' +
                    'Details: native log tag "AdropAds".'
            )
        }
    }
}

export default Adrop
