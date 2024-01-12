import { Adrop, AdropErrorCode, AdropBanner } from '../src'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import React, { useRef, useState } from 'react'
import { Button, DeviceEventEmitter, Text, View } from 'react-native'
import { AdropChannel, AdropMethod } from '../src/bridge'

interface IAdropBanner {
    load: () => void
}

const Example: React.FC<{
    unitId: string
    onClickLoad: () => void
    autoLoad?: boolean
}> = ({ unitId, onClickLoad, autoLoad = true }) => {
    const bannerRef = useRef<IAdropBanner>(null)
    const [text, setText] = useState('')

    const handleReceived = () => {
        act(() => {
            setText('received')
        })
    }

    const handleClicked = () => {
        act(() => {
            setText('clicked')
        })
    }

    const handleFailedToReceive = (_: string, error: string) => {
        act(() => {
            setText(error)
        })
    }

    const onClickLoadButton = () => {
        onClickLoad()
        bannerRef.current?.load()
    }

    return (
        <View>
            <Button
                title={'request ad'}
                testID="requestAd"
                onPress={onClickLoadButton}
            />
            <View testID="bannerWrapper">
                <AdropBanner
                    ref={bannerRef}
                    style={{ width: 100, height: 80 }}
                    unitId={unitId}
                    autoLoad={autoLoad}
                    onAdReceived={handleReceived}
                    onAdClicked={handleClicked}
                    onAdFailedToReceive={handleFailedToReceive}
                />
            </View>
            <Text testID="status">{text}</Text>
        </View>
    )
}

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropAds = {
        initialize: jest.fn(),
    }
    const eventEmitter = {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    }

    RN.NativeModules.BannerEventEmitter = eventEmitter
    RN.NativeModules.EventEmitter = eventEmitter
    RN.NativeModules.AdropInterstitialAd = eventEmitter
    RN.NativeModules.AdropRewardedAd = eventEmitter

    RN.UIManager.getViewManagerConfig = (name: string) => {
        if (name === 'AdropAds') {
            return { initialize: jest.fn() }
        }
        return {}
    }
    return RN
})

describe('AdropBanner Test', () => {
    const unitId = 'PUBLIC_TEST_UNIT_ID_320_50'
    const invalidId = 'INVALID_TEST_UNIT_ID'
    const onClickMock = jest.fn()
    let tag = 3

    const checkStatus = (status: string) => {
        const element = screen.getByTestId('status')
        expect(element.props.children).toBe(status)
    }

    beforeAll(() => {
        Adrop.initialize(false)
    })

    afterEach(() => ++tag)

    test('auto load successfully', () => {
        render(<Example unitId={unitId} onClickLoad={onClickMock} />)
        // onAdBannerCreated callback
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didReceiveAd,
            tag,
        })

        checkStatus('received')
    })

    test('disable auto load', () => {
        render(
            <Example
                unitId={unitId}
                onClickLoad={onClickMock}
                autoLoad={false}
            />
        )
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })

        checkStatus('')
    })

    test('disable auto load, click reload', () => {
        render(
            <Example
                unitId={unitId}
                onClickLoad={onClickMock}
                autoLoad={false}
            />
        )
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })

        checkStatus('')

        fireEvent.press(screen.getByTestId('requestAd'))
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didReceiveAd,

            tag,
        })

        expect(onClickMock).toHaveBeenCalled()
        checkStatus('received')
    })

    test('banner when app has no campaigns (inactive from remote config) ', () => {
        render(<Example unitId={unitId} onClickLoad={onClickMock} />)
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })

        fireEvent.press(screen.getByTestId('requestAd'))
        expect(onClickMock).toHaveBeenCalled()

        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didFailToReceiveAd,

            errorCode: AdropErrorCode.inactive,
            tag,
        })

        checkStatus(AdropErrorCode.inactive)
    })

    test('banner when app has no campaigns (active from remote config) ', () => {
        render(<Example unitId={unitId} onClickLoad={onClickMock} />)
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })

        fireEvent.press(screen.getByTestId('requestAd'))
        expect(onClickMock).toHaveBeenCalled()

        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didFailToReceiveAd,

            errorCode: AdropErrorCode.adNoFill,
            tag,
        })

        checkStatus(AdropErrorCode.adNoFill)
    })

    test('banner received ad successfully', () => {
        render(<Example unitId={unitId} onClickLoad={onClickMock} />)
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })

        fireEvent.press(screen.getByTestId('requestAd'))
        expect(onClickMock).toHaveBeenCalled()

        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didReceiveAd,

            tag,
        })

        checkStatus('received')
    })

    test('banner receive to fail with invalid unitId', () => {
        render(<Example unitId={invalidId} onClickLoad={onClickMock} />)
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })

        fireEvent.press(screen.getByTestId('requestAd'))
        expect(onClickMock).toHaveBeenCalled()

        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didFailToReceiveAd,

            errorCode: AdropErrorCode.adNoFill,
            tag,
        })

        checkStatus(AdropErrorCode.adNoFill)
    })

    test('banner receive to fail with empty unitId', () => {
        render(<Example unitId={''} onClickLoad={onClickMock} />)
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })

        fireEvent.press(screen.getByTestId('requestAd'))
        expect(onClickMock).toHaveBeenCalled()

        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didFailToReceiveAd,

            errorCode: AdropErrorCode.inactive,
            tag,
        })

        checkStatus(AdropErrorCode.inactive)
    })

    test('banner clicked', () => {
        render(<Example unitId={unitId} onClickLoad={onClickMock} />)
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didCreatedBanner,
            tag,
        })

        fireEvent.press(screen.getByTestId('requestAd'))
        expect(onClickMock).toHaveBeenCalled()

        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didReceiveAd,

            tag,
        })
        checkStatus('received')

        // const bannerView = screen.getByTestId('bannerWrapper').props.children[0]    // press not work
        fireEvent.press(screen.getByTestId('bannerWrapper'))
        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didClickAd,

            tag,
        })
        checkStatus('clicked')

        DeviceEventEmitter.emit(AdropChannel.bannerEventListenerChannel, {
            method: AdropMethod.didReceiveAd,

            tag,
        })
        checkStatus('received')
    })
})
