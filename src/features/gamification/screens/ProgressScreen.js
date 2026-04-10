import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import { COLORS } from '../../../shared/theme/colors'
import { getStreakInfo, getPracticeDates, getUnlockedAchievements, checkAndUnlockAchievements, getDueFlashcards, saveFlashcardReview } from '../gamificationStorage'
import { ACHIEVEMENTS } from '../achievementDefinitions'
import { FLASHCARD_DECKS, getAllFlashcardIds, getFlashcardById } from '../flashcardData'
import styles from '../gamificationStyles'
import StreakHeatmap from '../components/StreakHeatmap'
import AchievementGrid from '../components/AchievementGrid'
import FlashcardReview from '../components/FlashcardReview'

const ProgressScreen = ({ onBack }) => {
  const { language } = useLanguage()
  const [streak, setStreak] = useState({ current: 0, best: 0, totalDays: 0 })
  const [practiceDates, setPracticeDates] = useState([])
  const [unlocked, setUnlocked] = useState({})
  const [dueCards, setDueCards] = useState([])
  const [selectedDeck, setSelectedDeck] = useState(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadData()
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
  }, [])

  const loadData = async () => {
    const [streakData, dates, achievementResult] = await Promise.all([
      getStreakInfo(),
      getPracticeDates(),
      checkAndUnlockAchievements(),
    ])
    setStreak(streakData)
    setPracticeDates(dates)
    setUnlocked(achievementResult.unlocked)

    const allIds = getAllFlashcardIds()
    const due = await getDueFlashcards(allIds)
    setDueCards(due)
  }

  const handleFlashcardReview = useCallback(async (cardId, quality) => {
    await saveFlashcardReview(cardId, quality)
    setDueCards(current => current.filter(id => id !== cardId))
  }, [])

  const handleSelectDeck = (deckId) => {
    if (selectedDeck === deckId) {
      setSelectedDeck(null)
      // Reset to all due cards
      getDueFlashcards(getAllFlashcardIds()).then(setDueCards)
    } else {
      setSelectedDeck(deckId)
      const deck = FLASHCARD_DECKS[deckId]
      const deckCardIds = deck.cards.map(c => c.id)
      getDueFlashcards(deckCardIds).then(setDueCards)
    }
  }

  const unlockedCount = Object.keys(unlocked).length

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7} accessibilityLabel="Back" accessibilityRole="button">
            <Icon name="arrow-back" color={COLORS.text} size={20} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t(language, 'gamification.title')}</Text>
        </View>

        {/* Streak Section */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakIconCircle}>
              <Icon name="local-fire-department" color={COLORS.accent} size={24} />
            </View>
            <View>
              <Text style={styles.streakTitle}>{t(language, 'gamification.streak')}</Text>
              <Text style={styles.streakSubtitle}>{t(language, 'gamification.streakDesc')}</Text>
            </View>
          </View>

          <View style={styles.streakStatsRow}>
            <View style={styles.streakStatItem}>
              <Text style={styles.streakStatValue}>{streak.current}</Text>
              <Text style={styles.streakStatLabel}>{t(language, 'gamification.currentStreak')}</Text>
            </View>
            <View style={styles.streakStatItem}>
              <Text style={styles.streakStatValue}>{streak.best}</Text>
              <Text style={styles.streakStatLabel}>{t(language, 'gamification.bestStreak')}</Text>
            </View>
            <View style={styles.streakStatItem}>
              <Text style={styles.streakStatValue}>{streak.totalDays}</Text>
              <Text style={styles.streakStatLabel}>{t(language, 'gamification.totalDays')}</Text>
            </View>
          </View>

          <StreakHeatmap practiceDates={practiceDates} />
        </View>

        {/* Achievements Section */}
        <Text style={styles.sectionTitle}>
          {t(language, 'gamification.achievements')} ({unlockedCount}/{ACHIEVEMENTS.length})
        </Text>
        <AchievementGrid achievements={ACHIEVEMENTS} unlocked={unlocked} language={language} />

        {/* Flashcards Section */}
        <Text style={styles.sectionTitle}>{t(language, 'gamification.flashcards')}</Text>
        <FlashcardReview
          dueCards={dueCards}
          selectedDeck={selectedDeck}
          onSelectDeck={handleSelectDeck}
          onReview={handleFlashcardReview}
          language={language}
        />
      </ScrollView>
    </Animated.View>
  )
}

export default ProgressScreen
