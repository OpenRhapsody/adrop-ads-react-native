/**
 * Consent Example
 *
 * This example demonstrates how to use Google UMP (User Messaging Platform)
 * for GDPR/CCPA consent management with Adrop SDK.
 *
 * Requirements:
 * - adrop-ads-backfill module must be installed for consent features to work
 *
 * Consent Status:
 * - UNKNOWN: Consent status has not been determined yet
 * - REQUIRED: User consent is required (show consent form)
 * - NOT_REQUIRED: User consent is not required (non-regulated region)
 * - OBTAINED: User has provided consent
 */

import React, { useState } from 'react'
import { Button, StyleSheet, Text, View, ScrollView } from 'react-native'
import {
    AdropConsent,
    AdropConsentDebugGeography,
    AdropConsentStatus,
} from 'adrop-ads-react-native'
import type { AdropConsentResult } from 'adrop-ads-react-native'

const ConsentExample: React.FC = () => {
    const [result, setResult] = useState<AdropConsentResult | null>(null)
    const [status, setStatus] = useState<AdropConsentStatus | null>(null)
    const [canRequest, setCanRequest] = useState<boolean | null>(null)
    const [error, setError] = useState<string | null>(null)

    const getStatusText = (statusValue: AdropConsentStatus): string => {
        switch (statusValue) {
            case AdropConsentStatus.UNKNOWN:
                return 'UNKNOWN'
            case AdropConsentStatus.REQUIRED:
                return 'REQUIRED'
            case AdropConsentStatus.NOT_REQUIRED:
                return 'NOT_REQUIRED'
            case AdropConsentStatus.OBTAINED:
                return 'OBTAINED'
            default:
                return 'UNKNOWN'
        }
    }

    /**
     * Request consent info update and show consent form if needed.
     *
     * This is the main function to call for consent management.
     * It will:
     * 1. Check if consent is required based on user's location
     * 2. Show the consent form if required
     * 3. Return the consent result with status and permissions
     */
    const handleRequestConsentInfoUpdate = async () => {
        try {
            setError(null)
            const consentResult = await AdropConsent.requestConsentInfoUpdate()
            setResult(consentResult)
            console.log('Consent Result:', consentResult)
        } catch (e: any) {
            setError(e.message)
            console.error('Error:', e)
        }
    }

    /**
     * Get current consent status without showing any UI.
     *
     * Use this to check the stored consent status.
     * Returns: UNKNOWN, REQUIRED, NOT_REQUIRED, or OBTAINED
     */
    const handleGetConsentStatus = async () => {
        try {
            setError(null)
            const consentStatus = await AdropConsent.getConsentStatus()
            setStatus(consentStatus)
            console.log('Consent Status:', consentStatus)
        } catch (e: any) {
            setError(e.message)
            console.error('Error:', e)
        }
    }

    /**
     * Check if ads can be requested based on consent status.
     *
     * Returns true if:
     * - Consent is not required (non-regulated region), or
     * - User has provided consent
     */
    const handleCanRequestAds = async () => {
        try {
            setError(null)
            const canRequestAds = await AdropConsent.canRequestAds()
            setCanRequest(canRequestAds)
            console.log('Can Request Ads:', canRequestAds)
        } catch (e: any) {
            setError(e.message)
            console.error('Error:', e)
        }
    }

    /**
     * Set debug geography to EEA (European Economic Area).
     *
     * Use this for testing GDPR consent flow.
     * Only works in DEBUG builds.
     * Device ID is automatically detected.
     */
    const handleSetDebugEEA = () => {
        AdropConsent.setDebugSettings(AdropConsentDebugGeography.EEA)
        console.log('Debug settings set to EEA')
    }

    /**
     * Disable debug geography settings.
     *
     * Returns to using actual device location for consent determination.
     */
    const handleSetDebugDisabled = () => {
        AdropConsent.setDebugSettings(AdropConsentDebugGeography.DISABLED)
        console.log('Debug settings disabled')
    }

    /**
     * Reset all consent information.
     *
     * Use this for testing to clear stored consent and start fresh.
     * After reset, requestConsentInfoUpdate will show the consent form again.
     */
    const handleReset = () => {
        AdropConsent.reset()
        setResult(null)
        setStatus(null)
        setCanRequest(null)
        setError(null)
        console.log('Consent reset')
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Consent Example</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.button}>
                    <Button
                        title="Request Consent Info Update"
                        onPress={handleRequestConsentInfoUpdate}
                    />
                </View>
                <View style={styles.button}>
                    <Button
                        title="Get Consent Status"
                        onPress={handleGetConsentStatus}
                    />
                </View>
                <View style={styles.button}>
                    <Button
                        title="Can Request Ads"
                        onPress={handleCanRequestAds}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Debug Settings</Text>
                <View style={styles.button}>
                    <Button
                        title="Set Debug Geography: EEA"
                        onPress={handleSetDebugEEA}
                    />
                </View>
                <View style={styles.button}>
                    <Button
                        title="Disable Debug Geography"
                        onPress={handleSetDebugDisabled}
                    />
                </View>
                <View style={styles.button}>
                    <Button title="Reset Consent" onPress={handleReset} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Results</Text>
                {error && <Text style={styles.error}>Error: {error}</Text>}

                {result && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultTitle}>
                            requestConsentInfoUpdate Result:
                        </Text>
                        <Text style={styles.resultText}>
                            Status: {getStatusText(result.status)}
                        </Text>
                        <Text style={styles.resultText}>
                            Can Request Ads: {result.canRequestAds.toString()}
                        </Text>
                        <Text style={styles.resultText}>
                            Can Show Personalized Ads:{' '}
                            {result.canShowPersonalizedAds.toString()}
                        </Text>
                        {result.error && (
                            <Text style={styles.resultText}>
                                Error: {result.error}
                            </Text>
                        )}
                    </View>
                )}

                {status !== null && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultTitle}>
                            getConsentStatus Result:
                        </Text>
                        <Text style={styles.resultText}>
                            Status: {getStatusText(status)}
                        </Text>
                    </View>
                )}

                {canRequest !== null && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultTitle}>
                            canRequestAds Result:
                        </Text>
                        <Text style={styles.resultText}>
                            Can Request: {canRequest.toString()}
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    )
}

export default ConsentExample

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#000000',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#000000',
    },
    button: {
        marginVertical: 4,
    },
    resultBox: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    resultTitle: {
        fontWeight: '600',
        marginBottom: 5,
        color: '#000000',
    },
    resultText: {
        color: '#000000',
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
})
