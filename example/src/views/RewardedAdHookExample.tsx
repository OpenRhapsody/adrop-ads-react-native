import React, { useCallback, useMemo, useState } from 'react'
import { Button, Platform, StyleSheet, Text, View } from 'react-native'
import { testUnitId, testUnitId_rewarded } from '../TestUnitIds'
import { useAdropRewardedAd } from 'adrop-ads-react-native'
import { descriptionOf } from '../utils/Utils'

const RewardedAdHookExample: React.FC = () => {
    const unit = useMemo(() => {
        // Use your actual rewarded ad unit IDs here
        return Platform.OS === 'android'
            ? testUnitId_rewarded
            : testUnitId_rewarded
    }, [])

    const [unitId, setUnitId] = useState(unit)

    // useAdropRewardedAd hook provides ad management functions
    // - load: Load the ad
    // - show: Show the ad
    // - reset: Reset ad state
    // - isLoaded: Whether ad is loaded
    // - isOpened: Whether ad is currently displayed
    // - isReady: Whether ad can be loaded
    // - errorCode: Error code if failed
    const { load, show, errorCode, reset, isLoaded, isOpened, isReady } =
        useAdropRewardedAd(unitId)
    const disabledReset = !(isOpened || errorCode)

    // Load ad when ready
    const loadAd = useCallback(() => {
        if (isReady) {
            load()
        }
    }, [isReady, load])

    // Reset and load test ad
    const resetTestAd = useCallback(() => {
        reset()
        setUnitId(unit)
    }, [reset, unit])

    // Reset and load empty ad (for error testing)
    const resetEmptyAd = useCallback(() => {
        reset()
        setUnitId(testUnitId)
    }, [reset])

    return (
        <View style={styles.container}>
            <View style={styles.button}>
                <Button title={'rewardedAd load'} onPress={loadAd} />
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

export default RewardedAdHookExample

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
