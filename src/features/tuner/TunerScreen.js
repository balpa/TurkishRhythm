import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { Audio } from 'expo-av'
import { useIsFocused } from '@react-navigation/native'
import { useLanguage } from '../../../i18n/LanguageContext'
import { t } from '../../../i18n/translations'
import { COLORS } from '../../shared/theme/colors'
import { detectPitch, getNoteInfo, TURKISH_NOTES } from './tunerUtils'

const TunerScreen = () => {
  const { language } = useLanguage()
  const isFocused = useIsFocused()
  const [isListening, setIsListening] = useState(false)
  const [frequency, setFrequency] = useState(null)
  const [noteInfo, setNoteInfo] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const recordingRef = useRef(null)
  const intervalRef = useRef(null)
  const isRecordingBusy = useRef(false)
  const isMountedRef = useRef(true)
  const needleAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    isMountedRef.current = true
    checkPermission()
    return () => {
      isMountedRef.current = false
      stopListening()
    }
  }, [])

  useEffect(() => {
    if (!isFocused && isListening) {
      stopListening()
    }
  }, [isFocused])

  useEffect(() => {
    if (noteInfo) {
      Animated.spring(needleAnim, {
        toValue: Math.max(-1, Math.min(1, noteInfo.cents / 50)),
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start()
    }
  }, [noteInfo?.cents])

  useEffect(() => {
    if (!isListening) {
      pulseAnim.stopAnimation()
      pulseAnim.setValue(1)
      return
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [isListening])

  const checkPermission = async () => {
    const { granted } = await Audio.requestPermissionsAsync()
    setPermissionGranted(granted)
  }

  const startListening = async () => {
    if (!permissionGranted) {
      const { granted } = await Audio.requestPermissionsAsync()
      setPermissionGranted(granted)
      if (!granted) return
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })

    setIsListening(true)

    // Use a recurring recording approach: record short clips and analyze
    startRecordingCycle()
  }

  const recordOnce = async () => {
    if (isRecordingBusy.current || !isMountedRef.current) return
    isRecordingBusy.current = true

    let recording = null
    try {
      const result = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      })

      recording = result.recording
      recordingRef.current = recording

      await new Promise(resolve => setTimeout(resolve, 200))

      if (!isMountedRef.current) return

      await recording.stopAndUnloadAsync()
      recordingRef.current = null
      const uri = recording.getURI()

      if (uri && isMountedRef.current) {
        const pitch = await detectPitch(uri)
        if (pitch && pitch > 50 && pitch < 2000 && isMountedRef.current) {
          setFrequency(Math.round(pitch * 10) / 10)
          setNoteInfo(getNoteInfo(pitch))
        }
      }
    } catch {
      // Recording cycle error — try to clean up
      if (recording) {
        try { await recording.stopAndUnloadAsync() } catch { /* already stopped */ }
      }
      recordingRef.current = null
    } finally {
      isRecordingBusy.current = false
    }
  }

  const startRecordingCycle = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(recordOnce, 400)
  }

  const stopListening = async () => {
    setIsListening(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync()
      } catch { /* already stopped */ }
      recordingRef.current = null
    }
    isRecordingBusy.current = false
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const getCentsColor = () => {
    if (!noteInfo) return COLORS.textDim
    const absCents = Math.abs(noteInfo.cents)
    if (absCents < 5) return COLORS.green
    if (absCents < 15) return COLORS.gold
    return COLORS.error
  }

  const getCentsLabel = () => {
    if (!noteInfo) return ''
    if (noteInfo.cents > 0) return `+${noteInfo.cents}`
    return `${noteInfo.cents}`
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>{t(language, 'tuner.title')}</Text>
      <Text style={styles.subtitle}>{t(language, 'tuner.subtitle')}</Text>

      {/* Cents meter */}
      <View style={styles.meterContainer}>
        <View style={styles.meterTrack}>
          <View style={styles.meterCenter} />
          {[-40, -20, 0, 20, 40].map(mark => (
            <View key={mark} style={[styles.meterMark, { left: `${(mark + 50) }%` }]}>
              <Text style={styles.meterMarkText}>{mark === 0 ? '' : mark}</Text>
            </View>
          ))}
        </View>
        <Animated.View style={[styles.needle, {
          transform: [{
            translateX: needleAnim.interpolate({
              inputRange: [-1, 1],
              outputRange: [-120, 120],
            })
          }]
        }]}>
          <View style={[styles.needleDot, { backgroundColor: getCentsColor() }]} />
        </Animated.View>
      </View>

      {/* Note display */}
      <View style={styles.noteDisplay}>
        {noteInfo ? (
          <>
            <Text style={styles.turkishNoteName}>{noteInfo.turkishName}</Text>
            <Text style={styles.westernNoteName}>{noteInfo.westernName}</Text>
            <Text style={[styles.centsText, { color: getCentsColor() }]}>
              {getCentsLabel()} cent
            </Text>
          </>
        ) : (
          <Text style={styles.waitingText}>
            {isListening ? t(language, 'tuner.listening') : t(language, 'tuner.tapToStart')}
          </Text>
        )}
      </View>

      {/* Frequency */}
      {frequency && (
        <Text style={styles.frequencyText}>{frequency} Hz</Text>
      )}

      {/* Start/Stop button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.listenButton, isListening && styles.listenButtonActive]}
          onPress={toggleListening}
          activeOpacity={0.8}
          accessibilityLabel={isListening ? "Stop listening" : "Start listening"}
          accessibilityRole="button"
        >
          <Icon
            name={isListening ? 'mic' : 'mic-none'}
            color="#fff"
            size={36}
          />
          <Text style={styles.listenButtonText}>
            {isListening ? t(language, 'tuner.stop') : t(language, 'tuner.start')}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Turkish note reference */}
      <View style={styles.referenceSection}>
        <Text style={styles.referenceTitle}>{t(language, 'tuner.reference')}</Text>
        <View style={styles.referenceGrid}>
          {TURKISH_NOTES.slice(0, 12).map(note => (
            <View key={note.name} style={styles.referenceItem}>
              <Text style={styles.referenceNoteName}>{note.name}</Text>
              <Text style={styles.referenceFreq}>{note.freq}Hz</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default TunerScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textDim,
    marginBottom: 30,
  },
  meterContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  meterTrack: {
    width: 260,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    position: 'relative',
  },
  meterCenter: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: COLORS.green,
    left: '50%',
    top: -8,
    marginLeft: -1,
  },
  meterMark: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
    marginLeft: -10,
  },
  meterMarkText: {
    fontSize: 9,
    color: COLORS.textDim,
  },
  needle: {
    position: 'absolute',
    alignItems: 'center',
  },
  needleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  noteDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  turkishNoteName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  westernNoteName: {
    fontSize: 16,
    color: COLORS.textDim,
    marginBottom: 6,
  },
  centsText: {
    fontSize: 18,
    fontWeight: '700',
  },
  waitingText: {
    fontSize: 16,
    color: COLORS.textDim,
    fontStyle: 'italic',
  },
  frequencyText: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 24,
  },
  listenButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 30,
  },
  listenButtonActive: {
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
  },
  listenButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  referenceSection: {
    width: '100%',
    marginTop: 10,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDim,
    marginBottom: 10,
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  referenceItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  referenceNoteName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  referenceFreq: {
    fontSize: 9,
    color: COLORS.textDim,
  },
})
