import * as React from 'react'

import { StyleSheet, View, Button, Dimensions, Platform } from 'react-native'
import { Adrop, AdropBanner } from 'adrop-ads-react-native'
import { useEffect, useMemo, useRef } from 'react'

export default function App() {
    const bannerRef = useRef(null)
    const testBannerRef = useRef(null)

    useEffect(() => {
        Adrop.initialize(false)
    }, [])

    const unitId = useMemo(() => {
        switch (Platform.OS) {
            case 'android':
                return '01HD5R49SJGY7KKEP9MK8DYEN7'
            case 'ios':
                return '01HD5R54R6TDK91Y78M0J0SVCV'
            default:
                return ''
        }
    }, [Platform.OS])

    const loadBanner = () => bannerRef.current?.load()

    const loadTestBanner = () => testBannerRef.current?.load()

    const onAdClicked = (unitId: string) => {
        console.log('banner clicked', unitId)
    }

    const onAdReceived = (unitId: string) => {
        console.log('banner received', unitId)
    }

    const onAdFailedToReceive = (unitId: string, error?: string) => {
        console.log('banner onAdFailedToReceive', unitId, error)
    }

    return (
        <View style={styles.container}>
            <View>
                <Button title={'Request Ad!'} onPress={loadBanner} />
                <Button title={'Request TEST Ad!'} onPress={loadTestBanner} />
            </View>

            <View>
                <View style={{ width: '100%', height: 50 }}>
                    <AdropBanner
                        ref={bannerRef}
                        unitId={unitId}
                        style={{
                            width: Dimensions.get('window').width,
                            height: 80,
                        }}
                        onAdClicked={onAdClicked}
                        onAdReceived={onAdReceived}
                        onAdFailedToReceive={onAdFailedToReceive}
                    />
                </View>

                <View style={{ width: '100%', height: 50 }}>
                    <AdropBanner
                        ref={testBannerRef}
                        unitId={'ADROP_PUBLIC_TEST_UNIT_ID'}
                        style={{
                            width: Dimensions.get('window').width,
                            height: 80,
                        }}
                        onAdClicked={onAdClicked}
                        onAdReceived={onAdReceived}
                        onAdFailedToReceive={onAdFailedToReceive}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 50,
    },
    box: {
        width: 60,
        height: 60,
        marginVertical: 20,
    },
})
