import { type Reducer, useCallback, useEffect, useReducer } from 'react'
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
    errorCode?: string
    reward?: { type: number; amount: number }
}

const initState: AdStates = {
    isClosed: false,
    isClicked: false,
    isEarnRewarded: false,
    isLoaded: false,
    isOpened: false,
    errorCode: undefined,
    reward: undefined,
}

function useAdropFullScreenAd<
    T extends AdropInterstitialAd | AdropRewardedAd | null
>(ad: T): AdHookReturns & AdStates {
    const [states, setStates] = useReducer<
        Reducer<AdStates, Partial<AdStates>>
    >((prevState, newState) => ({ ...prevState, ...newState }), initState)

    const load = useCallback(() => ad?.load(), [ad])

    const show = useCallback(() => ad?.show(), [ad])

    const reset = useCallback(() => {
        setStates(initState)
    }, [])

    useEffect(() => {
        if (ad) {
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
    }, [ad])

    return { ...states, load, show, reset }
}

export default useAdropFullScreenAd
