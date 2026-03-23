import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Animated, Easing } from 'react-native'
import React, { useState, useRef, useCallback, useEffect } from 'react'
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

const DEBOUNCE_MS = 400
const MIN_CHARS = 3

const getUserDisplayName = (user) => {
  return user.display_name || user.email || '-'
}

const UserRow = ({ user, onAdd, adding, alreadyMember, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 60,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [])

  const displayName = getUserDisplayName(user)
  const initial = (displayName || '?')[0].toUpperCase()

  return (
    <Animated.View style={[styles.userRow, { opacity: fadeAnim }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userEmail} numberOfLines={1}>{displayName}</Text>
      </View>
      {alreadyMember ? (
        <View style={styles.alreadyBadge}>
          <Icon name="check-circle" color={COLORS.green} size={20} />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => onAdd(user)}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="person-add" color="#fff" size={18} />
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const AddMember = ({ route, navigation }) => {
  const { language } = useLanguage()
  const { chorus } = route.params
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addingId, setAddingId] = useState(null)
  const [memberIds, setMemberIds] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    fetchExistingMembers()
  }, [])

  const fetchExistingMembers = async () => {
    const { data } = await supabase
      .from('chorus_members')
      .select('user_id')
      .eq('chorus_id', chorus.id)

    if (data) {
      setMemberIds(data.map(m => m.user_id))
    }
  }

  const searchUsers = useCallback(async (text) => {
    if (text.length < MIN_CHARS) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)

    let { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .or(`email.ilike.%${text}%,display_name.ilike.%${text}%`)
      .limit(20)

    if (error && error.code === '42703') {
      const fallbackResult = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `%${text}%`)
        .limit(20)

      data = fallbackResult.data
      error = fallbackResult.error
    }

    if (!error && data) {
      setResults(data)
    }
    setSearching(false)
  }, [])

  const handleChangeText = (text) => {
    setQuery(text)
    setMessage('')

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (text.length < MIN_CHARS) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(() => {
      searchUsers(text)
    }, DEBOUNCE_MS)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleAddMember = async (user) => {
    setAddingId(user.id)

    const { error } = await supabase
      .from('chorus_members')
      .insert({ chorus_id: chorus.id, user_id: user.id, role: 'member' })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
    } else {
      setMemberIds(prev => [...prev, user.id])
      setMessage(t(language, 'addMember.added'))
      setMessageType('success')
      setTimeout(() => setMessage(''), 2500)
    }

    setAddingId(null)
  }

  const showHint = query.length > 0 && query.length < MIN_CHARS

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t(language, 'addMember.title')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" color={COLORS.textDim} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder={t(language, 'addMember.placeholder')}
          placeholderTextColor={COLORS.textDim}
          value={query}
          onChangeText={handleChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]) }}>
            <Icon name="close" color={COLORS.textDim} size={20} />
          </TouchableOpacity>
        )}
      </View>

      {message ? (
        <View style={[styles.messageBanner, messageType === 'error' ? styles.errorBanner : styles.successBanner]}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      {showHint && (
        <Text style={styles.hintText}>{t(language, 'addMember.minChars')}</Text>
      )}

      {searching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.accent} />
        </View>
      )}

      {!searching && query.length >= MIN_CHARS && results.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="person-search" color={COLORS.border} size={48} />
          <Text style={styles.emptyTitle}>{t(language, 'addMember.noResults')}</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <UserRow
            user={item}
            index={index}
            onAdd={handleAddMember}
            adding={addingId === item.id}
            alreadyMember={memberIds.includes(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  )
}

export default AddMember

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 14,
    marginLeft: 10,
  },
  hintText: {
    color: COLORS.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  userRow: {
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
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  alreadyBadge: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDim,
    marginTop: 12,
  },
  messageBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: '#FB923C20',
  },
  successBanner: {
    backgroundColor: '#4ADE8020',
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
})
