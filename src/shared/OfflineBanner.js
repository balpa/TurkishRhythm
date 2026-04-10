import { View, Text, StyleSheet, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { Icon } from 'react-native-elements'
import { COLORS } from './theme/colors'

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false)
  const slideAnim = useRef(new Animated.Value(-40)).current

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected || state.isInternetReachable === false
      setIsOffline(offline)
      Animated.timing(slideAnim, {
        toValue: offline ? 0 : -40,
        duration: 300,
        useNativeDriver: true,
      }).start()
    })

    return () => unsubscribe()
  }, [slideAnim])

  if (!isOffline) return null

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
      accessibilityRole="alert"
      accessibilityLabel="Çevrimdışı. Offline."
    >
      <Icon name="wifi-off" color={COLORS.text} size={14} />
      <Text style={styles.text}>Çevrimdışı / Offline</Text>
    </Animated.View>
  )
}

export default OfflineBanner

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 6,
    gap: 6,
    zIndex: 999,
  },
  text: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
})
