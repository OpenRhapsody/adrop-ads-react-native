import React, { useCallback, useRef, useState } from 'react'
import { Pressable, type ViewProps, Platform } from 'react-native'
import {
    requireNativeComponent,
    View,
    NativeModules,
    findNodeHandle,
} from 'react-native'
import {
    AdropNativeContext,
    nativeAdRequestIds,
} from '../contexts/AdropNativeContext'
import AdropNativeAd from '../ads/AdropNativeAd'

type Props = ViewProps & {
    nativeAd?: AdropNativeAd
}

const NativeAdViewComponent = requireNativeComponent('AdropNativeAdView')

const AdropNativeAdView: React.FC<Props> = ({
    nativeAd,
    children,
    ...props
}) => {
    const [nativeAdView, setNativeAdView] = useState<any>()
    const nativeAdRef = useRef(null)

    const onLayout = useCallback((_: any) => {
        setNativeAdView(nativeAdRef.current)
    }, [])

    const onCustomClick = useCallback(() => {
        if (Platform.OS !== 'ios' || !nativeAd?.useCustomClick) return

        const requestId = nativeAd ? nativeAdRequestIds.get(nativeAd)?.() : ''
        const nodeHandle = findNodeHandle(nativeAdRef.current)

        if (nodeHandle) {
            try {
                NativeModules.AdropNativeAdViewManager.performClick(
                    nodeHandle,
                    requestId
                )
            } catch (e) {
                console.error('Adrop NativeModules error: ', e)
            }
        }
    }, [nativeAd])

    return (
        <AdropNativeContext.Provider value={{ nativeAd, nativeAdView }}>
            <NativeAdViewComponent ref={nativeAdRef}>
                <Pressable onPress={onCustomClick}>
                    <View {...props} onLayout={onLayout}>
                        {children}
                    </View>
                </Pressable>
            </NativeAdViewComponent>
        </AdropNativeContext.Provider>
    )
}

export default AdropNativeAdView
