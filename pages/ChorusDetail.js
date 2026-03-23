import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Easing, Image, Modal, Alert, Linking, Platform } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { Swipeable } from 'react-native-gesture-handler'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

const COLORS = {
  bg: '#1B1B2F',
  surface: '#262640',
  accent: '#E45A84',
  border: '#3A3A5C',
  text: '#F0E6D3',
  textDim: '#9090B0',
  green: '#4ADE80',
  gold: '#C9B458',
}

const TABS = ['notes', 'bulletin', 'rehearsals', 'members']
const MAX_CHORUS_NOTES = 50
const ATTENDANCE_STATUSES = ['attending', 'maybe', 'absent']
const CACHE_TTL = 30_000

const renderDeleteAction = (onDelete) => () => (
  <View style={styles.deleteActionWrapper}>
    <TouchableOpacity style={styles.deleteAction} activeOpacity={0.7} onPress={onDelete}>
      <Icon name="delete" color="#fff" size={20} />
    </TouchableOpacity>
  </View>
)

const getUserDisplayName = (profile, fallbackId) => {
  return profile?.display_name || profile?.email || (fallbackId ? `${fallbackId.substring(0, 8)}...` : '-')
}

const applyAttendanceToBulletins = (items, attendanceRows, currentUserId) => {
  const attendanceMap = {}

  attendanceRows.forEach((row) => {
    if (!attendanceMap[row.bulletin_id]) {
      attendanceMap[row.bulletin_id] = {
        attending: 0,
        maybe: 0,
        absent: 0,
        currentUserStatus: null,
      }
    }

    if (ATTENDANCE_STATUSES.includes(row.status)) {
      attendanceMap[row.bulletin_id][row.status] += 1
    }

    if (row.user_id === currentUserId) {
      attendanceMap[row.bulletin_id].currentUserStatus = row.status
    }
  })

  return items.map((item) => {
    const attendance = attendanceMap[item.id] || {
      attending: 0,
      maybe: 0,
      absent: 0,
      currentUserStatus: null,
    }

    return {
      ...item,
      attendance_summary: {
        attending: attendance.attending,
        maybe: attendance.maybe,
        absent: attendance.absent,
      },
      my_attendance_status: attendance.currentUserStatus,
    }
  })
}

const applyAttendanceToRehearsals = (items, attendanceRows, currentUserId) => {
  const attendanceMap = {}

  attendanceRows.forEach((row) => {
    if (!attendanceMap[row.rehearsal_id]) {
      attendanceMap[row.rehearsal_id] = {
        attending: 0,
        maybe: 0,
        absent: 0,
        currentUserStatus: null,
      }
    }

    if (ATTENDANCE_STATUSES.includes(row.status)) {
      attendanceMap[row.rehearsal_id][row.status] += 1
    }

    if (row.user_id === currentUserId) {
      attendanceMap[row.rehearsal_id].currentUserStatus = row.status
    }
  })

  return items.map((item) => {
    const attendance = attendanceMap[item.id] || {
      attending: 0,
      maybe: 0,
      absent: 0,
      currentUserStatus: null,
    }

    return {
      ...item,
      attendance_summary: {
        attending: attendance.attending,
        maybe: attendance.maybe,
        absent: attendance.absent,
      },
      my_attendance_status: attendance.currentUserStatus,
    }
  })
}

const openLocationInMaps = async (location) => {
  if (!location?.label?.trim() && (location?.latitude == null || location?.longitude == null)) return

  const hasCoordinates = location?.latitude != null && location?.longitude != null
  const encodedLabel = encodeURIComponent(location?.label?.trim() || '')
  const coordinateQuery = hasCoordinates ? `${location.latitude},${location.longitude}` : null
  const primaryUrl = Platform.OS === 'ios'
    ? hasCoordinates
      ? `http://maps.apple.com/?ll=${coordinateQuery}&q=${encodedLabel || coordinateQuery}`
      : `http://maps.apple.com/?q=${encodedLabel}`
    : hasCoordinates
      ? `geo:${coordinateQuery}?q=${coordinateQuery}${encodedLabel ? `(${encodedLabel})` : ''}`
      : `geo:0,0?q=${encodedLabel}`
  const fallbackUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinateQuery}`
    : `https://www.google.com/maps/search/?api=1&query=${encodedLabel}`

  const targetUrl = await Linking.canOpenURL(primaryUrl) ? primaryUrl : fallbackUrl
  await Linking.openURL(targetUrl)
}

