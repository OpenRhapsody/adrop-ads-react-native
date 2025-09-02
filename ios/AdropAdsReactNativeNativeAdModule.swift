import Foundation
import AdropAds

@objc(AdropNativeAd)
class AdropAdsReactNativeNativeAdModule: RCTEventEmitter, AdropNativeAdDelegate {

    @objc(create:requestId:useCustomClick:)
    func create(_ unitId: String, _ requestId: String, _ useCustomClick: Bool = false) {
        let manager = AdropAdsNativeAdManager.instance
        DispatchQueue.main.async { [weak self, weak manager] in
            guard let self = self, let manager = manager else { return }
            manager.create(unitId, requestId, delegate: self, useCustomClick: useCustomClick)
        }
    }

    @objc(load:requestId:useCustomClick:)
    func load(_ unitId: String, _ requestId: String, _ useCustomClick: Bool = false) {
        let manager = AdropAdsNativeAdManager.instance
        DispatchQueue.main.async { [weak self, weak manager] in
            guard let self = self, let manager = manager else { return }
            manager.load(unitId, requestId, delegate: self, useCustomClick: useCustomClick)
        }
    }

    @objc(destroy:)
    func destroy(_ requestId: String) -> Void {
        AdropAdsNativeAdManager.instance.destroy(requestId)
    }

    private func sendEvent(ad: AdropNativeAd, requestId: String, method: String, errorCode: String? = nil) {
        var creative = ad.creative
                let adPlayerCallback = "window.adPlayerVisibilityCallback"
                if creative.contains(adPlayerCallback) {
                    creative = creative.replacingOccurrences(of: adPlayerCallback, with: "callback(true);\(adPlayerCallback)")
                }

        sendEvent(withName: AdropChannel.invokeNativeChannel,
                  body: [ "unitId": ad.unitId, "method": method, "errorCode": errorCode ?? "",
                          "requestId": requestId,
                          "icon": ad.icon, "cover": ad.cover, "headline": ad.headline, "body": ad.body,
                          "destinationURL": ad.destinationURL, "advertiserURL": ad.advertiserURL,
                          "accountTag": dictionaryToJSONString(ad.accountTag), "creativeTag": dictionaryToJSONString(ad.creativeTag),
                          "advertiser": ad.advertiser, "callToAction": ad.callToAction,
                          "creative": creative, "creativeId": ad.creativeId,
                          "profileName": ad.profile.displayName, "profileLogo": ad.profile.displayLogo,
                          "extra": dictionaryToJSONString(ad.extra), "asset": ad.asset
                        ])
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
        return [AdropChannel.invokeNativeChannel]
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
