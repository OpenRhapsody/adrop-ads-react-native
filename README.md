# adrop-ads-react-native

Adrop Ads SDK for React Native

![npm](https://img.shields.io/npm/v/adrop-ads-react-native)

Prerequisites
-------------
* Install your preferred [editor or IDE](https://reactnative.dev/docs/more-resources#ides).
* Make sure that your app meets the following requirements:
    * React Native
      * 0.71 or higher
    * **Android**
        * Targets API level 23 (M) or higher
        * Uses Android 6.0 or higher
            * minSdkVersion 23
        * Uses [Jetpack (AndroidX)](https://developer.android.com/jetpack/androidx/migrate), which includes meeting these version requirements:
            * ```com.android.tools.build:gradle``` v7.3.0 or later
            * ```compileSdkVersion``` 33
        * Kotlin 1.7.10 or higher
    * **iOS**
        * ios 13.0
        * swift 5.0
* [React Native - Setting up the development environment](https://reactnative.dev/docs/environment-setup)
* [Sign into Adrop](https://adrop.io) using your email or Google account.

&nbsp;

### Step 1: Create a Adrop project
Before you can add Adrop to your React Native app, you need to [create a Adrop project](https://adrop.gitbook.io/adrop-docs/guides/get-started-with-adrop#create-a-app-container-publisher-project) to connect to your app.

### Step 2: Register your app with Adrop
To use Adrop in your React Native app, you need to register your app with your Adrop project. Registering your app is often called "adding" your app to your project.

> **Note**
>
> Make sure to enter the package name that your app is actually using. The package name value is case-sensitive, and it cannot be changed for this Adrop Android app after it's registered with your Adrop project.

1. Go to the Adrop console.
2. In the center of the project app page, click the **React** icon button to launch the setup workflow.
3. Enter your app's package name in the **React package name** field.
   * A [package name](https://developer.android.com/studio/build/application-id) uniquely identifies your app on the device and in the Google Play Store or App Store.
   * A package name is often referred to as an application ID.
   * Be aware that the package name value is case-sensitive, and it cannot be changed for this Adrop React app after it's registered with your Adrop project.
4. Enter other app information: **App nickname**.
    * **App nickname**: An internal, convenience identifier that is only visible to you in the Adrop console
5. Click **Register app** and then Android and Apple apps will be created respectively.


### Step 3: Add a Adrop configuration file

#### Android
1. Download **adrop_service.json** to obtain your Adrop Android platforms config file.
2. Move your config file into your assets directory.
   ```android/app/src/main/assets/adrop_service.json```

#### iOS
1. Download **adrop_service.json** to obtain your Adrop Apple platforms config file.
2. Move your config file into the root of your Xcode project. If prompted, select to add the config file to all targets.

### Step 4: Add Adrop library to your your app
1. From your React Native project directory, run the following command to install the plugin.
    ```shell
    npm install adrop-ads-react-native
    ```

2. Altering CocoaPods to use frameworks
Open the file ```./ios/Podfile``` and add this line inside your targets

    ```shell
    use_frameworks!
    ```

    > **Note**
    >
    > **adrop-ads-react-native** uses use_frameworks, which has compatibility issues with Flipper.
    >
    > **Flipper**: use_frameworks [is not compatible with Flipper](https://github.com/reactwg/react-native-releases/discussions/21#discussioncomment-2924919). You need to disable Flipper by commenting out the :flipper_configuration line in your Podfile.

3. Autolinking & rebuilding

    Once the above steps have been completed, the React Native Adrop library must be linked to your project and your application needs to be rebuilt.

    Users on React Native 0.60+ automatically have access to "[autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)", requiring no further manual installation steps. To automatically link the package, rebuild your project:

    ```shell
    # Android apps
    npx react-native run-android

    # iOS apps
    cd ios/
    pod install --repo-update
    cd ..
    npx react-native run-ios
    ```

### Step 5: Initialize Adrop in your app
The final step is to add initialization code to your application.
1. Import the Adrop library and initialize.
    ```js
    import { Adrop } from 'adrop-ads-react-native';

    // ..
    Adrop.initialize(production);
    ```

### (Optional) Troubleshooting
```shell
# Add this line to your Podfile
use_frameworks!

# ...
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|

    #...
    # Add this line to your Podfile
    config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
    end
  end
end
```

### Display AdropBanner

```js
const YourComponent: React.FC = () => {
    const ref = useRef(null)

    const reload = () => {
        ref.current?.load()
    }

    return (
        <View>
            <Button title="reload" onPress={reload}/>
            <AdropBanner
                ref={ref}
                unitId={unitId}
                style={{
                    width: Dimensions.get('window').width,
                    height: 80
                }}
            />
        </View>
    )
}
```
