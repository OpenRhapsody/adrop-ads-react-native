import React from 'react'
import { Button, StyleSheet, View } from 'react-native'
import { Adrop } from 'adrop-ads-react-native'

Adrop.initialize(false)

const Home: React.FC<{ navigation: any }> = ({ navigation }) => {
    const showBannerExample = () => navigation.navigate('BannerExample')

    const showInterstitialAdHookExample = () =>
        navigation.navigate('InterstitialAdHookExample')

    const showInterstitialAdClassExample = () =>
        navigation.navigate('InterstitialAdClassExample')

    const showRewardedAdHookExample = () =>
        navigation.navigate('RewardedAdHookExample')

    const showRewardedAdClassExample = () =>
        navigation.navigate('RewardedAdClassExample')

    const showPopupAdExample = () => navigation.navigate('PopupAdClassExample')

    const showNativeAdExample = () => navigation.navigate('NativeAdExample')
    const showPropertyExample = () => navigation.navigate('PropertyExample')

    return (
        <View style={styles.container}>
            <View style={styles.button}>
                <Button title={'Banner Example'} onPress={showBannerExample} />
            </View>
            <View style={styles.button}>
                <Button
                    title={'InterstitialAd Hook Example'}
                    onPress={showInterstitialAdHookExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    title={'InterstitialAd Class Example'}
                    onPress={showInterstitialAdClassExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    title={'RewardedAd Hook Example'}
                    onPress={showRewardedAdHookExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    title={'RewardedAd Class Example'}
                    onPress={showRewardedAdClassExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    title={'PopupAd Class Example'}
                    onPress={showPopupAdExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    title={'NativeAd Class Example'}
                    onPress={showNativeAdExample}
                />
            </View>
            <View style={styles.button}>
                <Button
                    title={'Property Example'}
                    onPress={showPropertyExample}
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
