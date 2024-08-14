import React, { useCallback, useContext, useEffect, useRef } from 'react'
import type { ViewProps } from 'react-native'
import { findNodeHandle, requireNativeComponent } from 'react-native'
import { AdropNativeContext } from '../contexts/AdropNativeContext'

const WebView = requireNativeComponent<{ data: string } & ViewProps>(
    'AdropWebView'
)

const AdropMediaView: React.FC<ViewProps> = (props) => {
    const { nativeAd, nativeAdView } = useContext(AdropNativeContext)

    const mediaRef = useRef(null)
    const onLayout = useCallback(() => {
        const tag = findNodeHandle(mediaRef.current) ?? 0
        tag > 0 &&
            nativeAdView?.setNativeProps({
                mediaView: {
                    tag: findNodeHandle(mediaRef.current) ?? 0,
                    requestId: nativeAd?.requestId,
                },
            })
    }, [nativeAd, nativeAdView])

    useEffect(() => {
        onLayout()
    }, [onLayout, nativeAdView, nativeAd])

    return (
        <WebView
            ref={mediaRef}
            data={nativeAd?.properties?.creative ?? DATA}
            {...props}
        />
    )
}

export default AdropMediaView

const DATA = `<html lang='ko'>

<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' />
<meta charset='UTF-8' />
<style>
    @font-face {
        font-family: 'Pretendard';
        font-style: normal;
        font-weight: 600;
        font-display: block;
        src: url('https://s3.ap-northeast-2.amazonaws.com/storage.adrop.io/public/fonts/Pretendard-SemiBold.woff2')
    }

    @font-face {
        font-family: 'Pretendard';
        font-style: normal;
        font-weight: 500;
        font-display: block;
        src: url('https://s3.ap-northeast-2.amazonaws.com/storage.adrop.io/public/fonts/Pretendard-Medium.woff2')
    }
</style>
<style>
    @keyframes colorTransition {
        0% {
            color: #B0B8C6;
            background-color: #F5F7FA;
        }
        100% {
            color: #FFFFFF;
            background-color: #00C2DB;
        }
    }
</style>
<body style='padding:0;margin:0'>
<div id='adrop-native-0adb29c2bec96' class='adrop-native-0adb29c2bec96' style='flex:auto;flex-direction:column;max-width:720px;position:relative;overflow:hidden'>
    <div class='adrop-creative-0adb29c2bec96' style='width:100%;aspect-ratio:1;line-height:0'><img src='https://s3.ap-northeast-2.amazonaws.com/storage.adrop.io/public/test_templates/Native_360x360.png' alt='네이티브 360x360'
                                                                                                   style='width:100%;object-fit:cover;border:0;aspect-ratio:1'
                                                                                                   onload='(function(){function adjustFontSize() {
const element = document.getElementById("adrop-native-0adb29c2bec96")
const width = element.offsetWidth
const scale = width / 360

const cta = document.getElementById("native-cta")
const svg = document.getElementById("native-svg")
const watermark = document.getElementById("native-watermark")
cta.style.fontSize = 14 * scale + "px"
cta.style.padding = 10 * scale + "px " + 20 * scale + "px"
svg.style.width = 24 * scale + "px"
svg.style.height = 24 * scale + "px"
watermark.style.top = 16 * scale + "px"
watermark.style.right = 16 * scale + "px"
watermark.style.width = 34 * scale + "px"
watermark.style.height = 22 * scale + "px"
watermark.style.fontSize = 13 * scale + "px"
}
adjustFontSize()
window.onresize = adjustFontSize;}).call(this)'
    /></div>
    <a id='native-cta' target='_blank' rel='noopener noreferrer' href='https://adrop.io' style='background-color:#F5F7FA;color:#B0B8C6;display:flex;align-items:center;justify-content:space-between;animation:colorTransition 500ms forwards 600ms;text-decoration:none'>
        <div style='font-family:Pretendard;font-weight:600'>더 알아보기</div>
        <svg id='native-svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' style='width:24px;height:24px'>
            <path stroke-linecap='round' stroke-linejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5'></path>
        </svg>
    </a>
    <div id='native-watermark' style='position:absolute;border-radius:100px;background-color:#1A1B1E4D;font-weight:500;color:white;display:flex;align-items:center;justify-content:center'>AD</div>
</div>
</body>
</html>`
