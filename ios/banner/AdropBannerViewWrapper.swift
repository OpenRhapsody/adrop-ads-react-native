import UIKit
import React
import AdropAds

@objc
class AdropBannerViewWrapper: RCTView, AdropBannerDelegate {
    private var bridge: RCTBridge
    private var banner: AdropBanner?

    func onAdReceived(_ banner: AdropBanner) {
        sendEvent(method: AdropMethod.DID_RECEIVE_AD, creativeId: banner.creativeId)
    }

    func onAdClicked(_ banner: AdropBanner) {
        sendEvent(method: AdropMethod.DID_CLICK_AD, creativeId: banner.creativeId)
    }

    func onAdFailedToReceive(_ banner: AdropBanner, _ errorCode: AdropErrorCode) {
        sendEvent(method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode: AdropErrorCodeToString(code: errorCode))
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

        sendEvent(method: AdropMethod.DID_CREATED_BANNER)
    }

    func load() {
        self.banner?.load()
    }

    private func sendEvent(method: String, creativeId: String? = "", errorCode: String? = nil) {

        if let eventEmitter = bridge.module(for: BannerEventEmitter.self) as? BannerEventEmitter {
            let tag = self.reactTag ?? 0
            eventEmitter.sendEvent(withName: AdropChannel.invokeBannerChannel,
                                   body: [ "method": method, "errorCode": errorCode ?? "", "tag": tag, "creativeId": creativeId ])
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
