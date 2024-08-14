import React
import WebKit
import UIKit

@objc(AdropWebViewManager)
class AdropWebViewManager: RCTViewManager {
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> AdropWebView? {
        return AdropWebView(bridge: self.bridge)
    }
}
