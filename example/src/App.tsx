import * as React from 'react'

import { StyleSheet, View, Button, Dimensions } from 'react-native'
import { Adrop, AdropBanner } from 'adrop-ads-react-native'
import { useEffect, useRef } from 'react'


export default function App() {
    const bannerRef = useRef(null)

    useEffect(() => {
        Adrop.initialize(false)
    }, [])

    const loadBanner = () => bannerRef.current?.load()

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
            </View>

            <AdropBanner
                autoLoad={false}
                ref={bannerRef}
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
