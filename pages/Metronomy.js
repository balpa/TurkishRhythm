import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'

const COLORS = {
  bg: '#1B1B2F',
  surface: '#262640',
  accent: '#E45A84',
  gold: '#C9B458',
  border: '#3A3A5C',
  text: '#F0E6D3',
  textDim: '#9090B0',
  cardBg: '#1F1F38',
}

const Metronomy = () => {
  const MILLISECONDS_TEXT = 'milisaniye'
  const BETWEEN_TAPS_TEXT = 'vuruşlar arası'
  const HIT_BUTTON_TEXT = 'dokun'
  const RESET_BUTTON_TEXT = 'sıfırla'
  const infoText = `Bu uygulamanın amacı, butona her basışınızda, bir önceki basışınız arasındaki farkı hesaplayıp milisaniye cinsinden ekrana yazdırarak ritim duyunuzun performansını göstermek ve pratik yaparak gelişmesine katkıda bulunmaktır.`

  const [time, setTime] = useState('başla')
  const [timeArray, setTimeArray] = useState([])
  const [previousTime, setPreviousTime] = useState(0)
  const [msColor, setMsColor] = useState(COLORS.text)
  const [openInfoPanel, setOpenInfoPanel] = useState(false)
  const [score, setScore] = useState(0)
  const [tapCount, setTapCount] = useState(0)

  const previousTimeRef = useRef(0)

  const yAnim = useRef(new Animated.Value(500)).current
  const scaleAnim = useRef(new Animated.Value(0)).current
  const infoPanelPositionAnim = useRef(new Animated.Value(-200)).current
  const topAnimDependingOnInfoContainer = useRef(new Animated.Value(75)).current
  const msContainerScaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(yAnim, {
        toValue: 0,
        friction: 4,
        tension: 5,
        useNativeDriver: false
      }).start()

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 5,
        useNativeDriver: false
      }).start()
    }, 500)
  }, [])

  // color feedback based on consistency between consecutive intervals
  useEffect(() => {
    if (timeArray.length < 2) return
    const lastDiff = timeArray[timeArray.length - 1]
    const prevDiff = timeArray[timeArray.length - 2]
    const variance = Math.abs(lastDiff - prevDiff)

    if (variance < 30) {
      setMsColor('#4ADE80')
      setScore(s => s + 2)
    } else if (variance < 60) {
      setMsColor(COLORS.gold)
      setScore(s => s + 1)
    } else if (variance < 100) {
      setMsColor('#FB923C')
      setScore(s => Math.max(0, s - 1))
    } else {
      setMsColor(COLORS.accent)
      setScore(s => Math.max(0, s - 2))
    }
  }, [timeArray.length])

  // trim array to prevent memory growth
  useEffect(() => {
    if (timeArray.length > 50) {
      setTimeArray(prev => prev.slice(-10))
    }
  }, [timeArray.length])

  useEffect(() => {
    bounceAnimation()
  }, [time])

  const calculateTimeDifference = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 75,
      useNativeDriver: false
    }).start(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 75,
        useNativeDriver: false
      }).start()
    })

    const now = Date.now()

    if (previousTimeRef.current === 0) {
      previousTimeRef.current = now
      setPreviousTime(now)
      setTapCount(1)
      return
    }

    const diff = now - previousTimeRef.current
    previousTimeRef.current = now
    setPreviousTime(now)

    setTime(diff)
    setTapCount(c => c + 1)
    setTimeArray(old => [...old, diff])
  }

  const reset = () => {
    setTime('başla')
    setPreviousTime(0)
    previousTimeRef.current = 0
    setTimeArray([])
    setScore(0)
    setTapCount(0)
    setMsColor(COLORS.text)
  }

  const expandInfoPanel = () => {
    if (!openInfoPanel) {
      setOpenInfoPanel(true)
      Animated.timing(topAnimDependingOnInfoContainer, {
        toValue: 150,
        duration: 450,
        useNativeDriver: false
      }).start()
      Animated.timing(infoPanelPositionAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false
      }).start()
    } else {
      Animated.timing(topAnimDependingOnInfoContainer, {
        toValue: 75,
        duration: 450,
        useNativeDriver: false
      }).start()
      Animated.timing(infoPanelPositionAnim, {
        toValue: -200,
        duration: 400,
        useNativeDriver: false
      }).start()
      setTimeout(() => { setOpenInfoPanel(false) }, 450)
    }
  }

  const bounceAnimation = () => {
    Animated.timing(msContainerScaleAnim, {
      toValue: 1.02,
      duration: 50,
      useNativeDriver: false
    }).start(() => {
      Animated.timing(msContainerScaleAnim, {
        toValue: 0.98,
        duration: 50,
        useNativeDriver: false
      }).start(() => {
        Animated.timing(msContainerScaleAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: false
        }).start()
      })
    })
  }

  const getScoreLabel = () => {
    if (tapCount < 3) return ''
    if (score > 15) return 'Mükemmel!'
    if (score > 8) return 'Harika'
    if (score > 3) return 'İyi'
    return 'Pratik yap'
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => expandInfoPanel()}
        style={styles.infoButton}>
        <Icon
          name={openInfoPanel ? 'close' : 'info-outline'}
          color={COLORS.textDim}
          size={22}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          { width: '85%', marginTop: 10 },
          { transform: [{ translateY: infoPanelPositionAnim }] }
        ]}>
        {openInfoPanel && (
          <View style={styles.infoPanelCard}>
            <Text style={styles.infoPanelText}>{infoText}</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[
        styles.msInfoContainer,
        { transform: [{ scale: msContainerScaleAnim }] },
        { top: topAnimDependingOnInfoContainer }]}>
        <Text style={[styles.msText, { color: msColor }]}>
          {time}{"\n"}
          <Text style={styles.msLabel}>{MILLISECONDS_TEXT}{'\n'}</Text>
          <Text style={styles.msSubLabel}>{BETWEEN_TAPS_TEXT}</Text>
        </Text>
        {tapCount >= 3 && (
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: msColor }]}>
              {getScoreLabel()} ({score})
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[
        styles.hitMeButton,
        { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.fullCenter}
          activeOpacity={0.7}
          onPress={() => calculateTimeDifference()}>
          <Text style={styles.hitMeText}>{HIT_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[
        styles.resetButton,
        { transform: [{ translateY: yAnim }] }]}>
        <TouchableOpacity style={styles.resetTouchable} activeOpacity={0.7} onPress={() => reset()}>
          <Text style={styles.resetText}>{RESET_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

export default Metronomy

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height: "100%",
    width: "100%",
    backgroundColor: COLORS.bg,
  },
  infoButton: {
    position: 'absolute',
    right: 12,
    top: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  infoPanelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoPanelText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDim,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  msInfoContainer: {
    position: 'absolute',
    width: '90%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  msText: {
    padding: 1,
    fontSize: 80,
    fontWeight: "900",
    textAlign: 'center',
    position: 'absolute',
    paddingBottom: 25,
  },
  msLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDim,
  },
  msSubLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textDim,
  },
  scoreContainer: {
    position: 'absolute',
    bottom: 12,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hitMeButton: {
    width: '75%',
    height: 90,
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    position: 'absolute',
    bottom: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  hitMeText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  resetButton: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: COLORS.surface,
    width: '75%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetTouchable: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 28,
    color: COLORS.textDim,
    fontWeight: '800',
    letterSpacing: 1,
  },
  fullCenter: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
