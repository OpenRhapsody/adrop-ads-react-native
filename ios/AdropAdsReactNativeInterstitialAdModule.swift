import AdropAds

@objc(AdropInterstitialAd)
class AdropInterstitialAdModule: RCTEventEmitter, AdropInterstitialAdDelegate {
    private var _interstitialAds = [String:AdropInterstitialAd]()
    
    @objc(create:requestId:)
    func create(_ unitId: String, _ requestId: String) -> Void {
        
        if self._interstitialAds[requestId] == nil {
            let interstitialAd = AdropInterstitialAd(unitId: unitId)
            interstitialAd.delegate = self
            self._interstitialAds[requestId] = interstitialAd
        }
        
    }
    
    @objc(load:requestId:)
    func load(_ unitId: String, _ requestId: String) -> Void {
        
        if self._interstitialAds[requestId] == nil {
            let interstitialAd = AdropInterstitialAd(unitId: unitId)
            interstitialAd.delegate = self
            self._interstitialAds[requestId] = interstitialAd
        }
        
        DispatchQueue.main.async { [weak self] in
            if let interstitialAd = self?._interstitialAds[requestId] {
                interstitialAd.load()
            }
        }
    }
    
    @objc(show:requestId:)
    func show(_ unitId: String, _ requestId: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            if let interstitialAd = self?._interstitialAds[requestId], let viewController = RCTPresentedViewController() {
                interstitialAd.show(fromRootViewController: viewController)
            } else {
                self?.sendEvent(unitId: unitId, requestId: requestId, method: AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode: AdropErrorCodeToString(code: .ERROR_CODE_AD_EMPTY))
            }
        }
    }
    
    @objc(destroy:)
    func destroy(_ requestId: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            self?._interstitialAds.removeValue(forKey: requestId)
        }
    }
    
    private func requestIdFor(_ ad: AdropInterstitialAd) -> String {
        for (entry) in self._interstitialAds {
            if entry.value === ad {
                return entry.key
            }
        }
        return ""
    }
    
    
    private func sendEvent(unitId: String, requestId: String, method: String, creativeId: String? = "", errorCode: String? = nil) {
        sendEvent(withName: AdropChannel.invokeInterstitialChannel(id: requestId),
                  body: [ "unitId": unitId, "method": method, "errorCode": errorCode ?? "", "creativeId": creativeId])
    }
    
    
    func onAdReceived(_ ad: AdropInterstitialAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_RECEIVE_AD, creativeId: ad.creativeId)
    }
    
    func onAdFailedToReceive(_ ad: AdropInterstitialAd, _ errorCode: AdropErrorCode) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode: AdropErrorCodeToString(code: errorCode))
    }
    
    func onAdImpression(_ ad: AdropInterstitialAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_IMPRESSION)
    }
    
    func onAdClicked(_ ad: AdropInterstitialAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_CLICK_AD)
    }
    
    func onAdWillPresentFullScreen(_ ad: AdropInterstitialAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.WILL_PRESENT_FULL_SCREEN)
        
    }
    
    func onAdDidPresentFullScreen(_ ad: AdropInterstitialAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_PRESENT_FULL_SCREEN)
    }
    
    func onAdWillDismissFullScreen(_ ad: AdropInterstitialAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.WILL_DISMISS_FULL_SCREEN)
    }
    
    func onAdDidDismissFullScreen(_ ad: AdropInterstitialAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_DISMISS_FULL_SCREEN)
    }
    
    func onAdFailedToShowFullScreen(_ ad: AdropInterstitialAd, _ errorCode: AdropErrorCode) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode: AdropErrorCodeToString(code: errorCode))
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return self._interstitialAds.keys.map {AdropChannel.invokeInterstitialChannel(id: $0) }
    }
    
}
