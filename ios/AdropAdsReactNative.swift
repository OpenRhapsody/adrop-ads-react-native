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
}
