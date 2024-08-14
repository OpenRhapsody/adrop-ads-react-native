import React, { useCallback, useRef, useState } from 'react'
import type { ViewProps } from 'react-native'
import { requireNativeComponent, View } from 'react-native'
import { AdropNativeContext } from '../contexts/AdropNativeContext'
import { AdropNativeAd } from 'adrop-ads-react-native'

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

    return (
        <AdropNativeContext.Provider value={{ nativeAd, nativeAdView }}>
            <NativeAdViewComponent ref={nativeAdRef}>
                <View {...props} onLayout={onLayout}>
                    {children}
                </View>
            </NativeAdViewComponent>
        </AdropNativeContext.Provider>
    )
}

export default AdropNativeAdView
