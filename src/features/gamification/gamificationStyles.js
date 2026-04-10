import { StyleSheet, Dimensions } from 'react-native'
import { COLORS } from '../../shared/theme/colors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Streak section
  streakCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(228, 90, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  streakSubtitle: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 2,
  },
  streakStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
  },
  streakStatItem: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  streakStatLabel: {
    fontSize: 11,
    color: COLORS.textDim,
    marginTop: 2,
  },

  // Calendar heatmap
  calendarContainer: {
    marginTop: 4,
  },
  calendarMonthLabel: {
    fontSize: 12,
    color: COLORS.textDim,
    marginBottom: 8,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  calendarDay: {
    width: (SCREEN_WIDTH - 80) / 7 - 3,
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  calendarDayActive: {
    backgroundColor: COLORS.accent,
  },
  calendarDayToday: {
    borderWidth: 1.5,
    borderColor: COLORS.text,
  },

  // Achievements section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
    marginTop: 8,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  achievementCard: {
    width: (SCREEN_WIDTH - 60) / 3 - 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  achievementCardUnlocked: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(228, 90, 132, 0.08)',
  },
  achievementIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementIconLocked: {
    backgroundColor: COLORS.border,
  },
  achievementIconUnlocked: {
    backgroundColor: 'rgba(228, 90, 132, 0.2)',
  },
  achievementName: {
    fontSize: 10,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 13,
  },
  achievementNameUnlocked: {
    color: COLORS.text,
  },

  // Flashcard section
  flashcardArea: {
    marginBottom: 20,
  },
  flashcardDeckSelector: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  flashcardDeckChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flashcardDeckChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  flashcardDeckChipText: {
    fontSize: 12,
    color: COLORS.textDim,
    fontWeight: '500',
  },
  flashcardDeckChipTextActive: {
    color: COLORS.white,
  },
  flashcardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flashcardLabel: {
    fontSize: 12,
    color: COLORS.textDim,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  flashcardQuestion: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  flashcardHint: {
    fontSize: 13,
    color: COLORS.textDim,
    textAlign: 'center',
  },
  flashcardAnswer: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: 8,
  },
  flashcardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  flashcardButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  flashcardButtonForgot: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  flashcardButtonHard: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201, 180, 88, 0.1)',
  },
  flashcardButtonGood: {
    borderColor: COLORS.green,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  flashcardButtonEasy: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(228, 90, 132, 0.1)',
  },
  flashcardButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  flashcardProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 6,
  },
  flashcardProgressText: {
    fontSize: 12,
    color: COLORS.textDim,
  },
  flashcardEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flashcardEmptyText: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 12,
    textAlign: 'center',
  },
  tapToReveal: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 16,
    fontStyle: 'italic',
  },
})
