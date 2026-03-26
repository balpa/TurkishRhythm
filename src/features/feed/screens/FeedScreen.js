import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from 'react-native-elements'
import { supabase } from '../../../../lib/supabase'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import BulletinFeedCard from '../components/BulletinFeedCard'
import { applyAttendanceToBulletins, ATTENDANCE_STATUSES, COLORS, PAGE_SIZE } from '../feedShared'
import styles from '../feedStyles'

const FeedScreen = () => {
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

  const CACHE_TTL = 60_000

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || '')
    }

    loadCurrentUser()
  }, [])

  const fetchBulletins = useCallback(async (offset = 0, isRefresh = false) => {
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

    let nextData = data || []
    const eventBulletinIds = nextData.filter((item) => item.is_event).map((item) => item.id)

    if (eventBulletinIds.length > 0) {
      const { data: attendanceRows, error: attendanceError } = await supabase
        .from('bulletin_attendance')
        .select('bulletin_id, user_id, status')
        .in('bulletin_id', eventBulletinIds)

      if (attendanceError) {
        console.log('Feed attendance error:', attendanceError.message)
        setAttendanceEnabled(false)
        nextData = applyAttendanceToBulletins(nextData, [], currentUserId)
      } else {
        setAttendanceEnabled(true)
        nextData = applyAttendanceToBulletins(nextData, attendanceRows || [], currentUserId)
      }
    } else {
      setAttendanceEnabled(true)
      nextData = applyAttendanceToBulletins(nextData, [], currentUserId)
    }

    if (offset === 0) {
      setBulletins(nextData)
      cacheRef.current = { data: nextData, timestamp: Date.now() }
    } else {
      setBulletins((previous) => {
        const merged = [...previous, ...nextData]
        cacheRef.current = { data: merged, timestamp: Date.now() }
        return merged
      })
    }

    setHasMore(nextData.length >= PAGE_SIZE)
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
  }, [bulletins.length, fetchBulletins, hasMore, loadingMore])

  const handleAttendanceChange = useCallback(async (bulletin, status) => {
    if (!currentUserId || !attendanceEnabled) return

    const previousStatus = bulletin.my_attendance_status
    setAttendanceSavingId(bulletin.id)
    setBulletins((previous) => previous.map((item) => {
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
    <BulletinFeedCard
      item={item}
      language={language}
      attendanceEnabled={attendanceEnabled}
      attendanceSavingId={attendanceSavingId}
      onAttendanceChange={handleAttendanceChange}
    />
  ), [attendanceEnabled, attendanceSavingId, handleAttendanceChange, language])

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
  }, [language, loading])

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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        )}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={7}
        initialNumToRender={6}
      />
    </View>
  )
}

export default FeedScreen
