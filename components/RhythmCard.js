import { View, Text, StyleSheet, Animated, Image, TouchableOpacity } from 'react-native'
import React, { memo, useState, useRef } from 'react'
import { ScrollView } from 'react-native-gesture-handler'

const RhythmCard = ({ rhythmName, rhythmTime, color, imageURI, infoText }) => {
  const [isOpen, setIsOpen] = useState(false)

  const heightAnim = useRef(new Animated.Value(0)).current
  const contentOpacity = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  function toggleCard() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: false }),
    ]).start()

    if (!isOpen) {
      setIsOpen(true)
      Animated.spring(heightAnim, { toValue: 320, friction: 8, tension: 40, useNativeDriver: false }).start()
      setTimeout(() => {
        Animated.timing(contentOpacity, { toValue: 1, duration: 300, useNativeDriver: false }).start()
      }, 250)
    } else {
      Animated.timing(contentOpacity, { toValue: 0, duration: 150, useNativeDriver: false }).start(() => {
        Animated.spring(heightAnim, { toValue: 0, friction: 10, tension: 50, useNativeDriver: false }).start()
      })
      setTimeout(() => setIsOpen(false), 500)
    }
  }

  const renderBullets = (text, accentColor) => {
    const items = text.split('*').filter(s => s.trim())
    return items.map((item, i) => (
      <View key={i} style={styles.bulletRow}>
        <View style={[styles.bulletDot, { backgroundColor: accentColor }]} />
        <Text style={styles.bulletText}>{item.trim()}</Text>
      </View>
    ))
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

      <TouchableOpacity activeOpacity={0.85} onPress={toggleCard}>
        <View style={styles.headerRow}>
          {/* time badge */}
          <View style={styles.badgeOuter}>
            <Text style={styles.timeText}>{rhythmTime}</Text>
          </View>

          <View style={styles.titleBlock}>
            <Text
              numberOfLines={1}
              style={styles.nameText}>
              {rhythmName}
            </Text>
          </View>

          <View style={styles.chevronWrap}>
            <Text style={styles.chevron}>{isOpen ? '−' : '+'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {isOpen &&
        <Animated.View style={[styles.expandArea, { height: heightAnim }]}>
          <Animated.View style={[styles.expandInner, { opacity: contentOpacity }]}>
            {imageURI && (
            <View style={styles.imageWrap}>
              <Image source={imageURI} style={styles.image} />
            </View>
            )}
            <View style={styles.scrollWrap}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                {renderBullets(infoText, color)}
              </ScrollView>
            </View>
          </Animated.View>
        </Animated.View>
      }
    </Animated.View>
  )
}

export default memo(RhythmCard)

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeOuter: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  timeText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFF5E6',
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
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
    opacity: 0.7,
  },
  bulletText: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
    fontSize: 13.5,
    fontWeight: '500',
  },
})
