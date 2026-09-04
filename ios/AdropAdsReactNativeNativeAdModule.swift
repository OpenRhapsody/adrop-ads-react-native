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

    /// Per-call batch delegates, held strongly until the terminal callback.
    /// REQUIRED: the core stores `AdropNativeAd.delegate` weakly and `loads()`
    /// captures `[weak delegate]` — without this map the delegate deallocates
    /// and the JS Promise never settles.
    private var pendingLoadsDelegates: [String: RNNativeAdLoadsDelegate] = [:]

    /// Batch load backing `AdropNativeAd.loads()` (JS): one network call, up
    /// to 5 pre-loaded ads bound positionally to the JS-minted requestIds. A
    /// per-call delegate handles only the terminal batch callbacks; each ad's
    /// delegate is then swapped to this module so per-instance events route
    /// exactly like the singular path (docs/decisions/batch-loads-api.md §2).
    @objc(loads:requestIds:useCustomClick:resolver:rejecter:)
    func loads(
        _ unitId: String,
        _ requestIds: [String],
        _ useCustomClick: Bool,
        _ resolve: @escaping RCTPromiseResolveBlock,
        _ reject: @escaping RCTPromiseRejectBlock
    ) {
        let batchKey = UUID().uuidString
        let delegate = RNNativeAdLoadsDelegate(
            onBatchReceived: { [weak self] nativeAds in
                guard let self = self else { return }
                var filled: [String] = []
                var metas: [[String: Any]] = []
                for (index, ad) in nativeAds.enumerated() {
                    // Cap-drift guard: extras are simply not retained (ARC frees them).
                    if index >= requestIds.count { continue }
                    let requestId = requestIds[index]
                    ad.useCustomClick = useCustomClick
                    ad.delegate = self
                    AdropAdsNativeAdManager.instance.registerPreloaded(requestId, ad)
                    filled.append(requestId)
                    metas.append(self.payloadOf(ad, requestId: requestId))
                }
                self.pendingLoadsDelegates.removeValue(forKey: batchKey)
                resolve(["requestIds": filled, "ads": metas])
            },
            onBatchFailed: { [weak self] errorCode in
                self?.pendingLoadsDelegates.removeValue(forKey: batchKey)
                reject(AdropErrorCodeToString(code: errorCode), "AdropNativeAd.loads failed", nil)
            })
        pendingLoadsDelegates[batchKey] = delegate
        AdropNativeAd.loads(unitId: unitId, delegate: delegate)
    }

    /// Dev reload keeps the process-level registry alive while every JS
    /// reference dies — sweep batch-loaded ads so reloads don't stack WebViews.
    override func invalidate() {
        AdropAdsNativeAdManager.instance.destroyAllPreloaded()
        super.invalidate()
    }

    /// Single payload builder for both events and the batch loads() response
    /// (SSOT — a field added here reaches both consumers).
    private func payloadOf(
        _ ad: AdropNativeAd,
        requestId: String,
        method: String? = nil,
        errorCode: String? = nil
    ) -> [String: Any] {
        var creative = ad.creative
        let adPlayerCallback = "window.adPlayerVisibilityCallback"
        if creative.contains(adPlayerCallback) && !creative.contains("callback(true);\(adPlayerCallback)") {
            creative = creative.replacingOccurrences(of: adPlayerCallback, with: "callback(true);\(adPlayerCallback)")
        }

        let isVideoAd = creative.contains(adPlayerCallback)

        var payload: [String: Any] = [
            "unitId": ad.unitId,
            "requestId": requestId,
            "icon": ad.icon, "cover": ad.cover, "headline": ad.headline, "body": ad.body,
            "destinationURL": ad.destinationURL, "advertiserURL": ad.advertiserURL,
            "accountTag": dictionaryToJSONString(ad.accountTag) ?? "{}",
            "creativeTag": dictionaryToJSONString(ad.creativeTag) ?? "{}",
            "advertiser": ad.advertiser, "callToAction": ad.callToAction,
            "creative": creative, "creativeId": ad.creativeId,
            "profileName": ad.profile.displayName, "profileLogo": ad.profile.displayLogo,
            "extra": dictionaryToJSONString(ad.extra) ?? "{}", "asset": ad.asset,
            "txId": ad.txId, "campaignId": ad.campaignId,
            "isBackfilled": ad.isBackfilled,
            "isVideoAd": isVideoAd,
            "browserTarget": ad.browserTargetValue.rawValue,
            "creativeType": ad.creativeType,
        ]
        if let method = method { payload["method"] = method }
        payload["errorCode"] = errorCode ?? ""
        return payload
    }

    private func sendEvent(_ ad: AdropNativeAd, method: String, errorCode: String? = nil) {
        let requestId = AdropAdsNativeAdManager.instance.requestIdFor(ad)
        guard !requestId.isEmpty else { return }
        sendEvent(withName: AdropChannel.invokeNativeChannel,
                  body: payloadOf(ad, requestId: requestId, method: method, errorCode: errorCode))
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

/// Per-call delegate for `AdropNativeAd.loads`. Captures the promise
/// closures; the module keeps a strong reference until the terminal callback
/// (the core holds delegates weakly). Separate class from any banner batch
/// delegate — the two @objc protocols share selector names and cannot be
/// adopted by one NSObject (ios-sdk.md §2).
private class RNNativeAdLoadsDelegate: NSObject, AdropNativeAdDelegate {
    private let onBatchReceived: ([AdropNativeAd]) -> Void
    private let onBatchFailed: (AdropErrorCode) -> Void

    init(onBatchReceived: @escaping ([AdropNativeAd]) -> Void,
         onBatchFailed: @escaping (AdropErrorCode) -> Void) {
        self.onBatchReceived = onBatchReceived
        self.onBatchFailed = onBatchFailed
        super.init()
    }

    func onAdsReceived(_ ads: [AdropNativeAd]) {
        onBatchReceived(ads)
    }

    func onAdsFailedToReceive(_ errorCode: AdropErrorCode) {
        onBatchFailed(errorCode)
    }

    // Required by the protocol; singular callbacks can only fire between
    // auto-attach and the delegate swap — nothing is mounted yet, drop them.
    func onAdReceived(_ ad: AdropNativeAd) {}
    func onAdFailedToReceive(_ ad: AdropNativeAd, _ errorCode: AdropErrorCode) {}
}
