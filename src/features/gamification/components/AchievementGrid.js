import { View, Text } from 'react-native'
import React from 'react'
import { Icon } from 'react-native-elements'
import { COLORS } from '../../../shared/theme/colors'
import { t } from '../../../../i18n/translations'
import styles from '../gamificationStyles'

const AchievementGrid = ({ achievements, unlocked, language }) => {
  return (
    <View style={styles.achievementsGrid}>
      {achievements.map((achievement) => {
        const isUnlocked = !!unlocked[achievement.id]
        return (
          <View
            key={achievement.id}
            style={[styles.achievementCard, isUnlocked && styles.achievementCardUnlocked]}
          >
            <View style={[styles.achievementIconCircle, isUnlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked]}>
              <Icon
                name={achievement.icon}
                type="material"
                color={isUnlocked ? COLORS.accent : COLORS.textDim}
                size={20}
              />
            </View>
            <Text style={[styles.achievementName, isUnlocked && styles.achievementNameUnlocked]} numberOfLines={2}>
              {t(language, `gamification.badge_${achievement.id}`)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

export default AchievementGrid
