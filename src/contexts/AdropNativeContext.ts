import React from 'react'
import AdropNativeAd from '../ads/AdropNativeAd'

interface Props {
    nativeAd?: AdropNativeAd
    nativeAdView?: any
}

export const AdropNativeContext = React.createContext<Props>({
    nativeAd: undefined,
    nativeAdView: null,
})
