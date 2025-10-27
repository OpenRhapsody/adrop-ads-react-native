import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
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

    const listener: AdropListener = useMemo(() => {
        return {
            onAdImpression: (ad: AdropPopupAd) =>
                console.log(
                    `popupAd impressed ${ad.unitId}, ${ad.creativeId} , ${ad.txId}, ${ad.campaignId} ${ad.destinationURL}`
                ),
            onAdClicked: (ad: AdropPopupAd) =>
                console.log(
                    `popupAd clicked ${ad.unitId} , ${ad.destinationURL}`
                ),
            onAdReceived: (ad: AdropPopupAd) => {
                setIsLoaded(true)
                console.log(`popupAd received ${ad.unitId}`)
                setErrorCode('')
            },
            onAdFailedToReceive: (_: AdropPopupAd, error: any) => {
                console.log('popupAd onAdFailedToReceive', error)
                setErrorCode(error)
            },
            onAdDidDismissFullScreen: (ad: AdropPopupAd) =>
                console.log(`popupAd dismiss ${ad.unitId}`),
            onAdDidPresentFullScreen: (ad: AdropPopupAd) =>
                console.log(`popupAd present ${ad.unitId}`),
            onAdFailedToShowFullScreen: (_: AdropPopupAd, error: any) =>
                setErrorCode(error),
        } as AdropListener
    }, [])

    useEffect(() => {
        return () => {
            popupAd?.destroy()
        }
    }, [popupAd])

    const initialize = useCallback(
        (unitId: string) => {
            let hideForTodayTextColor = '#456'
            let backgroundColor = 'rgba(53, 255, 63,0.3)'
            let customColors: AdropPopupAdColors = {
                hideForTodayTextColor,
                backgroundColor,
            }

            let adropPopupAd = new AdropPopupAd(unitId, customColors)
            adropPopupAd.listener = listener
            setPopupAd((prev) => {
                prev?.destroy()
                return adropPopupAd
            })
        },
        [listener]
    )

    useEffect(() => {
        initialize(testUnitId_popup_bottom)
    }, [initialize])

    const load = () => popupAd?.load()
    const show = () => {
        popupAd?.show()
        setIsShown(true)
    }
    const resetTestAd = () => {
        initialize(testUnitId_popup_bottom)
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
