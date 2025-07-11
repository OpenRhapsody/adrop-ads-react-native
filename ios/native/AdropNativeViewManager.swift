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
    
    @objc func performClick(_ node: NSNumber, requestId: NSString) {
        DispatchQueue.main.async {
            guard let view = self.bridge.uiManager.view(forReactTag: node) as? RNAdropNativeAdView else {
                return
            }
            view.performClick(requestId as String)
        }
    }

}
