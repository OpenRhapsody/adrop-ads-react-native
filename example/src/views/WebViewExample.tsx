import React, { useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { useAdropWebView } from 'adrop-ads-react-native'
import { Colors } from '../theme/colors'

const TEST_URL = 'https://google.github.io/webview-ads/test/'

const WebViewExample: React.FC = () => {
    const { containerRef, isReady, onLayout } = useAdropWebView()
    const webViewRef = useRef<WebView>(null)

    return (
        <View style={styles.container}>
            <View style={styles.controls}>
                <Text style={styles.statusLabel}>
                    {isReady ? 'Registered' : 'Registering WebView...'}
                </Text>
                <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={() => webViewRef.current?.reload()}
                >
                    <Text style={styles.reloadButtonText}>Reload</Text>
                </TouchableOpacity>
            </View>

            <View ref={containerRef} style={styles.webView} onLayout={onLayout}>
                <WebView
                    ref={webViewRef}
                    source={isReady ? { uri: TEST_URL } : { html: '' }}
                    style={styles.webView}
                    javaScriptEnabled={true}
                    thirdPartyCookiesEnabled={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback={true}
                />
            </View>
        </View>
    )
}

export default WebViewExample

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    controls: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    statusLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        flex: 1,
    },
    reloadButton: {
        backgroundColor: Colors.primary,
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginLeft: 8,
    },
    reloadButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 13,
    },
    webView: {
        flex: 1,
    },
})
