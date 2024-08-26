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

const AdropProfileLogoView: React.FC<IconViewProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const viewRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(viewRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                profileLogo: {
                    tag: findNodeHandle(viewRef.current) ?? 0,
                    requestId: nativeAd?.requestId,
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const src = useMemo(
        () => nativeAd?.properties.profile?.displayLogo,
        [nativeAd]
    )

    if (!src) return null
    return (
        <Image
            {...props}
            ref={viewRef}
            source={{ uri: src }}
            onLayout={onLayout}
            resizeMode="cover"
        />
    )
}

export default AdropProfileLogoView
