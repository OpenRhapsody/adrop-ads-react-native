import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import type { TextProps } from 'react-native'
import { findNodeHandle, Text } from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'

const AdropHeadLineView: React.FC<TextProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const headlineRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(headlineRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                headline: {
                    tag: findNodeHandle(headlineRef.current) ?? 0,
                    requestId: nativeAd
                        ? nativeAdRequestIds.get(nativeAd)?.()
                        : '',
                }
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const content = useMemo(() => nativeAd?.properties.headline, [nativeAd])
    if (!content) return null

    return (
        <Text {...props} ref={headlineRef} onLayout={onLayout}>
            {content}
        </Text>
    )
}

export default AdropHeadLineView
