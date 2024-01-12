package io.adrop.bridge

object AdropMethod {
    const val DID_CREATED_AD_BANNER = "onAdBannerCreated"
    const val DID_RECEIVE_AD = "onAdReceived"
    const val DID_CLICK_AD = "onAdClicked"
    const val DID_FAIL_TO_RECEIVE_AD = "onAdFailedToReceive"

    const val DID_DISMISS_FULL_SCREEN = "onAdDidDismissFullScreen"
    const val DID_PRESENT_FULL_SCREEN = "onAdDidPresentFullScreen"
    const val DID_FAIL_TO_SHOW_FULL_SCREEN = "onAdFailedToShowFullScreen"
    const val DID_IMPRESSION = "onAdImpression"
    const val WILL_DISMISS_FULL_SCREEN = "onAdWillDismissFullScreen"
    const val WILL_PRESENT_FULL_SCREEN = "onAdWillPresentFullScreen"
    const val HANDLE_EARN_REWARD = "handleEarnReward"
}
