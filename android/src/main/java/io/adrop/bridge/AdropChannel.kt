package io.adrop.bridge

object AdropChannel {
    private const val METHOD_CHANNEL = "io.adrop.adrop-ads"
    const val invokeBannerChannel = "$METHOD_CHANNEL/banner"

    fun invokeInterstitialChannel(id: String): String = "${METHOD_CHANNEL}/interstitial_${id}"
    fun invokeRewardedChannelOf(id: String): String = "${METHOD_CHANNEL}/rewarded_${id}"
}
