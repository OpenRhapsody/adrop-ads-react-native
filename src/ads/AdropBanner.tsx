import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react'
import {
    findNodeHandle,
    requireNativeComponent,
    NativeModules,
    NativeEventEmitter,
    UIManager,
    View,
    Dimensions,
} from 'react-native'
import { AdropChannel, AdropMethod } from '../bridge'
import AdropNavigatorObserver from '../observer'

type AdropBannerNativeProp = {
    style: { height: number; width: number | string }
    unitId: string
}

type AdropBannerProp = AdropBannerNativeProp & {
    autoLoad?: boolean
    onAdReceived?: (unitId: string, creativeId: string) => void
    onAdClicked?: (unitId: string, creativeId: string) => void
    onAdFailedToReceive?: (unitId: string, errorCode?: any) => void
}

const ComponentName = 'AdropBannerView'

const BannerView = requireNativeComponent<
    AdropBannerNativeProp & { onLayout: any }
>(ComponentName)

const AdropBanner = forwardRef<HTMLDivElement, AdropBannerProp>(
    (
        {
            unitId,
            autoLoad = true,
            onAdClicked,
            onAdFailedToReceive,
            onAdReceived,
            style,
        },
        ref
    ) => {
        const bannerRef = useRef(null)
        const isVisible = useRef(false)
        const isLoaded = useRef(false)

        const getViewTag = useCallback(
            () => findNodeHandle(bannerRef.current) ?? 0,
            []
        )

        const validateView = useCallback(
            (viewTag: number) => viewTag === getViewTag(),
            [getViewTag]
        )

        const load = useCallback(() => {
            UIManager.dispatchViewManagerCommand(getViewTag(), 'load', [])
        }, [getViewTag])

        useImperativeHandle(ref, () => ({ load }))

        const handleCreated = useCallback(
            (viewTag: number) => {
                if (!validateView(viewTag)) return
                if (autoLoad) load()
            },
            [autoLoad, load, validateView]
        )

        const handleAdClicked = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                onAdClicked?.(unitId, event.creativeId ?? '')
            },
            [onAdClicked, validateView, unitId]
        )

        const invoke = useCallback(() => {
            if (!(isVisible.current && isLoaded.current)) return

            NativeModules.AdropPageTracker.attach(
                AdropNavigatorObserver.last,
                unitId
            )
        }, [unitId])

        const handleAdReceived = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                onAdReceived?.(unitId, event.creativeId ?? '')
                isLoaded.current = true
                invoke()
            },
            [invoke, onAdReceived, validateView, unitId]
        )

        const handleAdFailedReceive = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                onAdFailedToReceive?.(unitId, event.errorCode)
                isLoaded.current = false
            },
            [onAdFailedToReceive, validateView, unitId]
        )

        useEffect(() => {
            const eventListener = new NativeEventEmitter(
                NativeModules.BannerEventEmitter
            ).addListener(
                AdropChannel.bannerEventListenerChannel,
                (event: any) => {
                    switch (event.method) {
                        case AdropMethod.didCreatedBanner:
                            handleCreated(event.tag)
                            break
                        case AdropMethod.didClickAd:
                            handleAdClicked(event)
                            break
                        case AdropMethod.didReceiveAd:
                            handleAdReceived(event)
                            break
                        case AdropMethod.didFailToReceiveAd:
                            handleAdFailedReceive(event)
                            break
                    }
                }
            )

            return () => {
                eventListener.remove()
            }
        }, [
            handleCreated,
            handleAdClicked,
            handleAdReceived,
            handleAdFailedReceive,
        ])

        const onLayout = useCallback(
            (event) => {
                const { x, y, width, height } = event.nativeEvent.layout
                const { width: windowWidth, height: windowHeight } =
                    Dimensions.get('window')
                isVisible.current =
                    width > 0 &&
                    height > 0 &&
                    x >= 0 &&
                    x + width <= windowWidth &&
                    y >= 0 &&
                    y + height <= windowHeight

                invoke()
            },
            [invoke]
        )

        return (
            <View>
                <BannerView
                    ref={bannerRef}
                    style={style}
                    unitId={unitId}
                    onLayout={onLayout}
                />
            </View>
        )
    }
)
export default AdropBanner
