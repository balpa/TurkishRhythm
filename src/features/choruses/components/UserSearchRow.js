import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native'
import { Icon } from 'react-native-elements'
import styles from '../addMemberStyles'
import { COLORS } from '../chorusesShared'

const UserSearchRow = ({ user, onAdd, adding, alreadyMember, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 60, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()
  }, [fadeAnim, index])

  const displayName = user.display_name || user.email || '-'
  const initial = (displayName || '?')[0].toUpperCase()

  return (
    <Animated.View style={[styles.userRow, { opacity: fadeAnim }]}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
      <View style={styles.userInfo}><Text style={styles.userEmail} numberOfLines={1}>{displayName}</Text></View>
      {alreadyMember ? (
        <View style={styles.alreadyBadge}><Icon name="check-circle" color={COLORS.green} size={20} /></View>
      ) : (
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => onAdd(user)} disabled={adding}>
          {adding ? <ActivityIndicator size="small" color={COLORS.white} /> : <Icon name="person-add" color={COLORS.white} size={18} />}
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

export default UserSearchRow