const SwipeableNoteCard = ({ note, language, onPress, onDelete, isAdmin }) => {
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
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderDeleteAction(handleDelete)}
        overshootRight={false}
        rightThreshold={40}
      >
        {card}
      </Swipeable>
    </View>
  )
}

const SwipeableBulletinCard = ({ bulletin, language, onDelete, onEdit, isAdmin, attendanceEnabled, onAttendanceChange, attendanceSavingId }) => {
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
            <Text style={styles.eventInfoText}>{eventDateFormatted} — {eventTimeFormatted}</Text>
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
                {bulletin.event_price === 'free'
                  ? t(language, 'bulletin.free')
                  : `${bulletin.event_price} ₺`}
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
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderActions}
        overshootRight={false}
        rightThreshold={40}
      >
        {card}
      </Swipeable>
    </View>
  )
}

const SwipeableMemberItem = ({ member, index, language, onDelete, isAdmin }) => {
  const swipeRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 60,
      useNativeDriver: true,
    }).start()
  }, [])

  const roleColor = member.role === 'admin' ? COLORS.gold : COLORS.green
  const displayName = member.display_name || member.email
  const initial = (displayName || '?')[0].toUpperCase()
  const canDelete = isAdmin && member.role !== 'admin'

  const handleDelete = () => {
    swipeRef.current?.close()
    onDelete(member)
  }

  if (!canDelete) {
    return (
      <Animated.View style={[styles.memberRow, { opacity: fadeAnim }]}>
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
  }

  const card = (
    <Animated.View style={[styles.memberRow, { opacity: fadeAnim, marginBottom: 0 }]}>
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

  return (
    <View style={styles.swipeContainer}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderDeleteAction(handleDelete)}
        overshootRight={false}
        rightThreshold={40}
      >
        {card}
      </Swipeable>
    </View>
  )
}

const SwipeableRehearsalCard = ({ rehearsal, language, onDelete, onEdit, isAdmin, onAttendanceChange, attendanceSavingId }) => {
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
          <Text style={styles.eventInfoText}>{formattedDate} — {formattedTime}</Text>
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

      {rehearsal.agenda ? (
        <Text style={styles.rehearsalAgenda}>{rehearsal.agenda}</Text>
      ) : null}

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
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderActions}
        overshootRight={false}
        rightThreshold={40}
      >
        {card}
      </Swipeable>
    </View>
  )
}

