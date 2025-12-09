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
    useCustomClick?: boolean
    adSize?: { width: number; height: number } | null
}

export type AdropBannerMetadata = {
    creativeId: string
    txId: string
    campaignId: string
    destinationURL: string
}

type AdropBannerProp = AdropBannerNativeProp & {
    autoLoad?: boolean
    onAdReceived?: (unitId: string, metadata?: AdropBannerMetadata) => void
    onAdImpression?: (unitId: string, metadata?: AdropBannerMetadata) => void
    onAdClicked?: (unitId: string, metadata?: AdropBannerMetadata) => void
    onAdFailedToReceive?: (unitId: string, errorCode?: any) => void
}

const ComponentName = 'AdropBannerView'

const BannerView = requireNativeComponent<AdropBannerNativeProp>(ComponentName)

const AdropBanner = forwardRef<HTMLDivElement, AdropBannerProp>(
    (
        {
            unitId,
            autoLoad = true,
            useCustomClick = false,
            onAdClicked,
            onAdImpression,
            onAdFailedToReceive,
            onAdReceived,
            style,
        },
        ref
    ) => {
        const bannerRef = useRef(null)
        const isLoaded = useRef(false)

        const adSize =
            typeof style.width === 'number'
                ? { width: style.width, height: style.height }
                : null

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
                const metadata: AdropBannerMetadata = {
                    creativeId: event.creativeId ?? '',
                    txId: event.txId ?? '',
                    destinationURL: event.destinationURL ?? '',
                    campaignId: event.campaignId ?? '',
                }
                onAdClicked?.(unitId, metadata)
            },
            [onAdClicked, validateView, unitId]
        )

        const handleAdReceived = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                const metadata: AdropBannerMetadata = {
                    creativeId: event.creativeId ?? '',
                    txId: event.txId ?? '',
                    destinationURL: event.destinationURL ?? '',
                    campaignId: event.campaignId ?? '',
                }
                onAdReceived?.(unitId, metadata)
                isLoaded.current = true
            },
            [onAdReceived, validateView, unitId]
        )

        const handleAdImpression = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                const metadata: AdropBannerMetadata = {
                    creativeId: event.creativeId ?? '',
                    txId: event.txId ?? '',
                    destinationURL: event.destinationURL ?? '',
                    campaignId: event.campaignId ?? '',
                }
                onAdImpression?.(unitId, metadata)
            },
            [onAdImpression, validateView, unitId]
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
                        case AdropMethod.didImpression:
                            handleAdImpression(event)
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
            handleAdImpression,
            handleAdReceived,
            handleAdFailedReceive,
        ])

        return (
            <BannerView
                ref={bannerRef}
                style={style}
                unitId={unitId}
                useCustomClick={useCustomClick}
                adSize={adSize}
            />
        )
    }
)
export default AdropBanner
