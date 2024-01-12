import AdropAds

@objc(AdropAds)
class AdropAds: NSObject {
    
    @objc(initialize:withResolver:withRejecter:)
    func initialize(_ production: Bool, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            Adrop.initialize(production: production)
        }
    }
    
}
