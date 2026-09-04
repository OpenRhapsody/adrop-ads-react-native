package io.adrop.bridge

object AdropChannel {
    private const val METHOD_CHANNEL = "io.adrop.adrop-ads"
    const val invokeBannerChannel = "$METHOD_CHANNEL/banner"
    const val invokeNativeChannel = "$METHOD_CHANNEL/native"

    /**
     * Batch-loaded (preloaded) banner events — requestId-keyed, separate from
     * the tag-matched banner channel (same unitId can fill several slots).
     */
    const val invokePreloadedBannerChannel = "$METHOD_CHANNEL/preloaded_banner"

    fun invokeInterstitialChannel(id: String): String = "${METHOD_CHANNEL}/interstitial_${id}"
    fun invokeRewardedChannelOf(id: String): String = "${METHOD_CHANNEL}/rewarded_${id}"
    fun invokePopupChannelOf(id: String): String = "${METHOD_CHANNEL}/popup_${id}"
}
