import Foundation
import AdropAds

@objc(AdropNativeAd)
class AdropAdsReactNativeNativeAdMoulde: RCTEventEmitter, AdropNativeAdDelegate {
    
    @objc(create:requestId:)
    func create(_ unitId: String, _ requestId: String) {
        AdropAdsNativeAdManager.instance.create(unitId, requestId, delegate: self)
    }
    
    @objc(load:)
    func load(_ requestId: String) {
        let manager = AdropAdsNativeAdManager.instance
        guard let nativeAd = manager.getAd(requestId) else {
            sendEvent(withName: AdropChannel.invokeNativeChannel(id: requestId),
                      body: [
                        "method": AdropMethod.DID_FAIL_TO_RECEIVE_AD,
                        "errorCode": AdropErrorCodeToString(code: AdropErrorCode.ERROR_CODE_AD_NO_FILL)
                      ])
            return
        }
        
        DispatchQueue.main.async { [weak manager] in
            manager?.load(requestId)
        }
    }
    
    @objc(destroy:)
    func destroy(_ requestId: String) -> Void {
        AdropAdsNativeAdManager.instance.destroy(requestId)
    }
    
    private func sendEvent(ad: AdropNativeAd, requestId: String, method: String, errorCode: String? = nil) {
        sendEvent(withName: AdropChannel.invokeNativeChannel(id: requestId),
                  body: [ "unitId": ad.unitId, "method": method, "errorCode": errorCode ?? "",
                          "icon": ad.icon, "cover": ad.cover, "headline": ad.headline, "body": ad.body,
                          "destinationURL": ad.destinationURL, "advertiserURL": ad.advertiserURL,
                          "accountTag": dictionaryToJSONString(ad.accountTag), "creativeTag": dictionaryToJSONString(ad.creativeTag),
                          "advertiser": ad.advertiser, "callToAction": ad.callToAction,
                          "creative": ad.creative, "creativeId": ad.creativeId,
                          "profileName": ad.profile.displayName, "profileLogo": ad.profile.displayLogo,
                          "extra": dictionaryToJSONString(ad.extra), "asset": ad.asset
                        ])
    }
    
    private func dictionaryToJSONString(dictionary: [String: String]) -> String? {
        if let jsonData = try? JSONSerialization.data(withJSONObject: dictionary, options: []) {
            return String(data: jsonData, encoding: .utf8)
        }
        return nil
    }
    
    func onAdReceived(_ ad: AdropNativeAd) {
        let requestId = AdropAdsNativeAdManager.instance.requestIdFor(ad)
        sendEvent(ad: ad, requestId: requestId, method: AdropMethod.DID_RECEIVE_AD)
    }
    
    func onAdClicked(_ ad: AdropNativeAd) {
        let requestId = AdropAdsNativeAdManager.instance.requestIdFor(ad)
        sendEvent(ad: ad, requestId: requestId, method: AdropMethod.DID_CLICK_AD)
    }
    
    func onAdFailedToReceive(_ ad: AdropNativeAd, _ errorCode: AdropErrorCode) {
        let requestId = AdropAdsNativeAdManager.instance.requestIdFor(ad)
        sendEvent(ad: ad, requestId: requestId, method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode: AdropErrorCodeToString(code: errorCode))
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        let keys = AdropAdsNativeAdManager.instance.keys()
        return keys.map {AdropChannel.invokeNativeChannel(id: $0) }
    }
    
    func dictionaryToJSONString(_ dictionary: [String: Any]) -> String? {
        do {
            // Convert dictionary to JSON data
            let jsonData = try JSONSerialization.data(withJSONObject: dictionary, options: .prettyPrinted)
            
            // Convert JSON data to string
            let jsonString = String(data: jsonData, encoding: .utf8)
            return jsonString
        } catch {
            print("Error serializing dictionary to JSON: \(error)")
            return "{}"
        }
    }
}
