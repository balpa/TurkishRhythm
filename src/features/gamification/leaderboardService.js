import { supabase } from '../../../lib/supabase'
import { RHYTHM_LIBRARY_BY_KEY } from '../../../data/data'

/**
 * Upload a practice score to the leaderboard for all choruses the user is a member of.
 * Only updates if the new score is better than the existing one.
 * Runs in background — errors are silently caught to not disrupt practice flow.
 */
export const uploadPracticeScore = async (rhythmKey, bpm, accuracy, cycles) => {
  try {
    if (accuracy < 50 || cycles < 1) return

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return

    const { data: memberships, error: memberError } = await supabase
      .from('chorus_members')
      .select('chorus_id')
      .eq('user_id', user.id)

    if (memberError || !memberships || memberships.length === 0) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()

    const displayName = profile?.display_name || null
    const rhythmName = RHYTHM_LIBRARY_BY_KEY[rhythmKey]?.name || rhythmKey

    for (const membership of memberships) {
      try {
        const { data: existing } = await supabase
          .from('practice_leaderboard')
          .select('id, best_accuracy, best_bpm, total_cycles')
          .eq('chorus_id', membership.chorus_id)
          .eq('user_id', user.id)
          .eq('rhythm_key', rhythmKey)
          .maybeSingle()

        if (existing) {
          const isBetter = accuracy > existing.best_accuracy ||
            (accuracy === existing.best_accuracy && bpm > existing.best_bpm)

          await supabase
            .from('practice_leaderboard')
            .update({
              ...(isBetter ? { best_accuracy: accuracy, best_bpm: bpm, display_name: displayName, rhythm_name: rhythmName } : {}),
              total_cycles: existing.total_cycles + cycles,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('practice_leaderboard')
            .insert({
              chorus_id: membership.chorus_id,
              user_id: user.id,
              display_name: displayName,
              rhythm_key: rhythmKey,
              rhythm_name: rhythmName,
              best_accuracy: accuracy,
              best_bpm: bpm,
              total_cycles: cycles,
            })
        }
      } catch {
        // Individual chorus upsert failed — continue with next
      }
    }
  } catch {
    // Background upload failed — don't disrupt user experience
  }
}
