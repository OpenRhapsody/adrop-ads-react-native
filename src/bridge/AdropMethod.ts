const enum AdropMethod {
    didCreatedBanner = 'onAdBannerCreated',
    didReceiveAd = 'onAdReceived',
    didClickAd = 'onAdClicked',
    didFailToReceiveAd = 'onAdFailedToReceive',
    didDismissFullScreen = 'onAdDidDismissFullScreen',
    willDismissFullScreen = 'onAdWillDismissFullScreen',
    didPresentFullScreen = 'onAdDidPresentFullScreen',
    willPresentFullScreen = 'onAdWillPresentFullScreen',
    didFailToShowFullScreen = 'onAdFailedToShowFullScreen',
    didImpression = 'onAdImpression',
    handleEarnReward = 'handleEarnReward',
}

export default AdropMethod
