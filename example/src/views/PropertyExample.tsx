import React from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import {
    AdropMetrics,
    AdropGender,
    AdropProperties,
} from 'adrop-ads-react-native'

const PropertyExample: React.FC<{ navigation: any }> = () => {
    const setAge = (age: number) => {
        AdropMetrics.setProperty(AdropProperties.AGE, age.toString())
    }

    const setBirth = (birth: string) => {
        AdropMetrics.setProperty(AdropProperties.BIRTH, birth)
    }

    const setGender = (gender: AdropGender) => {
        AdropMetrics.setProperty(AdropProperties.GENDER, gender)
    }

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
        AdropMetrics.logEvent('RN_CustomKey', params)
    }

    return (
        <View style={styles.container}>
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
})
