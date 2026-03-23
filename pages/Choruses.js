import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Animated, Easing } from 'react-native'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Icon } from 'react-native-elements'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import ChorusDetail from './ChorusDetail'
import CreateNote from './CreateNote'
import NoteViewer from './NoteViewer'
import AddMember from './AddMember'
import CreateBulletin from './CreateBulletin'
import ChorusInfo from './ChorusInfo'

const Stack = createNativeStackNavigator()

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

const TABS = ['explore', 'my']

// Star rating display
const Stars = ({ rating, size = 14, color = COLORS.gold }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Icon
        key={i}
        name={i <= Math.round(rating) ? 'star' : 'star-border'}
        color={i <= Math.round(rating) ? color : COLORS.border}
        size={size}
      />
    ))}
  </View>
)

// Interactive star rating
const StarRating = ({ rating, onRate, size = 28 }) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <TouchableOpacity key={i} activeOpacity={0.6} onPress={() => onRate(i)}>
        <Icon
          name={i <= rating ? 'star' : 'star-border'}
          color={i <= rating ? COLORS.gold : COLORS.border}
          size={size}
        />
      </TouchableOpacity>
    ))}
  </View>
)

// My chorus card
const ChorusCard = ({ chorus, index, onPress, onInfo, language }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 400, delay: index * 80, easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const roleColor = chorus.role === 'admin' ? COLORS.gold : COLORS.green
  const roleLabel = chorus.role === 'admin' ? t(language, 'chorusDetail.roleAdmin') : t(language, 'chorusDetail.roleMember')

  const avgRating = chorus.avg_rating || 0
  const ratingCount = chorus.rating_count || 0

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.cardIcon}>
          <Icon name="groups" color={COLORS.accent} size={28} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{chorus.name}</Text>
          {chorus.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{chorus.description}</Text>
          ) : null}
          <View style={styles.myCardRating}>
            <Stars rating={avgRating} size={12} />
            <Text style={styles.myCardRatingText}>
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </Text>
            <Text style={styles.myCardRatingCount}>({ratingCount})</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoBtn} activeOpacity={0.6} onPress={onInfo}>
          <Icon name="info-outline" color={COLORS.textDim} size={20} />
        </TouchableOpacity>
        <View style={[styles.roleBadge, { borderColor: roleColor }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
        </View>
        <Icon name="chevron-right" color={COLORS.textDim} size={22} style={{ marginLeft: 4 }} />
      </Animated.View>
    </TouchableOpacity>
  )
}

