import React, { useCallback, useContext, useEffect, useRef } from 'react'
import type { ImageProps, ImageSourcePropType } from 'react-native'
import { findNodeHandle, Image } from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'
import AdropAssetWrapper from './AdropAssetWrapper'

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
                    requestId: nativeAd
                        ? nativeAdRequestIds.get(nativeAd)?.()
                        : '',
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    const src = nativeAd?.properties.profile?.displayLogo
    if (!src) return null
    return (
        <AdropAssetWrapper role="profileLogo">
            <Image
                {...props}
                ref={viewRef}
                source={{ uri: src }}
                onLayout={onLayout}
                resizeMode="cover"
            />
        </AdropAssetWrapper>
    )
}

export default AdropProfileLogoView
