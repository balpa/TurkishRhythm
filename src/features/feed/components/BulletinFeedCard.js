import { View, Text, TouchableOpacity } from 'react-native'
import React, { memo } from 'react'
import { Icon } from 'react-native-elements'
import { t } from '../../../../i18n/translations'
import styles from '../feedStyles'
import { ATTENDANCE_STATUSES, COLORS, getUserDisplayName } from '../feedShared'

const BulletinFeedCard = memo(({ item, language, attendanceEnabled, attendanceSavingId, onAttendanceChange }) => {
  const date = new Date(item.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )
  const authorName = getUserDisplayName(item.profiles, item.created_by)
  const chorusName = item.choruses?.name || ''
  const eventDateFormatted = item.event_date
    ? new Date(item.event_date).toLocaleDateString(
        language === 'tr' ? 'tr-TR' : 'en-US',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )
    : null
  const eventTimeFormatted = item.event_date
    ? new Date(item.event_date).toLocaleTimeString(
        language === 'tr' ? 'tr-TR' : 'en-US',
        { hour: '2-digit', minute: '2-digit' }
      )
    : null
  const isPastEvent = item.is_event && item.event_date && new Date(item.event_date) < new Date()
  const attendanceSummary = item.attendance_summary || { attending: 0, maybe: 0, absent: 0 }

  return (
    <View style={[styles.card, isPastEvent && styles.pastCard]}>
      <View style={styles.cardSourceRow}>
        <View style={styles.cardSourceIcon}>
          <Icon name="groups" color={COLORS.accent} size={16} />
        </View>
        <Text style={styles.cardSourceName} numberOfLines={1}>{chorusName}</Text>
        <Text style={styles.cardDate}>{date}</Text>
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: COLORS.green + '20' }]}>
          <Icon name="public" color={COLORS.green} size={12} />
          <Text style={[styles.badgeText, { color: COLORS.green }]}>{t(language, 'bulletin.public')}</Text>
        </View>
        {item.is_event && (
          <View style={[styles.badge, { backgroundColor: COLORS.accent + '20' }]}>
            <Icon name="event" color={COLORS.accent} size={12} />
            <Text style={[styles.badgeText, { color: COLORS.accent }]}>{t(language, 'bulletin.concert')}</Text>
          </View>
        )}
        {isPastEvent && (
          <View style={[styles.badge, { backgroundColor: COLORS.textDim + '20' }]}>
            <Icon name="event-busy" color={COLORS.textDim} size={12} />
            <Text style={[styles.badgeText, { color: COLORS.textDim }]}>{t(language, 'bulletin.pastEvent')}</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={4}>{item.content}</Text>

      {item.is_event && (
        <View style={styles.eventInfo}>
          <View style={styles.eventInfoRow}>
            <Icon name="calendar-today" color={COLORS.accent} size={14} />
            <Text style={styles.eventInfoText}>{eventDateFormatted} — {eventTimeFormatted}</Text>
          </View>
          {item.event_location && (
            <View style={styles.eventInfoRow}>
              <Icon name="location-on" color={COLORS.accent} size={14} />
              <Text style={styles.eventInfoText}>{item.event_location}</Text>
            </View>
          )}
          {item.event_price != null && (
            <View style={styles.eventInfoRow}>
              <Icon name="confirmation-number" color={COLORS.accent} size={14} />
              <Text style={styles.eventInfoText}>
                {item.event_price === 'free' ? t(language, 'bulletin.free') : `${item.event_price} ₺`}
              </Text>
            </View>
          )}
        </View>
      )}

      {item.is_event && attendanceEnabled && (
        <View style={styles.attendanceCard}>
          <View style={styles.attendanceHeader}>
            <Text style={styles.attendanceTitle}>{t(language, 'chorusDetail.attendanceTitle')}</Text>
            <Text style={styles.attendanceStatusText}>
              {item.my_attendance_status
                ? t(language, `chorusDetail.attendance_${item.my_attendance_status}`)
                : t(language, 'chorusDetail.attendance_notResponded')}
            </Text>
          </View>
          <View style={styles.attendanceStats}>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceStatValue}>{attendanceSummary.attending}</Text>
              <Text style={styles.attendanceStatLabel}>{t(language, 'chorusDetail.attendance_attending')}</Text>
            </View>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceStatValue}>{attendanceSummary.maybe}</Text>
              <Text style={styles.attendanceStatLabel}>{t(language, 'chorusDetail.attendance_maybe')}</Text>
            </View>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceStatValue}>{attendanceSummary.absent}</Text>
              <Text style={styles.attendanceStatLabel}>{t(language, 'chorusDetail.attendance_absent')}</Text>
            </View>
          </View>
          {!isPastEvent && (
            <View style={styles.attendanceActions}>
              {ATTENDANCE_STATUSES.map((status) => {
                const isActive = item.my_attendance_status === status
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.attendanceButton, isActive && styles.attendanceButtonActive]}
                    activeOpacity={0.7}
                    onPress={() => onAttendanceChange(item, status)}
                    disabled={attendanceSavingId === item.id}
                  >
                    <Text style={[styles.attendanceButtonText, isActive && styles.attendanceButtonTextActive]}>
                      {t(language, `chorusDetail.attendance_${status}`)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      )}

      <Text style={styles.cardAuthor}>{authorName}</Text>
    </View>
  )
})

export default BulletinFeedCard
