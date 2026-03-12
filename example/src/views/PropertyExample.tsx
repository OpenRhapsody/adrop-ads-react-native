import React, { useCallback, useState } from 'react'
import {
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import {
    AdropMetrics,
    AdropGender,
    AdropProperties,
} from 'adrop-ads-react-native'

const PropertyExample: React.FC<{ navigation: any }> = () => {
    const [key, setKey] = useState('')
    const [value, setValue] = useState('')

    const onChangeKey = useCallback((text: string) => {
        setKey(text)
    }, [])

    const onChangeValue = useCallback((text: string) => {
        setValue(text)
    }, [])

    const sendProperty = useCallback(async () => {
        if (value.trim() === '') {
            await AdropMetrics.setProperty(key, null)
        } else if (
            value.toLowerCase() === 'true' ||
            value.toLowerCase() === 'false'
        ) {
            await AdropMetrics.setProperty(key, value.toLowerCase() === 'true')
        } else if (
            !isNaN(parseInt(value, 10)) &&
            Number.isInteger(Number(value))
        ) {
            await AdropMetrics.setProperty(key, parseInt(value, 10))
        } else if (!isNaN(parseFloat(value))) {
            await AdropMetrics.setProperty(key, parseFloat(value))
        } else {
            await AdropMetrics.setProperty(key, value)
        }

        setTimeout(async () => {
            console.log('saved properties', await AdropMetrics.properties())
        }, 500)
    }, [key, value])

    const setAge = (age: number) => {
        AdropMetrics.setProperty(AdropProperties.AGE, age.toString())
    }

    const setBirth = (birth: string) => {
        AdropMetrics.setProperty(AdropProperties.BIRTH, birth)
    }

    const setGender = (gender: AdropGender) => {
        AdropMetrics.setProperty(AdropProperties.GENDER, gender)
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.sectionHeader}>Custom Property</Text>
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

            <Text style={styles.sectionHeader}>Default Events</Text>

            <EventButton
                title="app_open"
                onPress={() => {
                    AdropMetrics.sendEvent('app_open')
                }}
            />

            <EventButton
                title="sign_up"
                onPress={() => {
                    AdropMetrics.sendEvent('sign_up', {
                        method: 'google',
                    })
                }}
            />

            <EventButton
                title="push_clicks"
                onPress={() => {
                    AdropMetrics.sendEvent('push_clicks', {
                        campaign_id: 'camp-2024-summer',
                    })
                }}
            />

            <EventButton
                title="page_view"
                onPress={() => {
                    AdropMetrics.sendEvent('page_view', {
                        page_id: 'home',
                        page_category: 'main',
                        page_url: '/home',
                    })
                }}
            />

            <EventButton
                title="click"
                onPress={() => {
                    AdropMetrics.sendEvent('click', {
                        element_id: 'cta-banner',
                        element_type: 'button',
                        target_url: '/promo/summer-sale',
                    })
                }}
            />

            <EventButton
                title="view_item"
                onPress={() => {
                    AdropMetrics.sendEvent('view_item', {
                        item_id: 'SKU-123',
                        item_name: 'Widget',
                        item_category: 'Electronics',
                        brand: 'BrandX',
                        price: 29900,
                    })
                }}
            />

            <EventButton
                title="view_content"
                onPress={() => {
                    AdropMetrics.sendEvent('view_content', {
                        content_id: 'article-456',
                        content_name: 'How to use Adrop SDK',
                        content_type: 'blog_post',
                    })
                }}
            />

            <EventButton
                title="add_to_wishlist"
                onPress={() => {
                    AdropMetrics.sendEvent('add_to_wishlist', {
                        item_id: 'SKU-789',
                        item_name: 'Gadget Pro',
                        item_category: 'Electronics',
                        brand: 'BrandY',
                        price: 49900,
                    })
                }}
            />

            <EventButton
                title="add_to_cart"
                onPress={() => {
                    AdropMetrics.sendEvent('add_to_cart', {
                        item_id: 'SKU-123',
                        item_name: 'Widget',
                        item_category: 'Electronics',
                        brand: 'BrandX',
                        price: 29900,
                        quantity: 2,
                        value: 59800,
                        currency: 'KRW',
                    })
                }}
            />

            <EventButton
                title="begin_lead_form"
                onPress={() => {
                    AdropMetrics.sendEvent('begin_lead_form', {
                        form_id: 'form-1',
                        form_name: 'Contact Us',
                        form_type: 'lead',
                        form_destination: 'sales@example.com',
                    })
                }}
            />

            <EventButton
                title="generate_lead"
                onPress={() => {
                    AdropMetrics.sendEvent('generate_lead', {
                        form_id: 'form-1',
                        form_name: 'Contact Us',
                        form_type: 'lead',
                        form_destination: 'sales@example.com',
                        value: 100,
                        currency: 'KRW',
                    })
                }}
            />

            <EventButton
                title="begin_checkout"
                onPress={() => {
                    AdropMetrics.sendEvent('begin_checkout', {
                        currency: 'KRW',
                        items: [
                            {
                                item_id: 'SKU-001',
                                item_name: '상품A',
                                price: 29900,
                                quantity: 1,
                            },
                            {
                                item_id: 'SKU-002',
                                item_name: '상품B',
                                price: 15000,
                                quantity: 2,
                            },
                        ],
                    })
                }}
            />

            <EventButton
                title="purchase"
                onPress={() => {
                    AdropMetrics.sendEvent('purchase', {
                        tx_id: 'TXN-20240101-001',
                        currency: 'KRW',
                        items: [
                            {
                                item_id: 'SKU-001',
                                item_name: '상품A',
                                item_category: 'Electronics',
                                brand: 'BrandX',
                                price: 29900,
                                quantity: 1,
                            },
                            {
                                item_id: 'SKU-002',
                                item_name: '상품B',
                                price: 15000,
                                quantity: 2,
                            },
                        ],
                    })
                }}
            />
        </ScrollView>
    )
}

const EventButton: React.FC<{ title: string; onPress: () => void }> = ({
    title,
    onPress,
}) => (
    <TouchableOpacity style={styles.eventButton} onPress={onPress}>
        <Text style={styles.eventButtonText}>{title}</Text>
    </TouchableOpacity>
)

export default PropertyExample

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingBottom: 60,
    },
    sectionHeader: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 20,
        marginBottom: 8,
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
    eventButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginVertical: 2,
    },
    eventButtonText: {
        color: '#007AFF',
        fontSize: 15,
    },
})
