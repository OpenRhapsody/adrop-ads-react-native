import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    AdropBodyView,
    AdropHeadLineView,
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
} from 'react-native'
import { descriptionOf } from '../utils/Utils'
import type { AdropNativeAdListener } from 'adrop-ads-react-native'

const NativeAdExample: React.FC = () => {
    const [nativeAd, setNativeAd] = useState<AdropNativeAd>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [errorCode, setErrorCode] = useState('')

    const disabledReset = !errorCode

    const openUrl = useCallback((url: string) => {
        Linking.openURL(url).catch((err) =>
            console.error('Failed to open URL:', err)
        )
    }, [])

    const listener = useMemo(
        (): AdropNativeAdListener => ({
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
            onAdFailedToReceive: (_, error) => {
                console.log('nativeAd onAdFailedToReceive', error)
                setErrorCode(error)
            },
            onAdClicked: (ad) => console.log(`nativeAd clicked ${ad.unitId}`),
            onAdImpression: (ad) => console.log(`nativeAd impressed ${ad.unitId}`),
        }),
        []
    )

    const initialize = useCallback(
        (unitId: string) => {
            let adropNativeAd = new AdropNativeAd(unitId)
            adropNativeAd.listener = listener
            setNativeAd((prev) => {
                prev?.destroy()
                return adropNativeAd
            })
            setIsLoaded(false)
            setErrorCode('')
        },
        [listener]
    )

    useEffect(() => {
        initialize(testUnitId_native)
    }, [initialize])

    const load = () => nativeAd?.load()

    const resetTestAd = () => {
        initialize(testUnitId_native)
    }

    const resetEmptyAd = () => {
        initialize(testUnitId)
    }

    const adView = useMemo(() => {
        if (!isLoaded) return null

        return (
            <AdropNativeAdView
                nativeAd={nativeAd}
                style={{
                    ...styles.adContainer,
                    width: Dimensions.get('window').width,
                }}
            >
                <View style={styles.rowContainer}>
                    <AdropProfileLogoView style={styles.icon} />
                    <AdropProfileNameView style={styles.name} />
                </View>

                <AdropHeadLineView style={styles.headline} />
                <AdropBodyView style={styles.body} />

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
