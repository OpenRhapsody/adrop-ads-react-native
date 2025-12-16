import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Platform, StyleSheet, Text, View } from 'react-native'
import { AdropInterstitialAd, type AdropListener } from 'adrop-ads-react-native'
import { testUnitId, testUnitId_interstitialAd } from '../TestUnitIds'
import { descriptionOf } from '../utils/Utils'

const InterstitialAdClassExample: React.FC = () => {
    const [interstitialAd, setInterstitialAd] = useState<AdropInterstitialAd>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [isShown, setIsShown] = useState(false)
    const [errorCode, setErrorCode] = useState('')

    const disabledReset = !(errorCode || isShown)

    // Define ad event listener
    const listener: AdropListener = useMemo(() => {
        return {
            // Callback: Called when the ad is clicked
            onAdClicked: (ad: AdropInterstitialAd) =>
                console.log(`interstitialAd clicked ${ad.unitId}`),

            // Callback: Called when the ad is successfully loaded
            onAdReceived: (ad: AdropInterstitialAd) => {
                setIsLoaded(true)
                console.log(
                    `interstitialAd received ${ad.unitId} ${ad.txId}, ${ad.campaignId}, ${ad.creativeId}`
                )
                setErrorCode('')
            },

            // Callback: Called when the ad fails to load
            onAdFailedToReceive: (_: AdropInterstitialAd, error: any) => {
                console.log('interstitialAd onAdFailedToReceive', error)
                setErrorCode(error)
            },

            // Callback: Called when the full-screen ad is dismissed
            onAdDidDismissFullScreen: (ad: AdropInterstitialAd) =>
                console.log(`interstitialAd dismiss ${ad.unitId}`),

            // Callback: Called when the full-screen ad is presented
            onAdDidPresentFullScreen: (ad: AdropInterstitialAd) =>
                console.log(`interstitialAd present ${ad.unitId}`),

            // Callback: Called when the full-screen ad fails to show
            onAdFailedToShowFullScreen: (_: AdropInterstitialAd, error: any) =>
                setErrorCode(error),
        } as AdropListener
    }, [])

    const unit = useMemo(() => {
        // Use your actual interstitial ad unit IDs here
        return Platform.OS === 'android'
            ? testUnitId_interstitialAd
            : testUnitId_interstitialAd
    }, [])

    // Clean up: Destroy ad instance when component unmounts
    useEffect(() => {
        return () => {
            interstitialAd?.destroy()
        }
    }, [interstitialAd])

    // Initialize interstitial ad with unit ID and listener
    const initialize = useCallback(
        (unitId: string) => {
            // Create new AdropInterstitialAd instance
            let adropInterstitialAd = new AdropInterstitialAd(unitId)

            // Set event listener
            adropInterstitialAd.listener = listener

            setInterstitialAd((prev) => {
                // Destroy previous ad instance
                prev?.destroy()
                return adropInterstitialAd
            })
        },
        [listener]
    )

    useEffect(() => {
        initialize(unit)
    }, [initialize, unit])

    // Load the ad
    const load = () => interstitialAd?.load()

    // Show the ad
    const show = () => {
        interstitialAd?.show()
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
                <Button title={'interstitialAd load'} onPress={load} />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={!isLoaded}
                    title={'interstitialAd show'}
                    onPress={show}
                />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={disabledReset}
                    title={'interstitialAd reset (test ad)'}
                    onPress={resetTestAd}
                />
            </View>
            <Text style={styles.description}>
                Reset interstitialAd, you can be received ad successfully when
                click load button
            </Text>
            <View style={styles.button}>
                <Button
                    disabled={disabledReset}
                    title={'interstitialAd reset (empty ad)'}
                    onPress={resetEmptyAd}
                />
            </View>
            <Text style={styles.description}>
                Reset interstitialAd, you can be received error callback when
                click load button
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

export default InterstitialAdClassExample

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
