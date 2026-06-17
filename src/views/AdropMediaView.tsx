import React, { useCallback, useContext, useEffect, useRef } from 'react'
import type { ViewProps } from 'react-native'
import { findNodeHandle, requireNativeComponent } from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'
import AdropAssetWrapper from './AdropAssetWrapper'

const MediaView = requireNativeComponent<ViewProps>('MediaView')

const AdropMediaView: React.FC<ViewProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const mediaRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(mediaRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                mediaView: {
                    tag: findNodeHandle(mediaRef.current) ?? 0,
                    requestId: nativeAd
                        ? nativeAdRequestIds.get(nativeAd)?.()
                        : '',
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    return (
        <AdropAssetWrapper role="mediaView">
            <MediaView ref={mediaRef} {...props} />
        </AdropAssetWrapper>
    )
}

export default AdropMediaView
