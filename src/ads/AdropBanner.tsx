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
} from 'react-native'
import { AdropChannel, AdropMethod } from '../bridge'

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

        const handleAdReceived = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                onAdReceived?.(unitId, event.creativeId ?? '')
                isLoaded.current = true
            },
            [onAdReceived, validateView, unitId]
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

        return <BannerView ref={bannerRef} style={style} unitId={unitId} />
    }
)
export default AdropBanner
