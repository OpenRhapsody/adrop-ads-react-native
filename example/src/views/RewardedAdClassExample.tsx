import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Platform, StyleSheet, Text, View } from 'react-native'
import { type AdropListener, AdropRewardedAd } from 'adrop-ads-react-native'
import { testUnitId, testUnitId_rewarded } from '../TestUnitIds'
import { descriptionOf } from '../utils/Utils'

const RewardedAdClassExample: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isShown, setIsShown] = useState(false)
    const [errorCode, setErrorCode] = useState('')
    const [rewardedAd, setRewardedAd] = useState<AdropRewardedAd>()

    const disabledReset = !(errorCode || isShown)

    // Define ad event listener
    const listener: AdropListener = useMemo(() => {
        return {
            // Callback: Called when the ad is clicked
            onAdClicked: (ad: AdropRewardedAd) =>
                console.log(`rewardedAd clicked ${ad.unitId}`),

            // Callback: Called when the ad is successfully loaded
            onAdReceived: (ad: AdropRewardedAd) => {
                console.log(
                    `rewardedAd received ${ad.unitId} ${ad.txId}, ${ad.campaignId}, ${ad.creativeId}`
                )
                setErrorCode('')
                setIsLoaded(true)
            },

            // Callback: Called when the ad fails to load
            onAdFailedToReceive: (_: AdropRewardedAd, error: any) =>
                setErrorCode(error),

            // Callback: Called when the full-screen ad is dismissed
            onAdDidDismissFullScreen: (ad: AdropRewardedAd) =>
                console.log(`rewardedAd dismiss ${ad.unitId}`),

            // Callback: Called when the full-screen ad is presented
            onAdDidPresentFullScreen: (ad: AdropRewardedAd) =>
                console.log(`rewardedAd present ${ad.unitId}`),

            // Callback: Called when the full-screen ad fails to show
            onAdFailedToShowFullScreen: (_: AdropRewardedAd, error: any) =>
                setErrorCode(error),

            // Callback: Called when the user earns a reward
            onAdEarnRewardHandler: (
                ad: AdropRewardedAd,
                type: number,
                amount: number
            ) =>
                console.log(
                    `rewardedAd earn reward ${ad.unitId} ${type}, ${amount}`
                ),
        } as AdropListener
    }, [])

    // Clean up: Destroy ad instance when component unmounts
    useEffect(() => {
        return () => {
            rewardedAd?.destroy()
        }
    }, [rewardedAd])

    const unit = useMemo(() => {
        // Use your actual rewarded ad unit IDs here
        return Platform.OS === 'android'
            ? testUnitId_rewarded
            : testUnitId_rewarded
    }, [])

    // Initialize rewarded ad with unit ID and listener
    const initialize = useCallback(
        (unitId: string) => {
            // Create new AdropRewardedAd instance
            let adropRewardedAd = new AdropRewardedAd(unitId)

            // Set event listener
            adropRewardedAd.listener = listener

            setRewardedAd((prev) => {
                // Destroy previous ad instance
                prev?.destroy()
                return adropRewardedAd
            })
        },
        [listener]
    )

    useEffect(() => {
        initialize(unit)
    }, [initialize, unit])

    // Load the ad
    const load = () => rewardedAd?.load()

    // Show the ad
    const show = () => {
        rewardedAd?.show()
        setIsShown(true)
    }

    const resetTestAd = () => {
        initialize(unit)
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
