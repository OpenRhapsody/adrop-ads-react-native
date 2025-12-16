import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Platform, StyleSheet, Text, View } from 'react-native'
import {
    type AdropListener,
    AdropPopupAd,
    type AdropPopupAdColors,
} from 'adrop-ads-react-native'
import { testUnitId, testUnitId_popup_bottom } from '../TestUnitIds'
import { descriptionOf } from '../utils/Utils'

const PopupAdClassExample: React.FC = () => {
    const [popupAd, setPopupAd] = useState<AdropPopupAd>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [isShown, setIsShown] = useState(false)
    const [errorCode, setErrorCode] = useState('')

    const disabledReset = !(errorCode || isShown)

    const unit = useMemo(() => {
        // Use your actual popup ad unit IDs here
        return Platform.OS === 'android'
            ? testUnitId_popup_bottom
            : testUnitId_popup_bottom
    }, [])

    // Define ad event listener
    const listener: AdropListener = useMemo(() => {
        return {
            // Callback: Called when the ad is displayed and an impression is recorded
            onAdImpression: (ad: AdropPopupAd) =>
                console.log(
                    `popupAd impressed ${ad.unitId}, ${ad.createIds()} , ${
                        ad.txId
                    }, ${ad.campaignId} ${ad.destinationURL}`
                ),

            // Callback: Called when the ad is clicked
            onAdClicked: (ad: AdropPopupAd) => {
                console.log(
                    `popupAd clicked ${ad.unitId} , ${ad.destinationURL}`
                )
                // Close the popup ad when clicked
                ad.close()
            },

            // Callback: Called when the ad is successfully loaded
            onAdReceived: (ad: AdropPopupAd) => {
                setIsLoaded(true)
                console.log(`popupAd received ${ad.unitId}`)
                setErrorCode('')
            },

            // Callback: Called when the ad fails to load
            onAdFailedToReceive: (_: AdropPopupAd, error: any) => {
                console.log('popupAd onAdFailedToReceive', error)
                setErrorCode(error)
            },

            // Callback: Called when the popup ad is dismissed
            onAdDidDismissFullScreen: (ad: AdropPopupAd) =>
                console.log(`popupAd dismiss ${ad.unitId}`),

            // Callback: Called when the popup ad is presented
            onAdDidPresentFullScreen: (ad: AdropPopupAd) =>
                console.log(`popupAd present ${ad.unitId}`),

            // Callback: Called when the popup ad fails to show
            onAdFailedToShowFullScreen: (_: AdropPopupAd, error: any) =>
                setErrorCode(error),
        } as AdropListener
    }, [])

    // Clean up: Destroy ad instance when component unmounts
    useEffect(() => {
        return () => {
            popupAd?.destroy()
        }
    }, [popupAd])

    // Initialize popup ad with unit ID, custom colors, and listener
    const initialize = useCallback(
        (unitId: string) => {
            // Custom colors for popup ad UI
            let hideForTodayTextColor = '#456'
            let backgroundColor = 'rgba(53, 255, 63,0.3)'
            let customColors: AdropPopupAdColors = {
                hideForTodayTextColor,
                backgroundColor,
            }

            // Create new AdropPopupAd instance with custom colors
            let adropPopupAd = new AdropPopupAd(unitId, customColors)

            // Set event listener
            adropPopupAd.listener = listener

            setPopupAd((prev) => {
                // Destroy previous ad instance
                prev?.destroy()
                return adropPopupAd
            })
        },
        [listener]
    )

    useEffect(() => {
        initialize(unit)
    }, [initialize, unit])

    // Load the ad
    const load = () => popupAd?.load()

    // Show the ad
    const show = () => {
        popupAd?.show()
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
                <Button title={'popupAd load'} onPress={load} />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={!isLoaded}
                    title={'popupAd show'}
                    onPress={show}
                />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={disabledReset}
                    title={'popupAd reset (test ad)'}
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
                    title={'popupAd reset (empty ad)'}
                    onPress={resetEmptyAd}
                />
            </View>
            <Text style={styles.description}>
                Reset popupAd, you can be received error callback when click
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

export default PopupAdClassExample

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
