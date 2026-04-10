import { View, Text } from 'react-native'
import React, { useMemo } from 'react'
import styles from '../gamificationStyles'

const StreakHeatmap = ({ practiceDates }) => {
  const calendarData = useMemo(() => {
    const today = new Date()
    const days = []

    // Show last 35 days (5 weeks)
    for (let i = 34; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        active: practiceDates.includes(dateStr),
        isToday: i === 0,
      })
    }

    return days
  }, [practiceDates])

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarGrid}>
        {calendarData.map((day) => (
          <View
            key={day.date}
            style={[
              styles.calendarDay,
              day.active && styles.calendarDayActive,
              day.isToday && styles.calendarDayToday,
            ]}
          />
        ))}
      </View>
    </View>
  )
}

export default StreakHeatmap
