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

    @objc(registerWebView:withResolver:withRejecter:)
    func registerWebView(_ viewTag: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async { [weak self] in
            guard let bridge = self?.bridge,
                  let view = bridge.uiManager.view(forReactTag: viewTag) else {
                resolve(nil)
                return
            }

            if let webView = self?.findWKWebView(in: view) {
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
