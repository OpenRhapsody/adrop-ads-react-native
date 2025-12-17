# Adrop Ads Example - React Native

Example applications demonstrating how to integrate [Adrop Ads SDK](https://adrop.io) in React Native.

![npm](https://img.shields.io/npm/v/adrop-ads-react-native)
![license](https://img.shields.io/npm/l/adrop-ads-react-native)
![platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![typescript](https://img.shields.io/badge/TypeScript-supported-blue)

Language: English | [한국어](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/README.ko.md)

## Getting Started

- [Adrop Console](https://console.adrop.io) - Register your app and issue ad unit IDs
- [Adrop Developer Docs](https://docs.adrop.io/sdk/react-native) - SDK integration and advanced features
- [Test Ad Unit IDs](https://docs.adrop.io/sdk#test-environment) - Use test IDs during development

## Examples

### Adrop Ads

|  | Example |
|--|---------|
| Banner | [BannerExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/BannerExample.tsx) |
| Interstitial (Class) | [InterstitialAdClassExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/InterstitialAdClassExample.tsx) |
| Interstitial (Hook) | [InterstitialAdHookExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/InterstitialAdHookExample.tsx) |
| Rewarded (Class) | [RewardedAdClassExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/RewardedAdClassExample.tsx) |
| Rewarded (Hook) | [RewardedAdHookExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/RewardedAdHookExample.tsx) |
| Native | [NativeAdExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/NativeAdExample.tsx) |
| Popup | [PopupAdClassExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/PopupAdClassExample.tsx) |

### Targeting

|  | Example |
|--|---------|
| Property & Event | [PropertyExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/PropertyExample.tsx) |


## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/OpenRhapsody/adrop-ads-react-native.git
```

### 2. Install dependencies

```bash
cd adrop-ads-react-native
yarn install
```

### 3. Add configuration file

Download `adrop_service.json` from [Adrop Console](https://adrop.io) and place it in:

**Android:**
```
example/android/app/src/main/assets/adrop_service.json
```

**iOS:**

> **Note:** For iOS, you must add the configuration file through Xcode. Simply placing the file in the directory is not enough.

1. Open `example/ios/AdropAdsExample.xcworkspace` in Xcode
2. Drag and drop `adrop_service.json` into your project navigator
3. Make sure "Copy items if needed" is checked and the file is added to the target

### 4. Build and run

```bash
# Android
cd example
yarn android

# iOS
cd example/ios
pod install
cd ..
yarn ios
```
