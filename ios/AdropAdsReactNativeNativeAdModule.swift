import Foundation
import AdropAds
import React

@objc(AdropNativeAd)
class AdropAdsReactNativeNativeAdModule: RCTEventEmitter, AdropNativeAdDelegate {

    override var methodQueue: DispatchQueue! { DispatchQueue.main }

    @objc(create:requestId:useCustomClick:preferredAdChoicesPosition:)
    func create(_ unitId: String, _ requestId: String, _ useCustomClick: Bool = false, _ preferredAdChoicesPosition: Int = AdropAdChoicesPosition.topRight.rawValue) {
        AdropAdsNativeAdManager.instance.create(unitId, requestId, delegate: self, useCustomClick: useCustomClick, preferredAdChoicesPosition: preferredAdChoicesPosition)
    }

    @objc(load:requestId:useCustomClick:preferredAdChoicesPosition:)
    func load(_ unitId: String, _ requestId: String, _ useCustomClick: Bool = false, _ preferredAdChoicesPosition: Int = AdropAdChoicesPosition.topRight.rawValue) {
        AdropAdsNativeAdManager.instance.load(unitId, requestId, delegate: self, useCustomClick: useCustomClick, preferredAdChoicesPosition: preferredAdChoicesPosition)
    }

    @objc(destroy:)
    func destroy(_ requestId: String) -> Void {
        AdropAdsNativeAdManager.instance.destroy(requestId)
    }

    private func sendEvent(_ ad: AdropNativeAd, method: String, errorCode: String? = nil) {
        var creative = ad.creative
        let adPlayerCallback = "window.adPlayerVisibilityCallback"
        if creative.contains(adPlayerCallback) && !creative.contains("callback(true);\(adPlayerCallback)") {
            creative = creative.replacingOccurrences(of: adPlayerCallback, with: "callback(true);\(adPlayerCallback)")
        }

        let isVideoAd = creative.contains(adPlayerCallback)

        let requestId = AdropAdsNativeAdManager.instance.requestIdFor(ad)
        guard !requestId.isEmpty else { return }
        sendEvent(withName: AdropChannel.invokeNativeChannel,
                  body: [ "unitId": ad.unitId, "method": method, "errorCode": errorCode ?? "",
                          "requestId": requestId,
                          "icon": ad.icon, "cover": ad.cover, "headline": ad.headline, "body": ad.body,
                          "destinationURL": ad.destinationURL, "advertiserURL": ad.advertiserURL,
                          "accountTag": dictionaryToJSONString(ad.accountTag), "creativeTag": dictionaryToJSONString(ad.creativeTag),
                          "advertiser": ad.advertiser, "callToAction": ad.callToAction,
                          "creative": creative, "creativeId": ad.creativeId,
                          "profileName": ad.profile.displayName, "profileLogo": ad.profile.displayLogo,
                          "extra": dictionaryToJSONString(ad.extra), "asset": ad.asset,
                          "txId": ad.txId, "campaignId": ad.campaignId,
                          "isBackfilled": ad.isBackfilled,
                          "isVideoAd": isVideoAd,
                          "browserTarget": ad.browserTargetValue.rawValue,
                          "creativeType": ad.creativeType
                        ])
    }

    func onAdReceived(_ ad: AdropNativeAd) {
        if ad.isBackfilled {
            let requestId = AdropAdsNativeAdManager.instance.requestIdFor(ad)
            AdropAdsNativeAdManager.instance.viewFor(requestId)?.refreshMediaViewLayout()
        }
        sendEvent(ad, method: AdropMethod.DID_RECEIVE_AD)
    }

    func onAdClicked(_ ad: AdropNativeAd) {
        sendEvent(ad, method: AdropMethod.DID_CLICK_AD)
    }

    func onAdFailedToReceive(_ ad: AdropNativeAd, _ errorCode: AdropErrorCode) {
        sendEvent(ad, method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode: AdropErrorCodeToString(code: errorCode))
    }

    func onAdImpression(_ ad: AdropNativeAd) {
        sendEvent(ad, method: AdropMethod.DID_IMPRESSION)
    }

    func onAdVideoStart(_ ad: AdropNativeAd) {
        sendEvent(ad, method: AdropMethod.DID_VIDEO_START)
    }

    func onAdVideoEnd(_ ad: AdropNativeAd) {
        sendEvent(ad, method: AdropMethod.DID_VIDEO_END)
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
