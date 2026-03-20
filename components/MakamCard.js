import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'

const MakamCard = ({ makamName, color, imageURI, makamInfo }) => {
  const [isOpen, setIsOpen] = useState(false)

  const heightAnim = useRef(new Animated.Value(0)).current
  const contentOpacity = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  // letterSpacingAnim removed
  const glowAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 2200, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2200, useNativeDriver: false }),
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
      Animated.spring(heightAnim, { toValue: 420, friction: 8, tension: 40, useNativeDriver: false }).start()
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

  const renderFormattedInfo = (info, accentColor) => {
    const sections = info.split('*').filter(s => s.trim())
    return sections.map((section, i) => {
      const colonIdx = section.indexOf(':')
      if (colonIdx === -1) return <Text key={i} style={styles.infoBody}>{section.trim()}</Text>

      const label = section.slice(0, colonIdx).trim()
      const body = section.slice(colonIdx + 1).trim()

      return (
        <View key={i} style={styles.infoSection}>
          <View style={styles.labelRow}>
            <View style={[styles.labelDot, { backgroundColor: accentColor }]} />
            <Text style={styles.infoLabel}>{label}</Text>
          </View>
          <Text style={styles.infoBody}>{body}</Text>
          {i < sections.length - 1 && <View style={styles.divider} />}
        </View>
      )
    })
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
          {/* decorative geometric cluster */}
          <View style={styles.decoWrap}>
            <Animated.View style={[styles.decoRingOuter, { borderColor: 'rgba(255,255,255,0.25)', opacity: glowAnim }]} />
            <View style={[styles.decoFill, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={[styles.decoDiamond, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.decoCenter} />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.nameText}>
              {makamName}
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
            <View style={styles.imageWrap}>
              <Image source={imageURI} style={styles.image} />
            </View>
            <View style={styles.scrollWrap}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                {renderFormattedInfo(makamInfo, color)}
              </ScrollView>
            </View>
          </Animated.View>
        </Animated.View>
      }
    </Animated.View>
  )
}

export default MakamCard

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
  decoWrap: {
    width: 48,
    height: 48,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decoRingOuter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  decoFill: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  decoDiamond: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  decoCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
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
    marginBottom: 10,
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
  infoSection: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#fff',
  },
  infoBody: {
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 21,
    fontSize: 13.5,
    fontWeight: '500',
    paddingLeft: 13,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
})
