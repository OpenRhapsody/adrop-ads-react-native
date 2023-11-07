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
import { AdropChannel } from '../bridge/AdropChannel'
import { AdropMethod } from '../bridge/AdropMethod'

type AdropBannerNativeProp = {
    style: { height: number; width: number | string }
    unitId: string
}

type AdropBannerProp = AdropBannerNativeProp & {
    autoLoad?: boolean
    onAdReceived?: (unitId: string) => void
    onAdClicked?: (unitId: string) => void
    onAdFailedToReceive?: (unitId: string, error?: any) => void
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
        const bannerChannel = useCallback(
            () => AdropChannel.methodBannerChannelOf(getViewTag()),
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
                if (event.channel !== bannerChannel() || onAdClicked === null)
                    return
                onAdClicked!(unitId)
            },
            [bannerChannel, onAdClicked, unitId]
        )

        const handleAdReceived = useCallback(
            (event: any) => {
                if (event.channel !== bannerChannel() || onAdReceived === null)
                    return
                onAdReceived!(unitId)
            },
            [bannerChannel, onAdReceived, unitId]
        )

        const handleAdFailedReceive = useCallback(
            (event: any) => {
                if (
                    event.channel !== bannerChannel() ||
                    onAdFailedToReceive === null
                )
                    return
                onAdFailedToReceive!(unitId, event.message)
            },
            [bannerChannel, onAdFailedToReceive, unitId]
        )

        useEffect(() => {
            const eventListener = new NativeEventEmitter(
                NativeModules.BannerEventEmitter
            ).addListener(AdropChannel.methodBannerChannel, (event: any) => {
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
            })

            return () => {
                eventListener.remove()
            }
        }, [
            handleCreated,
            handleAdClicked,
            handleAdReceived,
            handleAdFailedReceive,
        ])

        // @ts-ignore
        return <BannerView ref={bannerRef} style={style} unitId={unitId} />
    }
)
export default AdropBanner
