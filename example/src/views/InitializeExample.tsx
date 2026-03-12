import React, { useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { Adrop } from 'adrop-ads-react-native'

const InitializeExample: React.FC = () => {
    const [status, setStatus] = useState('')

    const handleInitialize = () => {
        Adrop.initialize(false)
        setStatus('Adrop initialized successfully')
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Initialize</Text>
            <View style={styles.button}>
                <Button
                    title={'Adrop.initialize()'}
                    onPress={handleInitialize}
                />
            </View>
            {status !== '' && <Text style={styles.status}>{status}</Text>}
        </View>
    )
}

export default InitializeExample

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 50,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    button: {
        marginVertical: 4,
    },
    status: {
        marginTop: 24,
        color: 'green',
        textAlign: 'center',
    },
})
