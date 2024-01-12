import { AdropErrorCode, AdropInterstitialAd } from '../src'
import { DeviceEventEmitter, NativeModules } from 'react-native'
import { AdropChannel, AdropMethod } from '../src/bridge'
import { AdType } from '../src/ads/AdropAd'

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native')
    RN.NativeModules.AdropAds = {
        initialize: jest.fn(),
    }

    const eventEmitter = {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
        create: jest.fn(),
        load: jest.fn(),
        show: jest.fn(),
        destroy: jest.fn(),
    }

    RN.NativeModules.EventEmitter = eventEmitter
    RN.NativeModules.AdropInterstitialAd = eventEmitter
    RN.NativeModules.AdropRewardedAd = eventEmitter

    // mock modules created through UIManager
    RN.UIManager.getViewManagerConfig = (name: string) => {
        if (name === 'AdropAds') {
            return { initialize: jest.fn() }
        }
        return {}
    }
    return RN
})

describe('AdropInterstitialAdTest', () => {
    const unitId = 'PUBLIC_TEST_UNIT_ID_INTERSTITIAL'
    const invalidUnitId = 'PUBLIC_TEST_UNIT_ID_INVALID'
    let interstitialAd: AdropInterstitialAd

    beforeEach(() => {
        if (interstitialAd) {
            interstitialAd.destroy()
            expect(NativeModules.AdropInterstitialAd.destroy).toBeCalledTimes(1)
        }
        interstitialAd = new AdropInterstitialAd(unitId)
        expect(NativeModules.AdropInterstitialAd.create).toBeCalledTimes(1)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('handleEvent test', () => {
        test('handle event', () => {
            interstitialAd.listener = {
                onAdReceived: (_) => expect(_).toBe(unitId),
                onAdClicked: (_) => expect(_).toBe(unitId),
                onAdImpression: (_) => expect(_).toBe(unitId),
                onAdDidDismissFullScreen: (_) => expect(_).toBe(unitId),
                onAdWillDismissFullScreen: (_) => expect(_).toBe(unitId),
                onAdDidPresentFullScreen: (_) => expect(_).toBe(unitId),
                onAdWillPresentFullScreen: (_) => expect(_).toBe(unitId),
                onAdFailedToReceive: (_) => expect(_).toBe(unitId),
                onAdFailedToShowFullScreen: (_) => expect(_).toBe(unitId),
                onAdEarnRewardHandler: (_) => expect(_).toBe(unitId),
            }

            sendEvent(unitId, AdropMethod.didReceiveAd)
            sendEvent(unitId, AdropMethod.didClickAd)
            sendEvent(unitId, AdropMethod.didImpression)
            sendEvent(unitId, AdropMethod.didDismissFullScreen)
            sendEvent(unitId, AdropMethod.willDismissFullScreen)
            sendEvent(unitId, AdropMethod.didPresentFullScreen)
            sendEvent(unitId, AdropMethod.willPresentFullScreen)
            sendEvent(unitId, AdropMethod.didFailToReceiveAd)
            sendEvent(unitId, AdropMethod.didFailToShowFullScreen)
            sendEvent(unitId, AdropMethod.handleEarnReward)
        })

        test('filter events of different unitId', () => {
            interstitialAd.listener = {
                onAdReceived: (_) => {
                    throw new Error('diff unitId')
                },
                onAdClicked: (_) => {
                    throw new Error('diff unitId')
                },
                onAdImpression: (_) => {
                    throw new Error('diff unitId')
                },
                onAdDidDismissFullScreen: (_) => {
                    throw new Error('diff unitId')
                },
                onAdWillDismissFullScreen: (_) => {
                    throw new Error('diff unitId')
                },
                onAdDidPresentFullScreen: (_) => {
                    throw new Error('diff unitId')
                },
                onAdWillPresentFullScreen: (_) => {
                    throw new Error('diff unitId')
                },
                onAdFailedToReceive: (_) => {
                    throw new Error('diff unitId')
                },
                onAdFailedToShowFullScreen: (_) => {
                    throw new Error('diff unitId')
                },
                onAdEarnRewardHandler: (_) => {
                    throw new Error('diff unitId')
                },
            }

            sendEvent(invalidUnitId, AdropMethod.didReceiveAd)
            sendEvent(invalidUnitId, AdropMethod.didClickAd)
            sendEvent(invalidUnitId, AdropMethod.didImpression)
            sendEvent(invalidUnitId, AdropMethod.didDismissFullScreen)
            sendEvent(invalidUnitId, AdropMethod.willDismissFullScreen)
            sendEvent(invalidUnitId, AdropMethod.didPresentFullScreen)
            sendEvent(invalidUnitId, AdropMethod.willPresentFullScreen)
            sendEvent(invalidUnitId, AdropMethod.didFailToReceiveAd)
            sendEvent(invalidUnitId, AdropMethod.didFailToShowFullScreen)
            sendEvent(invalidUnitId, AdropMethod.handleEarnReward)
        })
    })

    test('interstitial ad received', () => {
        interstitialAd.listener = {
            onAdReceived: (id) => {
                expect(id).toBe(unitId)
            },
        }
        interstitialAd.load()
        sendEvent(unitId, AdropMethod.didReceiveAd)

        expect(NativeModules.AdropInterstitialAd.load).toBeCalledTimes(1)
    })

    test('interstitial ad show', () => {
        interstitialAd.listener = {
            onAdReceived: (id) => expect(id).toBe(unitId),
            onAdDidPresentFullScreen: (id) => expect(id).toBe(unitId),
            onAdImpression: (id) => expect(id).toBe(unitId),
        }

        interstitialAd.load()
        sendEvent(unitId, AdropMethod.didReceiveAd)

        interstitialAd.show()
        sendEvent(unitId, AdropMethod.didPresentFullScreen)
        sendEvent(unitId, AdropMethod.didImpression)

        expect(NativeModules.AdropInterstitialAd.load).toBeCalledTimes(1)
        expect(NativeModules.AdropInterstitialAd.show).toBeCalledTimes(1)
    })

    describe('error', () => {
        test('load before adrop initialize', () => {
            interstitialAd.listener = {
                onAdFailedToReceive: (id, errorCode) => {
                    expect(errorCode).toBe(AdropErrorCode.initialize)
                    expect(id).toBe(unitId)
                },
            }

            interstitialAd.load()

            sendEvent(
                unitId,
                AdropMethod.didFailToReceiveAd,
                AdropErrorCode.initialize
            )

            expect(NativeModules.AdropInterstitialAd.load).toBeCalledTimes(1)
        })

        test('not exist connected campaign (ad)', () => {
            interstitialAd.listener = {
                onAdFailedToReceive: (id, errorCode) => {
                    expect(errorCode).toBe(AdropErrorCode.inactive)
                    expect(id).toBe(unitId)
                },
            }

            interstitialAd.load()

            sendEvent(
                unitId,
                AdropMethod.didFailToReceiveAd,
                AdropErrorCode.inactive
            )

            expect(NativeModules.AdropInterstitialAd.load).toBeCalledTimes(1)
        })

        test('no suitable advertisement available', () => {
            interstitialAd.listener = {
                onAdFailedToReceive: (id, errorCode) => {
                    expect(errorCode).toBe(AdropErrorCode.adNoFill)
                    expect(id).toBe(unitId)
                },
            }

            interstitialAd.load()

            sendEvent(
                unitId,
                AdropMethod.didFailToReceiveAd,
                AdropErrorCode.adNoFill
            )

            expect(NativeModules.AdropInterstitialAd.load).toBeCalledTimes(1)
        })

        test('load again before any response', () => {
            interstitialAd.listener = {
                onAdFailedToReceive: (id, errorCode) => {
                    expect(errorCode).toBe(AdropErrorCode.adLoading)
                    expect(id).toBe(unitId)
                },
            }

            interstitialAd.load()
            interstitialAd.load()

            sendEvent(
                unitId,
                AdropMethod.didFailToReceiveAd,
                AdropErrorCode.adLoading
            )

            expect(NativeModules.AdropInterstitialAd.load).toBeCalledTimes(2)
        })

        test('load again after ad received', () => {
            interstitialAd.listener = {
                onAdReceived: (id) => expect(id).toBe(unitId),
                onAdFailedToReceive: (id, errorCode) => {
                    expect(errorCode).toBe(AdropErrorCode.adDuplicated)
                    expect(id).toBe(unitId)
                },
            }

            interstitialAd.load()
            sendEvent(unitId, AdropMethod.didReceiveAd)

            interstitialAd.load()
            sendEvent(
                unitId,
                AdropMethod.didFailToReceiveAd,
                AdropErrorCode.adDuplicated
            )

            expect(NativeModules.AdropInterstitialAd.load).toBeCalledTimes(2)
        })

        test('show before any response', () => {
            interstitialAd.listener = {
                onAdFailedToShowFullScreen: (id, errorCode) => {
                    expect(errorCode).toBe(AdropErrorCode.adEmpty)
                    expect(id).toBe(unitId)
                },
            }

            interstitialAd.show()
            sendEvent(
                unitId,
                AdropMethod.didFailToReceiveAd,
                AdropErrorCode.adEmpty
            )

            expect(NativeModules.AdropInterstitialAd.show).toBeCalledTimes(1)
        })

        test('show before any response (loading status)', () => {
            interstitialAd.listener = {
                onAdFailedToShowFullScreen: (id, errorCode) => {
                    expect(errorCode).toBe(AdropErrorCode.adLoading)
                    expect(id).toBe(unitId)
                },
            }

            interstitialAd.load()
            interstitialAd.show()
            sendEvent(
                unitId,
                AdropMethod.didFailToReceiveAd,
                AdropErrorCode.adLoading
            )
            expect(NativeModules.AdropInterstitialAd.load).toBeCalledTimes(1)
            expect(NativeModules.AdropInterstitialAd.show).toBeCalledTimes(1)
        })

        test('show again same interstitial ad', () => {
            interstitialAd.listener = {
                onAdFailedToShowFullScreen: (id, errorCode) => {
                    expect(errorCode).toBe(AdropErrorCode.adShown)
                    expect(id).toBe(unitId)
                },
            }

            interstitialAd.show()
            sendEvent(unitId, AdropMethod.didPresentFullScreen)
            sendEvent(unitId, AdropMethod.didImpression)

            interstitialAd.show()
            sendEvent(
                unitId,
                AdropMethod.didFailToReceiveAd,
                AdropErrorCode.adShown
            )

            expect(NativeModules.AdropInterstitialAd.show).toBeCalledTimes(2)
        })
    })

    const sendEvent = (_unitId: String, method: String, errorCode?: String) => {
        DeviceEventEmitter.emit(
            AdropChannel.adropEventListenerChannel(
                AdType.adropInterstitialAd,
                'requestId'
            ),
            {
                method,
                _unitId,
                errorCode: errorCode ?? '',
            }
        )
    }
})
