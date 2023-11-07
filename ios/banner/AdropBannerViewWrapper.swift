//
//  AdropBannerViewWrapper.swift
//  adrop-ads-react-native
//
//  Created by 민우임 on 11/1/23.
//
import UIKit
import React
import AdropAds

@objc
class AdropBannerViewWrapper: RCTView, AdropBannerDelegate {
    var bridge: RCTBridge
    var banner: AdropBanner?

    func onAdReceived(_ banner: AdropBanner) {
        sendEvent(method: AdropMethod.DID_RECEIVE_AD)
    }

    func onAdClicked(_ banner: AdropBanner) {
        sendEvent(method: AdropMethod.DID_CLICK_AD)
    }

    func onAdFailedToReceive(_ banner: AdropBanner, _ error: AdropErrorCode) {
        sendEvent(method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, message: error.rawValue)
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

    private func sendEvent(method: String, message: String? = nil) {
        let channel = AdropChannel.methodBannerChannelOf(id: self.reactTag as! Int)
        if let eventEmitter = bridge.module(for: BannerEventEmitter.self) as? BannerEventEmitter {
            eventEmitter.sendEvent(withName: AdropChannel.METHOD_BANNER_CHANNEL,
                                   body: [ "method": method, "channel": channel, "message": message ?? "", "tag": self.reactTag ?? 0 ])
        }
    }
}


@objc(BannerEventEmitter)
class BannerEventEmitter: RCTEventEmitter {
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    override func supportedEvents() -> [String]! {
        return [AdropChannel.METHOD_BANNER_CHANNEL]
    }

}
