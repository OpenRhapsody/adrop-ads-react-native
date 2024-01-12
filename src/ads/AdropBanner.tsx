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
} from 'react-native'
import { AdropChannel, AdropMethod } from '../bridge'

type AdropBannerNativeProp = {
    style: { height: number; width: number | string }
    unitId: string
}

type AdropBannerProp = AdropBannerNativeProp & {
    autoLoad?: boolean
    onAdReceived?: (unitId: string) => void
    onAdClicked?: (unitId: string) => void
    onAdFailedToReceive?: (unitId: string, errorCode?: any) => void
}

const ComponentName = 'AdropBannerView'

const BannerView = requireNativeComponent<AdropBannerNativeProp>(ComponentName)

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
                onAdClicked?.(unitId)
            },
            [onAdClicked, validateView, unitId]
        )

        const handleAdReceived = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                onAdReceived?.(unitId)
            },
            [onAdReceived, validateView, unitId]
        )

        const handleAdFailedReceive = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                onAdFailedToReceive?.(unitId, event.errorCode)
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

        return (
            <View>
                <BannerView ref={bannerRef} style={style} unitId={unitId} />
            </View>
        )
    }
)
export default AdropBanner
