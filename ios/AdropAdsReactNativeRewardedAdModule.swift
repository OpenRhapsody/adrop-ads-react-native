import AdropAds

@objc(AdropRewardedAd)
class AdropRewardedAdAdModule: RCTEventEmitter, AdropRewardedAdDelegate {
    private var _rewardedAds = [String: AdropRewardedAd]()
    
    @objc(create:requestId:)
    func create(_ unitId: String, _ requestId: String) -> Void {
        if self._rewardedAds[requestId] == nil {
            let rewardedAd = AdropRewardedAd(unitId: unitId)
            rewardedAd.delegate = self
            self._rewardedAds[requestId] = rewardedAd
        }
    }
    
    @objc(load:requestId:)
    func load(_ unitId: String, _ requestId: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            if let rewardedAd = self?._rewardedAds[requestId] {
                rewardedAd.load()
            }
        }
    }
    
    @objc(show:requestId:)
    func show(_ unitId: String, _ requestId: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            if let rewardedAd = self?._rewardedAds[requestId], let viewController = RCTPresentedViewController() {
                rewardedAd.show(fromRootViewController: viewController) { [weak self] type, amount in
                    guard let strongSelf = self else { return }
                    
                    strongSelf.sendEarnEvent(unitId: unitId,  requestId: requestId, method: AdropMethod.HANDLE_EARN_REWARD, type: type, amount: amount)
                }
            } else {
                self?.sendAdEvent(unitId: unitId, requestId: requestId, method: AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode: AdropErrorCodeToString(code: .ERROR_CODE_AD_EMPTY))
            }
        }
    }
    
    @objc(destroy:)
    func destroy(_ requestId: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            self?._rewardedAds.removeValue(forKey: requestId)
        }
    }
    
    private func requestIdFor(_ ad: AdropRewardedAd) -> String {
        for (entry) in self._rewardedAds {
            if entry.value === ad {
                return entry.key
            }
        }
        return ""
    }
    
    private func sendAdEvent(unitId: String, requestId: String, method: String, creativeId: String? = "", errorCode: String? = nil) {
        sendEvent(withName: AdropChannel.invokeRewardedChannel(id: requestId),
                  body: [ "unitId": unitId, "method": method, "errorCode": errorCode ?? "", "creativeId": creativeId])
    }
    
    private func sendEarnEvent(unitId: String, requestId: String, method: String, type: Int, amount: Int) {
        sendEvent(withName: AdropChannel.invokeRewardedChannel(id: requestId),
                  body: [ "unitId": unitId, "method": method, "type": type, "amount": amount])
    }
    
    func onAdReceived(_ ad: AdropRewardedAd) {
        sendAdEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_RECEIVE_AD, creativeId: ad.creativeId)
    }
    
    func onAdFailedToReceive(_ ad: AdropRewardedAd, _ errorCode: AdropErrorCode) {
        sendAdEvent(unitId: ad.unitId,  requestId: requestIdFor(ad), method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode: AdropErrorCodeToString(code: errorCode))
    }
    
    func onAdImpression(_ ad: AdropRewardedAd) {
        sendAdEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_IMPRESSION)
    }
    
    func onAdClicked(_ ad: AdropRewardedAd) {
        sendAdEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_CLICK_AD)
    }
    
    func onAdWillPresentFullScreen(_ ad: AdropRewardedAd) {
        sendAdEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.WILL_PRESENT_FULL_SCREEN)
    }
    
    func onAdDidPresentFullScreen(_ ad: AdropRewardedAd) {
        sendAdEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_PRESENT_FULL_SCREEN)
    }
    
    func onAdWillDismissFullScreen(_ ad: AdropRewardedAd) {
        sendAdEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.WILL_DISMISS_FULL_SCREEN)
    }
    
    func onAdDidDismissFullScreen(_ ad: AdropRewardedAd) {
        sendAdEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_DISMISS_FULL_SCREEN)
    }
    
    func onAdFailedToShowFullScreen(_ ad: AdropRewardedAd, _ errorCode: AdropErrorCode) {
        sendAdEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode: AdropErrorCodeToString(code: errorCode))
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return self._rewardedAds.keys.map {AdropChannel.invokeRewardedChannel(id: $0) }
    }
}