const ChorusDetail = ({ route, navigation }) => {
  const { language } = useLanguage()
  const { chorus } = route.params
  const isAdmin = chorus.role === 'admin'
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const [attendanceEnabled, setAttendanceEnabled] = useState(true)
  const [attendanceSavingId, setAttendanceSavingId] = useState(null)
  const [rehearsals, setRehearsals] = useState([])
  const [rehearsalsLoading, setRehearsalsLoading] = useState(true)
  const [rehearsalAttendanceSavingId, setRehearsalAttendanceSavingId] = useState(null)
  const [members, setMembers] = useState([])
  const [notes, setNotes] = useState([])
  const [bulletins, setBulletins] = useState([])
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(true)
  const [bulletinsLoading, setBulletinsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notes')

  const headerAnim = useRef(new Animated.Value(0)).current
  const cacheRef = useRef({
    members: { data: null, timestamp: 0 },
    notes: { data: null, timestamp: 0 },
    bulletins: { data: null, timestamp: 0 },
    rehearsals: { data: null, timestamp: 0 },
  })

  // deleteModal: { type: 'note'|'bulletin'|'member', item: ... }
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => {
    const loadCurrentUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const metadata = user?.user_metadata || {}
      setCurrentUserId(user?.id || '')
      setCurrentUserName(metadata.display_name || metadata.full_name || '')
    }

    loadCurrentUserName()
  }, [])

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [])

  const getCachedValue = (key, force = false) => {
    const entry = cacheRef.current[key]

    if (force || !entry?.data) {
      return null
    }

    return Date.now() - entry.timestamp < CACHE_TTL ? entry.data : null
  }

  const setCachedValue = (key, data) => {
    cacheRef.current[key] = {
      data,
      timestamp: Date.now(),
    }
  }

  const invalidateCache = (...keys) => {
    keys.forEach((key) => {
      cacheRef.current[key] = { data: null, timestamp: 0 }
    })
  }

  const fetchMembers = useCallback(async (force = false) => {
    const cached = getCachedValue('members', force)
    if (cached) {
      setMembers(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('chorus_members')
      .select('role, user_id, joined_at, profiles(*)')
      .eq('chorus_id', chorus.id)
      .order('joined_at', { ascending: true })

    if (error) {
      console.log('Fetch members error:', error.message)
    }
    if (!error && data) {
      const nextMembers = data.map(m => ({
        id: m.user_id,
        role: m.role,
        display_name: m.user_id === currentUserId ? currentUserName || m.profiles?.display_name || '' : m.profiles?.display_name || '',
        email: m.profiles?.email || m.user_id.substring(0, 8) + '...',
        joined_at: m.joined_at,
      }))

      setMembers(nextMembers)
      setCachedValue('members', nextMembers)
    }
    setLoading(false)
  }, [chorus.id, currentUserId, currentUserName])

  const fetchNotes = useCallback(async (force = false) => {
    const cached = getCachedValue('notes', force)
    if (cached) {
      setNotes(cached)
      setNotesLoading(false)
      return
    }

    setNotesLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('id, file_url, file_name, file_type, created_at, uploaded_by, profiles(*)')
      .eq('chorus_id', chorus.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Fetch notes error:', error.message)
    }
    if (!error && data) {
      setNotes(data)
      setCachedValue('notes', data)
    }
    setNotesLoading(false)
  }, [chorus.id])

  const fetchBulletins = useCallback(async (force = false) => {
    const cached = getCachedValue('bulletins', force)
    if (cached) {
      setAttendanceEnabled(cached.attendanceEnabled)
      setBulletins(cached.items)
      setBulletinsLoading(false)
      return
    }

    setBulletinsLoading(true)
    const { data, error } = await supabase
      .from('bulletins')
      .select('id, title, content, visibility, is_event, event_date, event_location, event_price, created_at, created_by, profiles(*)')
      .eq('chorus_id', chorus.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Fetch bulletins error:', error.message)
    }
    if (!error && data) {
      const eventBulletinIds = data.filter(item => item.is_event).map(item => item.id)

      if (eventBulletinIds.length === 0) {
        setAttendanceEnabled(true)
        const nextBulletins = applyAttendanceToBulletins(data, [], currentUserId)
        setBulletins(nextBulletins)
        setCachedValue('bulletins', { items: nextBulletins, attendanceEnabled: true })
      } else {
        const { data: attendanceRows, error: attendanceError } = await supabase
          .from('bulletin_attendance')
          .select('bulletin_id, user_id, status')
          .in('bulletin_id', eventBulletinIds)

        if (attendanceError) {
          if (attendanceError.code === '42P01') {
            setAttendanceEnabled(false)
            const nextBulletins = applyAttendanceToBulletins(data, [], currentUserId)
            setBulletins(nextBulletins)
            setCachedValue('bulletins', { items: nextBulletins, attendanceEnabled: false })
          } else {
            console.log('Fetch attendance error:', attendanceError.message)
            setAttendanceEnabled(false)
            const nextBulletins = applyAttendanceToBulletins(data, [], currentUserId)
            setBulletins(nextBulletins)
            setCachedValue('bulletins', { items: nextBulletins, attendanceEnabled: false })
          }
        } else {
          setAttendanceEnabled(true)
          const nextBulletins = applyAttendanceToBulletins(data, attendanceRows || [], currentUserId)
          setBulletins(nextBulletins)
          setCachedValue('bulletins', { items: nextBulletins, attendanceEnabled: true })
        }
      }
    }
    setBulletinsLoading(false)
  }, [chorus.id, currentUserId])

  const fetchRehearsals = useCallback(async (force = false) => {
    const cached = getCachedValue('rehearsals', force)
    if (cached) {
      setRehearsals(cached)
      setRehearsalsLoading(false)
      return
    }

    setRehearsalsLoading(true)
    const { data, error } = await supabase
      .from('rehearsals')
      .select('id, title, agenda, location, location_lat, location_lng, scheduled_at, created_at')
      .eq('chorus_id', chorus.id)
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.log('Fetch rehearsals error:', error.message)
      setRehearsals([])
      setCachedValue('rehearsals', [])
      setRehearsalsLoading(false)
      return
    }

    const rehearsalIds = (data || []).map(item => item.id)
    if (rehearsalIds.length === 0) {
      setRehearsals([])
      setCachedValue('rehearsals', [])
      setRehearsalsLoading(false)
      return
    }

    const { data: attendanceRows, error: attendanceError } = await supabase
      .from('rehearsal_attendance')
      .select('rehearsal_id, user_id, status')
      .in('rehearsal_id', rehearsalIds)

    if (attendanceError) {
      console.log('Fetch rehearsal attendance error:', attendanceError.message)
      const nextRehearsals = applyAttendanceToRehearsals(data || [], [], currentUserId)
      setRehearsals(nextRehearsals)
      setCachedValue('rehearsals', nextRehearsals)
    } else {
      const nextRehearsals = applyAttendanceToRehearsals(data || [], attendanceRows || [], currentUserId)
      setRehearsals(nextRehearsals)
      setCachedValue('rehearsals', nextRehearsals)
    }

    setRehearsalsLoading(false)
  }, [chorus.id, currentUserId])

  const loadTabData = useCallback((tab, force = false) => {
    if (tab === 'members') return fetchMembers(force)
    if (tab === 'bulletin') return fetchBulletins(force)
    if (tab === 'rehearsals') return fetchRehearsals(force)
    return fetchNotes(force)
  }, [fetchBulletins, fetchMembers, fetchNotes, fetchRehearsals])

  useEffect(() => {
    fetchMembers(true)
  }, [fetchMembers])

  useEffect(() => {
    loadTabData(activeTab)
  }, [activeTab, loadTabData])

  useEffect(() => {
    if (!currentUserId) return

    invalidateCache('members', 'bulletins', 'rehearsals')
    fetchMembers(true)

    if (activeTab !== 'notes') {
      loadTabData(activeTab, true)
    }
  }, [activeTab, currentUserId, fetchMembers, loadTabData])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMembers(true)
      loadTabData(activeTab, true)
    })
    return unsubscribe
  }, [activeTab, navigation, fetchMembers, loadTabData])

  const handleAttendanceChange = async (bulletin, status) => {
    if (!currentUserId || !attendanceEnabled) return

    const previousStatus = bulletin.my_attendance_status
    const nextStatus = previousStatus === status ? status : status

    setAttendanceSavingId(bulletin.id)
    setBulletins(prev => prev.map((item) => {
      if (item.id !== bulletin.id) return item

      const summary = { ...(item.attendance_summary || { attending: 0, maybe: 0, absent: 0 }) }

      if (previousStatus && ATTENDANCE_STATUSES.includes(previousStatus)) {
        summary[previousStatus] = Math.max(0, (summary[previousStatus] || 0) - 1)
      }
      summary[nextStatus] = (summary[nextStatus] || 0) + 1

      return {
        ...item,
        my_attendance_status: nextStatus,
        attendance_summary: summary,
      }
    }))
    invalidateCache('bulletins')

    const { error } = await supabase
      .from('bulletin_attendance')
      .upsert({
        bulletin_id: bulletin.id,
        user_id: currentUserId,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'bulletin_id,user_id' })

    if (error) {
      if (error.code === '42P01') {
        setAttendanceEnabled(false)
      } else {
        console.log('Attendance update error:', error.message)
      }
      fetchBulletins(true)
    }

    setAttendanceSavingId(null)
  }

  const handleRehearsalAttendanceChange = async (rehearsal, status) => {
    if (!currentUserId) return

    const previousStatus = rehearsal.my_attendance_status
    setRehearsalAttendanceSavingId(rehearsal.id)
    setRehearsals(prev => prev.map((item) => {
      if (item.id !== rehearsal.id) return item

      const summary = { ...(item.attendance_summary || { attending: 0, maybe: 0, absent: 0 }) }
      if (previousStatus && ATTENDANCE_STATUSES.includes(previousStatus)) {
        summary[previousStatus] = Math.max(0, (summary[previousStatus] || 0) - 1)
      }
      summary[status] = (summary[status] || 0) + 1

      return {
        ...item,
        my_attendance_status: status,
        attendance_summary: summary,
      }
    }))
    invalidateCache('rehearsals')

    const { error } = await supabase
      .from('rehearsal_attendance')
      .upsert({
        rehearsal_id: rehearsal.id,
        user_id: currentUserId,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'rehearsal_id,user_id' })

    if (error) {
      console.log('Rehearsal attendance update error:', error.message)
      fetchRehearsals(true)
    }

    setRehearsalAttendanceSavingId(null)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    const { type, item } = deleteModal

    if (type === 'note') {
      const filePath = item.file_url.split('/notes/')[1]
      const { error: storageError } = await supabase.storage.from('notes').remove([filePath])
      if (storageError) console.log('Storage delete error:', storageError.message)
      const { error: dbError } = await supabase.from('notes').delete().eq('id', item.id)
      if (dbError) console.log('DB delete error:', dbError.message)
      setDeleteModal(null)
      invalidateCache('notes')
      fetchNotes(true)
    } else if (type === 'bulletin') {
      const { error } = await supabase.from('bulletins').delete().eq('id', item.id)
      if (error) console.log('Bulletin delete error:', error.message)
      setDeleteModal(null)
      invalidateCache('bulletins')
      fetchBulletins(true)
    } else if (type === 'rehearsal') {
      const { error } = await supabase.from('rehearsals').delete().eq('id', item.id)
      if (error) console.log('Rehearsal delete error:', error.message)
      setDeleteModal(null)
      invalidateCache('rehearsals')
      fetchRehearsals(true)
    } else if (type === 'member') {
      const { error } = await supabase
        .from('chorus_members')
        .delete()
        .eq('chorus_id', chorus.id)
        .eq('user_id', item.id)
      if (error) console.log('Member delete error:', error.message)
      setDeleteModal(null)
      invalidateCache('members')
      fetchMembers(true)
    }
  }

  const getDeleteModalTitle = () => {
    if (!deleteModal) return ''
    if (deleteModal.type === 'note') return t(language, 'chorusDetail.deleteNoteTitle')
    if (deleteModal.type === 'bulletin') return t(language, 'chorusDetail.deleteBulletinTitle')
    if (deleteModal.type === 'rehearsal') return t(language, 'chorusDetail.deleteRehearsalTitle')
    return t(language, 'chorusDetail.deleteMemberTitle')
  }

  const getDeleteModalDesc = () => {
    if (!deleteModal) return ''
    if (deleteModal.type === 'note') return deleteModal.item.file_name
    if (deleteModal.type === 'bulletin') return deleteModal.item.title
    if (deleteModal.type === 'rehearsal') return deleteModal.item.title
    return deleteModal.item.email
  }

  const formattedDate = new Date(chorus.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const getTabLabel = (tab) => t(language, `chorusDetail.tab_${tab}`)
  const getTabIcon = (tab) => {
    if (tab === 'notes') return 'description'
    if (tab === 'bulletin') return 'campaign'
    if (tab === 'rehearsals') return 'event-note'
    return 'people'
  }

  const renderTabContent = () => {
    if (activeTab === 'members') {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        )
      }
      return members.length === 0 ? (
        <Text style={styles.emptyText}>{t(language, 'chorusDetail.noMembers')}</Text>
      ) : (
        members.map((member, index) => (
          <SwipeableMemberItem
            key={member.id}
            member={member}
            index={index}
            language={language}
            isAdmin={isAdmin}
            onDelete={(m) => setDeleteModal({ type: 'member', item: m })}
          />
        ))
      )
    }

    if (activeTab === 'notes') {
      if (notesLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        )
      }
      if (notes.length === 0) {
        return (
          <View style={styles.emptyTabState}>
            <Icon name="description" color={COLORS.border} size={48} />
            <Text style={styles.emptyTabTitle}>{t(language, 'chorusDetail.notesEmpty')}</Text>
            <Text style={styles.emptyTabDesc}>{t(language, 'chorusDetail.notesEmptyDesc')}</Text>
          </View>
        )
      }
      return notes.map((note) => (
        <SwipeableNoteCard
          key={note.id}
          note={note}
          language={language}
          isAdmin={isAdmin}
          onPress={() => navigation.navigate('NoteViewer', { note })}
          onDelete={(n) => setDeleteModal({ type: 'note', item: n })}
        />
      ))
    }

    if (activeTab === 'bulletin') {
      if (bulletinsLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        )
      }
      if (bulletins.length === 0) {
        return (
          <View style={styles.emptyTabState}>
            <Icon name="campaign" color={COLORS.border} size={48} />
            <Text style={styles.emptyTabTitle}>{t(language, 'chorusDetail.bulletinEmpty')}</Text>
            <Text style={styles.emptyTabDesc}>{t(language, 'chorusDetail.bulletinEmptyDesc')}</Text>
          </View>
        )
      }
      return bulletins.map((bulletin) => (
        <SwipeableBulletinCard
          key={bulletin.id}
          bulletin={bulletin}
          language={language}
          isAdmin={isAdmin}
          attendanceEnabled={attendanceEnabled}
          attendanceSavingId={attendanceSavingId}
          onAttendanceChange={handleAttendanceChange}
          onDelete={(b) => setDeleteModal({ type: 'bulletin', item: b })}
          onEdit={(b) => navigation.navigate('CreateBulletin', { chorus, bulletin: b })}
        />
      ))
    }

    if (activeTab === 'rehearsals') {
      if (rehearsalsLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        )
      }
      if (rehearsals.length === 0) {
        return (
          <View style={styles.emptyTabState}>
            <Icon name="event-note" color={COLORS.border} size={48} />
            <Text style={styles.emptyTabTitle}>{t(language, 'chorusDetail.rehearsalsEmpty')}</Text>
            <Text style={styles.emptyTabDesc}>{t(language, 'chorusDetail.rehearsalsEmptyDesc')}</Text>
          </View>
        )
      }
      return rehearsals.map((rehearsal) => (
        <SwipeableRehearsalCard
          key={rehearsal.id}
          rehearsal={rehearsal}
          language={language}
          isAdmin={isAdmin}
          attendanceSavingId={rehearsalAttendanceSavingId}
          onAttendanceChange={handleRehearsalAttendanceChange}
          onDelete={(r) => setDeleteModal({ type: 'rehearsal', item: r })}
          onEdit={(r) => navigation.navigate('CreateRehearsal', { chorus, rehearsal: r })}
        />
      ))
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{chorus.name}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Chorus info card */}
        <Animated.View style={[styles.infoCard, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <View style={styles.infoIconCircle}>
            <Icon name="groups" color="#fff" size={32} />
          </View>
          <Text style={styles.chorusName}>{chorus.name}</Text>
          {chorus.description ? (
            <Text style={styles.chorusDesc}>{chorus.description}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="calendar-today" color={COLORS.textDim} size={14} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="people" color={COLORS.textDim} size={14} />
              <Text style={styles.metaText}>
                {loading ? '...' : `${members.length} ${t(language, 'chorusDetail.members')}`}
              </Text>
            </View>
            <View style={[styles.roleBadge, { borderColor: isAdmin ? COLORS.gold : COLORS.green }]}>
              <Text style={[styles.roleText, { color: isAdmin ? COLORS.gold : COLORS.green }]}>
                {isAdmin ? t(language, 'chorusDetail.roleAdmin') : t(language, 'chorusDetail.roleMember')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab)}
            >
              <Icon
                name={getTabIcon(tab)}
                color={activeTab === tab ? COLORS.accent : COLORS.textDim}
                size={20}
              />
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {getTabLabel(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Floating + button */}
      {((activeTab === 'notes' || activeTab === 'bulletin') || (isAdmin && (activeTab === 'members' || activeTab === 'rehearsals'))) && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => {
            if (activeTab === 'notes' && notes.length >= MAX_CHORUS_NOTES) {
              Alert.alert(t(language, 'createNote.limitTitle'), t(language, 'createNote.limitReached'))
              return
            }
            const screens = { notes: 'CreateNote', bulletin: 'CreateBulletin', rehearsals: 'CreateRehearsal', members: 'AddMember' }
            navigation.navigate(screens[activeTab], { chorus })
          }}
        >
          <Icon name={activeTab === 'members' ? 'person-add' : 'add'} color="#fff" size={22} />
        </TouchableOpacity>
      )}

      {/* Delete confirmation modal */}
      <Modal visible={deleteModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Icon name="delete-outline" color={COLORS.accent} size={36} />
            <Text style={styles.modalTitle}>{getDeleteModalTitle()}</Text>
            <Text style={styles.modalDesc}>{getDeleteModalDesc()}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
                onPress={() => setDeleteModal(null)}
              >
                <Text style={styles.modalCancelText}>{t(language, 'chorusDetail.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                activeOpacity={0.7}
                onPress={confirmDelete}
              >
                <Text style={styles.modalDeleteText}>{t(language, 'chorusDetail.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ChorusDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  chorusName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  chorusDesc: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  roleBadge: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 52,
    gap: 6,
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: COLORS.bg,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Members
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accent,
  },
  memberInfo: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 14,
    paddingVertical: 20,
  },
  // Empty tab states
  emptyTabState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 6,
  },
  emptyTabDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 19,
  },
  // Notes
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
  },
  noteFileIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteFileName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  noteMeta: {
    fontSize: 11,
    color: COLORS.textDim,
    marginTop: 3,
  },
  // Bulletins
  bulletinCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rehearsalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rehearsalHeader: {
    marginBottom: 10,
  },
  rehearsalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rehearsalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  rehearsalAgenda: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
    marginBottom: 10,
  },
  pastCard: {
    opacity: 0.5,
  },
  bulletinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  visibilityLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bulletinDate: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  bulletinTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  bulletinContent: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
    marginBottom: 10,
  },
  bulletinBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  eventInfo: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  attendanceCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  attendanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  attendanceStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
  attendanceStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  attendanceStat: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attendanceStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  attendanceStatLabel: {
    fontSize: 10,
    color: COLORS.textDim,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  attendanceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attendanceButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  attendanceButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
    textAlign: 'center',
  },
  attendanceButtonTextActive: {
    color: '#fff',
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventInfoText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  linkText: {
    color: COLORS.accent,
  },
  bulletinAuthor: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  // Swipeable
  swipeContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  editAction: {
    width: 48,
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionBtn: {
    width: 48,
    height: '100%',
    backgroundColor: '#D9534F',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionWrapper: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteAction: {
    width: 56,
    height: '100%',
    backgroundColor: '#D9534F',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Delete modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#D9534F',
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
})
