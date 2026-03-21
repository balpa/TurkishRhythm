import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Animated, Easing } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import ChorusDetail from './ChorusDetail'
import CreateNote from './CreateNote'
import NoteViewer from './NoteViewer'

const Stack = createNativeStackNavigator()


const CreateBulletinPlaceholder = ({ route, navigation }) => {
  const { chorus } = route.params
  return (
    <View style={{ flex: 1, backgroundColor: '#1B1B2F', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 12, left: 16, width: 38, height: 38, borderRadius: 12, backgroundColor: '#262640', justifyContent: 'center', alignItems: 'center' }}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" color="#F0E6D3" size={22} />
      </TouchableOpacity>
      <Icon name="campaign" color="#3A3A5C" size={64} />
      <Text style={{ color: '#F0E6D3', fontSize: 20, fontWeight: '700', marginTop: 16 }}>Create Bulletin</Text>
      <Text style={{ color: '#9090B0', fontSize: 14, marginTop: 8, textAlign: 'center' }}>Coming soon for {chorus.name}</Text>
    </View>
  )
}

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

const ChorusCard = ({ chorus, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const roleColor = chorus.role === 'admin' ? COLORS.gold : COLORS.green
  const roleLabel = chorus.role === 'admin' ? 'Admin' : 'Member'

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
        </View>
        <View style={[styles.roleBadge, { borderColor: roleColor }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
        </View>
        <Icon name="chevron-right" color={COLORS.textDim} size={22} style={{ marginLeft: 4 }} />
      </Animated.View>
    </TouchableOpacity>
  )
}

const ChorusList = ({ navigation }) => {
  const { language } = useLanguage()
  const [choruses, setChoruses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchChoruses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('chorus_members')
      .select('role, choruses(id, name, description, created_at)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })

    if (!error && data) {
      setChoruses(data.map(d => ({
        id: d.choruses.id,
        name: d.choruses.name,
        description: d.choruses.description,
        role: d.role,
        created_at: d.choruses.created_at,
      })))
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchChoruses()
  }, [fetchChoruses])

  // Re-fetch when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChoruses()
    })
    return unsubscribe
  }, [navigation, fetchChoruses])

  const onRefresh = () => {
    setRefreshing(true)
    fetchChoruses()
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>{t(language, 'chorus.title')}</Text>
        <TouchableOpacity style={styles.refreshButton} activeOpacity={0.7} onPress={onRefresh}>
          <Icon name="refresh" color={COLORS.textDim} size={22} />
        </TouchableOpacity>
      </View>

      {choruses.length === 0 ? (
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
              onPress={() => navigation.navigate('ChorusDetail', { chorus: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
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
      <Stack.Screen name="CreateBulletin" component={CreateBulletinPlaceholder} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
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
