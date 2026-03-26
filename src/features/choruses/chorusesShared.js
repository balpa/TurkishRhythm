import { COLORS } from '../../shared/theme/colors'

export { COLORS }

export const TABS = ['explore', 'my']

export const buildAverageRatings = (ratingsData, currentUserId) => {
  const averages = {}
  const userRatings = {}

  if (!ratingsData?.length) {
    return { averages, userRatings }
  }

  const grouped = {}

  ratingsData.forEach((ratingRow) => {
    if (!grouped[ratingRow.chorus_id]) {
      grouped[ratingRow.chorus_id] = []
    }

    grouped[ratingRow.chorus_id].push(ratingRow.rating)

    if (currentUserId && ratingRow.user_id === currentUserId) {
      userRatings[ratingRow.chorus_id] = ratingRow.rating
    }
  })

  Object.keys(grouped).forEach((chorusId) => {
    const chorusRatings = grouped[chorusId]
    averages[chorusId] = {
      avg: chorusRatings.reduce((sum, value) => sum + value, 0) / chorusRatings.length,
      count: chorusRatings.length,
    }
  })

  return { averages, userRatings }
}

export const applyOptimisticRating = (choruses, chorusId, previousRating, nextRating) => {
  return choruses.map((chorus) => {
    if (chorus.id !== chorusId) return chorus

    const oldCount = chorus.rating_count || 0
    const oldAvg = chorus.avg_rating || 0
    let newAvg
    let newCount

    if (previousRating) {
      newCount = oldCount
      newAvg = oldCount > 0 ? (oldAvg * oldCount - previousRating + nextRating) / newCount : nextRating
    } else {
      newCount = oldCount + 1
      newAvg = (oldAvg * oldCount + nextRating) / newCount
    }

    return { ...chorus, avg_rating: newAvg, rating_count: newCount }
  })
}
