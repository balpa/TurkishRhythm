import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Animated } from 'react-native'
import { Icon } from 'react-native-elements'
import { supabase } from '../../../../lib/supabase'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import { ChorusCard, ExploreChorusCard } from '../components/ChorusListCards'
import styles from '../chorusesStyles'
import { COLORS, TABS, buildAverageRatings, applyOptimisticRating } from '../chorusesShared'

const ChorusListScreen = ({ navigation }) => {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('my')
  const [tabBarWidth, setTabBarWidth] = useState(0)
  const tabIndicatorAnim = useRef(new Animated.Value(1)).current

  const [choruses, setChoruses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [allChoruses, setAllChoruses] = useState([])
  const [exploreLoading, setExploreLoading] = useState(true)
  const [exploreSearch, setExploreSearch] = useState('')
  const [userRatings, setUserRatings] = useState({})
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    Animated.spring(tabIndicatorAnim, {
      toValue: TABS.indexOf(activeTab),
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start()
  }, [activeTab, tabIndicatorAnim])

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
      const chorusIds = data.map((item) => item.choruses.id)
      const { data: ratingsData } = chorusIds.length > 0
        ? await supabase
          .from('chorus_ratings')
          .select('chorus_id, rating')
          .in('chorus_id', chorusIds)
        : { data: [] }
      const { averages } = buildAverageRatings(ratingsData)

      setChoruses(data.map((item) => ({
        id: item.choruses.id,
        name: item.choruses.name,
        description: item.choruses.description,
        role: item.role,
        created_at: item.choruses.created_at,
        avg_rating: averages[item.choruses.id]?.avg || 0,
        rating_count: averages[item.choruses.id]?.count || 0,
      })))
    }

    setLoading(false)
    setRefreshing(false)
  }, [])

  const fetchAllChoruses = useCallback(async () => {
    setExploreLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: chorusData, error: chorusError } = await supabase
      .from('choruses')
      .select('id, name, description, created_at')
      .order('created_at', { ascending: false })

    if (chorusError) {
      console.log('Fetch all choruses error:', chorusError.message)
      setExploreLoading(false)
      return
    }

    const { data: ratingsData } = await supabase
      .from('chorus_ratings')
      .select('chorus_id, rating, user_id')

    const { averages, userRatings: nextUserRatings } = buildAverageRatings(ratingsData, user?.id)

    setAllChoruses((chorusData || []).map((chorus) => ({
      ...chorus,
      avg_rating: averages[chorus.id]?.avg || 0,
      rating_count: averages[chorus.id]?.count || 0,
    })))
    setUserRatings(nextUserRatings)
    setExploreLoading(false)
  }, [])

  useEffect(() => {
    fetchChoruses()
    fetchAllChoruses()
  }, [fetchAllChoruses, fetchChoruses])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchChoruses)
    return unsubscribe
  }, [fetchChoruses, navigation])

  const onRefresh = () => {
    setRefreshing(true)

    if (activeTab === 'my') {
      fetchChoruses()
      return
    }

    fetchAllChoruses().then(() => setRefreshing(false))
  }

  const handleRate = async (chorusId, rating) => {
    if (!currentUserId) return

    const previousRating = userRatings[chorusId]

    setUserRatings((current) => ({ ...current, [chorusId]: rating }))
    setAllChoruses((current) => applyOptimisticRating(current, chorusId, previousRating, rating))

    const { error } = await supabase
      .from('chorus_ratings')
      .upsert({ chorus_id: chorusId, user_id: currentUserId, rating }, { onConflict: 'chorus_id,user_id' })

    if (error) {
      console.log('Rate error:', error.message)
      setUserRatings((current) => ({ ...current, [chorusId]: previousRating }))
      fetchAllChoruses()
    }
  }

  const filteredExplore = useMemo(() => {
    if (!exploreSearch.trim()) return allChoruses
    const query = exploreSearch.toLowerCase()
    return allChoruses.filter((chorus) => chorus.name.toLowerCase().includes(query))
  }, [allChoruses, exploreSearch])

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

      <View style={styles.tabBar} onLayout={(event) => setTabBarWidth(event.nativeEvent.layout.width)}>
        {tabBarWidth > 0 ? (
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: (tabBarWidth - 8) / 2,
                transform: [{
                  translateX: tabIndicatorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, (tabBarWidth - 8) / 2],
                  }),
                }],
              },
            ]}
          />
        ) : null}

        {TABS.map((tab) => (
          <TouchableOpacity key={tab} style={styles.tab} activeOpacity={0.7} onPress={() => setActiveTab(tab)}>
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
            keyExtractor={(item) => item.id}
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
            {exploreSearch.length > 0 ? (
              <TouchableOpacity onPress={() => setExploreSearch('')}>
                <Icon name="close" color={COLORS.textDim} size={20} />
              </TouchableOpacity>
            ) : null}
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
              keyExtractor={(item) => item.id}
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

export default ChorusListScreen
