import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import type { TextProps } from 'react-native'
import { findNodeHandle, Text } from 'react-native'
import { AdropNativeContext } from '../contexts/AdropNativeContext'

const AdropAdvertiserView: React.FC<TextProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const advertiserRef = useRef(null)
    const onLayout = useCallback(() => {
        nativeAdView?.setNativeProps({
            advertiser: {
                tag: findNodeHandle(advertiserRef.current) ?? 0,
                requestId: nativeAd?.requestId,
            },
        })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const content = useMemo(() => nativeAd?.properties.advertiser, [nativeAd])
    if (!content) return null

    return (
        <Text {...props} ref={advertiserRef} onLayout={onLayout}>
            {content}
        </Text>
    )
}

export default AdropAdvertiserView
