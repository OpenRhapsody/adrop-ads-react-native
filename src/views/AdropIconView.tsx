import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import type { ImageProps, ImageSourcePropType } from 'react-native'
import { findNodeHandle, Image } from 'react-native'
import { AdropNativeContext } from '../contexts/AdropNativeContext'

interface IconViewProps extends Omit<ImageProps, 'source'> {
    source?: ImageSourcePropType | undefined
}

const AdropIconView: React.FC<IconViewProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const iconRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(iconRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                icon: {
                    tag: findNodeHandle(iconRef.current) ?? 0,
                    requestId: nativeAd?.requestId,
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const src = useMemo(() => nativeAd?.properties.icon, [nativeAd])
    if (!src) return null
    return (
        <Image
            {...props}
            ref={iconRef}
            source={{ uri: src }}
            onLayout={onLayout}
            resizeMode="cover"
        />
    )
}

export default AdropIconView
