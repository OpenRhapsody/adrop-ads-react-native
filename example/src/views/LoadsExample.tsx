import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, FlatList, StyleSheet, Text, View } from 'react-native'
import {
    AdropBanner,
    AdropBodyView,
    AdropHeadLineView,
    AdropNativeAd,
    AdropNativeAdView,
    AdropPreloadedBanner,
    type AdropBannerHandle,
} from 'adrop-ads-react-native'
import { testUnitId_100, testUnitId_native } from '../TestUnitIds'

type FeedItem =
    | { kind: 'filler'; key: string; index: number }
    | { kind: 'banner'; key: string; handle: AdropBannerHandle }
    | { kind: 'native'; key: string; ad: AdropNativeAd }

/**
 * Batch loads() example: up to 5 banners / native ads from a single network
 * request, mounted in a FlatList with filler rows so scrolling exercises the
 * re-attach contract (recycled unmounts only detach; instances live until
 * destroyLoaded / destroy).
 */
const LoadsExample: React.FC = () => {
    const [handles, setHandles] = useState<AdropBannerHandle[]>([])
    const [nativeAds, setNativeAds] = useState<AdropNativeAd[]>([])
    const [status, setStatus] = useState('Idle')
    const cancelled = useRef(false)

    const handlesRef = useRef(handles)
    handlesRef.current = handles
    const nativeAdsRef = useRef(nativeAds)
    nativeAdsRef.current = nativeAds

    useEffect(() => {
        return () => {
            // Publisher owns cleanup: every batch instance holds a native
            // WebView (~5-15 MB) — release all, mounted or not.
            cancelled.current = true
            handlesRef.current.forEach(AdropBanner.destroyLoaded)
            nativeAdsRef.current.forEach((ad) => ad.destroy())
        }
    }, [])

    const loadBanners = useCallback(async () => {
        try {
            const loaded = await AdropBanner.loads({
                unitId: testUnitId_100,
                listener: {
                    // One listener for the whole batch — requestId tells slots apart.
                    onAdClicked: (_unitId, requestId) =>
                        console.log('banner clicked', requestId),
                    onAdImpression: (_unitId, requestId) =>
                        console.log('banner impression', requestId),
                },
            })
            if (cancelled.current) {
                loaded.forEach(AdropBanner.destroyLoaded)
                return
            }
            setHandles((previous) => {
                previous.forEach(AdropBanner.destroyLoaded)
                return loaded
            })
            setStatus(`Banners: ${loaded.length} received`)
        } catch (error: any) {
            if (!cancelled.current)
                setStatus(`Banner loads failed: ${error?.code ?? error}`)
        }
    }, [])

    const loadNativeAds = useCallback(async () => {
        try {
            const loaded = await AdropNativeAd.loads({
                unitId: testUnitId_native,
                listener: {
                    onAdClicked: (ad) =>
                        console.log('native clicked', ad.creativeId),
                    onAdImpression: (ad) =>
                        console.log('native impression', ad.creativeId),
                },
            })
            if (cancelled.current) {
                loaded.forEach((ad) => ad.destroy())
                return
            }
            setNativeAds((previous) => {
                previous.forEach((ad) => ad.destroy())
                return loaded
            })
            setStatus(`Native ads: ${loaded.length} received`)
        } catch (error: any) {
            if (!cancelled.current)
                setStatus(`Native loads failed: ${error?.code ?? error}`)
        }
    }, [])

    const feed: FeedItem[] = []
    const ads: FeedItem[] = [
        ...handles.map<FeedItem>((handle) => ({
            kind: 'banner',
            key: `banner_${handle.requestId}`,
            handle,
        })),
        ...nativeAds.map<FeedItem>((ad, index) => ({
            kind: 'native',
            key: `native_${index}`,
            ad,
        })),
    ]
    let adIndex = 0
    const total = ads.length === 0 ? 10 : ads.length * 4
    for (let i = 0; i < total; i++) {
        if (i % 4 === 2 && adIndex < ads.length) {
            feed.push(ads[adIndex++]!)
        } else {
            feed.push({ kind: 'filler', key: `filler_${i}`, index: i })
        }
    }

    return (
        <View style={styles.screen}>
            <View style={styles.row}>
                <View style={styles.flex1}>
                    <Button title="Load 5 Banners" onPress={loadBanners} />
                </View>
                <View style={styles.flex1}>
                    <Button title="Load 5 Native" onPress={loadNativeAds} />
                </View>
            </View>
            <Text style={styles.status}>{status}</Text>
            <FlatList
                data={feed}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => {
                    if (item.kind === 'banner') {
                        return (
                            <View style={styles.adCell}>
                                <AdropPreloadedBanner handle={item.handle} />
                            </View>
                        )
                    }
                    if (item.kind === 'native') {
                        return (
                            <AdropNativeAdView
                                nativeAd={item.ad}
                                style={styles.nativeCard}
                            >
                                <AdropHeadLineView style={styles.headline} />
                                <AdropBodyView style={styles.body} />
                            </AdropNativeAdView>
                        )
                    }
                    return (
                        <View style={styles.fillerCell}>
                            <Text>Feed item {item.index}</Text>
                            <Text style={styles.fillerSub}>
                                Scroll past the ads and back to re-attach
                            </Text>
                        </View>
                    )
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    row: { flexDirection: 'row', padding: 8 },
    flex1: { flex: 1, marginHorizontal: 4 },
    status: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
    adCell: { alignItems: 'center', marginVertical: 4 },
    nativeCard: {
        marginVertical: 4,
        marginHorizontal: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
    },
    headline: { fontSize: 18, fontWeight: 'bold' },
    body: { fontSize: 14, marginTop: 4 },
    fillerCell: { padding: 16 },
    fillerSub: { fontSize: 11, color: '#888' },
})

export default LoadsExample
