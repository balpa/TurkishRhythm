import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEYS = {
  PRACTICE_DATES: '@gamification_practice_dates',
  ACHIEVEMENTS: '@gamification_achievements',
  FLASHCARD_STATE: '@gamification_flashcard_state',
  PRACTICE_STATS: '@gamification_practice_stats',
}

// ---------- Practice Streak ----------

export const recordPracticeSession = async (rhythmKey, bpm, accuracy, cycles) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const dates = await getPracticeDates()
    if (!dates.includes(today)) {
      dates.push(today)
      await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_DATES, JSON.stringify(dates))
    }

    const stats = await getPracticeStats()
    const session = { rhythmKey, bpm, accuracy, cycles, date: today, timestamp: Date.now() }
    stats.sessions.push(session)

    if (!stats.bestByRhythm[rhythmKey] || accuracy > stats.bestByRhythm[rhythmKey].accuracy ||
      (accuracy === stats.bestByRhythm[rhythmKey].accuracy && bpm > stats.bestByRhythm[rhythmKey].bpm)) {
      stats.bestByRhythm[rhythmKey] = { accuracy, bpm, cycles, date: today }
    }

    stats.totalSessions = (stats.totalSessions || 0) + 1
    stats.totalCycles = (stats.totalCycles || 0) + cycles

    await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_STATS, JSON.stringify(stats))
    return stats
  } catch {
    return { sessions: [], bestByRhythm: {}, totalSessions: 0, totalCycles: 0 }
  }
}

export const getPracticeDates = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_DATES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const getPracticeStats = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_STATS)
    return raw ? JSON.parse(raw) : { sessions: [], bestByRhythm: {}, totalSessions: 0, totalCycles: 0 }
  } catch {
    return { sessions: [], bestByRhythm: {}, totalSessions: 0, totalCycles: 0 }
  }
}

export const getStreakInfo = async () => {
  try {
    const dates = await getPracticeDates()
    if (dates.length === 0) return { current: 0, best: 0, totalDays: 0 }

    const sorted = [...dates].sort()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    let current = 0
    const lastDate = sorted[sorted.length - 1]
    if (lastDate === today || lastDate === yesterday) {
      current = 1
      for (let i = sorted.length - 2; i >= 0; i--) {
        const prev = new Date(sorted[i + 1])
        const curr = new Date(sorted[i])
        const diffDays = Math.round((prev - curr) / 86400000)
        if (diffDays === 1) {
          current++
        } else {
          break
        }
      }
    }

    let best = 1
    let streak = 1
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diffDays = Math.round((curr - prev) / 86400000)
      if (diffDays === 1) {
        streak++
        best = Math.max(best, streak)
      } else if (diffDays > 1) {
        streak = 1
      }
    }

    return { current, best, totalDays: dates.length }
  } catch {
    return { current: 0, best: 0, totalDays: 0 }
  }
}

// ---------- Achievements ----------

export const getUnlockedAchievements = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export const unlockAchievement = async (achievementId) => {
  try {
    const achievements = await getUnlockedAchievements()
    if (!achievements[achievementId]) {
      achievements[achievementId] = { unlockedAt: Date.now() }
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements))
    }
    return achievements
  } catch {
    return {}
  }
}

export const checkAndUnlockAchievements = async () => {
  try {
    const stats = await getPracticeStats()
    const streak = await getStreakInfo()
    const unlocked = await getUnlockedAchievements()
    const newlyUnlocked = []

    const checks = [
      { id: 'first_practice', condition: stats.totalSessions >= 1 },
      { id: 'sessions_10', condition: stats.totalSessions >= 10 },
      { id: 'sessions_50', condition: stats.totalSessions >= 50 },
      { id: 'sessions_100', condition: stats.totalSessions >= 100 },
      { id: 'streak_3', condition: streak.current >= 3 },
      { id: 'streak_7', condition: streak.current >= 7 },
      { id: 'streak_30', condition: streak.current >= 30 },
      { id: 'cycles_100', condition: stats.totalCycles >= 100 },
      { id: 'cycles_500', condition: stats.totalCycles >= 500 },
      { id: 'perfect_accuracy', condition: Object.values(stats.bestByRhythm).some(r => r.accuracy === 100) },
      { id: 'five_rhythms', condition: Object.keys(stats.bestByRhythm).length >= 5 },
      { id: 'ten_rhythms', condition: Object.keys(stats.bestByRhythm).length >= 10 },
      { id: 'all_rhythms', condition: Object.keys(stats.bestByRhythm).length >= 21 },
      { id: 'speed_120', condition: Object.values(stats.bestByRhythm).some(r => r.bpm >= 120 && r.accuracy >= 80) },
      { id: 'speed_160', condition: Object.values(stats.bestByRhythm).some(r => r.bpm >= 160 && r.accuracy >= 80) },
    ]

    for (const check of checks) {
      if (check.condition && !unlocked[check.id]) {
        unlocked[check.id] = { unlockedAt: Date.now() }
        newlyUnlocked.push(check.id)
      }
    }

    if (newlyUnlocked.length > 0) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked))
    }

    return { unlocked, newlyUnlocked }
  } catch {
    return { unlocked: {}, newlyUnlocked: [] }
  }
}

// ---------- Flashcard Spaced Repetition ----------

export const getFlashcardState = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FLASHCARD_STATE)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export const saveFlashcardReview = async (cardId, quality) => {
  try {
    const state = await getFlashcardState()
    const card = state[cardId] || { interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: 0 }

    if (quality < 2) {
      card.repetitions = 0
      card.interval = 1
    } else {
      card.repetitions += 1
      if (card.repetitions === 1) {
        card.interval = 1
      } else if (card.repetitions === 2) {
        card.interval = 3
      } else {
        card.interval = Math.round(card.interval * card.easeFactor)
      }
    }

    card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)))
    card.nextReview = Date.now() + card.interval * 86400000
    card.lastReview = Date.now()
    card.lastQuality = quality

    state[cardId] = card
    await AsyncStorage.setItem(STORAGE_KEYS.FLASHCARD_STATE, JSON.stringify(state))
    return state
  } catch {
    return {}
  }
}

export const getDueFlashcards = async (allCardIds) => {
  try {
    const state = await getFlashcardState()
    const now = Date.now()

    const due = []
    const newCards = []

    for (const id of allCardIds) {
      if (!state[id]) {
        newCards.push(id)
      } else if (state[id].nextReview <= now) {
        due.push(id)
      }
    }

    return [...due, ...newCards.slice(0, 5)]
  } catch {
    return allCardIds.slice(0, 5)
  }
}
