import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'
import { useIsFocused } from '@react-navigation/native'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import styles from '../metronomeStyles'
import { COLORS, MAX_HISTORY_DOTS } from '../metronomeShared'
import MetronomeInfoModal from '../components/MetronomeInfoModal'

const MetronomeScreen = () => {
  const { language } = useLanguage()
  const isFocused = useIsFocused()
  const [time, setTime] = useState(null)
  const [timeArray, setTimeArray] = useState([])
  const [msColor, setMsColor] = useState(COLORS.text)
  const [showInfo, setShowInfo] = useState(false)
  const [score, setScore] = useState(0)
  const [tapCount, setTapCount] = useState(0)
  const [bpm, setBpm] = useState(null)
  const previousTimeRef = useRef(0)
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

  useEffect(() => { Animated.spring(entryAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true, delay: 300 }).start() }, [entryAnim])
  useEffect(() => {
    if (!isFocused) { pulseAnim.stopAnimation(() => pulseAnim.setValue(1)); return }
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]))
    pulse.start()
    return () => pulse.stop()
  }, [isFocused, pulseAnim])
  useEffect(() => {
    if (timeArray.length < 2) return
    const variance = Math.abs(timeArray[timeArray.length - 1] - timeArray[timeArray.length - 2])
    let newColor = COLORS.accent
    let scoreDelta = -2
    if (variance < 30) { newColor = COLORS.green; scoreDelta = 2 }
    else if (variance < 60) { newColor = COLORS.gold; scoreDelta = 1 }
    else if (variance < 100) { newColor = COLORS.error; scoreDelta = -1 }
    setMsColor(newColor)
    setScore((current) => Math.max(0, current + scoreDelta))
  }, [timeArray.length])
  useEffect(() => { Animated.spring(scoreBarWidth, { toValue: Math.min(score / 20, 1) * 100, friction: 8, tension: 60, useNativeDriver: false }).start() }, [score, scoreBarWidth])
  useEffect(() => { if (timeArray.length > 50) setTimeArray((current) => current.slice(-10)) }, [timeArray.length])
  useEffect(() => {
    if (timeArray.length === 0) return
    const dotIndex = (timeArray.length - 1) % MAX_HISTORY_DOTS
    dotAnims[dotIndex].setValue(0)
    Animated.spring(dotAnims[dotIndex], { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start()
  }, [dotAnims, timeArray.length])

  const openInfo = () => { setShowInfo(true); modalAnim.setValue(0); Animated.spring(modalAnim, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }).start() }
  const closeInfo = () => { Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowInfo(false)) }
  const triggerRipple = () => {
    rippleScale.setValue(0); rippleOpacity.setValue(0.6)
    Animated.parallel([
      Animated.timing(rippleScale, { toValue: 1.8, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start()
    setTimeout(() => {
      ripple2Scale.setValue(0); ripple2Opacity.setValue(0.3)
      Animated.parallel([
        Animated.timing(ripple2Scale, { toValue: 2.2, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(ripple2Opacity, { toValue: 0, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start()
    }, 100)
  }
  const triggerMsBounce = () => { msScale.setValue(1.15); Animated.spring(msScale, { toValue: 1, friction: 3, tension: 150, useNativeDriver: true }).start() }
  const reset = () => { setTime(null); previousTimeRef.current = 0; setTimeArray([]); setScore(0); setTapCount(0); setMsColor(COLORS.text); setBpm(null); dotAnims.forEach((a) => a.setValue(0)); scoreBarWidth.setValue(0) }
  const calculateTimeDifference = () => {
    Animated.sequence([Animated.timing(tapScale, { toValue: 0.9, duration: 60, useNativeDriver: true }), Animated.spring(tapScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true })]).start()
    triggerRipple()
    const now = Date.now()
    if (previousTimeRef.current === 0) { previousTimeRef.current = now; setTapCount(1); return }
    const diff = now - previousTimeRef.current
    if (diff > 10000) { reset(); previousTimeRef.current = now; setTapCount(1); return }
    previousTimeRef.current = now
    setTime(diff); setBpm(Math.round(60000 / diff)); setTapCount((current) => current + 1); setTimeArray((current) => [...current, diff]); triggerMsBounce()
  }
  const getScoreLabel = () => tapCount < 3 ? null : score > 15 ? t(language, 'metronome.perfect') : score > 8 ? t(language, 'metronome.great') : score > 3 ? t(language, 'metronome.good') : t(language, 'metronome.practice')
  const getScoreColor = () => score > 15 ? COLORS.green : score > 8 ? COLORS.gold : score > 3 ? COLORS.error : COLORS.accent
  const getVarianceColor = (index) => {
    if (timeArray.length < 2 || index === 0) return COLORS.textDim
    const itemIndex = timeArray.length <= MAX_HISTORY_DOTS ? index : (timeArray.length - MAX_HISTORY_DOTS + index)
    if (itemIndex <= 0 || itemIndex >= timeArray.length) return COLORS.textDim
    const variance = Math.abs(timeArray[itemIndex] - timeArray[itemIndex - 1])
    if (variance < 30) return COLORS.green
    if (variance < 60) return COLORS.gold
    if (variance < 100) return COLORS.error
    return COLORS.accent
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openInfo} style={styles.infoButton} activeOpacity={0.7}><Icon name="info-outline" color={COLORS.textDim} size={20} /></TouchableOpacity>
      <Animated.View style={[styles.msDisplay, { transform: [{ scale: msScale }] }]}>
        {time === null ? <Text style={styles.msPlaceholder}>{t(language, 'metronome.waiting')}</Text> : <>
          <Text style={[styles.msValue, { color: msColor }]}>{time}</Text><Text style={styles.msUnit}>ms</Text>
          {bpm ? <View style={styles.bpmContainer}><Text style={styles.bpmValue}>{bpm}</Text><Text style={styles.bpmUnit}>BPM</Text></View> : null}
        </>}
      </Animated.View>
      <View style={styles.historyContainer}>
        {dotAnims.map((anim, index) => {
          const visible = index < timeArray.length
          return <Animated.View key={index} style={[styles.historyDot, { backgroundColor: visible ? getVarianceColor(index) : COLORS.border, transform: [{ scale: visible ? anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) : 0.4 }], opacity: visible ? 1 : 0.3 }]} />
        })}
      </View>
      {tapCount >= 3 ? <View style={styles.scoreSection}><View style={styles.scoreRow}><Text style={[styles.scoreLabel, { color: getScoreColor() }]}>{getScoreLabel()}</Text><Text style={styles.scoreNumber}>{score}</Text></View><View style={styles.scoreBarBg}><Animated.View style={[styles.scoreBarFill, { backgroundColor: getScoreColor(), width: scoreBarWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} /></View></View> : null}
      <View style={styles.tapArea}>
        <Animated.View style={[styles.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity, borderColor: msColor }]} />
        <Animated.View style={[styles.ripple, { transform: [{ scale: ripple2Scale }], opacity: ripple2Opacity, borderColor: msColor }]} />
        <Animated.View style={[styles.tapButtonOuter, { transform: [{ scale: Animated.multiply(tapScale, time === null ? pulseAnim : new Animated.Value(1)) }] }]}>
          <TouchableOpacity style={styles.tapButton} activeOpacity={0.8} onPress={calculateTimeDifference}>
            <View style={styles.tapButtonInner}><Icon name="touch-app" color={COLORS.white} size={40} /><Text style={styles.tapText}>{t(language, 'metronome.tap')}</Text></View>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <Animated.View style={[styles.resetContainer, { opacity: entryAnim, transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
        <TouchableOpacity style={styles.resetButton} activeOpacity={0.7} onPress={reset}><Icon name="refresh" color={COLORS.textDim} size={18} style={{ marginRight: 6 }} /><Text style={styles.resetText}>{t(language, 'metronome.reset')}</Text></TouchableOpacity>
      </Animated.View>
      <MetronomeInfoModal visible={showInfo} language={language} animation={modalAnim} onClose={closeInfo} />
    </View>
  )
}

export default MetronomeScreen
