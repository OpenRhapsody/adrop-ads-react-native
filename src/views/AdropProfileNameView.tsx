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

const AdropProfileNameView: React.FC<TextProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const viewRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(viewRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                body: {
                    tag: findNodeHandle(viewRef.current) ?? 0,
                    requestId: nativeAd?.requestId,
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const content = useMemo(
        () => nativeAd?.properties.profile?.displayName,
        [nativeAd]
    )
    console.log('profile name', nativeAd?.properties.profile, content)

    if (!content) return null

    return (
        <Text {...props} ref={viewRef} onLayout={onLayout}>
            {content}
        </Text>
    )
}

export default AdropProfileNameView
