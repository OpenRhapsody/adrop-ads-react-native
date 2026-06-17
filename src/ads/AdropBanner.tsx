import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react'
import {
    findNodeHandle,
    NativeModules,
    NativeEventEmitter,
    UIManager,
} from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { AdropChannel, AdropMethod } from '../bridge'
import { BrowserTarget } from './AdropAd'
import BannerView, {
    Commands as BannerCommands,
} from '../specs/AdropBannerViewNativeComponent'
import { isFabricEnabled } from '../utils/arch'

export type AdropBannerMetadata = {
    creativeId: string
    txId: string
    campaignId: string
    destinationURL: string
    browserTarget: BrowserTarget
    creativeType: 'display' | 'video'
}

type AdropBannerProp = {
    style: { height: number; width: number | string }
    unitId: string
    useCustomClick?: boolean
    autoLoad?: boolean
    onAdReceived?: (unitId: string, metadata?: AdropBannerMetadata) => void
    onAdImpression?: (unitId: string, metadata?: AdropBannerMetadata) => void
    onAdClicked?: (unitId: string, metadata?: AdropBannerMetadata) => void
    onAdFailedToReceive?: (unitId: string, errorCode?: any) => void
    onAdVideoStart?: (unitId: string) => void
    onAdVideoEnd?: (unitId: string) => void
}

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
            onAdVideoStart,
            onAdVideoEnd,
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

        // New Architecture (Fabric): the codegen command is delivered straight
        // to the component view — no `bridge.uiManager.view(forReactTag:)`.
        // Old Architecture / Jest: fall back to the legacy UIManager dispatch.
        const dispatch = useCallback(
            (command: 'load' | 'play' | 'pause') => {
                const node = bannerRef.current
                try {
                    if (node) {
                        BannerCommands[command](node as never)
                        return
                    }
                } catch {
                    // Fabric command unavailable (Old Arch / Jest) — fall through.
                }
                UIManager.dispatchViewManagerCommand(getViewTag(), command, [])
            },
            [getViewTag]
        )

        const load = useCallback(() => dispatch('load'), [dispatch])
        const play = useCallback(() => dispatch('play'), [dispatch])
        const pause = useCallback(() => dispatch('pause'), [dispatch])

        useImperativeHandle(ref, () => ({ load, play, pause }))

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
                    browserTarget:
                        event.browserTarget ?? BrowserTarget.EXTERNAL,
                    creativeType: event.creativeType ?? 'display',
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
                    browserTarget:
                        event.browserTarget ?? BrowserTarget.EXTERNAL,
                    creativeType: event.creativeType ?? 'display',
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
                    browserTarget:
                        event.browserTarget ?? BrowserTarget.EXTERNAL,
                    creativeType: event.creativeType ?? 'display',
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

        const handleAdVideoStart = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                onAdVideoStart?.(unitId)
            },
            [onAdVideoStart, validateView, unitId]
        )

        const handleAdVideoEnd = useCallback(
            (event: any) => {
                if (!validateView(event.tag)) return
                onAdVideoEnd?.(unitId)
            },
            [onAdVideoEnd, validateView, unitId]
        )

        const routeBannerEvent = useCallback(
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
                    case AdropMethod.didVideoStart:
                        handleAdVideoStart(event)
                        break
                    case AdropMethod.didVideoEnd:
                        handleAdVideoEnd(event)
                        break
                }
            },
            [
                handleCreated,
                handleAdClicked,
                handleAdImpression,
                handleAdReceived,
                handleAdFailedReceive,
                handleAdVideoStart,
                handleAdVideoEnd,
            ]
        )

        // Old Architecture: events arrive on the global BannerEventEmitter channel.
        // On Fabric the bridge module does not exist (NativeModules.BannerEventEmitter
        // is undefined — constructing NativeEventEmitter with it triggers an RN runtime
        // warning) and events flow through onAdEvent instead, so skip entirely.
        useEffect(() => {
            if (isFabricEnabled) return

            const eventListener = new NativeEventEmitter(
                NativeModules.BannerEventEmitter
            ).addListener(
                AdropChannel.bannerEventListenerChannel,
                routeBannerEvent
            )

            return () => {
                eventListener.remove()
            }
        }, [routeBannerEvent])

        // New Architecture (Fabric): events arrive as a direct component event
        // (no bridge emitter). The event is already scoped to this view, so stamp
        // our own tag so the per-view validation passes.
        const onFabricAdEvent = useCallback(
            (e: { nativeEvent: any }) => {
                routeBannerEvent({ ...e.nativeEvent, tag: getViewTag() })
            },
            [routeBannerEvent, getViewTag]
        )

        return (
            <BannerView
                ref={bannerRef}
                // The public `style` keeps the legacy loose shape
                // ({ width: number | string }); the codegen component expects a
                // strict ViewStyle, so cast at the boundary.
                style={style as unknown as StyleProp<ViewStyle>}
                unitId={unitId}
                useCustomClick={useCustomClick}
                adSize={adSize ?? undefined}
                onAdEvent={onFabricAdEvent}
            />
        )
    }
)
export default AdropBanner
