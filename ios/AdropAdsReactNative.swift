import AdropAds
import React
import WebKit

@objc(AdropAds)
class AdropAds: NSObject {

    @objc weak var bridge: RCTBridge?

    @objc(initialize:targetCountries:useInAppBrowser:withResolver:withRejecter:)
    func initialize(_ production: Bool, targetCountries: [String], useInAppBrowser: Bool, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            Adrop.initialize(production: production, useInAppBrowser: useInAppBrowser, targetCountries: targetCountries)
        }
    }

    @objc(setUID:withResolver:withRejecter:)
    func setUID(_ uid: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            if (uid.isEmpty) {
                return
            }

            Adrop.setUID(uid)
        }
    }

    @objc(setTheme:withResolver:withRejecter:)
    func setTheme(_ theme: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            let converted: AdropTheme
            switch theme.lowercased() {
            case "light":
                converted = .light
            case "dark":
                converted = .dark
            default:
                converted = .auto
            }

            Adrop.setTheme(converted)
        }
    }

    @objc(setMarketingConsent:)
    func setMarketingConsent(_ consent: Bool) -> Void {
        DispatchQueue.main.async {
            Adrop.setMarketingConsent(consent)
        }
    }

    // Normal mounts finish within 1-2 frames. The cap only bounds cases where the view never
    // appears (flattened wrapper, unmount) so the hook's isReady is not held back for long.
    private static let maxMountWaitAttempts = 30

    /// Resolves `true` when a WKWebView was found and passed to `Adrop.registerWebView`, `false` otherwise.
    /// Never rejects — `Adrop.registerWebView` on the JS side turns `false` into a dev warning.
    @objc(registerWebView:withResolver:withRejecter:)
    func registerWebView(_ viewTag: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { resolve(false); return }
            self.tryRegisterWebView(viewTag, attempt: 0, resolve: resolve)
        }
    }

    // Main queue only — on the New Architecture the lookup ends in RCTComponentViewRegistry, which asserts it.
    private func tryRegisterWebView(_ viewTag: NSNumber, attempt: Int, resolve: @escaping RCTPromiseResolveBlock) {
        guard let bridge = bridge else {
            NSLog("%@", "[AdropAds] registerWebView: bridge unavailable")
            resolve(false)
            return
        }
        let view = bridge.uiManager.view(forReactTag: viewTag)
        guard let webView = view.flatMap({ findWKWebView(in: $0) }) else {
            if attempt < Self.maxMountWaitAttempts {
                // Fabric may mount after onLayout reached JS, and react-native-webview creates the
                // WKWebView only once it is in a window (didMoveToWindow) — wait for both.
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0 / 60) { [weak self] in
                    guard let self = self else { resolve(false); return }
                    self.tryRegisterWebView(viewTag, attempt: attempt + 1, resolve: resolve)
                }
                return
            }
            let message = view == nil
                ? "[AdropAds] registerWebView: no native view for tag \(viewTag) (New Architecture: add collapsable={false} to the wrapper View)"
                : "[AdropAds] registerWebView: no WKWebView inside view for tag \(viewTag)"
            NSLog("%@", message)
            resolve(false)
            return
        }

        Adrop.registerWebView(webView)
        #if DEBUG
        NSLog("%@", "[AdropAds] registerWebView: passed WKWebView for tag \(viewTag) to Adrop (after \(attempt) attempts)")
        #endif
        resolve(true)
    }

    private func findWKWebView(in view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView { return webView }
        for subview in view.subviews {
            if let found = findWKWebView(in: subview) { return found }
        }
        return nil
    }
}
