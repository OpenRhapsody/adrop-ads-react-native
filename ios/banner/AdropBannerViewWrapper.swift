import UIKit
import React
import AdropAds

@objc(AdropBannerViewWrapper)
class AdropBannerViewWrapper: RCTView, AdropBannerDelegate {
    // Old Architecture delivers events through the bridge-backed
    // `BannerEventEmitter`. New Architecture (Fabric) has no bridge, so the
    // component view injects `onFabricEvent` and events flow through it instead.
    private var bridge: RCTBridge?
    @objc var onFabricEvent: (([String: Any]) -> Void)?
    private var banner: AdropBanner?

    func onAdReceived(_ banner: AdropBanner) {
        sendEvent(ad: banner, method: AdropMethod.DID_RECEIVE_AD)
    }

    func onAdClicked(_ banner: AdropBanner) {
        sendEvent(ad: banner, method: AdropMethod.DID_CLICK_AD)
    }

    func onAdFailedToReceive(_ banner: AdropBanner, _ errorCode: AdropErrorCode) {
        sendEvent(ad: banner, method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode: AdropErrorCodeToString(code: errorCode))
    }

    func onAdImpression(_ banner: AdropBanner) {
        sendEvent(ad: banner, method: AdropMethod.DID_IMPRESSION)
    }

    func onAdVideoStart(_ banner: AdropBanner) {
        sendEvent(ad: banner, method: AdropMethod.DID_VIDEO_START)
    }

    func onAdVideoEnd(_ banner: AdropBanner) {
        sendEvent(ad: banner, method: AdropMethod.DID_VIDEO_END)
    }

    @objc init (bridge: RCTBridge? = nil) {
        self.bridge = bridge
        super.init(frame: .zero)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        self.banner?.frame = frame
    }

    @objc
    func setUnitId(_ unitId: NSString) {
        banner = AdropBanner(unitId: unitId as String)
        banner?.delegate = self
        self.addSubview(banner!)

        sendEvent(ad: banner!, method: AdropMethod.DID_CREATED_BANNER)
    }

    @objc
    func setUseCustomClick(_ useCustomClick: Bool) {
        self.banner?.useCustomClick = useCustomClick
    }

    @objc
    func load() {
        self.banner?.load()
    }

    @objc
    func play() {
        self.banner?.play()
    }

    @objc
    func pause() {
        self.banner?.pause()
    }

    private func sendEvent(ad: AdropBanner, method: String, errorCode: String? = nil) {
        let tag = self.reactTag ?? 0
        let body: [String: Any] = [
            "method": method,
            "errorCode": errorCode ?? "",
            "tag": tag,
            "creativeId": ad.creativeId,
            "destinationURL": ad.destinationURL,
            "txId": ad.txId,
            "campaignId": ad.campaignId,
            "browserTarget": ad.browserTargetValue.rawValue,
            "creativeType": ad.creativeType
        ]

        // New Architecture (Fabric): no bridge — emit via the injected callback.
        if let onFabricEvent = onFabricEvent {
            onFabricEvent(body)
            return
        }

        // Old Architecture: emit through the bridge-backed event emitter.
        if let eventEmitter = bridge?.module(for: BannerEventEmitter.self) as? BannerEventEmitter {
            eventEmitter.sendEvent(withName: AdropChannel.invokeBannerChannel, body: body)
        }
    }
}


@objc(BannerEventEmitter)
class BannerEventEmitter: RCTEventEmitter {
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    override func supportedEvents() -> [String]! {
        return [AdropChannel.invokeBannerChannel]
    }

}