// Explore chorus card with rating
const ExploreChorusCard = ({ chorus, index, language, userRating, onRate, onInfo }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 400, delay: index * 60, easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const avgRating = chorus.avg_rating || 0
  const ratingCount = chorus.rating_count || 0

  return (
    <Animated.View style={[styles.exploreCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.exploreHeader}>
        <View style={styles.cardIcon}>
          <Icon name="groups" color={COLORS.accent} size={28} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{chorus.name}</Text>
          {chorus.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{chorus.description}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.infoBtn} activeOpacity={0.6} onPress={onInfo}>
          <Icon name="info-outline" color={COLORS.textDim} size={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.ratingSection}>
        <View style={styles.avgRatingRow}>
          <Stars rating={avgRating} />
          <Text style={styles.avgRatingText}>
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </Text>
          <Text style={styles.ratingCount}>({ratingCount})</Text>
        </View>
        <View style={styles.userRatingRow}>
          <Text style={styles.userRatingLabel}>{t(language, 'chorus.yourRating')}</Text>
          <StarRating rating={userRating || 0} onRate={onRate} size={24} />
        </View>
      </View>
    </Animated.View>
  )
}

const ChorusList = ({ navigation }) => {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('my')
  const [tabBarWidth, setTabBarWidth] = useState(0)
  const tabIndicatorAnim = useRef(new Animated.Value(1)).current

  // My choruses state
  const [choruses, setChoruses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Explore state
  const [allChoruses, setAllChoruses] = useState([])
  const [exploreLoading, setExploreLoading] = useState(true)
  const [exploreSearch, setExploreSearch] = useState('')
  const [userRatings, setUserRatings] = useState({})
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    const index = TABS.indexOf(activeTab)
    Animated.spring(tabIndicatorAnim, {
      toValue: index, friction: 7, tension: 80, useNativeDriver: true,
    }).start()
  }, [activeTab])

  const fetchChoruses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const { data, error } = await supabase
      .from('chorus_members')
      .select('role, choruses(id, name, description, created_at)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })

    if (!error && data) {
      const chorusIds = data.map(d => d.choruses.id)

      // Fetch ratings for user's choruses
      const { data: ratingsData } = await supabase
        .from('chorus_ratings')
        .select('chorus_id, rating')
        .in('chorus_id', chorusIds)

      const avgMap = {}
      if (ratingsData) {
        const grouped = {}
        ratingsData.forEach(r => {
          if (!grouped[r.chorus_id]) grouped[r.chorus_id] = []
          grouped[r.chorus_id].push(r.rating)
        })
        Object.keys(grouped).forEach(cid => {
          const ratings = grouped[cid]
          avgMap[cid] = {
            avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
            count: ratings.length,
          }
        })
      }

      setChoruses(data.map(d => ({
        id: d.choruses.id,
        name: d.choruses.name,
        description: d.choruses.description,
        role: d.role,
        created_at: d.choruses.created_at,
        avg_rating: avgMap[d.choruses.id]?.avg || 0,
        rating_count: avgMap[d.choruses.id]?.count || 0,
      })))
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  const fetchAllChoruses = useCallback(async () => {
    setExploreLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch all choruses
    const { data: chorusData, error: chorusError } = await supabase
      .from('choruses')
      .select('id, name, description, created_at')
      .order('created_at', { ascending: false })

    if (chorusError) {
      console.log('Fetch all choruses error:', chorusError.message)
      setExploreLoading(false)
      return
    }

    // Fetch all ratings to compute averages
    const { data: ratingsData } = await supabase
      .from('chorus_ratings')
      .select('chorus_id, rating, user_id')

    const avgMap = {}
    const userRatingMap = {}
    if (ratingsData) {
      const grouped = {}
      ratingsData.forEach(r => {
        if (!grouped[r.chorus_id]) grouped[r.chorus_id] = []
        grouped[r.chorus_id].push(r.rating)
        if (user && r.user_id === user.id) {
          userRatingMap[r.chorus_id] = r.rating
        }
      })
      Object.keys(grouped).forEach(cid => {
        const ratings = grouped[cid]
        avgMap[cid] = {
          avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
          count: ratings.length,
        }
      })
    }

    setAllChoruses((chorusData || []).map(c => ({
      ...c,
      avg_rating: avgMap[c.id]?.avg || 0,
      rating_count: avgMap[c.id]?.count || 0,
    })))
    setUserRatings(userRatingMap)
    setExploreLoading(false)
  }, [])

  useEffect(() => {
    fetchChoruses()
    fetchAllChoruses()
  }, [fetchChoruses, fetchAllChoruses])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChoruses()
    })
    return unsubscribe
  }, [navigation, fetchChoruses])

  const onRefresh = () => {
    setRefreshing(true)
    if (activeTab === 'my') fetchChoruses()
    else {
      fetchAllChoruses().then(() => setRefreshing(false))
    }
  }

  const handleRate = async (chorusId, rating) => {
    if (!currentUserId) return

    // Optimistic update
    const prevRating = userRatings[chorusId]
    setUserRatings(prev => ({ ...prev, [chorusId]: rating }))
    setAllChoruses(prev => prev.map(c => {
      if (c.id !== chorusId) return c
      const oldCount = c.rating_count || 0
      const oldAvg = c.avg_rating || 0
      let newAvg, newCount
      if (prevRating) {
        newCount = oldCount
        newAvg = oldCount > 0 ? (oldAvg * oldCount - prevRating + rating) / newCount : rating
      } else {
        newCount = oldCount + 1
        newAvg = (oldAvg * oldCount + rating) / newCount
      }
      return { ...c, avg_rating: newAvg, rating_count: newCount }
    }))

    const { error } = await supabase
      .from('chorus_ratings')
      .upsert(
        { chorus_id: chorusId, user_id: currentUserId, rating },
        { onConflict: 'chorus_id,user_id' }
      )

    if (error) {
      console.log('Rate error:', error.message)
      // Revert
      setUserRatings(prev => ({ ...prev, [chorusId]: prevRating }))
      fetchAllChoruses()
    }
  }

  const filteredExplore = useMemo(() => {
    if (!exploreSearch.trim()) return allChoruses
    const q = exploreSearch.toLowerCase()
    return allChoruses.filter(c => c.name.toLowerCase().includes(q))
  }, [exploreSearch, allChoruses])

  if (loading && activeTab === 'my') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>{t(language, 'chorus.pageTitle')}</Text>

      {/* Tab bar */}
      <View
        style={styles.tabBar}
        onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
      >
        {tabBarWidth > 0 && (
          <Animated.View style={[styles.tabIndicator, {
            width: (tabBarWidth - 8) / 2,
            transform: [{
              translateX: tabIndicatorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, (tabBarWidth - 8) / 2],
              }),
            }],
          }]} />
        )}
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab)}
          >
            <Icon
              name={tab === 'explore' ? 'explore' : 'folder-special'}
              color={activeTab === tab ? COLORS.accent : COLORS.textDim}
              size={20}
            />
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {t(language, `chorus.tab_${tab}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === 'my' ? (
        choruses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="groups" color={COLORS.border} size={64} />
            <Text style={styles.emptyTitle}>{t(language, 'chorus.empty')}</Text>
            <Text style={styles.emptySubtitle}>{t(language, 'chorus.emptyDesc')}</Text>
          </View>
        ) : (
          <FlatList
            data={choruses}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <ChorusCard
                chorus={item}
                index={index}
                language={language}
                onPress={() => navigation.navigate('ChorusDetail', { chorus: item })}
                onInfo={() => navigation.navigate('ChorusInfo', { chorusId: item.id, isAdmin: item.role === 'admin' })}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )
      ) : (
        <>
          <View style={styles.searchContainer}>
            <Icon name="search" color={COLORS.textDim} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder={t(language, 'chorus.searchPlaceholder')}
              placeholderTextColor={COLORS.textDim}
              value={exploreSearch}
              onChangeText={setExploreSearch}
              autoCorrect={false}
            />
            {exploreSearch.length > 0 && (
              <TouchableOpacity onPress={() => setExploreSearch('')}>
                <Icon name="close" color={COLORS.textDim} size={20} />
              </TouchableOpacity>
            )}
          </View>
          {exploreLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
          ) : filteredExplore.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="search-off" color={COLORS.border} size={56} />
              <Text style={styles.emptyTitle}>{t(language, 'chorus.noResults')}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredExplore}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => (
                <ExploreChorusCard
                  chorus={item}
                  index={index}
                  language={language}
                  userRating={userRatings[item.id]}
                  onRate={(rating) => handleRate(item.id, rating)}
                  onInfo={() => navigation.navigate('ChorusInfo', { chorusId: item.id, isAdmin: false })}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
        </>
      )}
    </View>
  )
}

const Choruses = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="ChorusList" component={ChorusList} />
      <Stack.Screen name="ChorusDetail" component={ChorusDetail} />
      <Stack.Screen name="CreateNote" component={CreateNote} />
      <Stack.Screen name="NoteViewer" component={NoteViewer} />
      <Stack.Screen name="CreateBulletin" component={CreateBulletin} />
      <Stack.Screen name="AddMember" component={AddMember} />
      <Stack.Screen name="ChorusInfo" component={ChorusInfo} />
    </Stack.Navigator>
  )
}

export default Choruses

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
    marginBottom: 12,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.bg,
    borderRadius: 11,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 12,
    marginLeft: 10,
  },
  // Lists
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  // My chorus card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    marginTop: 3,
    lineHeight: 18,
  },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  myCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  myCardRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
  },
  myCardRatingCount: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  roleBadge: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Explore card
  exploreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exploreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 10,
  },
  avgRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avgRatingText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gold,
  },
  ratingCount: {
    fontSize: 12,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  userRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRatingLabel: {
    fontSize: 13,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  // Empty
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
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
})
