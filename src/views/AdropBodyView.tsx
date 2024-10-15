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

const AdropBodyView: React.FC<TextProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const bodyRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(bodyRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                body: {
                    tag: findNodeHandle(bodyRef.current) ?? 0,
                    requestId: nativeAd?.requestId,
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const content = useMemo(() => nativeAd?.properties.body, [nativeAd])
    if (!content) return null

    return (
        <Text {...props} ref={bodyRef} onLayout={onLayout}>
            {content}
        </Text>
    )
}

export default AdropBodyView
