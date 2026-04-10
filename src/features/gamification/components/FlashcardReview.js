import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Icon } from 'react-native-elements'
import { COLORS } from '../../../shared/theme/colors'
import { t } from '../../../../i18n/translations'
import { FLASHCARD_DECKS, getFlashcardById } from '../flashcardData'
import styles from '../gamificationStyles'

const DECK_ORDER = ['duragi', 'guclusu', 'seyri', 'yedeni']

const FlashcardReview = ({ dueCards, selectedDeck, onSelectDeck, onReview, language }) => {
  const [showAnswer, setShowAnswer] = useState(false)
  const currentCardId = dueCards[0] || null
  const currentCard = currentCardId ? getFlashcardById(currentCardId) : null

  const handleReveal = () => setShowAnswer(true)

  const handleRate = (quality) => {
    setShowAnswer(false)
    onReview(currentCardId, quality)
  }

  const getDeckLabel = (deckId) => t(language, `gamification.deck_${deckId}`)

  const getQuestionText = (card) => {
    if (!card) return ''
    const deckId = card.deckId
    return `${card.makam}`
  }

  const getDeckQuestion = (deckId) => t(language, `gamification.deckQuestion_${deckId}`)

  const getAnswerText = (card) => {
    if (!card) return ''
    if (card.deckId === 'seyri') {
      return t(language, `gamification.seyri_${card.answer}`)
    }
    return card.answer
  }

  if (!currentCard) {
    return (
      <View style={styles.flashcardArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashcardDeckSelector}>
          {DECK_ORDER.map((deckId) => (
            <TouchableOpacity
              key={deckId}
              style={[styles.flashcardDeckChip, selectedDeck === deckId && styles.flashcardDeckChipActive]}
              onPress={() => onSelectDeck(deckId)}
              activeOpacity={0.7}
            >
              <Text style={[styles.flashcardDeckChipText, selectedDeck === deckId && styles.flashcardDeckChipTextActive]}>
                {getDeckLabel(deckId)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.flashcardEmpty}>
          <Icon name="check-circle" color={COLORS.green} size={36} />
          <Text style={styles.flashcardEmptyText}>{t(language, 'gamification.allReviewed')}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.flashcardArea}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashcardDeckSelector}>
        {DECK_ORDER.map((deckId) => (
          <TouchableOpacity
            key={deckId}
            style={[styles.flashcardDeckChip, selectedDeck === deckId && styles.flashcardDeckChipActive]}
            onPress={() => onSelectDeck(deckId)}
            activeOpacity={0.7}
          >
            <Text style={[styles.flashcardDeckChipText, selectedDeck === deckId && styles.flashcardDeckChipTextActive]}>
              {getDeckLabel(deckId)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.flashcardCard}
        activeOpacity={0.9}
        onPress={!showAnswer ? handleReveal : undefined}
      >
        <Text style={styles.flashcardLabel}>{getDeckQuestion(currentCard.deckId)}</Text>
        <Text style={styles.flashcardQuestion}>{getQuestionText(currentCard)}</Text>

        {showAnswer ? (
          <Text style={styles.flashcardAnswer}>{getAnswerText(currentCard)}</Text>
        ) : (
          <Text style={styles.tapToReveal}>{t(language, 'gamification.tapToReveal')}</Text>
        )}
      </TouchableOpacity>

      {showAnswer && (
        <View style={styles.flashcardActions}>
          <TouchableOpacity style={[styles.flashcardButton, styles.flashcardButtonForgot]} onPress={() => handleRate(0)}>
            <Text style={[styles.flashcardButtonText, { color: COLORS.error }]}>{t(language, 'gamification.forgot')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.flashcardButton, styles.flashcardButtonHard]} onPress={() => handleRate(1)}>
            <Text style={[styles.flashcardButtonText, { color: COLORS.gold }]}>{t(language, 'gamification.hard')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.flashcardButton, styles.flashcardButtonGood]} onPress={() => handleRate(2)}>
            <Text style={[styles.flashcardButtonText, { color: COLORS.green }]}>{t(language, 'gamification.good')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.flashcardButton, styles.flashcardButtonEasy]} onPress={() => handleRate(3)}>
            <Text style={[styles.flashcardButtonText, { color: COLORS.accent }]}>{t(language, 'gamification.easy')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.flashcardProgress}>
        <Icon name="style" color={COLORS.textDim} size={14} />
        <Text style={styles.flashcardProgressText}>
          {dueCards.length} {t(language, 'gamification.cardsRemaining')}
        </Text>
      </View>
    </View>
  )
}

export default FlashcardReview
