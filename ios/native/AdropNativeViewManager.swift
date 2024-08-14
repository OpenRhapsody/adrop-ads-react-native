import Foundation
import React

@objc(AdropNativeAdViewManager)
class AdropNativeAdViewManager: RCTViewManager {

    override func view() -> UIView {
        return RNAdropNativeAdView(bridge: self.bridge)
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

}
