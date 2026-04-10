import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, FlatList } from 'react-native'
import React, { useState, useRef } from 'react'
import { Icon } from 'react-native-elements'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLanguage } from '../../../i18n/LanguageContext'
import { t } from '../../../i18n/translations'
import { COLORS } from '../../shared/theme/colors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const ONBOARDING_KEY = '@onboarding_seen'

export const hasSeenOnboarding = async () => {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY)
  return val === 'true'
}

export const markOnboardingSeen = async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
}

const SLIDES = [
  {
    key: 'welcome',
    icon: 'music-note',
    iconBg: COLORS.accent,
  },
  {
    key: 'makams',
    icon: 'queue-music',
    iconBg: '#2D8B84',
  },
  {
    key: 'rhythms',
    icon: 'graphic-eq',
    iconBg: '#CC7A3A',
  },
  {
    key: 'practice',
    icon: 'timer',
    iconBg: '#6B4C8A',
  },
]

const OnboardingScreen = ({ onComplete }) => {
  const { language } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
    } else {
      handleFinish()
    }
  }

  const handleSkip = () => {
    handleFinish()
  }

  const handleFinish = async () => {
    await markOnboardingSeen()
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      onComplete()
    })
  }

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  const renderSlide = ({ item, index }) => (
    <View style={styles.slide}>
      <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
        <Icon name={item.icon} type="material" color="#fff" size={48} />
      </View>
      <Text style={styles.slideTitle}>{t(language, `onboarding.${item.key}_title`)}</Text>
      <Text style={styles.slideDesc}>{t(language, `onboarding.${item.key}_desc`)}</Text>
    </View>
  )

  const isLast = currentIndex === SLIDES.length - 1

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7} accessibilityLabel="Skip" accessibilityRole="button">
        <Text style={styles.skipText}>{t(language, 'onboarding.skip')}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} accessibilityLabel={`Slide ${i + 1} of ${SLIDES.length}`} accessibilityRole="image" />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8} accessibilityLabel={isLast ? "Start" : "Next"} accessibilityRole="button">
          <Text style={styles.nextText}>
            {isLast ? t(language, 'onboarding.start') : t(language, 'onboarding.next')}
          </Text>
          <Icon name={isLast ? 'check' : 'arrow-forward'} color="#fff" size={18} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

export default OnboardingScreen

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg,
    zIndex: 100,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: COLORS.textDim,
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  slideDesc: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textDim,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
