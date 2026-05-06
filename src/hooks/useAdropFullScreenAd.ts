import {
    type Reducer,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
} from 'react'
import { AdropInterstitialAd, AdropRewardedAd, BrowserTarget } from '../ads'

interface AdHookReturns {
    load: () => void
    show: () => void
    close: () => void
    reset: () => void
}

interface AdStates {
    isBackPressed: boolean
    isClicked: boolean
    isClosed: boolean
    isEarnRewarded: boolean
    isLoaded: boolean
    isOpened: boolean
    isReady: boolean
    errorCode?: string
    reward?: { type: number; amount: number }
    browserTarget?: BrowserTarget
}

const initState: AdStates = {
    isBackPressed: false,
    isClosed: false,
    isClicked: false,
    isEarnRewarded: false,
    isLoaded: false,
    isOpened: false,
    isReady: false,
    errorCode: undefined,
    reward: undefined,
    browserTarget: undefined,
}

function useAdropFullScreenAd<
    T extends AdropInterstitialAd | AdropRewardedAd | null
>(ad: T): AdHookReturns & AdStates {
    const [states, setStates] = useReducer<
        Reducer<AdStates, Partial<AdStates>>
    >((prevState, newState) => ({ ...prevState, ...newState }), initState)

    const isReady = useMemo(() => states.isReady, [states])

    const load = useCallback(() => {
        if (isReady) {
            ad?.load()
        }
    }, [ad, isReady])

    const show = useCallback(() => ad?.show(), [ad])

    const close = useCallback(() => ad?.close(), [ad])

    const reset = useCallback(() => {
        setStates(initState)
    }, [])

    useEffect(() => {
        if (ad) {
            setStates({ isReady: true })
            ad.listener = {
                onAdReceived: (receivedAd) => {
                    setStates({
                        isLoaded: true,
                        errorCode: '',
                        browserTarget: receivedAd.browserTarget,
                    })
                },
                onAdFailedToReceive: (_, errorCode) => {
                    setStates({ errorCode })
                },
                onAdDidPresentFullScreen: (_) => {
                    setStates({ isOpened: true, errorCode: '' })
                },
                onAdDidDismissFullScreen: (_) => {
                    setStates({ isClosed: true, errorCode: '' })
                },
                onAdEarnRewardHandler: (_, type, amount) => {
                    setStates({
                        isEarnRewarded: true,
                        reward: { type, amount },
                        errorCode: '',
                    })
                },
                onAdClicked: (_) => {
                    setStates({ isClicked: true, errorCode: '' })
                },
                onAdFailedToShowFullScreen: (_, errorCode) => {
                    setStates({ errorCode })
                },
                onAdBackButtonPressed: (_) => {
                    setStates({ isBackPressed: true })
                },
            }
        } else {
            setStates(initState)
        }

        return () => {
            ad?.destroy()
        }
    }, [ad])

    return { ...states, load, show, close, reset }
}

export default useAdropFullScreenAd
