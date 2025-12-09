import React, { useCallback, useContext, useEffect, useRef } from 'react'
import type { ViewProps } from 'react-native'
import { findNodeHandle, requireNativeComponent } from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'

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

    return <MediaView ref={mediaRef} {...props} />
}

export default AdropMediaView
