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
import {
    Button,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { descriptionOf } from '../utils/Utils'
import type { AdropNativeAdListener } from 'adrop-ads-react-native'

const NativeAdExample: React.FC = () => {
    const [nativeAd, setNativeAd] = useState<AdropNativeAd>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [errorCode, setErrorCode] = useState('')

    const disabledReset = !errorCode

    const listener = useMemo(
        (): AdropNativeAdListener => ({
            onAdReceived: (ad) => {
                console.log(`nativeAd received ${ad.unitId}`, ad.properties)
                setIsLoaded(true)
                setErrorCode('')
            },
            onAdFailedToReceive: (_, error) => {
                console.log('nativeAd onAdFailedToReceive', error)
                setErrorCode(error)
            },
            onAdClicked: (ad) => console.log(`nativeAd clicked ${ad.unitId}`),
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
        },
        [listener]
    )

    useEffect(() => {
        initialize(testUnitId_native)
    }, [initialize])

    const load = () => nativeAd?.load()

    const resetTestAd = () => {
        initialize(testUnitId_native)
        resetState()
    }

    const resetEmptyAd = () => {
        initialize(testUnitId)
        resetState()
    }

    const resetState = () => {
        setIsLoaded(false)
        setErrorCode('')
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

                <AdropMediaView
                    style={{
                        ...styles.adStyle,
                    }}
                />
            </AdropNativeAdView>
        )
    }, [isLoaded, nativeAd])

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
        // alignItems: 'center',
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
