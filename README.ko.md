# Adrop Ads Example - React Native

React Native에서 [Adrop Ads SDK](https://adrop.io)를 연동하는 예제 앱입니다.

![npm](https://img.shields.io/npm/v/adrop-ads-react-native)
![license](https://img.shields.io/npm/l/adrop-ads-react-native)
![platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![typescript](https://img.shields.io/badge/TypeScript-supported-blue)

Language: [English](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/README.md) | 한국어

## 시작하기

- [Adrop 콘솔](https://console.adrop.io) - 앱 등록 및 광고 단위 ID 발급
- [Adrop 개발자 문서](https://docs.adrop.io/ko/sdk/flutter) - SDK 연동 및 고급 기능
- [테스트 광고 단위 ID](https://docs.adrop.io/ko/sdk#테스트-환경) - 개발 중 테스트용 ID

## 예제

### Adrop Ads

|  | 예제 |
|--|------|
| 배너 | [BannerExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/BannerExample.tsx) |
| 전면 (Class) | [InterstitialAdClassExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/InterstitialAdClassExample.tsx) |
| 전면 (Hook) | [InterstitialAdHookExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/InterstitialAdHookExample.tsx) |
| 보상형 (Class) | [RewardedAdClassExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/RewardedAdClassExample.tsx) |
| 보상형 (Hook) | [RewardedAdHookExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/RewardedAdHookExample.tsx) |
| 네이티브 | [NativeAdExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/NativeAdExample.tsx) |
| 팝업 | [PopupAdClassExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/PopupAdClassExample.tsx) |

### 타겟팅

|  | 예제 |
|--|------|
| 속성 & 이벤트 | [PropertyExample.tsx](https://github.com/OpenRhapsody/adrop-ads-react-native/blob/master/example/src/views/PropertyExample.tsx) |


## 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/OpenRhapsody/adrop-ads-react-native.git
```

### 2. 의존성 설치

```bash
cd adrop-ads-react-native
yarn install
```

### 3. 설정 파일 추가

[Adrop 콘솔](https://adrop.io)에서 `adrop_service.json`을 다운로드하고 다음 경로에 배치합니다:

**Android:**
```
example/android/app/src/main/assets/adrop_service.json
```

**iOS:**

> **주의:** iOS의 경우 Xcode를 통해 설정 파일을 추가해야 합니다. 단순히 디렉토리에 파일을 배치하는 것만으로는 충분하지 않습니다.

1. Xcode에서 `example/ios/AdropAdsExample.xcworkspace`를 엽니다
2. `adrop_service.json` 파일을 프로젝트 네비게이터로 드래그 앤 드롭합니다
3. "Copy items if needed"가 체크되어 있고 파일이 타겟에 추가되었는지 확인합니다

### 4. 빌드 및 실행

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
