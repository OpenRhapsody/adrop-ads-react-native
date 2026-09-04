import Foundation
import AdropAds
import React

/// NativeModule backing the batch `AdropBanner.loads()` JS API.
///
/// Batch flow: one network call, up to 5 pre-loaded banners bound positionally
/// to the JS-minted requestIds. A per-call delegate handles only the terminal
/// batch callbacks; after registration each banner's delegate is swapped to
/// this module so per-instance events are emitted on the requestId-keyed
/// preloaded channel (docs/decisions/batch-loads-api.md §2).
@objc(AdropBanner)
class AdropAdsReactNativeBannerModule: RCTEventEmitter, AdropBannerDelegate {

    override var methodQueue: DispatchQueue! { DispatchQueue.main }

    /// Per-call batch delegates, held strongly until the terminal callback.
    /// REQUIRED: the core stores `AdropBanner.delegate` weakly and `loads()`
    /// captures `[weak delegate]` — without this map the delegate deallocates
    /// and the JS Promise never settles.
    private var pendingLoadsDelegates: [String: RNBannerLoadsDelegate] = [:]

    @objc(loads:requestIds:useCustomClick:resolver:rejecter:)
    func loads(
        _ unitId: String,
        _ requestIds: [String],
        _ useCustomClick: Bool,
        _ resolve: @escaping RCTPromiseResolveBlock,
        _ reject: @escaping RCTPromiseRejectBlock
    ) {
        let batchKey = UUID().uuidString
        let delegate = RNBannerLoadsDelegate(
            onBatchReceived: { [weak self] banners in
                guard let self = self else { return }
                var filled: [String] = []
                var metas: [[String: Any]] = []
                for (index, banner) in banners.enumerated() {
                    if index >= requestIds.count {
                        // Cap-drift guard: native returned more rows than minted ids.
                        DispatchQueue.main.async { banner.destroy() }
                        continue
                    }
                    let requestId = requestIds[index]
                    banner.useCustomClick = useCustomClick
                    banner.delegate = self
                    AdropPreloadedBannerStore.instance.banners[requestId] = banner
                    filled.append(requestId)
                    metas.append(self.payloadOf(banner, requestId: requestId))
                }
                self.pendingLoadsDelegates.removeValue(forKey: batchKey)
                resolve(["requestIds": filled, "ads": metas])
            },
            onBatchFailed: { [weak self] errorCode in
                self?.pendingLoadsDelegates.removeValue(forKey: batchKey)
                reject(AdropErrorCodeToString(code: errorCode), "AdropBanner.loads failed", nil)
            })
        pendingLoadsDelegates[batchKey] = delegate
        AdropBanner.loads(unitId: unitId, delegate: delegate)
    }

    @objc(destroy:)
    func destroy(_ requestId: String) {
        AdropPreloadedBannerStore.instance.banners.removeValue(forKey: requestId)?.destroy()
    }

    /// Dev reload keeps the process (and this registry) alive while every JS
    /// reference dies — sweep so each reload doesn't stack up to 5 WebViews.
    /// Bridge teardown may call this off-main; view destruction must be main.
    override func invalidate() {
        DispatchQueue.main.async {
            AdropPreloadedBannerStore.instance.banners.values.forEach { $0.destroy() }
            AdropPreloadedBannerStore.instance.banners.removeAll()
        }
        super.invalidate()
    }

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return [AdropChannel.invokePreloadedBannerChannel]
    }

    /// Single payload builder for both the loads() response and every emitted
    /// event (SSOT within the preloaded path). Field set mirrors the frozen
    /// singular builder in AdropBannerViewWrapper.sendEvent — keep in sync.
    private func payloadOf(
        _ banner: AdropBanner,
        requestId: String,
        method: String? = nil,
        errorCode: String? = nil
    ) -> [String: Any] {
        var payload: [String: Any] = [
            "unitId": banner.unitId,
            "requestId": requestId,
            "creativeId": banner.creativeId,
            "txId": banner.txId,
            "campaignId": banner.campaignId,
            "destinationURL": banner.destinationURL,
            "creativeSizeWidth": banner.creativeSize.width,
            "creativeSizeHeight": banner.creativeSize.height,
            "browserTarget": banner.browserTargetValue.rawValue,
            "creativeType": banner.creativeType,
        ]
        if let method = method { payload["method"] = method }
        if let errorCode = errorCode { payload["errorCode"] = errorCode }
        return payload
    }

    private func emit(_ banner: AdropBanner, method: String, errorCode: String? = nil) {
        let requestId = AdropPreloadedBannerStore.instance.requestIdFor(banner)
        guard !requestId.isEmpty else { return }
        sendEvent(
            withName: AdropChannel.invokePreloadedBannerChannel,
            body: payloadOf(banner, requestId: requestId, method: method, errorCode: errorCode))
    }

    // Swap-target delegate — full override set (a missed method silently drops
    // that event for every preloaded banner).
    func onAdReceived(_ banner: AdropBanner) {
        // The batch path never re-fires the singular onAdReceived (native
        // contract); nothing to emit.
    }

    func onAdFailedToReceive(_ banner: AdropBanner, _ errorCode: AdropErrorCode) {
        emit(banner, method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode: AdropErrorCodeToString(code: errorCode))
    }

    func onAdClicked(_ banner: AdropBanner) {
        emit(banner, method: AdropMethod.DID_CLICK_AD)
    }

    func onAdImpression(_ banner: AdropBanner) {
        emit(banner, method: AdropMethod.DID_IMPRESSION)
    }

    func onAdVideoStart(_ banner: AdropBanner) {
        emit(banner, method: AdropMethod.DID_VIDEO_START)
    }

    func onAdVideoEnd(_ banner: AdropBanner) {
        emit(banner, method: AdropMethod.DID_VIDEO_END)
    }
}

/// Per-call delegate for `AdropBanner.loads`. Captures the promise closures;
/// the module keeps a strong reference until the terminal callback (the core
/// holds delegates weakly).
private class RNBannerLoadsDelegate: NSObject, AdropBannerDelegate {
    private let onBatchReceived: ([AdropBanner]) -> Void
    private let onBatchFailed: (AdropErrorCode) -> Void

    init(onBatchReceived: @escaping ([AdropBanner]) -> Void,
         onBatchFailed: @escaping (AdropErrorCode) -> Void) {
        self.onBatchReceived = onBatchReceived
        self.onBatchFailed = onBatchFailed
        super.init()
    }

    func onAdsReceived(_ banners: [AdropBanner]) {
        onBatchReceived(banners)
    }

    func onAdsFailedToReceive(_ errorCode: AdropErrorCode) {
        onBatchFailed(errorCode)
    }

    // Required by the protocol; singular callbacks can only fire between
    // auto-attach and the delegate swap — nothing is mounted yet, drop them.
    func onAdReceived(_ banner: AdropBanner) {}
    func onAdFailedToReceive(_ banner: AdropBanner, _ errorCode: AdropErrorCode) {}
}
