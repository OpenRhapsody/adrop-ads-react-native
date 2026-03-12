import { StyleSheet } from 'react-native'
import { Colors } from './colors'

export const Typography = StyleSheet.create({
    heroTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 1,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.69)',
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    body: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    caption: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    label: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    category: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    adLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textSecondary,
    },
})
