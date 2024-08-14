import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import { findNodeHandle, Text } from 'react-native'
import type { TextProps } from 'react-native'
import { AdropNativeContext } from '../contexts/AdropNativeContext'

const AdropCallToActionView: React.FC<TextProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const callToActionRef = useRef(null)
    const onLayout = useCallback(() => {
        nativeAdView?.setNativeProps({
            callToAction: findNodeHandle(callToActionRef.current) ?? 0,
            requestId: { id: nativeAd?.requestId },
        })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const content = useMemo(() => nativeAd?.properties.advertiser, [nativeAd])
    if (!content) return null

    return (
        <Text {...props} ref={callToActionRef} onLayout={onLayout}>
            {content}
        </Text>
    )
}

export default AdropCallToActionView
