import React from 'react'
import type AdropNativeAd from '../ads/AdropNativeAd'

interface Props {
    nativeAd?: AdropNativeAd
    nativeAdView?: any
}

export const AdropNativeContext = React.createContext<Props>({
    nativeAd: undefined,
    nativeAdView: null,
})

export const nativeAdRequestIds = new WeakMap<AdropNativeAd, () => string>()

export const nativeAdDataListeners = new WeakMap<
    AdropNativeAd,
    Set<() => void>
>()
