import AdropAds

@objc(AdropAds)
class AdropAds: NSObject {

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
}
