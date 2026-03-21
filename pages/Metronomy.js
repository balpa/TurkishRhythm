import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Easing, Modal } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TAP_BUTTON_SIZE = SCREEN_WIDTH * 0.48

const COLORS = {
  bg: '#1B1B2F',
  surface: '#262640',
  accent: '#E45A84',
  gold: '#C9B458',
  green: '#4ADE80',
  orange: '#FB923C',
  border: '#3A3A5C',
  text: '#F0E6D3',
  textDim: '#9090B0',
}

const MAX_HISTORY_DOTS = 8

const Metronomy = () => {
  const { language } = useLanguage()

  const [time, setTime] = useState(null)
  const [timeArray, setTimeArray] = useState([])
  const [msColor, setMsColor] = useState(COLORS.text)
  const [showInfo, setShowInfo] = useState(false)
  const [score, setScore] = useState(0)
  const [tapCount, setTapCount] = useState(0)
  const [bpm, setBpm] = useState(null)

  const previousTimeRef = useRef(0)

  // Animations
  const entryAnim = useRef(new Animated.Value(0)).current
  const tapScale = useRef(new Animated.Value(1)).current
  const rippleScale = useRef(new Animated.Value(0)).current
  const rippleOpacity = useRef(new Animated.Value(0)).current
  const ripple2Scale = useRef(new Animated.Value(0)).current
  const ripple2Opacity = useRef(new Animated.Value(0)).current
  const msScale = useRef(new Animated.Value(1)).current
  const scoreBarWidth = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const dotAnims = useRef([...Array(MAX_HISTORY_DOTS)].map(() => new Animated.Value(0))).current
  const modalAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
      delay: 300,
    }).start()

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  useEffect(() => {
    if (timeArray.length < 2) return
    const lastDiff = timeArray[timeArray.length - 1]
    const prevDiff = timeArray[timeArray.length - 2]
    const variance = Math.abs(lastDiff - prevDiff)

    let newColor, scoreDelta
    if (variance < 30) { newColor = COLORS.green; scoreDelta = 2 }
    else if (variance < 60) { newColor = COLORS.gold; scoreDelta = 1 }
    else if (variance < 100) { newColor = COLORS.orange; scoreDelta = -1 }
    else { newColor = COLORS.accent; scoreDelta = -2 }

    setMsColor(newColor)
    setScore(s => Math.max(0, s + scoreDelta))
  }, [timeArray.length])

  useEffect(() => {
    const maxScore = 20
    const targetWidth = Math.min(score / maxScore, 1) * 100
    Animated.spring(scoreBarWidth, { toValue: targetWidth, friction: 8, tension: 60, useNativeDriver: false }).start()
  }, [score])

  useEffect(() => {
    if (timeArray.length > 50) setTimeArray(prev => prev.slice(-10))
  }, [timeArray.length])

  useEffect(() => {
    if (timeArray.length === 0) return
    const dotIndex = (timeArray.length - 1) % MAX_HISTORY_DOTS
    dotAnims[dotIndex].setValue(0)
    Animated.spring(dotAnims[dotIndex], { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start()
  }, [timeArray.length])

  const openInfo = () => {
    setShowInfo(true)
    modalAnim.setValue(0)
    Animated.spring(modalAnim, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }).start()
  }

  const closeInfo = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowInfo(false))
  }

  const triggerRipple = () => {
    rippleScale.setValue(0)
    rippleOpacity.setValue(0.6)
    Animated.parallel([
      Animated.timing(rippleScale, { toValue: 1.8, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start()

    setTimeout(() => {
      ripple2Scale.setValue(0)
      ripple2Opacity.setValue(0.3)
      Animated.parallel([
        Animated.timing(ripple2Scale, { toValue: 2.2, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(ripple2Opacity, { toValue: 0, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start()
    }, 100)
  }

  const triggerMsBounce = () => {
    msScale.setValue(1.15)
    Animated.spring(msScale, { toValue: 1, friction: 3, tension: 150, useNativeDriver: true }).start()
  }

  const calculateTimeDifference = () => {
    Animated.sequence([
      Animated.timing(tapScale, { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.spring(tapScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
    ]).start()

    triggerRipple()

    const now = Date.now()
    if (previousTimeRef.current === 0) {
      previousTimeRef.current = now
      setTapCount(1)
      return
    }

    const diff = now - previousTimeRef.current
    previousTimeRef.current = now
    setTime(diff)
    setBpm(Math.round(60000 / diff))
    setTapCount(c => c + 1)
    setTimeArray(old => [...old, diff])
    triggerMsBounce()
  }

  const reset = () => {
    setTime(null)
    previousTimeRef.current = 0
    setTimeArray([])
    setScore(0)
    setTapCount(0)
    setMsColor(COLORS.text)
    setBpm(null)
    dotAnims.forEach(a => a.setValue(0))
    scoreBarWidth.setValue(0)
  }

  const getScoreLabel = () => {
    if (tapCount < 3) return null
    if (score > 15) return t(language, 'metronome.perfect')
    if (score > 8) return t(language, 'metronome.great')
    if (score > 3) return t(language, 'metronome.good')
    return t(language, 'metronome.practice')
  }

  const getScoreColor = () => {
    if (score > 15) return COLORS.green
    if (score > 8) return COLORS.gold
    if (score > 3) return COLORS.orange
    return COLORS.accent
  }

  const getVarianceColor = (index) => {
    if (timeArray.length < 2 || index === 0) return COLORS.textDim
    const i = timeArray.length <= MAX_HISTORY_DOTS ? index : (timeArray.length - MAX_HISTORY_DOTS + index)
    if (i <= 0 || i >= timeArray.length) return COLORS.textDim
    const variance = Math.abs(timeArray[i] - timeArray[i - 1])
    if (variance < 30) return COLORS.green
    if (variance < 60) return COLORS.gold
    if (variance < 100) return COLORS.orange
    return COLORS.accent
  }

  return (
    <View style={styles.container}>
      {/* Info button */}
      <TouchableOpacity onPress={openInfo} style={styles.infoButton} activeOpacity={0.7}>
        <Icon name="info-outline" color={COLORS.textDim} size={20} />
      </TouchableOpacity>

      {/* MS Display */}
      <Animated.View style={[styles.msDisplay, { transform: [{ scale: msScale }] }]}>
        {time === null ? (
          <Text style={styles.msPlaceholder}>{t(language, 'metronome.waiting')}</Text>
        ) : (
          <>
            <Text style={[styles.msValue, { color: msColor }]}>{time}</Text>
            <Text style={styles.msUnit}>ms</Text>
            {bpm && (
              <View style={styles.bpmContainer}>
                <Text style={styles.bpmValue}>{bpm}</Text>
                <Text style={styles.bpmUnit}>BPM</Text>
              </View>
            )}
          </>
        )}
      </Animated.View>

      {/* History dots */}
      <View style={styles.historyContainer}>
        {dotAnims.map((anim, index) => {
          const dotColor = getVarianceColor(index)
          const visible = index < timeArray.length
          return (
            <Animated.View
              key={index}
              style={[
                styles.historyDot,
                {
                  backgroundColor: visible ? dotColor : COLORS.border,
                  transform: [{ scale: visible ? anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) : 0.4 }],
                  opacity: visible ? 1 : 0.3,
                },
              ]}
            />
          )
        })}
      </View>

      {/* Score section */}
      {tapCount >= 3 && (
        <View style={styles.scoreSection}>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreLabel, { color: getScoreColor() }]}>{getScoreLabel()}</Text>
            <Text style={styles.scoreNumber}>{score}</Text>
          </View>
          <View style={styles.scoreBarBg}>
            <Animated.View style={[styles.scoreBarFill, {
              backgroundColor: getScoreColor(),
              width: scoreBarWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            }]} />
          </View>
        </View>
      )}

      {/* Tap button area */}
      <View style={styles.tapArea}>
        <Animated.View style={[styles.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity, borderColor: msColor }]} />
        <Animated.View style={[styles.ripple, { transform: [{ scale: ripple2Scale }], opacity: ripple2Opacity, borderColor: msColor }]} />

        <Animated.View style={[styles.tapButtonOuter, {
          transform: [{ scale: Animated.multiply(tapScale, time === null ? pulseAnim : new Animated.Value(1)) }],
        }]}>
          <TouchableOpacity style={styles.tapButton} activeOpacity={0.8} onPress={calculateTimeDifference}>
            <View style={styles.tapButtonInner}>
              <Icon name="touch-app" color="#fff" size={40} />
              <Text style={styles.tapText}>{t(language, 'metronome.tap')}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Reset button */}
      <Animated.View style={[styles.resetContainer, {
        opacity: entryAnim,
        transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
      }]}>
        <TouchableOpacity style={styles.resetButton} activeOpacity={0.7} onPress={reset}>
          <Icon name="refresh" color={COLORS.textDim} size={18} style={{ marginRight: 6 }} />
          <Text style={styles.resetText}>{t(language, 'metronome.reset')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Info Modal */}
      <Modal visible={showInfo} transparent animationType="none" onRequestClose={closeInfo}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeInfo}>
          <TouchableOpacity activeOpacity={1} style={{ width: '100%' }}>
          <Animated.View style={[styles.modalCard, {
            opacity: modalAnim,
            transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
          }]}>
            <View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t(language, 'metronome.infoTitle')}</Text>
                <TouchableOpacity onPress={closeInfo} style={styles.modalClose}>
                  <Icon name="close" color={COLORS.textDim} size={22} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalText}>{t(language, 'metronome.infoText')}</Text>
              <View style={styles.modalLegend}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.green }]} />
                  <Text style={styles.legendText}>{t(language, 'metronome.legendPerfect')}</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
                  <Text style={styles.legendText}>{t(language, 'metronome.legendGood')}</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.orange }]} />
                  <Text style={styles.legendText}>{t(language, 'metronome.legendMedium')}</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
                  <Text style={styles.legendText}>{t(language, 'metronome.legendPractice')}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default Metronomy

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingTop: 12,
  },
  infoButton: {
    alignSelf: 'flex-end',
    marginRight: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },
  msDisplay: {
    width: '88%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  msPlaceholder: {
    fontSize: 16,
    color: COLORS.textDim,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  msValue: {
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: -2,
  },
  msUnit: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDim,
    marginTop: -2,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  bpmValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginRight: 4,
  },
  bpmUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
    letterSpacing: 1,
  },
  historyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
    height: 20,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scoreSection: {
    width: '88%',
    marginTop: 10,
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDim,
  },
  scoreBarBg: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  ripple: {
    position: 'absolute',
    width: TAP_BUTTON_SIZE,
    height: TAP_BUTTON_SIZE,
    borderRadius: TAP_BUTTON_SIZE / 2,
    borderWidth: 2,
  },
  tapButtonOuter: {
    width: TAP_BUTTON_SIZE,
    height: TAP_BUTTON_SIZE,
    borderRadius: TAP_BUTTON_SIZE / 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  tapButton: {
    width: '100%',
    height: '100%',
    borderRadius: TAP_BUTTON_SIZE / 2,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tapButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapText: {
    fontSize: 19,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 4,
  },
  resetContainer: {
    width: '88%',
    marginBottom: 90,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetText: {
    fontSize: 16,
    color: COLORS.textDim,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  modalClose: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.bg,
  },
  modalText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDim,
    lineHeight: 21,
    letterSpacing: 0.2,
    marginBottom: 20,
  },
  modalLegend: {
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDim,
  },
})
