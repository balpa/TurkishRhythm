import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native'
import { Icon } from 'react-native-elements'
import { t } from '../../../../i18n/translations'
import styles from '../chorusesStyles'
import { COLORS } from '../chorusesShared'

export const Stars = ({ rating, size = 14, color = COLORS.gold }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((value) => (
      <Icon
        key={value}
        name={value <= Math.round(rating) ? 'star' : 'star-border'}
        color={value <= Math.round(rating) ? color : COLORS.border}
        size={size}
      />
    ))}
  </View>
)

export const StarRating = ({ rating, onRate, size = 28 }) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((value) => (
      <TouchableOpacity key={value} activeOpacity={0.6} onPress={() => onRate(value)}>
        <Icon
          name={value <= rating ? 'star' : 'star-border'}
          color={value <= rating ? COLORS.gold : COLORS.border}
          size={size}
        />
      </TouchableOpacity>
    ))}
  </View>
)

const useCardAnimation = (index, delayStep) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    const delay = index * delayStep

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start()
  }, [delayStep, fadeAnim, index, slideAnim])

  return {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  }
}

export const ChorusCard = ({ chorus, index, onPress, onInfo, language }) => {
  const animationStyle = useCardAnimation(index, 80)
  const roleColor = chorus.role === 'admin' ? COLORS.gold : COLORS.green
  const roleLabel = chorus.role === 'admin'
    ? t(language, 'chorusDetail.roleAdmin')
    : t(language, 'chorusDetail.roleMember')
  const avgRating = chorus.avg_rating || 0
  const ratingCount = chorus.rating_count || 0

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Animated.View style={[styles.card, animationStyle]}>
        <View style={styles.cardIcon}>
          <Icon name="groups" color={COLORS.accent} size={28} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{chorus.name}</Text>
          {chorus.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{chorus.description}</Text>
          ) : null}
          <View style={styles.myCardRating}>
            <Stars rating={avgRating} size={12} />
            <Text style={styles.myCardRatingText}>
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </Text>
            <Text style={styles.myCardRatingCount}>({ratingCount})</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoBtn} activeOpacity={0.6} onPress={onInfo}>
          <Icon name="info-outline" color={COLORS.textDim} size={20} />
        </TouchableOpacity>
        <View style={[styles.roleBadge, { borderColor: roleColor }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
        </View>
        <Icon name="chevron-right" color={COLORS.textDim} size={22} style={{ marginLeft: 4 }} />
      </Animated.View>
    </TouchableOpacity>
  )
}

export const ExploreChorusCard = ({ chorus, index, language, userRating, onRate, onInfo }) => {
  const animationStyle = useCardAnimation(index, 60)
  const avgRating = chorus.avg_rating || 0
  const ratingCount = chorus.rating_count || 0

  return (
    <Animated.View style={[styles.exploreCard, animationStyle]}>
      <View style={styles.exploreHeader}>
        <View style={styles.cardIcon}>
          <Icon name="groups" color={COLORS.accent} size={28} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{chorus.name}</Text>
          {chorus.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{chorus.description}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.infoBtn} activeOpacity={0.6} onPress={onInfo}>
          <Icon name="info-outline" color={COLORS.textDim} size={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.ratingSection}>
        <View style={styles.avgRatingRow}>
          <Stars rating={avgRating} />
          <Text style={styles.avgRatingText}>
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </Text>
          <Text style={styles.ratingCount}>({ratingCount})</Text>
        </View>
        <View style={styles.userRatingRow}>
          <Text style={styles.userRatingLabel}>{t(language, 'chorus.yourRating')}</Text>
          <StarRating rating={userRating || 0} onRate={onRate} size={24} />
        </View>
      </View>
    </Animated.View>
  )
}
