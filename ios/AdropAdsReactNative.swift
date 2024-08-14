import AdropAds

@objc(AdropAds)
class AdropAds: NSObject {

    @objc(initialize:targetCountries:withResolver:withRejecter:)
    func initialize(_ production: Bool, targetCountries: [String], resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            Adrop.initialize(production: production, targetCountries: targetCountries)
        }
    }

}
