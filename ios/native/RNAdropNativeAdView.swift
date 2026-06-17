import UIKit
import React
import Foundation
import AdropAds


// @objc so the class is emitted into `adrop_ads_react_native-Swift.h` and the
// Fabric component view (AdropNativeAdComponentView.mm) can reference it.
@objc(RNAdropNativeAdView) class RNAdropNativeAdView: RCTView, UIGestureRecognizerDelegate {
    // Old Architecture binds asset views by reactTag via `bridge.uiManager`.
    // New Architecture (Fabric) has no bridge — the Fabric component view
    // (AdropNativeAdComponentView) collects asset views via mountChildComponentView
    // and binds them directly, so `bridge` is optional there.
    private var bridge: RCTBridge?
    var adView: AdropNativeAdView
    private var webView: UIView?
    private var webViewFrame: CGRect?
    var isEntireClick = true
    private var lastTouchPoint: CGPoint?
    private var mediaView: RNAdropMediaView?
    private var pendingSetNativeAdWorkItem: DispatchWorkItem?
    private var lastSetRequestId: String?
    private var isBackfillAd: Bool = false
    // The core ad's tap gesture (added in init). Disabled for useCustomClick ads so
    // the JS <Pressable> receives the tap (onCustomClick → performClick); kept enabled
    // for default-click ads so the gesture opens the destination natively.
    private var clickGesture: UIGestureRecognizer?
    private var isCustomClickAd = false

