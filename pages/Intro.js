import { View, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef } from 'react'

const Intro = ({ setShowIntroPage }) => {
  let scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 0,
        friction: 8,
        tension: 30,
        useNativeDriver: false
      }).start();
    }, 2000)
    setTimeout(() => { setShowIntroPage(false) }, 2500)
  }, [])

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
      ]}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo/logo-low-res.png')} style={styles.logo} />
      </View>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#1B1B2F',
  },
  logoContainer: {
    position: 'absolute',
    width: '50%',
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    aspectRatio: 1,
    borderRadius: 100,
  },
  activityIndicator: {
    width: 50,
    height: 50,
    marginTop: 500,
  },
})
