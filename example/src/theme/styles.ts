import { StyleSheet } from 'react-native'
import { Colors } from './colors'

export const CommonStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.divider,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.1,
        elevation: 2,
    },
    cardLarge: {
        padding: 20,
    },
    rewardButton: {
        backgroundColor: Colors.primary,
        borderRadius: 24,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rewardButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginVertical: 16,
    },
    outlinedButton: {
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    bannerContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        minHeight: 60,
    },
    nativeAdContainer: {
        marginHorizontal: 16,
        marginTop: 12,
    },
})
