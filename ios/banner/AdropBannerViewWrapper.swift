import UIKit
import React
import AdropAds

@objc
class AdropBannerViewWrapper: RCTView, AdropBannerDelegate {
    // Optional so the layout behaviour can be unit-tested without standing up an RCTBridge.
    // sendEvent already tolerates a missing emitter, so a nil bridge only means "no JS events".
    private var bridge: RCTBridge?
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

    @objc
    init (bridge: RCTBridge?) {
        self.bridge = bridge
        super.init(frame: .zero)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        // `bounds`, not `frame`: frame is this wrapper's rect in its superview's coordinate
        // space, so assigning it to a child offsets the banner by the wrapper's own origin.
        // Whenever RN lays the wrapper out at a non-zero origin (margins, padding, siblings)
        // the banner was pushed out of place. That also silently kills impressions: the core
        // SDK's viewability math (ViewVisibilityUtils) intersects the banner against *every*
        // superview's bounds regardless of clipsToBounds, so the offset alone shrinks the
        // measured visible area, and VisibilityTracker needs >50% to report an impression.
        // AdMob backfill viewability is penalised the same way.
        // Matches RNAdropNativeAdView (`adView.frame = bounds`) and the Flutter iOS banner.
        self.banner?.frame = bounds
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

        if let eventEmitter = bridge?.module(for: BannerEventEmitter.self) as? BannerEventEmitter {
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
