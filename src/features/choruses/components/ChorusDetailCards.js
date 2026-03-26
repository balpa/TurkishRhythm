import { View, Text, TouchableOpacity, Image, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'
import { Swipeable } from 'react-native-gesture-handler'
import { t } from '../../../../i18n/translations'
import styles from '../chorusDetailStyles'
import { ATTENDANCE_STATUSES, COLORS, getUserDisplayName, openLocationInMaps } from '../chorusDetailShared'

export const renderDeleteAction = (onDelete) => () => (
  <View style={styles.deleteActionWrapper}>
    <TouchableOpacity style={styles.deleteAction} activeOpacity={0.7} onPress={onDelete}>
      <Icon name="delete" color="#fff" size={20} />
    </TouchableOpacity>
  </View>
)

export const SwipeableNoteCard = ({ note, language, onPress, onDelete, isAdmin }) => {
  const swipeRef = useRef(null)
  const isImage = note.file_type?.startsWith('image/')
  const uploaderName = getUserDisplayName(note.profiles, note.uploaded_by)
  const date = new Date(note.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )

  const handleDelete = () => {
    swipeRef.current?.close()
    onDelete(note)
  }

  const card = (
    <TouchableOpacity style={styles.noteCard} activeOpacity={0.8} onPress={onPress}>
      {isImage ? (
        <Image source={{ uri: note.file_url }} style={styles.noteImage} />
      ) : (
        <View style={styles.noteFileIcon}>
          <Icon name="picture-as-pdf" color={COLORS.accent} size={28} />
        </View>
      )}
      <View style={styles.noteInfo}>
        <Text style={styles.noteFileName} numberOfLines={1}>{note.file_name}</Text>
        <Text style={styles.noteMeta}>{uploaderName} • {date}</Text>
      </View>
    </TouchableOpacity>
  )

  if (!isAdmin) {
    return <View style={styles.swipeContainer}>{card}</View>
  }

  return (
    <View style={styles.swipeContainer}>
      <Swipeable ref={swipeRef} renderRightActions={renderDeleteAction(handleDelete)} overshootRight={false} rightThreshold={40}>
        {card}
      </Swipeable>
    </View>
  )
}

export const SwipeableBulletinCard = ({ bulletin, language, onDelete, onEdit, isAdmin, attendanceEnabled, onAttendanceChange, attendanceSavingId }) => {
  const swipeRef = useRef(null)
  const isPublic = bulletin.visibility === 'public'
  const authorName = getUserDisplayName(bulletin.profiles, bulletin.created_by)
  const date = new Date(bulletin.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )
  const eventDateFormatted = bulletin.event_date
    ? new Date(bulletin.event_date).toLocaleDateString(
        language === 'tr' ? 'tr-TR' : 'en-US',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )
    : null
  const eventTimeFormatted = bulletin.event_date
    ? new Date(bulletin.event_date).toLocaleTimeString(
        language === 'tr' ? 'tr-TR' : 'en-US',
        { hour: '2-digit', minute: '2-digit' }
      )
    : null
  const isPastEvent = bulletin.is_event && bulletin.event_date && new Date(bulletin.event_date) < new Date()
  const attendanceSummary = bulletin.attendance_summary || { attending: 0, maybe: 0, absent: 0 }

  const handleDelete = () => {
    swipeRef.current?.close()
    onDelete(bulletin)
  }

  const handleEdit = () => {
    swipeRef.current?.close()
    onEdit(bulletin)
  }

  const renderActions = () => (
    <View style={styles.swipeActions}>
      <TouchableOpacity style={styles.editAction} activeOpacity={0.7} onPress={handleEdit}>
        <Icon name="edit" color="#fff" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteActionBtn} activeOpacity={0.7} onPress={handleDelete}>
        <Icon name="delete" color="#fff" size={20} />
      </TouchableOpacity>
    </View>
  )

  const card = (
    <View style={[styles.bulletinCard, isPastEvent && styles.pastCard]}>
      <View style={styles.bulletinHeader}>
        <View style={styles.bulletinBadges}>
          <View style={[styles.visibilityBadge, { backgroundColor: isPublic ? COLORS.green + '20' : COLORS.gold + '20' }]}>
            <Icon name={isPublic ? 'public' : 'lock'} color={isPublic ? COLORS.green : COLORS.gold} size={14} />
            <Text style={[styles.visibilityLabel, { color: isPublic ? COLORS.green : COLORS.gold }]}>
              {isPublic ? t(language, 'bulletin.public') : t(language, 'bulletin.private')}
            </Text>
          </View>
          {bulletin.is_event && (
            <View style={[styles.visibilityBadge, { backgroundColor: COLORS.accent + '20' }]}>
              <Icon name="event" color={COLORS.accent} size={14} />
              <Text style={[styles.visibilityLabel, { color: COLORS.accent }]}>
                {t(language, 'bulletin.concert')}
              </Text>
            </View>
          )}
          {isPastEvent && (
            <View style={[styles.visibilityBadge, { backgroundColor: COLORS.textDim + '20' }]}>
              <Icon name="event-busy" color={COLORS.textDim} size={14} />
              <Text style={[styles.visibilityLabel, { color: COLORS.textDim }]}>
                {t(language, 'bulletin.pastEvent')}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.bulletinDate}>{date}</Text>
      </View>
      <Text style={styles.bulletinTitle}>{bulletin.title}</Text>
      <Text style={styles.bulletinContent}>{bulletin.content}</Text>
      {bulletin.is_event && (
        <View style={styles.eventInfo}>
          <View style={styles.eventInfoRow}>
            <Icon name="calendar-today" color={COLORS.accent} size={15} />
            <Text style={styles.eventInfoText}>{eventDateFormatted} • {eventTimeFormatted}</Text>
          </View>
          {bulletin.event_location && (
            <View style={styles.eventInfoRow}>
              <Icon name="location-on" color={COLORS.accent} size={15} />
              <Text style={styles.eventInfoText}>{bulletin.event_location}</Text>
            </View>
          )}
          {bulletin.event_price != null && (
            <View style={styles.eventInfoRow}>
              <Icon name="confirmation-number" color={COLORS.accent} size={15} />
              <Text style={styles.eventInfoText}>
                {bulletin.event_price === 'free' ? t(language, 'bulletin.free') : `${bulletin.event_price} ₺`}
              </Text>
            </View>
          )}
        </View>
      )}
      {bulletin.is_event && attendanceEnabled && (
        <View style={styles.attendanceCard}>
          <View style={styles.attendanceHeader}>
            <Text style={styles.attendanceTitle}>{t(language, 'chorusDetail.attendanceTitle')}</Text>
            <Text style={styles.attendanceStatusText}>
              {bulletin.my_attendance_status
                ? t(language, `chorusDetail.attendance_${bulletin.my_attendance_status}`)
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
                const isActive = bulletin.my_attendance_status === status
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.attendanceButton, isActive && styles.attendanceButtonActive]}
                    activeOpacity={0.7}
                    onPress={() => onAttendanceChange(bulletin, status)}
                    disabled={attendanceSavingId === bulletin.id}
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
      <Text style={styles.bulletinAuthor}>{authorName}</Text>
    </View>
  )

  if (!isAdmin) {
    return <View style={styles.swipeContainer}>{card}</View>
  }

  return (
    <View style={styles.swipeContainer}>
      <Swipeable ref={swipeRef} renderRightActions={renderActions} overshootRight={false} rightThreshold={40}>
        {card}
      </Swipeable>
    </View>
  )
}

export const SwipeableMemberItem = ({ member, index, language, onDelete, isAdmin }) => {
  const swipeRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 60,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim, index])

  const roleColor = member.role === 'admin' ? COLORS.gold : COLORS.green
  const displayName = member.display_name || member.email
  const initial = (displayName || '?')[0].toUpperCase()
  const canDelete = isAdmin && member.role !== 'admin'

  const handleDelete = () => {
    swipeRef.current?.close()
    onDelete(member)
  }

  const card = (
    <Animated.View style={[styles.memberRow, { opacity: fadeAnim, marginBottom: canDelete ? 0 : 8 }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberEmail} numberOfLines={1}>{displayName}</Text>
        <Text style={[styles.memberRole, { color: roleColor }]}>
          {member.role === 'admin' ? t(language, 'chorusDetail.roleAdmin') : t(language, 'chorusDetail.roleMember')}
        </Text>
      </View>
    </Animated.View>
  )

  if (!canDelete) {
    return card
  }

  return (
    <View style={styles.swipeContainer}>
      <Swipeable ref={swipeRef} renderRightActions={renderDeleteAction(handleDelete)} overshootRight={false} rightThreshold={40}>
        {card}
      </Swipeable>
    </View>
  )
}

export const SwipeableRehearsalCard = ({ rehearsal, language, onDelete, onEdit, isAdmin, onAttendanceChange, attendanceSavingId }) => {
  const swipeRef = useRef(null)
  const scheduledDate = new Date(rehearsal.scheduled_at)
  const isPast = scheduledDate < new Date()
  const summary = rehearsal.attendance_summary || { attending: 0, maybe: 0, absent: 0 }
  const formattedDate = scheduledDate.toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
  const formattedTime = scheduledDate.toLocaleTimeString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  )

  const handleDelete = () => {
    swipeRef.current?.close()
    onDelete(rehearsal)
  }

  const handleEdit = () => {
    swipeRef.current?.close()
    onEdit(rehearsal)
  }

  const renderActions = () => (
    <View style={styles.swipeActions}>
      <TouchableOpacity style={styles.editAction} activeOpacity={0.7} onPress={handleEdit}>
        <Icon name="edit" color="#fff" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteActionBtn} activeOpacity={0.7} onPress={handleDelete}>
        <Icon name="delete" color="#fff" size={20} />
      </TouchableOpacity>
    </View>
  )

  const card = (
    <View style={[styles.rehearsalCard, isPast && styles.pastCard]}>
      <View style={styles.rehearsalHeader}>
        <View style={styles.rehearsalTitleWrap}>
          <Text style={styles.rehearsalTitle}>{rehearsal.title}</Text>
          <View style={[styles.visibilityBadge, { backgroundColor: (isPast ? COLORS.textDim : COLORS.accent) + '20' }]}>
            <Icon name={isPast ? 'history' : 'schedule'} color={isPast ? COLORS.textDim : COLORS.accent} size={14} />
            <Text style={[styles.visibilityLabel, { color: isPast ? COLORS.textDim : COLORS.accent }]}>
              {isPast ? t(language, 'rehearsal.past') : t(language, 'rehearsal.upcoming')}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.eventInfo}>
        <View style={styles.eventInfoRow}>
          <Icon name="calendar-today" color={COLORS.accent} size={15} />
          <Text style={styles.eventInfoText}>{formattedDate} • {formattedTime}</Text>
        </View>
        <View style={styles.eventInfoRow}>
          <Icon name="location-on" color={COLORS.accent} size={15} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openLocationInMaps({
              label: rehearsal.location,
              latitude: rehearsal.location_lat,
              longitude: rehearsal.location_lng,
            })}
          >
            <Text style={[styles.eventInfoText, styles.linkText]}>{rehearsal.location}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {rehearsal.agenda ? <Text style={styles.rehearsalAgenda}>{rehearsal.agenda}</Text> : null}
      <View style={styles.attendanceCard}>
        <View style={styles.attendanceHeader}>
          <Text style={styles.attendanceTitle}>{t(language, 'chorusDetail.attendanceTitle')}</Text>
          <Text style={styles.attendanceStatusText}>
            {rehearsal.my_attendance_status
              ? t(language, `chorusDetail.attendance_${rehearsal.my_attendance_status}`)
              : t(language, 'chorusDetail.attendance_notResponded')}
          </Text>
        </View>
        <View style={styles.attendanceStats}>
          <View style={styles.attendanceStat}>
            <Text style={styles.attendanceStatValue}>{summary.attending}</Text>
            <Text style={styles.attendanceStatLabel}>{t(language, 'chorusDetail.attendance_attending')}</Text>
          </View>
          <View style={styles.attendanceStat}>
            <Text style={styles.attendanceStatValue}>{summary.maybe}</Text>
            <Text style={styles.attendanceStatLabel}>{t(language, 'chorusDetail.attendance_maybe')}</Text>
          </View>
          <View style={styles.attendanceStat}>
            <Text style={styles.attendanceStatValue}>{summary.absent}</Text>
            <Text style={styles.attendanceStatLabel}>{t(language, 'chorusDetail.attendance_absent')}</Text>
          </View>
        </View>
        {!isPast && (
          <View style={styles.attendanceActions}>
            {ATTENDANCE_STATUSES.map((status) => {
              const isActive = rehearsal.my_attendance_status === status
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.attendanceButton, isActive && styles.attendanceButtonActive]}
                  activeOpacity={0.7}
                  onPress={() => onAttendanceChange(rehearsal, status)}
                  disabled={attendanceSavingId === rehearsal.id}
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
    </View>
  )

  if (!isAdmin) {
    return <View style={styles.swipeContainer}>{card}</View>
  }

  return (
    <View style={styles.swipeContainer}>
      <Swipeable ref={swipeRef} renderRightActions={renderActions} overshootRight={false} rightThreshold={40}>
        {card}
      </Swipeable>
    </View>
  )
}
