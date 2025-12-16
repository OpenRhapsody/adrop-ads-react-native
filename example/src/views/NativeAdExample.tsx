import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    AdropBodyView,
    AdropHeadLineView,
    AdropMediaView,
    AdropNativeAd,
    AdropNativeAdView,
    AdropProfileLogoView,
    AdropProfileNameView,
} from 'adrop-ads-react-native'
import { testUnitId, testUnitId_native } from '../TestUnitIds'
import { WebView } from 'react-native-webview'
import {
    Button,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Linking,
    Platform,
} from 'react-native'
import { descriptionOf } from '../utils/Utils'
import type { AdropNativeAdListener } from 'adrop-ads-react-native'

const NativeAdExample: React.FC = () => {
    const [nativeAd, setNativeAd] = useState<AdropNativeAd>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [errorCode, setErrorCode] = useState('')

    const disabledReset = !errorCode

    const unit = useMemo(() => {
        // Use your actual native ad unit IDs here
        return Platform.OS === 'android' ? testUnitId_native : testUnitId_native
    }, [])

    const openUrl = useCallback((url: string) => {
        Linking.openURL(url).catch((err) =>
            console.error('Failed to open URL:', err)
        )
    }, [])

    // Define ad event listener
    const listener = useMemo(
        (): AdropNativeAdListener => ({
            // Callback: Called when the ad is successfully loaded
            onAdReceived: (ad) => {
                console.log(
                    `nativeAd received ${ad.unitId}`,
                    ad.properties,
                    ad.txId,
                    ad.campaignId,
                    ad.creativeId
                )
                setIsLoaded(true)
                setErrorCode('')
            },

            // Callback: Called when the ad fails to load
            onAdFailedToReceive: (_, error) => {
                console.log('nativeAd onAdFailedToReceive', error)
                setErrorCode(error)
            },

            // Callback: Called when the ad is clicked
            onAdClicked: (ad) => console.log(`nativeAd clicked ${ad.unitId}`),

            // Callback: Called when the ad is displayed and an impression is recorded
            onAdImpression: (ad) =>
                console.log(`nativeAd impressed ${ad.unitId}`),
        }),
        []
    )

    // Initialize native ad with unit ID and listener
    const initialize = useCallback(
        (unitId: string) => {
            // Create new AdropNativeAd instance
            let adropNativeAd = new AdropNativeAd(unitId)

            // Set event listener
            adropNativeAd.listener = listener

            setNativeAd((prev) => {
                // Destroy previous ad instance
                prev?.destroy()
                return adropNativeAd
            })
            setIsLoaded(false)
            setErrorCode('')
        },
        [listener]
    )

    useEffect(() => {
        initialize(unit)
    }, [initialize, unit])

    // Load the ad
    const load = () => nativeAd?.load()

    const resetTestAd = () => {
        initialize(unit)
    }

    const resetEmptyAd = () => {
        initialize(testUnitId)
    }

    // Native ad view component
    const adView = useMemo(() => {
        if (!isLoaded) return null

        return (
            // AdropNativeAdView container for native ad components
            <AdropNativeAdView
                nativeAd={nativeAd}
                style={{
                    ...styles.adContainer,
                    width: Dimensions.get('window').width,
                }}
            >
                <View style={styles.rowContainer}>
                    {/* Profile logo component */}
                    <AdropProfileLogoView style={styles.icon} />
                    {/* Profile name component */}
                    <AdropProfileNameView style={styles.name} />
                </View>

                {/* Headline text component */}
                <AdropHeadLineView style={styles.headline} />
                {/* Body text component */}
                <AdropBodyView style={styles.body} />

                {/* Media view for backfilled ads or WebView for custom creatives */}
                {nativeAd?.isBackfilled ? (
                    <AdropMediaView style={styles.adStyle} />
                ) : (
                    <WebView
                        source={{
                            html: nativeAd?.properties?.creative ?? '',
                        }}
                        style={styles.adStyle}
                        javaScriptEnabled={true}
                        mediaPlaybackRequiresUserAction={false}
                        allowsInlineMediaPlayback={true}
                        scrollEnabled={false}
                        onNavigationStateChange={(event) => {
                            // Android webview event
                            if (
                                event.url &&
                                event.url !== 'about:blank' &&
                                !event.url.startsWith('data:')
                            ) {
                                openUrl(event.url)
                            }
                        }}
                        onOpenWindow={(event) => {
                            // iOS webview event (window.open)
                            if (event.nativeEvent?.targetUrl) {
                                openUrl(event.nativeEvent.targetUrl)
                            }
                        }}
                    />
                )}
            </AdropNativeAdView>
        )
    }, [isLoaded, nativeAd, openUrl])

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.button}>
                    <Button title={'nativeAd load'} onPress={load} />
                </View>
                <View style={styles.button}>
                    <Button
                        disabled={disabledReset}
                        title={'nativeAd reset (test ad)'}
                        onPress={resetTestAd}
                    />
                </View>
                {adView}
                <Text style={styles.description}>
                    Reset nativeAd, you can be received ad successfully when
                    click load button
                </Text>
                <View style={styles.button}>
                    <Button
                        disabled={disabledReset}
                        title={'nativeAd reset (empty ad)'}
                        onPress={resetEmptyAd}
                    />
                </View>
                <Text style={styles.description}>
                    Reset nativeAd, you can be received error callback when
                    click load button
                </Text>
                {errorCode && (
                    <>
                        <Text style={styles.error}>
                            Error Code : {errorCode}
                        </Text>
                        <Text style={styles.error}>
                            {descriptionOf(errorCode)}
                        </Text>
                    </>
                )}
            </View>
        </ScrollView>
    )
}

export default NativeAdExample

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 66,
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
    adContainer: {
        paddingHorizontal: 16,
    },
    adStyle: {
        width: '100%',
        height: 360,
        marginBottom: 24,
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 8,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
    headline: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    body: {
        fontSize: 14,
        color: 'black',
        marginVertical: 16,
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 8,
    },
})
