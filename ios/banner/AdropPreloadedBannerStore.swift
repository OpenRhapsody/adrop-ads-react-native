import Foundation
import AdropAds

/// Registry of banners delivered by the batch `AdropBanner.loads()` path,
/// keyed by the JS-minted requestId. Shared between the AdropBanner module
/// (which fills and destroys entries) and `AdropPreloadedBannerView` (which
/// looks entries up on mount). Main-thread only (module methodQueue is main,
/// view props are set on main).
class AdropPreloadedBannerStore {
    static let instance = AdropPreloadedBannerStore()

    var banners: [String: AdropBanner] = [:]

    func requestIdFor(_ banner: AdropBanner) -> String {
        for entry in banners where entry.value === banner {
            return entry.key
        }
        return ""
    }
}
