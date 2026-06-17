import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { findNodeHandle, Text } from 'react-native'
import type { TextProps } from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'
import AdropAssetWrapper from './AdropAssetWrapper'

const AdropBodyView: React.FC<TextProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const bodyRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(bodyRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                body: {
                    tag: findNodeHandle(bodyRef.current) ?? 0,
                    requestId: nativeAd
                        ? nativeAdRequestIds.get(nativeAd)?.()
                        : '',
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const content = nativeAd?.properties.body
    if (!content) return null

    return (
        <AdropAssetWrapper role="body">
            <Text {...props} ref={bodyRef} onLayout={onLayout}>
                {content}
            </Text>
        </AdropAssetWrapper>
    )
}

export default AdropBodyView
