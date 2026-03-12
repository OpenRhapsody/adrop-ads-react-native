import React from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { Colors } from '../theme/colors'
import { Typography } from '../theme/typography'
import { CommonStyles } from '../theme/styles'

const AD_FORMATS = [
    {
        name: '배너 광고 (Banner)',
        desc: '화면 상·하단에 표시되는 직사각형 광고\n\n• 동영상  16:9 / 9:16\n• 이미지   375×80 / 320×50',
    },
    {
        name: '네이티브 광고 (Native)',
        desc: '앱 디자인에 자연스럽게 녹아드는 맞춤형 광고\n\n구성: 프로필 · 헤드라인 · 미디어 · 본문 · CTA 버튼',
    },
    {
        name: '전면 광고 (Interstitial)',
        desc: '전체 화면으로 표시되는 광고\n\n페이지 이동, 앱 종료 등 자연스러운 전환 시점에 노출을 권장합니다.',
    },
    {
        name: '보상형 광고 (Rewarded)',
        desc: '동영상 시청 후 앱 내 보상을 제공하는 광고\n\n• 지원 포맷  9:16 동영상',
    },
    {
        name: '팝업 광고 (Popup)',
        desc: '화면 위에 오버레이로 표시되는 광고\n\n• 위치  하단 / 중앙\n• 오늘 하루 보지 않기 · 커스텀 스타일링 지원',
    },
    {
        name: '스플래시 광고 (Splash)',
        desc: '앱 실행 시 전체 화면으로 표시되는 광고\n\n• 자동 닫기 타이머 · 건너뛰기 옵션 제공',
    },
]

const DescriptionCard: React.FC<{ text: string }> = ({ text }) => (
    <View style={[CommonStyles.card, styles.cardNoMargin]}>
        <Text style={styles.descText}>{text}</Text>
    </View>
)

const GuideScreen: React.FC = () => {
    return (
        <ScrollView style={styles.screen}>
            <View style={styles.content}>
                <Text style={[Typography.screenTitle, styles.mb16]}>
                    개발자 가이드
                </Text>

                {/* SDK 초기화 */}
                <Text style={[Typography.sectionTitle, styles.mb12]}>
                    SDK 초기화
                </Text>
                <DescriptionCard
                    text={
                        'useEffect 또는 앱 시작 시점에서 초기화합니다.\n\n' +
                        '• Production  Adrop.initialize(true)\n' +
                        '• Debug          Adrop.initialize(false)\n\n' +
                        '⚠ Debug 모드에서는 테스트 광고가 노출됩니다.\n' +
                        '     출시 전 반드시 Production으로 전환하세요.'
                    }
                />

                <View style={CommonStyles.divider} />

                {/* 광고 포맷 */}
                <Text style={[Typography.sectionTitle, styles.mb12]}>
                    광고 포맷
                </Text>
                {AD_FORMATS.map((format, i) => (
                    <View
                        key={i}
                        style={[
                            CommonStyles.card,
                            styles.cardNoMargin,
                            i > 0 && styles.mt8,
                        ]}
                    >
                        <Text style={styles.formatTitle}>{format.name}</Text>
                        <Text style={[Typography.caption, styles.mt4]}>
                            {format.desc}
                        </Text>
                    </View>
                ))}

                <View style={CommonStyles.divider} />

                {/* 속성 설정 */}
                <Text style={[Typography.sectionTitle, styles.mb12]}>
                    속성 설정
                </Text>
                <DescriptionCard
                    text={
                        '사용자 속성을 키-값 쌍으로 설정합니다.\n\n' +
                        'AdropMetrics.setProperty(key, value)\n\n' +
                        '지원 타입\n' +
                        'string · number · boolean · null\n\n' +
                        '예시\n' +
                        'setProperty("age", 25)\n' +
                        'setProperty("gender", "male")\n' +
                        'setProperty("premium", true)'
                    }
                />

                <View style={CommonStyles.divider} />

                {/* 동의 관리 */}
                <Text style={[Typography.sectionTitle, styles.mb12]}>
                    동의 관리
                </Text>
                <DescriptionCard
                    text={
                        'GDPR 등 개인정보 보호 규정에 대응합니다.\n\n' +
                        '1. AdropConsent 모듈 import\n' +
                        '2. requestConsentInfoUpdate()로 동의 상태 요청\n' +
                        '3. Promise로 결과 수신\n\n' +
                        '동의 상태에 따라 광고 요청 및 맞춤 광고 노출 여부가 결정됩니다.'
                    }
                />

                <View style={styles.spacerV} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 16,
    },
    formatTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    descText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    cardNoMargin: {
        marginHorizontal: 0,
    },
    mb16: {
        marginBottom: 16,
    },
    mb12: {
        marginBottom: 12,
    },
    mt8: {
        marginTop: 8,
    },
    mt4: {
        marginTop: 4,
    },
    spacerV: {
        height: 16,
    },
})

export default GuideScreen
