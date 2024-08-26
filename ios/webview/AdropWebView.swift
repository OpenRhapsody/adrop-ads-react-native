import WebKit
import UIKit
import React

class AdropWebView: RCTView {
    private var bridge: RCTBridge

    init (bridge: RCTBridge) {
        self.bridge = bridge
        super.init(frame: .null)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc func setData(_ data: NSString) {
        DispatchQueue.main.async {
//            self.webView.loadHTMLString(data as String, baseURL: nil)
        }
    }
}
