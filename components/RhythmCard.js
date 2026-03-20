import { View, Text, StyleSheet, Animated, Image, TouchableOpacity } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { ScrollView } from 'react-native-gesture-handler'

const RhythmCard = ({ rhythmName, rhythmTime, color, imageURI, infoText }) => {
  const [isOpen, setIsOpen] = useState(false)

  const heightAnim = useRef(new Animated.Value(0)).current
  const contentOpacity = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const letterSpacingAnim = useRef(new Animated.Value(1)).current
  const badgeScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeScale, { toValue: 1.06, duration: 2000, useNativeDriver: false }),
        Animated.timing(badgeScale, { toValue: 1, duration: 2000, useNativeDriver: false }),
      ])
    ).start()
  }, [])

  function toggleCard() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: false }),
    ]).start()

    if (!isOpen) {
      setIsOpen(true)
      Animated.timing(letterSpacingAnim, { toValue: 5, duration: 600, useNativeDriver: false }).start()
      Animated.spring(heightAnim, { toValue: 320, friction: 8, tension: 40, useNativeDriver: false }).start()
      setTimeout(() => {
        Animated.timing(contentOpacity, { toValue: 1, duration: 300, useNativeDriver: false }).start()
      }, 250)
    } else {
      Animated.timing(letterSpacingAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start()
      Animated.timing(contentOpacity, { toValue: 0, duration: 150, useNativeDriver: false }).start(() => {
        Animated.spring(heightAnim, { toValue: 0, friction: 10, tension: 50, useNativeDriver: false }).start()
      })
      setTimeout(() => setIsOpen(false), 500)
    }
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: color,
          transform: [{ scale: scaleAnim }],
          shadowColor: color,
        }
      ]}>

      <View style={styles.topStripe}>
        <View style={[styles.stripeLine, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
        <View style={[styles.stripeLine, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
      </View>

      <TouchableOpacity activeOpacity={0.85} onPress={toggleCard}>
        <View style={styles.headerRow}>
          {/* 3D time badge */}
          <Animated.View style={[
            styles.badgeOuter,
            { transform: [{ scale: badgeScale }] }
          ]}>
            <View style={styles.badgeHighlight} />
            <Text style={styles.timeText}>{rhythmTime}</Text>
          </Animated.View>

          <View style={styles.titleBlock}>
            <Animated.Text
              numberOfLines={1}
              style={[styles.nameText, { letterSpacing: letterSpacingAnim }]}>
              {rhythmName}
            </Animated.Text>
          </View>

          <View style={styles.chevronWrap}>
            <Text style={styles.chevron}>{isOpen ? '−' : '+'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {isOpen &&
        <Animated.View style={[styles.expandArea, { height: heightAnim }]}>
          <Animated.View style={[styles.expandInner, { opacity: contentOpacity }]}>
            <View style={styles.imageWrap}>
              <Image source={imageURI} style={styles.image} />
            </View>
            <View style={styles.scrollWrap}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                <Text style={styles.infoText}>{infoText}</Text>
              </ScrollView>
            </View>
          </Animated.View>
        </Animated.View>
      }
    </Animated.View>
  )
}

export default RhythmCard

const styles = StyleSheet.create({
  card: {
    width: '92%',
    marginVertical: 7,
    borderRadius: 18,
    alignSelf: 'center',
    padding: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  topStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  stripeLine: {
    flex: 1,
    height: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeOuter: {
    width: 54,
    height: 54,
    borderRadius: 14,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  badgeHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  timeText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFF5E6',
    zIndex: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleBlock: {
    flex: 1,
  },
  nameText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFF5E6',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    marginTop: -1,
  },
  expandArea: {
    width: '100%',
    overflow: 'hidden',
    marginTop: 14,
  },
  expandInner: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    padding: 14,
  },
  imageWrap: {
    height: '38%',
    justifyContent: 'center',
  },
  scrollWrap: {
    flex: 1,
  },
  image: {
    height: undefined,
    width: '92%',
    alignSelf: 'center',
    aspectRatio: 2.7,
    borderRadius: 8,
  },
  infoText: {
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    fontSize: 14,
  },
})
