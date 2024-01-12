import { useCallback, useEffect, useState } from 'react'
import { AdropRewardedAd } from '../ads'
import useAdropFullScreenAd from './useAdropFullScreenAd'

const useAdropRewardedAd = (unitId: string | null) => {
    const [rewardedAd, setRewardedAd] = useState<AdropRewardedAd | null>(null)

    const fullScreenAd = useAdropFullScreenAd(rewardedAd)

    useEffect(() => {
        setRewardedAd((prevState) => {
            return unitId
                ? prevState?.unitId === unitId
                    ? prevState
                    : new AdropRewardedAd(unitId)
                : null
        })
    }, [unitId])

    const reset = useCallback(() => {
        setRewardedAd((prevState) => {
            prevState?.destroy()
            return unitId ? new AdropRewardedAd(unitId) : null
        })
        fullScreenAd.reset()
    }, [unitId, fullScreenAd])

    return { ...fullScreenAd, reset }
}

export default useAdropRewardedAd
