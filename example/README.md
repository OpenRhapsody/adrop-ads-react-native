# Adrop Ads — React Native Example

Demo app for `adrop-ads-react-native`. It also serves as the **New Architecture
(Fabric / TurboModule / bridgeless) harness**: one example runs on either
architecture via a build flag, so you can verify the SDK on both and reproduce
the publisher banner-freeze case.

- **React Native** 0.78 · **React** 19
- Runs on **both architectures** — pick one with the flags in [Running per architecture](#running-per-architecture).

## What it demonstrates

| Screen | Contents |
|--------|----------|
| **Guide** | Overview of every ad format (banner · native · interstitial · rewarded · popup · splash) |
| **Developer** | Load / show each ad type, native-ad asset binding, consent (UMP), metrics |
| **Splash** | App-launch splash ad (the Android launch activity) |

## Setup

The example is a Yarn workspace of the `react-native/` package. All commands below
run from `react-native/`.

```bash
yarn install              # install workspace deps (once)
yarn example start        # Metro bundler
```

## Running per architecture

The active architecture is whatever you build with — set the flag explicitly for
the arch you want to test.

### iOS

Reinstall Pods with the matching flag, then run `yarn example ios`:

| Arch | Pod install |
|------|-------------|
| **New Arch (Fabric)** | `cd example/ios && RCT_NEW_ARCH_ENABLED=1 bundle exec pod install` |
| **Old Arch (interop)** | `cd example/ios && RCT_NEW_ARCH_ENABLED=0 bundle exec pod install` |

> After switching arch: reinstall Pods, then **Xcode → Clean Build Folder (⇧⌘K)**.

### Android

Set `newArchEnabled` in `example/android/gradle.properties` (ships as `false`),
then run `yarn example android`:

| Arch | Setting |
|------|---------|
| **New Arch (Fabric)** | `newArchEnabled=true` |
| **Old Arch** | `newArchEnabled=false` |

> After switching arch: `cd example/android && ./gradlew clean`.

## Notes

- Test unit IDs live in [`src/TestUnitIds.ts`](src/TestUnitIds.ts) and
  [`src/constants/AdropUnitId.ts`](src/constants/AdropUnitId.ts).
- Reload the JS bundle: Android `Ctrl/Cmd + M` → Reload · iOS `Cmd + R`.
