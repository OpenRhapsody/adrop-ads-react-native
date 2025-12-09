import React, { useMemo, useRef, useState } from 'react'
import {
    Button,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { AdropBanner, type AdropBannerMetadata } from 'adrop-ads-react-native'
import { testUnitId, testUnitId_50 } from '../TestUnitIds'
import { descriptionOf } from '../utils/Utils'

interface IBanner {
    load: () => void
}

const BannerExample: React.FC = () => {
    const bannerRef = useRef<IBanner>(null)
    const emptyBannerRef = useRef<IBanner>(null)
    const [errorCode, setErrorCode] = useState('')
    const [emptyErrorCode, setEmptyErrorCode] = useState('')

    const unit = useMemo(() => {
        // Use your actual banner ad unit IDs here
        return Platform.OS === 'android' ? testUnitId_50 : testUnitId_50
    }, [])

    const loadBanner = () => {
        bannerRef.current?.load()
        setErrorCode('')
    }

    const loadEmptyBanner = () => {
        emptyBannerRef.current?.load()
        setEmptyErrorCode('')
    }

    const onAdClicked = (unitId: string, metadata?: AdropBannerMetadata) =>
        console.log('banner clicked', unitId, metadata)
    const onAdReceived = (unitId: string, metadata?: AdropBannerMetadata) =>
        console.log('banner received', unitId, metadata)
    const onAdFailedToReceive = (unitId: string, error?: string) => {
        console.log('banner onAdFailedToReceive', unitId, error)
        setErrorCode(error ?? '')
    }

    const onAdImpression = (unitId: string, metadata?: AdropBannerMetadata) =>
        console.log('banner onAdImpression', unitId, metadata)

    const onEmptyAdFailedToReceive = (_: string, error?: string) => {
        console.log('banner onAdFailedToReceive', _, error)
        setEmptyErrorCode(error ?? '')
    }

    const screenWidth = Dimensions.get('window').width

    return (
        <View style={styles.container}>
            <Button title={'Load banner (test ad)'} onPress={loadBanner} />

            <AdropBanner
                ref={bannerRef}
                unitId={unit}
                style={{ ...styles.banner, width: screenWidth }}
                autoLoad={false}
                onAdClicked={onAdClicked}
                onAdReceived={onAdReceived}
                onAdFailedToReceive={onAdFailedToReceive}
                onAdImpression={onAdImpression}
            />

            {errorCode && (
                <>
                    <Text style={styles.error}>{errorCode}</Text>
                    <Text style={styles.error}>{descriptionOf(errorCode)}</Text>
                </>
            )}

            <View style={styles.divider} />

            <Button
                title={'Load banner (empty ad)'}
                onPress={loadEmptyBanner}
            />

            <AdropBanner
                ref={emptyBannerRef}
                unitId={testUnitId}
                style={{ ...styles.banner, width: screenWidth }}
                autoLoad={false}
                onAdFailedToReceive={onEmptyAdFailedToReceive}
            />

            {emptyErrorCode && (
                <>
                    <Text style={styles.error}>{emptyErrorCode}</Text>
                    <Text style={styles.error}>
                        {descriptionOf(emptyErrorCode)}
                    </Text>
                </>
            )}
        </View>
    )
}

export default BannerExample

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 50,
        paddingHorizontal: 16,
    },
    banner: {
        width: '100%',
        height: 80,
        marginVertical: 4,
    },
    error: {
        marginVertical: 2,
        color: 'black',
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        marginVertical: 16,
        backgroundColor: 'black',
    },
})
