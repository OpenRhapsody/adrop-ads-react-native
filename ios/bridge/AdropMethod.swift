import Foundation

struct AdropMethod {
    static let DID_CREATED_BANNER = "onAdBannerCreated"
    static let DID_RECEIVE_AD = "onAdReceived"
    static let DID_CLICK_AD = "onAdClicked"
    static let DID_FAIL_TO_RECEIVE_AD = "onAdFailedToReceive"

    static let DID_DISMISS_FULL_SCREEN = "onAdDidDismissFullScreen"
    static let DID_PRESENT_FULL_SCREEN = "onAdDidPresentFullScreen"
    static let DID_FAIL_TO_SHOW_FULL_SCREEN = "onAdFailedToShowFullScreen"
    static let DID_IMPRESSION = "onAdImpression"
    static let WILL_DISMISS_FULL_SCREEN = "onAdWillDismissFullScreen"
    static let WILL_PRESENT_FULL_SCREEN = "onAdWillPresentFullScreen"
    static let HANDLE_EARN_REWARD = "handleEarnReward"
}
