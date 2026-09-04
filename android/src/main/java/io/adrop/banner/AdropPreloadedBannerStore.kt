package io.adrop.banner

import io.adrop.ads.banner.AdropBanner
import java.util.concurrent.ConcurrentHashMap

/**
 * Registry of banners delivered by the batch `AdropBanner.loads()` path,
 * keyed by the JS-minted requestId. Shared between [io.adrop.AdropBannerModule]
 * (which fills and destroys entries) and [AdropPreloadedBannerViewManager]
 * (which looks entries up on mount).
 *
 * ConcurrentHashMap + main-thread mutation follows the module thread-safety
 * decision (react-native/docs/decisions/native-module-thread-safety.md).
 */
object AdropPreloadedBannerStore {
    val banners = ConcurrentHashMap<String, AdropBanner>()

    fun requestIdFor(banner: AdropBanner): String {
        banners.entries.find { it.value === banner }?.let { return it.key }
        return ""
    }
}
