import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { findNodeHandle, Text } from 'react-native'
import type { TextProps } from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'

const AdropCallToActionView: React.FC<TextProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const callToActionRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(callToActionRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                callToAction: {
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

    const content = nativeAd?.properties.callToAction
    if (!content) return null

    return (
        <Text {...props} ref={callToActionRef} onLayout={onLayout}>
            {content}
        </Text>
    )
}

export default AdropCallToActionView
