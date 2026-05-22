import Foundation
import AdropAds

public class AdropAdsNativeAdManager: NSObject {
    static var instance = AdropAdsNativeAdManager()

    private var _nativeAds =  [String: AdropNativeAd]()
    private var _nativeAdViews = NSMapTable<NSString, RNAdropNativeAdView>.strongToWeakObjects()

    func create(_ unitId: String, _ requestId: String, delegate: AdropNativeAdDelegate, useCustomClick: Bool, preferredAdChoicesPosition: Int = AdropAdChoicesPosition.topRight.rawValue) {
        if self._nativeAds[requestId] == nil {
            let nativeAd = AdropNativeAd(unitId: unitId)
            nativeAd.useCustomClick = useCustomClick
            nativeAd.preferredAdChoicesPosition = AdropAdChoicesPosition(rawValue: preferredAdChoicesPosition) ?? .topRight
            nativeAd.delegate = delegate
            self._nativeAds[requestId] = nativeAd
        }
    }

    func load(_ unitId: String, _ requestId: String, delegate: AdropNativeAdDelegate, useCustomClick: Bool, preferredAdChoicesPosition: Int = AdropAdChoicesPosition.topRight.rawValue) {
        DispatchQueue.main.async { [weak self, weak delegate] in
            guard let self = self, let delegate = delegate else { return }

            create(unitId, requestId, delegate: delegate, useCustomClick: useCustomClick, preferredAdChoicesPosition: preferredAdChoicesPosition)
            if let nativeAd = _nativeAds[requestId] {
                nativeAd.preferredAdChoicesPosition = AdropAdChoicesPosition(rawValue: preferredAdChoicesPosition) ?? .topRight
                nativeAd.load()
            }
        }
    }

    func destroy(_ requestId: String) {
        DispatchQueue.main.async { [weak self] in
            self?._nativeAds.removeValue(forKey: requestId)
            self?._nativeAdViews.removeObject(forKey: requestId as NSString)
        }
    }

    func getAd(_ requestId: String) -> AdropNativeAd? {
        return self._nativeAds[requestId]
    }

    func registerView(_ requestId: String, _ view: RNAdropNativeAdView) {
        _nativeAdViews.setObject(view, forKey: requestId as NSString)
    }

    func viewFor(_ requestId: String) -> RNAdropNativeAdView? {
        return _nativeAdViews.object(forKey: requestId as NSString)
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