    @objc init (bridge: RCTBridge? = nil) {
        self.bridge = bridge
        adView = AdropNativeAdView()
        adView.setIsEntireClick(true)
        adView.clipsToBounds = true

        super.init(frame: .zero)

        self.clipsToBounds = true
        self.addSubview(adView)

        if let gesture = adView.gestureRecognizers?.first {
            gesture.delegate = self
            gesture.cancelsTouchesInView = false
            clickGesture = gesture
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

    // MARK: - Asset View Setters

    @objc func setHeadline(_ headline: NSDictionary) {
        guard let viewTag = headline["tag"] as? NSNumber,
              let requestId = headline["requestId"] as? NSString else {
            return
        }

        DispatchQueue.main.async { [weak self] in
            if let headlineView = self?.bridge?.uiManager.view(forReactTag: viewTag) {
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
            if let bodyView = self?.bridge?.uiManager.view(forReactTag: viewTag) {
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
            if let iconView = self?.bridge?.uiManager.view(forReactTag: viewTag) {
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
            guard let self = self else { return }
            if let mediaViewView = self.bridge?.uiManager.view(forReactTag: viewTag) {
                if let rnMediaView = mediaViewView as? RNAdropMediaView {
                    self.mediaView = rnMediaView
                }
                self.adView.setMediaView(mediaViewView)
                self.setNativeAd(requestId as String)
            }
        }
    }

    @objc func setAdvertiser(_ advertiser: NSDictionary) {
        guard let viewTag = advertiser["tag"] as? NSNumber,
              let requestId = advertiser["requestId"] as? NSString else {
            return
        }

        DispatchQueue.main.async { [weak self] in
            if let advertiserView = self?.bridge?.uiManager.view(forReactTag: viewTag) {
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
            if let callToActionView = self?.bridge?.uiManager.view(forReactTag: viewTag) {
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
            if let profileLogoView = self?.bridge?.uiManager.view(forReactTag: viewTag) {
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
            if let profileNameView = self?.bridge?.uiManager.view(forReactTag: viewTag) {
                self?.adView.setProfileNameView(profileNameView)
                self?.setNativeAd(requestId as String)
            }
        }
    }

    // MARK: - Direct Native Ad Setting (for use without asset views)

    @objc func setNativeAdRequestId(_ requestId: String?) {
        guard let requestId = requestId, !requestId.isEmpty else { return }
        setNativeAd(requestId)
    }

    // MARK: - Fabric Asset Binding (New Architecture)

    /// Binds an asset view collected by the Fabric container
    /// (AdropNativeAdComponentView) to the core SDK ad view — the New
    /// Architecture replacement for the reactTag setters above. Reuses the same
    /// SDK API, so behaviour matches the Old Architecture path.
    @objc func bindAsset(_ view: UIView, role: NSString) {
        switch role as String {
        // mediaView is a native AdropMediaView surface the core SDK populates
        // (video/image creative), so it must be bound.
        case "mediaView":
            if let media = RNAdropNativeAdView.findMediaView(in: view) {
                self.mediaView = media
                adView.setMediaView(media)
            } else {
                adView.setMediaView(view)
            }
        // Other assets (icon/headline/body/advertiser/cta/profile*) are rendered by
        // JS. The core SDK injects content into bound asset views via setImage:/text
        // setters (e.g. AdropNativeAdView.downloadAndSetImage → [view setImage:]),
        // which Fabric component views don't implement → "unrecognized selector".
        // So under the New Architecture we don't bind those for content injection;
        // the container's setNativeAd still handles impression + whole-ad click.
        default: break
        }
    }

    private static func findMediaView(in view: UIView) -> RNAdropMediaView? {
        if let media = view as? RNAdropMediaView { return media }
        for sub in view.subviews {
            if let found = findMediaView(in: sub) { return found }
        }
        return nil
    }

    // MARK: - Click Handling

    @objc func performClick(_ requestId: String) {
        DispatchQueue.main.async { [weak self] in
            guard let ad = AdropAdsNativeAdManager.instance.getAd(requestId as String) else {
                return
            }
            if !ad.useCustomClick { return }

            if self?.isClickInVideoWebView() == true {
                return
            }

            self?.adView.performClick()
        }
    }

    // MARK: - Native Ad Setup

    func setNativeAd(_ requestId: String) {
        pendingSetNativeAdWorkItem?.cancel()

        let workItem = DispatchWorkItem { [weak self] in
            guard let self = self else { return }

            guard let ad = AdropAdsNativeAdManager.instance.getAd(requestId) else {
                return
            }

            if self.lastSetRequestId == requestId {
                return
            }
            self.lastSetRequestId = requestId

            AdropAdsNativeAdManager.instance.registerView(requestId, self)

            self.isEntireClick = false
            self.isBackfillAd = ad.isBackfilled

            // useCustomClick: the JS <Pressable> drives the click (onCustomClick →
            // performClick), so disable the native tap gesture which would otherwise
            // intercept the tap under Fabric and the Pressable would never fire.
            // Default-click ads keep the gesture so it opens the destination natively.
            self.clickGesture?.isEnabled = !ad.useCustomClick
            self.isCustomClickAd = ad.useCustomClick

            if ad.isBackfilled {
                if self.mediaView == nil {
                    let hiddenMediaView = RNAdropMediaView(frame: CGRect(x: 0, y: 0, width: 1, height: 1))
                    hiddenMediaView.isHidden = true
                    self.adView.addSubview(hiddenMediaView)
                    self.mediaView = hiddenMediaView
                }
                self.reparentSubviewsToAdView()
            }

            self.configureVideoAdClickHandling(for: ad)
            self.adView.setNativeAd(ad)
            self.updateWebViewFrame()
        }

        pendingSetNativeAdWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05, execute: workItem)
    }

    // MARK: - Backfill Refresh Layout

    func refreshMediaViewLayout() {
        mediaView?.refreshLayout()
    }

    // MARK: - Backfill Ad View Reparenting

    private func reparentSubviewsToAdView() {
        for subview in self.subviews {
            if subview === adView { continue }

            let frameInAdView = self.convert(subview.frame, to: adView)
            subview.removeFromSuperview()
            subview.frame = frameInAdView
            adView.addSubview(subview)
        }
    }

    // MARK: - Video Ad Support

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

    // MARK: - Touch Handling

    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        lastTouchPoint = point

        // useCustomClick: the JS <Pressable> drives the click (onCustomClick →
        // performClick). Under the New Architecture the JS content is a SIBLING of
        // this wrapper — the full-size wrapper sits on top and would swallow every
        // tap — so when a tap lands on the wrapper or the core ad view, pass it
        // through (return nil) and let the container route it to the JS Pressable
        // behind. Under the Old Architecture the JS content is a child here, so
        // hitTest returns it (not the core/self) and this branch is skipped.
        if isCustomClickAd {
            let hit = super.hitTest(point, with: event)
            if hit === self || hit === adView || (hit?.isDescendant(of: adView) ?? false) {
                return nil
            }
            return hit
        }

        if isEntireClick {
            return super.hitTest(point, with: event)
        }

        if let webViewFrame = webViewFrame,
           let webView = webView,
           webViewFrame.contains(point) {
            let webViewPoint = self.convert(point, to: webView)
            if let hitView = webView.hitTest(webViewPoint, with: event) {
                return hitView
            }
        }

        return super.hitTest(point, with: event)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        if let touch = touches.first {
            lastTouchPoint = touch.location(in: self)
        }
    }

    // MARK: - UIGestureRecognizerDelegate

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        if isBackfillAd {
            return false
        }

        if isEntireClick {
            return true
        }

        let location = touch.location(in: self)
        if let webViewFrame = webViewFrame, webViewFrame.contains(location) {
            return false
        }

        return true
    }

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return true
    }
}
