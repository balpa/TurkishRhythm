import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import { Icon } from 'react-native-elements'
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

const PAGE_SIZE = 10
const ATTENDANCE_STATUSES = ['attending', 'maybe', 'absent']

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

const BulletinCard = memo(({ item, language, attendanceEnabled, attendanceSavingId, onAttendanceChange }) => {
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
      {/* Chorus name header */}
      <View style={styles.cardSourceRow}>
        <View style={styles.cardSourceIcon}>
          <Icon name="groups" color={COLORS.accent} size={16} />
        </View>
        <Text style={styles.cardSourceName} numberOfLines={1}>{chorusName}</Text>
        <Text style={styles.cardDate}>{date}</Text>
      </View>

      {/* Badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: COLORS.green + '20' }]}>
          <Icon name="public" color={COLORS.green} size={12} />
          <Text style={[styles.badgeText, { color: COLORS.green }]}>
            {t(language, 'bulletin.public')}
          </Text>
        </View>
        {item.is_event && (
          <View style={[styles.badge, { backgroundColor: COLORS.accent + '20' }]}>
            <Icon name="event" color={COLORS.accent} size={12} />
            <Text style={[styles.badgeText, { color: COLORS.accent }]}>
              {t(language, 'bulletin.concert')}
            </Text>
          </View>
        )}
        {isPastEvent && (
          <View style={[styles.badge, { backgroundColor: COLORS.textDim + '20' }]}>
            <Icon name="event-busy" color={COLORS.textDim} size={12} />
            <Text style={[styles.badgeText, { color: COLORS.textDim }]}>
              {t(language, 'bulletin.pastEvent')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={4}>{item.content}</Text>

      {/* Event details */}
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
                {item.event_price === 'free'
                  ? t(language, 'bulletin.free')
                  : `${item.event_price} ₺`}
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

const Feed = () => {
  const { language } = useLanguage()
  const [bulletins, setBulletins] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentUserId, setCurrentUserId] = useState('')
  const [attendanceEnabled, setAttendanceEnabled] = useState(true)
  const [attendanceSavingId, setAttendanceSavingId] = useState(null)
  const cacheRef = useRef({ data: null, timestamp: 0 })

  const CACHE_TTL = 60_000 // 1 min

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || '')
    }

    loadCurrentUser()
  }, [])

  const fetchBulletins = useCallback(async (offset = 0, isRefresh = false) => {
    // Use cache for initial load if fresh
    if (offset === 0 && !isRefresh && cacheRef.current.data && Date.now() - cacheRef.current.timestamp < CACHE_TTL) {
      setBulletins(cacheRef.current.data)
      setHasMore(cacheRef.current.data.length >= PAGE_SIZE)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('bulletins')
      .select('id, title, content, visibility, is_event, event_date, event_location, event_price, created_at, created_by, profiles(*), choruses(name)')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.log('Feed fetch error:', error.message)
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
      return
    }

    let newData = data || []
    const eventBulletinIds = newData.filter(item => item.is_event).map(item => item.id)

    if (eventBulletinIds.length > 0) {
      const { data: attendanceRows, error: attendanceError } = await supabase
        .from('bulletin_attendance')
        .select('bulletin_id, user_id, status')
        .in('bulletin_id', eventBulletinIds)

      if (attendanceError) {
        console.log('Feed attendance error:', attendanceError.message)
        setAttendanceEnabled(false)
        newData = applyAttendanceToBulletins(newData, [], currentUserId)
      } else {
        setAttendanceEnabled(true)
        newData = applyAttendanceToBulletins(newData, attendanceRows || [], currentUserId)
      }
    } else {
      setAttendanceEnabled(true)
      newData = applyAttendanceToBulletins(newData, [], currentUserId)
    }

    if (offset === 0) {
      setBulletins(newData)
      cacheRef.current = { data: newData, timestamp: Date.now() }
    } else {
      setBulletins(prev => {
        const merged = [...prev, ...newData]
        cacheRef.current = { data: merged, timestamp: Date.now() }
        return merged
      })
    }

    setHasMore(newData.length >= PAGE_SIZE)
    setLoading(false)
    setRefreshing(false)
    setLoadingMore(false)
  }, [currentUserId])

  useEffect(() => {
    fetchBulletins(0)
  }, [fetchBulletins])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setHasMore(true)
    fetchBulletins(0, true)
  }, [fetchBulletins])

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    fetchBulletins(bulletins.length)
  }, [loadingMore, hasMore, bulletins.length, fetchBulletins])

  const handleAttendanceChange = useCallback(async (bulletin, status) => {
    if (!currentUserId || !attendanceEnabled) return

    const previousStatus = bulletin.my_attendance_status

    setAttendanceSavingId(bulletin.id)
    setBulletins(prev => prev.map((item) => {
      if (item.id !== bulletin.id) return item

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

    const { error } = await supabase
      .from('bulletin_attendance')
      .upsert({
        bulletin_id: bulletin.id,
        user_id: currentUserId,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'bulletin_id,user_id' })

    if (error) {
      console.log('Feed attendance update error:', error.message)
      fetchBulletins(0, true)
    }

    setAttendanceSavingId(null)
  }, [attendanceEnabled, currentUserId, fetchBulletins])

  const renderItem = useCallback(({ item }) => (
    <BulletinCard
      item={item}
      language={language}
      attendanceEnabled={attendanceEnabled}
      attendanceSavingId={attendanceSavingId}
      onAttendanceChange={handleAttendanceChange}
    />
  ), [language, attendanceEnabled, attendanceSavingId, handleAttendanceChange])

  const keyExtractor = useCallback((item) => item.id, [])

  const ListFooter = useCallback(() => {
    if (!loadingMore) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.accent} />
      </View>
    )
  }, [loadingMore])

  const ListEmpty = useCallback(() => {
    if (loading) return null
    return (
      <View style={styles.emptyState}>
        <Icon name="campaign" color={COLORS.border} size={56} />
        <Text style={styles.emptyTitle}>{t(language, 'feed.empty')}</Text>
        <Text style={styles.emptyDesc}>{t(language, 'feed.emptyDesc')}</Text>
      </View>
    )
  }, [loading, language])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>{t(language, 'feed.title')}</Text>
      <FlatList
        data={bulletins}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={7}
        initialNumToRender={6}
        getItemLayout={undefined}
      />
    </View>
  )
}

export default Feed

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pastCard: {
    opacity: 0.5,
  },
  cardSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSourceIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardSourceName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardDate: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: '600',
    marginLeft: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
    marginBottom: 10,
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
  cardAuthor: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  // Footer / empty
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
})
