import WebKit
import UIKit
import React

class AdropWebView: RCTView {
    private var bridge: RCTBridge
    private var webView: WKWebView = WKWebView()

    init (bridge: RCTBridge) {
        self.bridge = bridge
        super.init(frame: .null)
        self.addSubview(self.webView)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        self.webView.frame = bounds
    }

    @objc func setData(_ data: NSString) {
        DispatchQueue.main.async {
//            self.webView.loadHTMLString(data as String, baseURL: nil)
        }
    }
}
