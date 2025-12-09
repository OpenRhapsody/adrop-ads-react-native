import Foundation
import React

@objc(MediaViewManager)
class MediaViewManager: RCTViewManager {

    override func view() -> UIView {
        return RNAdropMediaView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
