import UIKit
import React
import Foundation
import AdropAds


class RNAdropNativeAdView: RCTView {
    private var bridge: RCTBridge
    var adView: AdropNativeAdView
    
    init (bridge: RCTBridge) {
        self.bridge = bridge
        adView = AdropNativeAdView()
        adView.setIsEntireClick(true)
        
        super.init(frame: .zero)
        
        self.addSubview(adView)
        guard let gesture = adView.gestureRecognizers?.first else {
            return
        }
        addGestureRecognizer(gesture)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        self.adView.frame = bounds
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
            
            self?.adView.performClick()
        }
    }
    
    func setNativeAd(_ requestId: String) {
        guard let ad = AdropAdsNativeAdManager.instance.getAd(requestId) else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.adView.setNativeAd(ad)
        }
    }
}
