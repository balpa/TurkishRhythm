import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native'
import React, { memo, useState, useRef } from 'react'
import { Icon } from 'react-native-elements'

const ExpandableCard = ({ color, expandHeight = 320, headerContent, bodyContent, isFavorite, onToggleFavorite, accessibilityLabel }) => {
  const [isOpen, setIsOpen] = useState(false)
  const heightAnim = useRef(new Animated.Value(0)).current
  const contentOpacity = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  const toggleCard = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: false }),
    ]).start()

    if (!isOpen) {
      setIsOpen(true)
      Animated.spring(heightAnim, { toValue: expandHeight, friction: 8, tension: 40, useNativeDriver: false }).start()
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

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: color,
          transform: [{ scale: scaleAnim }],
          shadowColor: color,
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={toggleCard} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
        <View style={styles.headerRow}>
          {headerContent}

          {onToggleFavorite && (
            <TouchableOpacity
              onPress={onToggleFavorite}
              activeOpacity={0.6}
              style={styles.favButton}
              accessibilityLabel={isFavorite ? 'Favorilerden çıkar (Remove favorite)' : 'Favorilere ekle (Add to favorites)'}
              accessibilityRole="button"
            >
              <Icon name={isFavorite ? 'star' : 'star-border'} color={isFavorite ? '#FFD700' : 'rgba(255,255,255,0.5)'} size={22} />
            </TouchableOpacity>
          )}

          <View style={styles.chevronWrap}>
            <Text style={styles.chevron}>{isOpen ? '\u2212' : '+'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View style={[styles.expandArea, { height: heightAnim }]}>
          <Animated.View style={[styles.expandInner, { opacity: contentOpacity }]}>
            <View style={styles.scrollWrap}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                {bodyContent}
              </ScrollView>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  )
}

export default memo(ExpandableCard)

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
  favButton: {
    marginRight: 10,
    padding: 4,
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
  scrollWrap: {
    flex: 1,
  },
})
