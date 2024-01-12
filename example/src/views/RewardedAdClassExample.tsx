import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { AdropRewardedAd } from 'adrop-ads-react-native'
import { testUnitId, testUnitId_rewarded } from '../TestUnitIds'
import { descriptionOf } from '../utils/Utils'

const RewardedAdClassExample: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isShown, setIsShown] = useState(false)
    const [errorCode, setErrorCode] = useState('')
    const [rewardedAd, setRewardedAd] = useState<AdropRewardedAd>()

    const disabledReset = !(errorCode || isShown)
    const listener: any = useMemo(() => {
        return {
            onAdClicked: (ad: AdropRewardedAd) =>
                console.log(`rewardedAd clicked ${ad.unitId}`),
            onAdReceived: (ad: AdropRewardedAd) => {
                console.log(`rewardedAd received ${ad.unitId}`)
                setErrorCode('')
                setIsLoaded(true)
            },
            onAdFailedToReceive: (_: AdropRewardedAd, error: any) =>
                setErrorCode(error),
            onAdDidDismissFullScreen: (ad: AdropRewardedAd) =>
                console.log(`rewardedAd dismiss ${ad.unitId}`),
            onAdDidPresentFullScreen: (ad: AdropRewardedAd) =>
                console.log(`rewardedAd present ${ad.unitId}`),
            onAdFailedToShowFullScreen: (_: AdropRewardedAd, error: any) =>
                setErrorCode(error),
            onAdEarnRewardHandler: (
                ad: AdropRewardedAd,
                type: number,
                amount: number
            ) =>
                console.log(
                    `rewardedAd earn reward ${ad.unitId} ${type}, ${amount}`
                ),
        }
    }, [])

    useEffect(() => {
        return () => {
            rewardedAd?.destroy()
        }
    }, [rewardedAd])

    const initialize = useCallback(
        (unitId: string) => {
            let adropRewardedAd = new AdropRewardedAd(unitId)
            adropRewardedAd.listener = listener
            setRewardedAd((prev) => {
                prev?.destroy()
                return adropRewardedAd
            })
        },
        [listener]
    )

    useEffect(() => {
        initialize(testUnitId_rewarded)
    }, [initialize])

    const load = () => rewardedAd?.load()
    const show = () => {
        rewardedAd?.show()
        setIsShown(true)
    }
    const resetTestAd = () => {
        initialize(testUnitId_rewarded)
        resetState()
    }

    const resetEmptyAd = () => {
        initialize(testUnitId)
        resetState()
    }

    const resetState = () => {
        setIsLoaded(false)
        setIsShown(false)
        setErrorCode('')
    }

    return (
        <View style={styles.container}>
            <View style={styles.button}>
                <Button title={'rewardedAd load'} onPress={load} />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={!isLoaded}
                    title={'rewardedAd show'}
                    onPress={show}
                />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={disabledReset}
                    title={'rewardedAd reset (test ad)'}
                    onPress={resetTestAd}
                />
            </View>
            <Text style={styles.description}>
                Reset rewardedAd, you can be received ad successfully when click
                load button
            </Text>
            <View style={styles.button}>
                <Button
                    disabled={disabledReset}
                    title={'rewardedAd reset (empty ad)'}
                    onPress={resetEmptyAd}
                />
            </View>
            <Text style={styles.description}>
                Reset rewardedAd, you can be received error callback when click
                load button
            </Text>
            {errorCode && (
                <>
                    <Text style={styles.error}>Error Code : {errorCode}</Text>
                    <Text style={styles.error}>{descriptionOf(errorCode)}</Text>
                </>
            )}
        </View>
    )
}

export default RewardedAdClassExample

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 50,
    },
    button: {
        marginVertical: 4,
    },
    description: {
        color: 'black',
        marginBottom: 24,
        paddingHorizontal: 16,
        textAlign: 'center',
    },
    error: {
        color: 'black',
        marginVertical: 2,
    },
})
