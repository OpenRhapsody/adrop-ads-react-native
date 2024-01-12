import { useCallback, useEffect, useState } from 'react'
import { AdropInterstitialAd } from '../ads'
import useAdropFullScreenAd from './useAdropFullScreenAd'

const useAdropInterstitialAd = (unitId: string | null) => {
    const [interstitialAd, setInterstitialAd] =
        useState<AdropInterstitialAd | null>(null)

    const fullScreenAd = useAdropFullScreenAd(interstitialAd)

    useEffect(() => {
        setInterstitialAd((prevState) => {
            return unitId
                ? prevState?.unitId === unitId
                    ? prevState
                    : new AdropInterstitialAd(unitId)
                : null
        })
    }, [unitId])

    const reset = useCallback(() => {
        setInterstitialAd((prevState) => {
            prevState?.destroy()
            return unitId ? new AdropInterstitialAd(unitId) : null
        })
        fullScreenAd.reset()
    }, [unitId, fullScreenAd])

    return { ...fullScreenAd, reset }
}

export default useAdropInterstitialAd
