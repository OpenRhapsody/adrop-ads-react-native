import React from 'react'
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native'
import { Adrop } from 'adrop-ads-react-native'
import { useNavigation } from '@react-navigation/native'
import { Colors } from '../theme/colors'
import { Typography } from '../theme/typography'
import { CommonStyles } from '../theme/styles'

const DeveloperScreen: React.FC = () => {
    const navigation = useNavigation<any>()

    const handleInitDebug = () => {
        Adrop.initialize(false)
        Alert.alert('SDK', 'Initialized (Debug)')
    }

    const handleInitProd = () => {
        Adrop.initialize(true)
        Alert.alert('SDK', 'Initialized (Production)')
    }

    const navigateTo = (screen: string) => {
        navigation.navigate(screen)
    }

    return (
        <ScrollView style={styles.screen}>
            <View style={styles.content}>
                <Text style={[Typography.screenTitle, styles.mb16]}>
                    Developer Tools
                </Text>

                {/* SDK Control */}
                <Text style={[Typography.sectionTitle, styles.mb12]}>
                    SDK Control
                </Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[CommonStyles.outlinedButton, styles.flex1]}
                        onPress={handleInitDebug}
                    >
                        <Text style={styles.outlinedText}>
                            Initialize Debug
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.spacerH} />
                    <TouchableOpacity
                        style={[CommonStyles.outlinedButton, styles.flex1]}
                        onPress={handleInitProd}
                    >
                        <Text style={styles.outlinedText}>Initialize Prod</Text>
                    </TouchableOpacity>
                </View>

                <View style={CommonStyles.divider} />

                {/* Ad Format Test */}
                <Text style={[Typography.sectionTitle, styles.mb12]}>
                    Ad Format Test
                </Text>
                {[
                    'BannerExample',
                    'NativeAdExample',
                    'RewardedAdClassExample',
                    'InterstitialAdClassExample',
                ].map((screen) => {
                    const label = screen
                        .replace('Example', '')
                        .replace('ClassExample', '')
                        .replace('AdClass', ' Ad')
                        .replace('Ad', ' Ad')
                    return (
                        <TouchableOpacity
                            key={screen}
                            style={[styles.testButton, styles.mb8]}
                            onPress={() => navigateTo(screen)}
                        >
                            <Text style={styles.testButtonText}>
                                {label} Test
                            </Text>
                        </TouchableOpacity>
                    )
                })}

                <View style={CommonStyles.divider} />

                {/* Other Test Screens */}
                <TouchableOpacity
                    style={[CommonStyles.outlinedButton, styles.mb8]}
                    onPress={() => navigateTo('PropertyExample')}
                >
                    <Text style={styles.outlinedText}>
                        Property & Events Test
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={CommonStyles.outlinedButton}
                    onPress={() => navigateTo('ConsentExample')}
                >
                    <Text style={styles.outlinedText}>Consent Test</Text>
                </TouchableOpacity>

                <View style={CommonStyles.divider} />

                <Text style={[Typography.sectionTitle, styles.mb12]}>
                    Shopping Ad Test
                </Text>
                <TouchableOpacity
                    style={[styles.testButton, styles.mb8]}
                    onPress={() => navigateTo('ShoppingAdExample')}
                >
                    <Text style={styles.testButtonText}>Shopping Ad Test</Text>
                </TouchableOpacity>

                <View style={styles.spacerV} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    testButton: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    testButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    outlinedText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    mb16: {
        marginBottom: 16,
    },
    mb12: {
        marginBottom: 12,
    },
    mb8: {
        marginBottom: 8,
    },
    flex1: {
        flex: 1,
    },
    spacerH: {
        width: 8,
    },
    spacerV: {
        height: 16,
    },
})

export default DeveloperScreen
