import React
import AdropAds
import UIKit


@objc(AdropBannerViewManager)
class AdropBannerViewManager: RCTViewManager {
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> AdropBannerViewWrapper? {
        return AdropBannerViewWrapper(bridge: self.bridge)
    }
    
    @objc func load(_ reactTag: NSNumber) {
        DispatchQueue.main.async {
            if let uiView =  self.bridge.uiManager.view(forReactTag: reactTag),
               let banner = uiView as? AdropBannerViewWrapper {
                banner.load()
            }
        }
    }
}
