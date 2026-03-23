import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Animated, Easing } from 'react-native'
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

const BulletinCard = memo(({ item, language }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start()
  }, [])

  const date = new Date(item.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )

  const authorEmail = item.profiles?.email || item.created_by?.substring(0, 8) + '...'
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

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
        </View>
      )}

      <Text style={styles.cardAuthor}>{authorEmail}</Text>
    </Animated.View>
  )
})

const Feed = () => {
  const { language } = useLanguage()
  const [bulletins, setBulletins] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const cacheRef = useRef({ data: null, timestamp: 0 })

  const CACHE_TTL = 60_000 // 1 min

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
      .select('id, title, content, visibility, is_event, event_date, event_location, created_at, created_by, profiles(email), choruses(name)')
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

    const newData = data || []

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
  }, [])

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

  const renderItem = useCallback(({ item }) => (
    <BulletinCard item={item} language={language} />
  ), [language])

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
