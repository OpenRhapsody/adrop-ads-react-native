import {
    type Reducer,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
} from 'react'
import { AdropInterstitialAd, AdropRewardedAd } from '../ads'

interface AdHookReturns {
    load: () => void
    show: () => void
    reset: () => void
}

interface AdStates {
    isClicked: boolean
    isClosed: boolean
    isEarnRewarded: boolean
    isLoaded: boolean
    isOpened: boolean
    isReady: boolean
    errorCode?: string
    reward?: { type: number; amount: number }
}

const initState: AdStates = {
    isClosed: false,
    isClicked: false,
    isEarnRewarded: false,
    isLoaded: false,
    isOpened: false,
    isReady: false,
    errorCode: undefined,
    reward: undefined,
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

    const reset = useCallback(() => {
        setStates(initState)
    }, [])

    useEffect(() => {
        if (ad) {
            setStates({ isReady: true })
            ad.listener = {
                onAdReceived: (_) => {
                    setStates({ isLoaded: true, errorCode: '' })
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
            }
        } else {
            setStates(initState)
        }

        return () => {
            ad?.destroy()
        }
    }, [ad])

    return { ...states, load, show, reset }
}

export default useAdropFullScreenAd
