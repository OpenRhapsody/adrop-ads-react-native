import React, { useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { useAdropInterstitialAd } from 'adrop-ads-react-native'
import { testUnitId, testUnitId_interstitialAd } from '../TestUnitIds'
import { descriptionOf } from '../utils/Utils'

const InterstitialAdHookExample: React.FC = () => {
    const [unitId, setUnitId] = useState(testUnitId_interstitialAd)

    const { load, show, errorCode, reset, isLoaded, isOpened } =
        useAdropInterstitialAd(unitId)
    const disabledReset = !(isOpened || errorCode)

    const resetTestAd = () => {
        reset()
        setUnitId(testUnitId_interstitialAd)
    }

    const resetEmptyAd = () => {
        reset()
        setUnitId(testUnitId)
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

export default InterstitialAdHookExample

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
