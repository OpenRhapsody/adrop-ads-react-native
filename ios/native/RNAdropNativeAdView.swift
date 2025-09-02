import UIKit
import React
import Foundation
import AdropAds


class RNAdropNativeAdView: RCTView, UIGestureRecognizerDelegate {
    private var bridge: RCTBridge
    var adView: AdropNativeAdView
    private var webView: UIView?
    private var webViewFrame: CGRect?
    var isEntireClick = true
    private var lastTouchPoint: CGPoint?
    
    init (bridge: RCTBridge) {
        self.bridge = bridge
        adView = AdropNativeAdView()
        adView.setIsEntireClick(true)
        
        super.init(frame: .zero)
        
        self.addSubview(adView)
        if let gesture = adView.gestureRecognizers?.first {
            gesture.delegate = self
            addGestureRecognizer(gesture)
        }
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        self.adView.frame = bounds
        updateWebViewFrame()
    }
    
    @objc func setHeadline(_ headline: NSDictionary) {
        guard let viewTag = headline["tag"] as? NSNumber,
              let requestId = headline["requestId"] as? NSString else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            if let headlineView =  self?.bridge.uiManager.view(forReactTag: viewTag)
            {
                self?.adView.setHeadLineView(headlineView)
                self?.setNativeAd(requestId as String)
            }
        }
    }
    
    @objc func setBody(_ body: NSDictionary) {
        guard let viewTag = body["tag"] as? NSNumber,
              let requestId = body["requestId"] as? NSString else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            if let bodyView =  self?.bridge.uiManager.view(forReactTag: viewTag)
            {
                self?.adView.setBodyView(bodyView)
                self?.setNativeAd(requestId as String)
            }
        }
    }
    
    @objc func setIcon(_ icon: NSDictionary) {
        guard let viewTag = icon["tag"] as? NSNumber,
              let requestId = icon["requestId"] as? NSString else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            if let iconView =  self?.bridge.uiManager.view(forReactTag: viewTag)
            {
                
                self?.adView.setIconView(iconView)
                self?.setNativeAd(requestId as String)
            }
        }
    }
    
    @objc func setMediaView(_ mediaView: NSDictionary) {
        guard let viewTag = mediaView["tag"] as? NSNumber,
              let requestId = mediaView["requestId"] as? NSString else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            if let mediaViewView =  self?.bridge.uiManager.view(forReactTag: viewTag)
            {
                self?.adView.setMediaView(mediaViewView)
                self?.setNativeAd(requestId as String)
            }
        }
    }
    
    @objc func setAdvertiser(_ advertiser: NSDictionary) {
        guard let viewTag = advertiser["tag"] as? NSNumber,
              let requestId = advertiser["requestId"] as? NSString else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            if let advertiserView =  self?.bridge.uiManager.view(forReactTag: viewTag)
            {
                self?.adView.setAdvertiserView(advertiserView)
                self?.setNativeAd(requestId as String)
            }
        }
    }
    
    @objc func setCallToAction(_ callToAction: NSDictionary) {
        guard let viewTag = callToAction["tag"] as? NSNumber,
              let requestId = callToAction["requestId"] as? NSString else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            if let callToActionView =  self?.bridge.uiManager.view(forReactTag: viewTag)
            {
                self?.adView.setCallToActionView(callToActionView)
                self?.setNativeAd(requestId as String)
            }
        }
    }
    
    @objc func setProfileLogo(_ profileLogo: NSDictionary) {
        guard let viewTag = profileLogo["tag"] as? NSNumber,
              let requestId = profileLogo["requestId"] as? NSString else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            if let profileLogoView =  self?.bridge.uiManager.view(forReactTag: viewTag)
            {
                self?.adView.setProfileLogoView(profileLogoView)
                self?.setNativeAd(requestId as String)
            }
        }
    }
    
    @objc func setProfileName(_ profileName: NSDictionary) {
        guard let viewTag = profileName["tag"] as? NSNumber,
              let requestId = profileName["requestId"] as? NSString else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            if let profileNameView =  self?.bridge.uiManager.view(forReactTag: viewTag)
            {
                self?.adView.setProfileNameView(profileNameView)
                self?.setNativeAd(requestId as String)
            }
        }
    }
    
    @objc func performClick(_ requestId: String) {
        DispatchQueue.main.async { [weak self] in
            guard let ad = AdropAdsNativeAdManager.instance.getAd(requestId as String) else {
                return
            }
            if (!ad.useCustomClick) { return }
            
            // For video ads, check if the click is within the WebView area
            if self?.isClickInVideoWebView() == true {
                return
            }
            
            self?.adView.performClick()
        }
    }
    
    func setNativeAd(_ requestId: String) {
        guard let ad = AdropAdsNativeAdManager.instance.getAd(requestId) else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.configureVideoAdClickHandling(for: ad)
            
            self?.adView.setNativeAd(ad)
            self?.updateWebViewFrame()
        }
    }
    
    // Handle video ads
    
    private func updateWebViewFrame() {
        webView = findWebView(in: self)
        if let webView = webView {
            let webViewPoint = webView.convert(webView.bounds.origin, to: self)
            webViewFrame = CGRect(origin: webViewPoint, size: webView.bounds.size)
        }
    }
    
    private func findWebView(in view: UIView) -> UIView? {
        for subview in view.subviews {
            let className = String(describing: type(of: subview))
            if className.contains("WebView") {
                return subview
            }
            if let found = findWebView(in: subview) {
                return found
            }
        }
        return nil
    }
    
    private func isClickInVideoWebView() -> Bool {
        if !isEntireClick {
            if let webViewFrame = webViewFrame,
               let lastTouch = lastTouchPoint,
               webViewFrame.contains(lastTouch) {
                // Click is within WebView area, skip performClick
                return true
            }
        }
        return false
    }
    
    private func configureVideoAdClickHandling(for ad: AdropNativeAd) {
        if ad.creative.contains("<video") && ad.useCustomClick {
            isEntireClick = false
            adView.setIsEntireClick(false)
        }
    }
    
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        // Store the touch point for later use in performClick
        lastTouchPoint = point
        
        // If entireClick is enabled, use default behavior
        if isEntireClick {
            return super.hitTest(point, with: event)
        }
        
        // Check if touch is within webView bounds
        if let webViewFrame = webViewFrame,
           let webView = webView,
           webViewFrame.contains(point) {
            // Convert point to webView's coordinate system
            let webViewPoint = self.convert(point, to: webView)
            // Let webView handle the touch by returning it directly
            if let hitView = webView.hitTest(webViewPoint, with: event) {
                return hitView
            }
        }
        
        // Otherwise, use default behavior
        return super.hitTest(point, with: event)
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        if let touch = touches.first {
            lastTouchPoint = touch.location(in: self)
        }
    }
    
    // UIGestureRecognizerDelegate methods
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        // If entireClick is enabled, allow gesture
        if isEntireClick {
            return true
        }
        
        // For video ads, check if touch is within webView
        let location = touch.location(in: self)
        if let webViewFrame = webViewFrame,
           webViewFrame.contains(location) {
            // Don't handle touch in webView area
            return false
        }
        
        return true
    }
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        // Allow simultaneous recognition with webView gestures
        return true
    }
}
