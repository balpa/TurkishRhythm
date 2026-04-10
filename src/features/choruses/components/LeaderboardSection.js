import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Icon } from 'react-native-elements'
import { supabase } from '../../../../lib/supabase'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import { COLORS } from '../../../shared/theme/colors'

const LeaderboardSection = ({ chorusId }) => {
  const { language } = useLanguage()
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [chorusId])

  const fetchLeaderboard = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('practice_leaderboard')
      .select('id, user_id, display_name, rhythm_key, rhythm_name, best_accuracy, best_bpm, total_cycles, updated_at')
      .eq('chorus_id', chorusId)
      .order('best_accuracy', { ascending: false })
      .order('best_bpm', { ascending: false })
      .limit(30)

    if (!error && data) {
      setScores(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={COLORS.accent} />
      </View>
    )
  }

  if (scores.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="leaderboard" color={COLORS.border} size={48} />
        <Text style={styles.emptyTitle}>{t(language, 'leaderboard.empty')}</Text>
        <Text style={styles.emptyDesc}>{t(language, 'leaderboard.emptyDesc')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
        <Text style={[styles.headerCell, styles.nameCell]}>{t(language, 'leaderboard.member')}</Text>
        <Text style={[styles.headerCell, styles.rhythmCell]}>{t(language, 'leaderboard.rhythm')}</Text>
        <Text style={[styles.headerCell, styles.scoreCell]}>{t(language, 'leaderboard.accuracy')}</Text>
        <Text style={[styles.headerCell, styles.bpmCell]}>BPM</Text>
      </View>

      {scores.map((score, index) => (
        <View key={score.id} style={[styles.row, index < 3 && styles.topRow]}>
          <View style={[styles.rankCell, styles.rankBadge]}>
            {index < 3 ? (
              <Icon name="emoji-events" color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} size={16} />
            ) : (
              <Text style={styles.rankText}>{index + 1}</Text>
            )}
          </View>
          <Text style={[styles.cell, styles.nameCell]} numberOfLines={1}>
            {score.display_name || t(language, 'leaderboard.anonymous')}
          </Text>
          <Text style={[styles.cell, styles.rhythmCell]} numberOfLines={1}>
            {score.rhythm_name}
          </Text>
          <Text style={[styles.cell, styles.scoreCell, { color: score.best_accuracy >= 90 ? COLORS.green : score.best_accuracy >= 70 ? COLORS.gold : COLORS.text }]}>
            {score.best_accuracy}%
          </Text>
          <Text style={[styles.cell, styles.bpmCell]}>
            {score.best_bpm}
          </Text>
        </View>
      ))}
    </View>
  )
}

export default LeaderboardSection

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  centered: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topRow: {
    backgroundColor: 'rgba(228, 90, 132, 0.05)',
  },
  rankCell: {
    width: 32,
    alignItems: 'center',
  },
  rankBadge: {
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 13,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  nameCell: {
    flex: 1,
    marginLeft: 8,
  },
  rhythmCell: {
    width: 70,
    textAlign: 'center',
  },
  scoreCell: {
    width: 45,
    textAlign: 'center',
    fontWeight: '700',
  },
  bpmCell: {
    width: 40,
    textAlign: 'center',
  },
  cell: {
    fontSize: 13,
    color: COLORS.text,
  },
})
