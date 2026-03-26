import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

const Intro = ({ setShowIntroPage }) => {
  const { language } = useLanguage()
  const scaleAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const titleSlide = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 0,
        friction: 8,
        tension: 30,
        useNativeDriver: true,
      }).start()
    }, 2000)
    setTimeout(() => { setShowIntroPage(false) }, 2500)
  }, [])

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
      ]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: titleSlide }] }]}>
        <View style={styles.iconCircle}>
          <Icon name="music-note" color="#fff" size={40} />
        </View>
        <Text style={styles.title}>Koma</Text>
        <Text style={styles.subtitle}>{t(language, 'intro.subtitle')}</Text>
      </Animated.View>
      <View style={styles.activityIndicator}>
        <ActivityIndicator size='large' color='#E45A84' />
      </View>
    </Animated.View>
  )
}

export default Intro

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#1B1B2F',
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E45A84',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#E45A84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F0E6D3',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9090B0',
    marginTop: 6,
    letterSpacing: 1,
  },
  activityIndicator: {
    position: 'absolute',
    bottom: 120,
  },
})
