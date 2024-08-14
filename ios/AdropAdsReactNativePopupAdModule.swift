import AdropAds

@objc(AdropPopupAd)
class AdropPopupAdModule: RCTEventEmitter, AdropPopupAdDelegate {
    private var _popupAds = [String:AdropPopupAd]()
    
    @objc(create:requestId:)
    func create(_ unitId: String, _ requestId: String) -> Void {
        if self._popupAds[requestId] == nil {
            let popupAd = AdropPopupAd(unitId: unitId)
            popupAd.delegate = self
            self._popupAds[requestId] = popupAd
        }
    }
    
    @objc(load:requestId:)
    func load(_ unitId: String, _ requestId: String) -> Void {
        
        if self._popupAds[requestId] == nil {
            let popupAd = AdropPopupAd(unitId: unitId)
            popupAd.delegate = self
            self._popupAds[requestId] = popupAd
        }
        
        if let popupAd = self._popupAds[requestId] {
            DispatchQueue.main.async {
                popupAd.load()
            }
        }
    }
    
    @objc(show:requestId:)
    func show(_ unitId: String, _ requestId: String) -> Void {
        DispatchQueue.main.async {
            if let popupAd = self._popupAds[requestId], let viewController = RCTPresentedViewController() {
                popupAd.show(fromRootViewController: viewController)
            } else {
                self.sendEvent(unitId: unitId, requestId: requestId, method: AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode: AdropErrorCodeToString(code: .ERROR_CODE_AD_EMPTY))
            }
        }
    }
    
    @objc(customize:data:)
    func customize(_ requestId: String, data: [String:Any]?) {
        DispatchQueue.main.async {
            guard let popupAd = self._popupAds[requestId] else { return }
            
            if let closeTextColor = data?["closeTextColor"] as? String {
                let color = self.hexStringToColorInt(closeTextColor)
                popupAd.closeTextColor = UIColor(fromRNColor: color)
            }
            
            if let hideForTodayTextColor = data?["hideForTodayTextColor"] as? String {
                let color = self.hexStringToColorInt(hideForTodayTextColor)
                popupAd.hideForTodayTextColor = UIColor(fromRNColor: color)
            }
            
            if let backgroundColor = data?["backgroundColor"] as? String {
                let color = self.hexStringToColorInt(backgroundColor)
                popupAd.backgroundColor = UIColor(fromRNColor: color)
            }
            
        }
    }
    
    @objc(destroy:)
    func destroy(_ requestId: String) -> Void {
        DispatchQueue.main.async {
            self._popupAds.removeValue(forKey: requestId)
        }
    }
    
    func hexStringToColorInt(_ hexString: String) -> UInt32 {
        var hex = hexString
        
        if hex.hasPrefix("#") {
            hex.remove(at: hex.startIndex)
        }
        
        if hex.count == 3 || hex.count == 4 {
            hex = String(hex.flatMap { [$0, $0] })
        }
        
        guard hex.count == 6 || hex.count == 8 else {
            return 0
        }
        
        var rgba: UInt64 = 0
        guard Scanner(string: hex).scanHexInt64(&rgba) else {
            return 0
        }
        
        if hex.count == 6 {
            return UInt32(rgba) | 0xFF000000
        } else {
            return UInt32(rgba)
        }
    }
    
    private func requestIdFor(_ ad: AdropPopupAd) -> String {
        for (entry) in self._popupAds {
            if entry.value === ad {
                return entry.key
            }
        }
        return ""
    }
    
    
    private func sendEvent(unitId: String, requestId: String, method: String, creativeIds: [String] = [], errorCode: String? = nil) {
        sendEvent(withName: AdropChannel.invokePopupChannel(id: requestId),
                  body: [ "unitId": unitId, "method": method, "errorCode": errorCode ?? "", "creativeId": creativeIds.joined(separator: ",")])
    }
    
    
    func onAdReceived(_ ad: AdropPopupAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_RECEIVE_AD, creativeIds: ad.creativeIds)
    }
    
    func onAdFailedToReceive(_ ad: AdropPopupAd, _ errorCode: AdropErrorCode) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_FAIL_TO_RECEIVE_AD, errorCode: AdropErrorCodeToString(code: errorCode))
    }
    
    func onAdImpression(_ ad: AdropPopupAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_IMPRESSION)
    }
    
    func onAdClicked(_ ad: AdropPopupAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_CLICK_AD)
    }
    
    func onAdWillPresentFullScreen(_ ad: AdropPopupAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.WILL_PRESENT_FULL_SCREEN)
        
    }
    
    func onAdDidPresentFullScreen(_ ad: AdropPopupAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_PRESENT_FULL_SCREEN)
    }
    
    func onAdWillDismissFullScreen(_ ad: AdropPopupAd) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.WILL_DISMISS_FULL_SCREEN)
    }
    
    func onAdDidDismissFullScreen(_ ad: AdropPopupAd) {
        sendEvent(unitId: ad.unitId, requestId: self.requestIdFor(ad), method: AdropMethod.DID_DISMISS_FULL_SCREEN)
    }
    
    func onAdFailedToShowFullScreen(_ ad: AdropPopupAd, _ errorCode: AdropErrorCode) {
        sendEvent(unitId: ad.unitId, requestId: requestIdFor(ad), method: AdropMethod.DID_FAIL_TO_SHOW_FULL_SCREEN, errorCode: AdropErrorCodeToString(code: errorCode))
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return self._popupAds.keys.map {AdropChannel.invokePopupChannel(id: $0) }
    }
}
