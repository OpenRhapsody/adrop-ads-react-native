import React, { useCallback, useContext, useEffect, useRef } from 'react'
import type { TextProps } from 'react-native'
import { findNodeHandle, Text } from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'
import AdropAssetWrapper from './AdropAssetWrapper'

const AdropAdvertiserView: React.FC<TextProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const advertiserRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(advertiserRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                advertiser: {
                    tag,
                    requestId: nativeAd
                        ? nativeAdRequestIds.get(nativeAd)?.()
                        : '',
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const content = nativeAd?.properties.advertiser
    if (!content) return null

    return (
        <AdropAssetWrapper role="advertiser">
            <Text {...props} ref={advertiserRef} onLayout={onLayout}>
                {content}
            </Text>
        </AdropAssetWrapper>
    )
}

export default AdropAdvertiserView
