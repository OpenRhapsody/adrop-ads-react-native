import Foundation
import AdropAds

public class AdropAdsNativeAdManager: NSObject {
    static var instance = AdropAdsNativeAdManager()

    private var _nativeAds =  [String: AdropNativeAd]()

    func create(_ unitId: String, _ requestId: String, delegate: AdropNativeAdDelegate, useCustomClick: Bool) {
        if self._nativeAds[requestId] == nil {
            let nativeAd = AdropNativeAd(unitId: unitId)
            nativeAd.useCustomClick = useCustomClick
            nativeAd.delegate = delegate
            self._nativeAds[requestId] = nativeAd
        }
    }

    func load(_ unitId: String, _ requestId: String, delegate: AdropNativeAdDelegate, useCustomClick: Bool) {
        DispatchQueue.main.async { [weak self, weak delegate] in
            guard let self = self, let delegate = delegate else { return }

            create(unitId, requestId, delegate: delegate, useCustomClick: useCustomClick)
            if let nativeAd = _nativeAds[requestId] {
                nativeAd.load()
            }
        }
    }

    func destroy(_ requestId: String) {
        DispatchQueue.main.async { [weak self] in
            self?._nativeAds.removeValue(forKey: requestId)
        }
    }

    func getAd(_ requestId: String) -> AdropNativeAd? {
        return self._nativeAds[requestId]
    }

    func requestIdFor(_ ad: AdropNativeAd) -> String {
        for (entry) in self._nativeAds {
            if entry.value === ad {
                return entry.key
            }
        }
        return ""
    }
}
