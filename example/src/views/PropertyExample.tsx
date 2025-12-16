import React, { useCallback, useState } from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import {
    AdropMetrics,
    AdropGender,
    AdropProperties,
} from 'adrop-ads-react-native'

const PropertyExample: React.FC<{ navigation: any }> = () => {
    const [key, setKey] = useState('')
    const [value, setValue] = useState('')

    const onChangeKey = useCallback((text: string) => {
        console.log('key', text)
        setKey(text)
    }, [])

    const onChangeValue = useCallback((text: string) => {
        console.log('value', text)
        setValue(text)
    }, [])

    // Set custom property with automatic type detection
    const sendProperty = useCallback(async () => {
        if (value.trim() === '') {
            // Set property to null (remove)
            await AdropMetrics.setProperty(key, null)
        } else if (
            value.toLowerCase() === 'true' ||
            value.toLowerCase() === 'false'
        ) {
            // Set boolean property
            console.log('boolean value', value)
            await AdropMetrics.setProperty(key, value.toLowerCase() === 'true')
        } else if (
            !isNaN(parseInt(value, 10)) &&
            Number.isInteger(Number(value))
        ) {
            // Set integer property
            console.log('int value', value)
            await AdropMetrics.setProperty(key, parseInt(value, 10))
        } else if (!isNaN(parseFloat(value))) {
            // Set float property
            console.log('float value', value)
            await AdropMetrics.setProperty(key, parseFloat(value))
        } else {
            // Set string property
            await AdropMetrics.setProperty(key, value)
        }

        // Log saved properties after a delay
        setTimeout(async () => {
            console.log('saved properties', await AdropMetrics.properties())
        }, 500)
    }, [key, value])

    // Set user age property
    const setAge = (age: number) => {
        AdropMetrics.setProperty(AdropProperties.AGE, age.toString())
    }

    // Set user birth date property
    const setBirth = (birth: string) => {
        AdropMetrics.setProperty(AdropProperties.BIRTH, birth)
    }

    // Set user gender property
    const setGender = (gender: AdropGender) => {
        AdropMetrics.setProperty(AdropProperties.GENDER, gender)
    }

    // Log custom event with parameters
    const sendEvent = () => {
        let params = {
            key1: true,
            key2: 123,
            key3: 1.1,
            key4: 'value',
            array: ['123'],
            dictionary: { '1': '1' },
            null: null,
            exp: 1.42e32,
        }
        console.log(
            `sendEvent key: CustomKey, params ${JSON.stringify(params)}`
        )
        // Log custom event with event name and parameters
        AdropMetrics.logEvent('RN_CustomKey', params)
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputRow}>
                <Text style={styles.key}>Key</Text>
                <TextInput
                    style={styles.input}
                    value={key}
                    placeholder={'key'}
                    placeholderTextColor={'grey'}
                    onChangeText={onChangeKey}
                />
            </View>
            <View style={styles.inputRow}>
                <Text style={styles.key}>Value</Text>
                <TextInput
                    style={styles.input}
                    value={value}
                    placeholder={'value (string, int, double, boolean)'}
                    placeholderTextColor={'grey'}
                    onChangeText={onChangeValue}
                />
            </View>
            <Button title="Set Property" onPress={sendProperty} />
            <Text style={styles.header}>Gender</Text>
            <View style={styles.row}>
                <Button
                    title="Male"
                    onPress={() => setGender(AdropGender.MALE)}
                />
                <Button
                    title="Female"
                    onPress={() => setGender(AdropGender.FEMALE)}
                />
                <Button
                    title="Other"
                    onPress={() => setGender(AdropGender.OTHER)}
                />
                <Button
                    title="Unknown"
                    onPress={() => setGender(AdropGender.UNKNOWN)}
                />
            </View>

            <Text style={styles.header}>Age</Text>
            <View style={styles.row}>
                <Button title="18" onPress={() => setAge(18)} />
                <Button title="25" onPress={() => setAge(25)} />
                <Button title="37" onPress={() => setAge(37)} />
                <Button title="45" onPress={() => setAge(45)} />
            </View>

            <Text style={styles.header}>Birth</Text>
            <View style={styles.row}>
                <Button title="20101111" onPress={() => setBirth('20101111')} />
                <Button title="2000" onPress={() => setBirth('2000')} />
                <Button title="199507" onPress={() => setBirth('199507')} />
            </View>

            <Text style={styles.header}>Custom Event</Text>
            <View style={styles.row}>
                <Button title="Send Event" onPress={sendEvent} />
            </View>
        </View>
    )
}

export default PropertyExample

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 50,
    },
    header: {
        color: 'black',
        marginVertical: 8,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    key: {
        marginRight: 8,
        color: 'black',
    },
    input: {
        width: 200,
        borderWidth: 1,
        borderColor: 'black',
        borderStyle: 'solid',
        padding: 4,
        color: 'black',
    },
})
