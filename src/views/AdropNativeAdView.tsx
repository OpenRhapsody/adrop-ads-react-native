import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
    nativeAdDataListeners,
} from '../contexts/AdropNativeContext'
import AdropNativeAd from '../ads/AdropNativeAd'

type Props = ViewProps & {
    nativeAd?: AdropNativeAd
}

type NativeAdViewProps = ViewProps & {
    nativeAdRequestId?: string
}

const NativeAdViewComponent =
    requireNativeComponent<NativeAdViewProps>('AdropNativeAdView')

const AdropNativeAdView: React.FC<Props> = ({
    nativeAd,
    children,
    ...props
}) => {
    const [nativeAdView, setNativeAdView] = useState<any>()
    const [revision, setRevision] = useState(0)
    const nativeAdRef = useRef(null)

    useEffect(() => {
        if (!nativeAd) return
        if (!nativeAdDataListeners.has(nativeAd)) {
            nativeAdDataListeners.set(nativeAd, new Set())
        }
        const callback = () => setRevision((r) => r + 1)
        nativeAdDataListeners.get(nativeAd)!.add(callback)
        return () => {
            nativeAdDataListeners.get(nativeAd)?.delete(callback)
        }
    }, [nativeAd])

    const onLayout = useCallback((_: any) => {
        const view = nativeAdRef.current
        setNativeAdView(view)
    }, [])

    const onCustomClick = useCallback(() => {
        if (Platform.OS !== 'ios' || !nativeAd?.useCustomClick) return

        const requestId = nativeAd ? nativeAdRequestIds.get(nativeAd)?.() : ''
        const nodeHandle = findNodeHandle(nativeAdRef.current)

        if (nodeHandle != null) {
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

    const nativeAdRequestId = useMemo(() => {
        if (!nativeAd) return undefined
        return nativeAdRequestIds.get(nativeAd)?.()
    }, [nativeAd])

    // When .load() is called repeatedly on the same AdropNativeAd instance, the nativeAd
    // ref stays stable, so React does not detect a prop change and the
    // setNativeAdRequestId ReactProp setter is not fired again. As a result the native
    // chain setNativeAd → handler.setupAdView → setAdMobNativeAd never rebinds to the
    // new admob ad, and the previous mediaView lingers. Since nativeAdDataListeners
    // (the event channel) bumps revision for us, explicitly call setNativeProps when
    // revision changes to re-fire the ReactProp setter and trigger a rebind.
    useEffect(() => {
        if (!nativeAdView || !nativeAd) return
        const requestId = nativeAdRequestIds.get(nativeAd)?.()
        if (!requestId) return
        nativeAdView.setNativeProps({ nativeAdRequestId: requestId })
        // revision is bumped by the nativeAdDataListeners callback; it must be in the
        // deps so the effect re-runs on a same-instance reload.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revision, nativeAd, nativeAdView])

    const contextValue = useMemo(
        () => ({ nativeAd, nativeAdView }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [nativeAd, nativeAdView, revision]
    )

    return (
        <AdropNativeContext.Provider value={contextValue}>
            <NativeAdViewComponent
                ref={nativeAdRef}
                nativeAdRequestId={nativeAdRequestId}
            >
                {nativeAd?.isBackfilled ? (
                    <View {...props} onLayout={onLayout}>
                        {children}
                    </View>
                ) : (
                    <Pressable onPress={onCustomClick}>
                        <View {...props} onLayout={onLayout}>
                            {children}
                        </View>
                    </Pressable>
                )}
            </NativeAdViewComponent>
        </AdropNativeContext.Provider>
    )
}

export default AdropNativeAdView
