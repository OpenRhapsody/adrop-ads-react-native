import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { AdropInterstitialAd, type AdropListener } from 'adrop-ads-react-native'
import { testUnitId, testUnitId_interstitialAd } from '../TestUnitIds'
import { descriptionOf } from '../utils/Utils'

const InterstitialAdClassExample: React.FC = () => {
    const [interstitialAd, setInterstitialAd] = useState<AdropInterstitialAd>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [isShown, setIsShown] = useState(false)
    const [errorCode, setErrorCode] = useState('')

    const disabledReset = !(errorCode || isShown)

    const listener: AdropListener = useMemo(() => {
        return {
            onAdClicked: (ad: AdropInterstitialAd) =>
                console.log(`interstitialAd clicked ${ad.unitId}`),
            onAdReceived: (ad: AdropInterstitialAd) => {
                setIsLoaded(true)
                console.log(`interstitialAd received ${ad.unitId}`)
                setErrorCode('')
            },
            onAdFailedToReceive: (_: AdropInterstitialAd, error: any) => {
                console.log('interstitialAd onAdFailedToReceive', error)
                setErrorCode(error)
            },
            onAdDidDismissFullScreen: (ad: AdropInterstitialAd) =>
                console.log(`interstitialAd dismiss ${ad.unitId}`),
            onAdDidPresentFullScreen: (ad: AdropInterstitialAd) =>
                console.log(`interstitialAd present ${ad.unitId}`),
            onAdFailedToShowFullScreen: (_: AdropInterstitialAd, error: any) =>
                setErrorCode(error),
        } as AdropListener
    }, [])

    useEffect(() => {
        return () => {
            interstitialAd?.destroy()
        }
    }, [interstitialAd])

    const initialize = useCallback(
        (unitId: string) => {
            let adropInterstitialAd = new AdropInterstitialAd(unitId)
            adropInterstitialAd.listener = listener
            setInterstitialAd((prev) => {
                prev?.destroy()
                return adropInterstitialAd
            })
        },
        [listener]
    )

    useEffect(() => {
        initialize(testUnitId_interstitialAd)
    }, [initialize])

    const load = () => interstitialAd?.load()
    const show = () => {
        interstitialAd?.show()
        setIsShown(true)
    }
    const resetTestAd = () => {
        initialize(testUnitId_interstitialAd)
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
