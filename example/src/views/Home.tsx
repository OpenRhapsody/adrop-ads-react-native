import React, { useState } from 'react'
import { Button, StyleSheet, View } from 'react-native'
import { Adrop } from 'adrop-ads-react-native'

const Home: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [initialized, setInitialized] = useState(false)

    const initialize = async () => {
        await Adrop.initialize(false)
        setInitialized(true)
    }

    const showBannerExample = () => navigation.navigate('BannerExample')

    const showInterstitialAdHookExample = () =>
        navigation.navigate('InterstitialAdHookExample')

    const showInterstitialAdClassExample = () =>
        navigation.navigate('InterstitialAdClassExample')

    const showRewardedAdHookExample = () =>
        navigation.navigate('RewardedAdHookExample')

    const showRewardedAdClassExample = () =>
        navigation.navigate('RewardedAdClassExample')

    return (
        <View style={styles.container}>
            <View style={styles.button}>
                <Button
                    disabled={initialized}
                    title={'Adrop Initialize'}
                    onPress={initialize}
                />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={!initialized}
                    title={'Banner Example'}
                    onPress={showBannerExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={!initialized}
                    title={'InterstitialAd Hook Example'}
                    onPress={showInterstitialAdHookExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={!initialized}
                    title={'InterstitialAd Class Example'}
                    onPress={showInterstitialAdClassExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={!initialized}
                    title={'RewardedAd Hook Example'}
                    onPress={showRewardedAdHookExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    disabled={!initialized}
                    title={'RewardedAd Class Example'}
                    onPress={showRewardedAdClassExample}
                />
            </View>
        </View>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 50,
    },
    button: {
        marginVertical: 4,
    },
})
