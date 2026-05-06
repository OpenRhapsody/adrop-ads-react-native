import UIKit
import React
import AdropAds

@objc
class AdropBannerViewWrapper: RCTView, AdropBannerDelegate {
    private var bridge: RCTBridge
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

    init (bridge: RCTBridge) {
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

    func load() {
        self.banner?.load()
    }

    func play() {
        self.banner?.play()
    }

    func pause() {
        self.banner?.pause()
    }

    private func sendEvent(ad: AdropBanner, method: String, errorCode: String? = nil) {

        if let eventEmitter = bridge.module(for: BannerEventEmitter.self) as? BannerEventEmitter {
            let tag = self.reactTag ?? 0
            eventEmitter.sendEvent(withName: AdropChannel.invokeBannerChannel,
                                   body: [
                                       "method": method,
                                       "errorCode": errorCode ?? "",
                                       "tag": tag,
                                       "creativeId": ad.creativeId,
                                       "destinationURL": ad.destinationURL,
                                       "txId": ad.txId,
                                       "campaignId": ad.campaignId,
                                       "browserTarget": ad.browserTargetValue.rawValue,
                                       "creativeType": ad.creativeType
                                   ])
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
