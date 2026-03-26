import { View, Text, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Icon } from 'react-native-elements'
import { useIsFocused } from '@react-navigation/native'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import { RHYTHM_LIBRARY } from '../../../../data/data'
import styles from '../metronomeStyles'
import { COLORS, DEFAULT_PRACTICE_RHYTHM_KEY, MAX_HISTORY_DOTS, getPracticeRhythm } from '../metronomeShared'
import MetronomeInfoModal from '../components/MetronomeInfoModal'

const PRACTICE_DEFAULT_BPM = 84
const PRACTICE_MIN_BPM = 40
const PRACTICE_MAX_BPM = 180

const MetronomeScreen = () => {
  const { language } = useLanguage()
  const isFocused = useIsFocused()
  const [mode, setMode] = useState('tap')
  const [time, setTime] = useState(null)
  const [timeArray, setTimeArray] = useState([])
  const [msColor, setMsColor] = useState(COLORS.text)
  const [showInfo, setShowInfo] = useState(false)
  const [score, setScore] = useState(0)
  const [tapCount, setTapCount] = useState(0)
  const [bpm, setBpm] = useState(null)
  const [selectedRhythmKey, setSelectedRhythmKey] = useState(DEFAULT_PRACTICE_RHYTHM_KEY)
  const [practiceBpm, setPracticeBpm] = useState(PRACTICE_DEFAULT_BPM)
  const [practiceUnitIndex, setPracticeUnitIndex] = useState(0)
  const [practiceHits, setPracticeHits] = useState(0)
  const [practiceMistakes, setPracticeMistakes] = useState(0)
  const [practiceCycles, setPracticeCycles] = useState(0)
  const [lastPracticeResult, setLastPracticeResult] = useState(null)
  const [lastPadType, setLastPadType] = useState(null)
  const [isPracticeRunning, setIsPracticeRunning] = useState(false)
  const [lastPracticeDelta, setLastPracticeDelta] = useState(null)
  const [pulseStates, setPulseStates] = useState([])
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
  const practiceFeedbackTimeout = useRef(null)
  const practiceIntervalRef = useRef(null)
  const currentTickRef = useRef({ index: -1, startedAt: 0, matched: false })

  const selectedRhythm = getPracticeRhythm(selectedRhythmKey)
  const practiceUnits = selectedRhythm.practiceUnits || []
  const currentPracticeUnit = practiceUnits[practiceUnitIndex] || practiceUnits[0] || null
  const practiceAccuracy = practiceHits + practiceMistakes === 0 ? 0 : Math.round((practiceHits / (practiceHits + practiceMistakes)) * 100)
  const practiceIntervalMs = Math.round(60000 / practiceBpm)
  const practiceBufferMs = Math.min(220, Math.max(120, Math.round(practiceIntervalMs * 0.35)))
  const visiblePulseStates = useMemo(() => pulseStates.slice(0, 16), [pulseStates])

  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
      delay: 300,
    }).start()
  }, [entryAnim])

  useEffect(() => {
    if (!isFocused || mode !== 'tap') {
      pulseAnim.stopAnimation(() => pulseAnim.setValue(1))
      return
    }

    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]))
    pulse.start()
    return () => pulse.stop()
  }, [isFocused, mode, pulseAnim])

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

  useEffect(() => {
    Animated.spring(scoreBarWidth, {
      toValue: Math.min(score / 20, 1) * 100,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start()
  }, [score, scoreBarWidth])

  useEffect(() => {
    if (timeArray.length > 50) setTimeArray((current) => current.slice(-10))
  }, [timeArray.length])

  useEffect(() => {
    if (timeArray.length === 0) return
    const dotIndex = (timeArray.length - 1) % MAX_HISTORY_DOTS
    dotAnims[dotIndex].setValue(0)
    Animated.spring(dotAnims[dotIndex], {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start()
  }, [dotAnims, timeArray.length])

  useEffect(() => () => {
    if (practiceFeedbackTimeout.current) clearTimeout(practiceFeedbackTimeout.current)
    if (practiceIntervalRef.current) clearInterval(practiceIntervalRef.current)
  }, [])

  useEffect(() => {
    if (!isFocused && isPracticeRunning) {
      stopPractice()
    }
  }, [isFocused, isPracticeRunning])

  useEffect(() => {
    if (mode !== 'practice' && isPracticeRunning) {
      stopPractice()
    }
  }, [mode, isPracticeRunning])

  useEffect(() => {
    if (!isPracticeRunning) return
    restartPracticeClock()
  }, [practiceBpm, selectedRhythmKey])

  const buildPulseStates = (units, activeIndex = 0, statuses = {}) => units.map((unit, index) => ({
    key: `${unit.type}-${unit.beatIndex}-${unit.unitIndex}-${index}`,
    label: unit.type === 'dum' ? 'D' : 'T',
    meta: `${unit.beatIndex + 1}.${unit.unitIndex + 1}`,
    status: statuses[index] || (index === activeIndex ? 'current' : 'idle'),
  }))

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

  const resetTapMode = () => {
    setTime(null)
    previousTimeRef.current = 0
    setTimeArray([])
    setScore(0)
    setTapCount(0)
    setMsColor(COLORS.text)
    setBpm(null)
    dotAnims.forEach((anim) => anim.setValue(0))
    scoreBarWidth.setValue(0)
  }

  const clearPracticeFeedback = () => {
    setLastPracticeResult(null)
    setLastPadType(null)
    setLastPracticeDelta(null)
  }

  const resetPracticeMode = () => {
    setPracticeUnitIndex(0)
    setPracticeHits(0)
    setPracticeMistakes(0)
    setPracticeCycles(0)
    clearPracticeFeedback()
    setPulseStates(buildPulseStates(practiceUnits, 0))
    currentTickRef.current = { index: -1, startedAt: 0, matched: false }
    if (practiceFeedbackTimeout.current) clearTimeout(practiceFeedbackTimeout.current)
  }

  const stopPractice = () => {
    if (practiceIntervalRef.current) {
      clearInterval(practiceIntervalRef.current)
      practiceIntervalRef.current = null
    }
    setIsPracticeRunning(false)
  }

  const markPulseStatus = (index, status) => {
    setPulseStates((current) => {
      const next = current.length ? [...current] : buildPulseStates(practiceUnits, practiceUnitIndex)
      if (!next[index]) return next
      next[index] = { ...next[index], status }
      return next
    })
  }

  const advanceToNextPulse = () => {
    setPracticeUnitIndex((current) => {
      const previousTick = currentTickRef.current
      if (previousTick.index >= 0 && !previousTick.matched) {
        setPracticeMistakes((value) => value + 1)
        markPulseStatus(previousTick.index, 'missed')
      }

      const nextIndex = current + 1 >= practiceUnits.length ? 0 : current + 1
      if (current + 1 >= practiceUnits.length) {
        setPracticeCycles((value) => value + 1)
      }

      setPulseStates((currentStates) => {
        const nextStates = buildPulseStates(practiceUnits, nextIndex)
        currentStates.forEach((item, index) => {
          if (!nextStates[index]) return
          if (item.status === 'done' || item.status === 'missed') nextStates[index] = { ...nextStates[index], status: item.status }
        })
        nextStates[nextIndex] = { ...nextStates[nextIndex], status: 'current' }
        return nextStates
      })

      currentTickRef.current = {
        index: nextIndex,
        startedAt: Date.now(),
        matched: false,
      }
      return nextIndex
    })
  }

  const startPractice = () => {
    if (!practiceUnits.length) return
    if (practiceIntervalRef.current) clearInterval(practiceIntervalRef.current)
    resetPracticeMode()
    setIsPracticeRunning(true)
    currentTickRef.current = { index: 0, startedAt: Date.now(), matched: false }
    setPulseStates(buildPulseStates(practiceUnits, 0))
    practiceIntervalRef.current = setInterval(advanceToNextPulse, practiceIntervalMs)
  }

  const restartPracticeClock = () => {
    if (!isPracticeRunning) return
    startPractice()
  }

  const resetCurrentMode = () => {
    if (mode === 'tap') {
      resetTapMode()
      return
    }
    stopPractice()
    resetPracticeMode()
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
    if (diff > 10000) {
      resetTapMode()
      previousTimeRef.current = now
      setTapCount(1)
      return
    }
    previousTimeRef.current = now
    setTime(diff)
    setBpm(Math.round(60000 / diff))
    setTapCount((current) => current + 1)
    setTimeArray((current) => [...current, diff])
    triggerMsBounce()
  }

  const setPracticeFeedback = ({ result, tappedType, delta = null }) => {
    setLastPracticeResult(result)
    setLastPadType(tappedType)
    setLastPracticeDelta(delta)
    if (practiceFeedbackTimeout.current) clearTimeout(practiceFeedbackTimeout.current)
    practiceFeedbackTimeout.current = setTimeout(clearPracticeFeedback, 500)
  }

  const handlePracticeTap = (tappedType) => {
    if (!isPracticeRunning) {
      if (tappedType !== 'dum') {
        setPracticeFeedback({ result: 'wrong', tappedType, delta: null })
        return
      }
      startPractice()
      const startedAt = Date.now()
      currentTickRef.current = { index: 0, startedAt, matched: true }
      setPracticeHits((value) => value + 1)
      markPulseStatus(0, 'done')
      setLastPracticeResult('correct')
      setLastPadType('dum')
      setLastPracticeDelta(0)
      if (practiceFeedbackTimeout.current) clearTimeout(practiceFeedbackTimeout.current)
      practiceFeedbackTimeout.current = setTimeout(clearPracticeFeedback, 500)
      return
    }

    if (!currentPracticeUnit) return

    const tick = currentTickRef.current
    const delta = Date.now() - tick.startedAt
    const distanceToPulse = Math.abs(delta)
    const expectedType = practiceUnits[tick.index]?.type

    if (tick.matched) {
      setPracticeFeedback({ result: 'duplicate', tappedType, delta: distanceToPulse })
      setPracticeMistakes((value) => value + 1)
      return
    }

    if (distanceToPulse > practiceBufferMs) {
      setPracticeFeedback({ result: 'late', tappedType, delta: distanceToPulse })
      setPracticeMistakes((value) => value + 1)
      return
    }

    if (expectedType !== tappedType) {
      setPracticeFeedback({ result: 'wrong', tappedType, delta: distanceToPulse })
      setPracticeMistakes((value) => value + 1)
      return
    }

    currentTickRef.current = { ...tick, matched: true }
    markPulseStatus(tick.index, 'done')
    setPracticeHits((value) => value + 1)
    setPracticeFeedback({ result: 'correct', tappedType, delta: distanceToPulse })
  }

  const handleSelectRhythm = (rhythmKey) => {
    stopPractice()
    setSelectedRhythmKey(rhythmKey)
    clearPracticeFeedback()
    setPracticeUnitIndex(0)
    setPracticeHits(0)
    setPracticeMistakes(0)
    setPracticeCycles(0)
    const nextRhythm = getPracticeRhythm(rhythmKey)
    setPulseStates(buildPulseStates(nextRhythm.practiceUnits || [], 0))
    currentTickRef.current = { index: -1, startedAt: 0, matched: false }
  }

  useEffect(() => {
    setPulseStates(buildPulseStates(practiceUnits, 0))
  }, [selectedRhythmKey])

  const getScoreLabel = () => (
    tapCount < 3
      ? null
      : score > 15
        ? t(language, 'metronome.perfect')
        : score > 8
          ? t(language, 'metronome.great')
          : score > 3
            ? t(language, 'metronome.good')
            : t(language, 'metronome.practice')
  )

  const getScoreColor = () => (
    score > 15 ? COLORS.green : score > 8 ? COLORS.gold : score > 3 ? COLORS.error : COLORS.accent
  )

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

  const practiceFeedbackText = (() => {
    if (!isPracticeRunning) return t(language, 'metronome.startWithDum')
    if (lastPracticeResult === 'correct') return `${t(language, 'metronome.practiceCorrect')} ${lastPracticeDelta}ms`
    if (lastPracticeResult === 'wrong') return `${t(language, 'metronome.practiceWrong')} ${currentPracticeUnit?.type === 'dum' ? t(language, 'metronome.dum') : t(language, 'metronome.tek')}`
    if (lastPracticeResult === 'late') return `${t(language, 'metronome.practiceOutOfWindow')} ${practiceBufferMs}ms`
    if (lastPracticeResult === 'duplicate') return t(language, 'metronome.practiceAlreadyMatched')
    return `${t(language, 'metronome.followPattern')} ${selectedRhythm.practicePatternLabel}`
  })()

  const practiceFeedbackStyle = {
    backgroundColor: lastPracticeResult === 'correct'
      ? 'rgba(73, 201, 126, 0.14)'
      : lastPracticeResult === 'wrong' || lastPracticeResult === 'late' || lastPracticeResult === 'duplicate'
        ? 'rgba(219, 82, 77, 0.14)'
        : COLORS.surface,
    borderWidth: 1,
    borderColor: lastPracticeResult === 'correct'
      ? COLORS.green
      : lastPracticeResult === 'wrong' || lastPracticeResult === 'late' || lastPracticeResult === 'duplicate'
        ? COLORS.error
        : COLORS.border,
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={openInfo} style={styles.infoButton} activeOpacity={0.7}>
          <Icon name="info-outline" color={COLORS.textDim} size={20} />
        </TouchableOpacity>

        <View style={styles.modeSwitch}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => setMode('tap')} style={[styles.modeButton, mode === 'tap' && styles.modeButtonActive]}>
            <Text style={[styles.modeButtonText, mode === 'tap' && styles.modeButtonTextActive]}>{t(language, 'metronome.modeTap')}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} onPress={() => setMode('practice')} style={[styles.modeButton, mode === 'practice' && styles.modeButtonActive]}>
            <Text style={[styles.modeButtonText, mode === 'practice' && styles.modeButtonTextActive]}>{t(language, 'metronome.modePractice')}</Text>
          </TouchableOpacity>
        </View>

        {mode === 'tap' ? (
          <>
            <Animated.View style={[styles.msDisplay, { transform: [{ scale: msScale }] }]}>
              {time === null ? <Text style={styles.msPlaceholder}>{t(language, 'metronome.waiting')}</Text> : <>
                <Text style={[styles.msValue, { color: msColor }]}>{time}</Text>
                <Text style={styles.msUnit}>ms</Text>
                {bpm ? <View style={styles.bpmContainer}><Text style={styles.bpmValue}>{bpm}</Text><Text style={styles.bpmUnit}>BPM</Text></View> : null}
              </>}
            </Animated.View>

            <View style={styles.historyContainer}>
              {dotAnims.map((anim, index) => {
                const visible = index < timeArray.length
                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.historyDot,
                      {
                        backgroundColor: visible ? getVarianceColor(index) : COLORS.border,
                        transform: [{ scale: visible ? anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) : 0.4 }],
                        opacity: visible ? 1 : 0.3,
                      },
                    ]}
                  />
                )
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
          </>
        ) : (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>{t(language, 'metronome.selectedRhythm')}</Text>
              <View style={styles.rhythmMetaRow}>
                <Text style={styles.rhythmTitle}>{selectedRhythm.name}</Text>
                <View style={styles.rhythmBadge}><Text style={styles.rhythmBadgeText}>{selectedRhythm.time}</Text></View>
              </View>
              <Text style={styles.rhythmSequenceSummary}>{t(language, 'metronome.pattern')}: {selectedRhythm.practicePatternLabel}</Text>
              <Text style={styles.rhythmSequenceSummary}>{t(language, 'metronome.patternUnits')}: {selectedRhythm.totalUnits}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rhythmSelectorContent} style={{ marginTop: 14, width: '100%' }}>
              {RHYTHM_LIBRARY.map((rhythm) => {
                const active = rhythm.key === selectedRhythm.key
                return (
                  <TouchableOpacity key={rhythm.key} activeOpacity={0.85} style={[styles.rhythmChip, active && styles.rhythmChipActive]} onPress={() => handleSelectRhythm(rhythm.key)}>
                    <Text style={[styles.rhythmChipName, active && styles.rhythmChipNameActive]}>{rhythm.name}</Text>
                    <Text style={[styles.rhythmChipTime, active && styles.rhythmChipTimeActive]}>{rhythm.time}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            <View style={styles.practiceControlRow}>
              <View style={styles.practiceControlCard}>
                <Text style={styles.sectionLabel}>{t(language, 'metronome.practiceBpm')}</Text>
                <View style={styles.bpmAdjustRow}>
                  <TouchableOpacity style={styles.bpmAdjustButton} activeOpacity={0.8} onPress={() => setPracticeBpm((value) => Math.max(PRACTICE_MIN_BPM, value - 4))}>
                    <Icon name="remove" color={COLORS.text} size={18} />
                  </TouchableOpacity>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.practiceStatValue}>{practiceBpm}</Text>
                    <Text style={styles.practiceStatLabel}>BPM</Text>
                  </View>
                  <TouchableOpacity style={styles.bpmAdjustButton} activeOpacity={0.8} onPress={() => setPracticeBpm((value) => Math.min(PRACTICE_MAX_BPM, value + 4))}>
                    <Icon name="add" color={COLORS.text} size={18} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.rhythmSequenceSummary}>
                  {t(language, 'metronome.practiceBuffer')}: {practiceBufferMs}ms
                </Text>
              </View>
            </View>

            <View style={styles.nextBeatCard}>
              <Text style={styles.nextBeatLabel}>{t(language, 'metronome.nextBeat')}</Text>
              <Text style={styles.nextBeatValue}>{currentPracticeUnit?.type === 'dum' ? t(language, 'metronome.dum') : t(language, 'metronome.tek')}</Text>
              <Text style={styles.nextBeatHint}>{isPracticeRunning ? t(language, 'metronome.practiceHintTimed') : t(language, 'metronome.practiceHint')}</Text>
            </View>

            <View style={styles.pulseRow}>
              {visiblePulseStates.map((pulse) => (
                <View
                  key={pulse.key}
                  style={[
                    styles.pulseChip,
                    pulse.status === 'current' && styles.pulseChipCurrent,
                    pulse.status === 'done' && styles.pulseChipDone,
                    pulse.status === 'missed' && styles.pulseChipMissed,
                  ]}
                >
                  <Text style={styles.pulseChipLabel}>{pulse.label}</Text>
                  <Text style={styles.pulseChipMeta}>{pulse.meta}</Text>
                </View>
              ))}
            </View>

            <View style={styles.practiceStatsRow}>
              <View style={styles.practiceStatCard}><Text style={styles.practiceStatValue}>{practiceAccuracy}%</Text><Text style={styles.practiceStatLabel}>{t(language, 'metronome.accuracy')}</Text></View>
              <View style={styles.practiceStatCard}><Text style={styles.practiceStatValue}>{practiceCycles}</Text><Text style={styles.practiceStatLabel}>{t(language, 'metronome.cycles')}</Text></View>
              <View style={styles.practiceStatCard}><Text style={styles.practiceStatValue}>{practiceMistakes}</Text><Text style={styles.practiceStatLabel}>{t(language, 'metronome.mistakes')}</Text></View>
            </View>

            <View style={[styles.practiceFeedback, practiceFeedbackStyle]}>
              <Text style={[styles.practiceFeedbackText, { color: lastPracticeResult === 'correct' ? COLORS.green : lastPracticeResult ? COLORS.error : COLORS.textDim }]}>{practiceFeedbackText}</Text>
            </View>

            <View style={styles.practicePadsRow}>
              <View style={styles.practicePadOuter}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.practicePad,
                    styles.practicePadTek,
                    lastPadType === 'tek' && lastPracticeResult === 'correct' && styles.practicePadCorrect,
                    lastPadType === 'tek' && lastPracticeResult && lastPracticeResult !== 'correct' && styles.practicePadWrong,
                  ]}
                  onPress={() => handlePracticeTap('tek')}
                >
                  <Text style={styles.practicePadTitle}>{t(language, 'metronome.tek')}</Text>
                  <Text style={styles.practicePadSubtitle}>{t(language, 'metronome.highBeat')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.practicePadOuter}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.practicePad,
                    styles.practicePadDum,
                    lastPadType === 'dum' && lastPracticeResult === 'correct' && styles.practicePadCorrect,
                    lastPadType === 'dum' && lastPracticeResult && lastPracticeResult !== 'correct' && styles.practicePadWrong,
                  ]}
                  onPress={() => handlePracticeTap('dum')}
                >
                  <Text style={styles.practicePadTitle}>{t(language, 'metronome.dum')}</Text>
                  <Text style={styles.practicePadSubtitle}>{t(language, 'metronome.lowBeat')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <Animated.View style={[styles.resetContainer, { opacity: entryAnim, transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
          <TouchableOpacity style={styles.resetButton} activeOpacity={0.7} onPress={resetCurrentMode}><Icon name="refresh" color={COLORS.textDim} size={18} style={{ marginRight: 6 }} /><Text style={styles.resetText}>{t(language, 'metronome.reset')}</Text></TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <MetronomeInfoModal visible={showInfo} language={language} animation={modalAnim} onClose={closeInfo} />
    </View>
  )
}

export default MetronomeScreen
