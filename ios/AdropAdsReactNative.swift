import AdropAds
import React
import WebKit

@objc(AdropAds)
class AdropAds: NSObject {

    @objc weak var bridge: RCTBridge?

    // Injected by RN on BOTH architectures (RCTModuleData / RCTTurboModuleManager
    // call the setter when the module declares it). On bridgeless (New
    // Architecture) `bridge` is nil, so this registry is the only way to resolve
    // a view from a react tag.
    @objc var viewRegistry_DEPRECATED: RCTViewRegistry?

    // Signatures aligned to the codegen `NativeAdropAdsSpec` (TurboModule):
    // initialize/setUID/setTheme are `void` (fire-and-forget; JS does not await),
    // registerWebView uses `resolve:reject:` + a `double` tag. Old Architecture is
    // unaffected (these were never awaited and numbers are bridge-coerced).
    @objc(initialize:targetCountries:useInAppBrowser:)
    func initialize(_ production: Bool, targetCountries: [String], useInAppBrowser: Bool) -> Void {
        DispatchQueue.main.async {
            Adrop.initialize(production: production, useInAppBrowser: useInAppBrowser, targetCountries: targetCountries)
        }
    }

    @objc(setUID:)
    func setUID(_ uid: String) -> Void {
        DispatchQueue.main.async {
            if (uid.isEmpty) {
                return
            }

            Adrop.setUID(uid)
        }
    }

    @objc(setTheme:)
    func setTheme(_ theme: String) -> Void {
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

    @objc(registerWebView:resolve:reject:)
    func registerWebView(_ viewTag: Double, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                resolve(nil)
                return
            }

            // New Architecture (bridgeless): bridge is nil — resolve the view via
            // the injected view registry. Old Architecture: bridge.uiManager.
            // Not-found stays a silent resolve(nil), matching Android and the
            // documented "silently ignored" contract.
            let tag = NSNumber(value: viewTag)
            let view = self.viewRegistry_DEPRECATED?.view(forReactTag: tag)
                ?? self.bridge?.uiManager.view(forReactTag: tag)

            guard let view = view else {
                resolve(nil)
                return
            }

            if let webView = self.findWKWebView(in: view) {
                Adrop.registerWebView(webView)
            }
            resolve(nil)
        }
    }

    private func findWKWebView(in view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView { return webView }
        for subview in view.subviews {
            if let found = findWKWebView(in: subview) { return found }
        }
        return nil
    }
}
