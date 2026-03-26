import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Icon } from 'react-native-elements'
import { supabase } from '../../../../lib/supabase'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import styles from '../addMemberStyles'
import { COLORS } from '../chorusesShared'
import UserSearchRow from '../components/UserSearchRow'

const DEBOUNCE_MS = 400
const MIN_CHARS = 3

const AddMemberScreen = ({ route, navigation }) => {
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
    const fetchExistingMembers = async () => {
      const { data } = await supabase.from('chorus_members').select('user_id').eq('chorus_id', chorus.id)
      if (data) setMemberIds(data.map((member) => member.user_id))
    }
    fetchExistingMembers()
  }, [chorus.id])

  const searchUsers = useCallback(async (text) => {
    if (text.length < MIN_CHARS) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    let { data, error } = await supabase.from('profiles').select('id, email, display_name').or(`email.ilike.%${text}%,display_name.ilike.%${text}%`).limit(20)
    if (error && error.code === '42703') {
      const fallback = await supabase.from('profiles').select('id, email').ilike('email', `%${text}%`).limit(20)
      data = fallback.data
      error = fallback.error
    }
    if (!error && data) setResults(data)
    setSearching(false)
  }, [])

  const handleChangeText = (text) => {
    setQuery(text)
    setMessage('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (text.length < MIN_CHARS) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(() => searchUsers(text), DEBOUNCE_MS)
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const handleAddMember = async (user) => {
    setAddingId(user.id)
    const { error } = await supabase.from('chorus_members').insert({ chorus_id: chorus.id, user_id: user.id, role: 'member' })
    if (error) {
      setMessage(error.message)
      setMessageType('error')
    } else {
      setMemberIds((current) => [...current, user.id])
      setMessage(t(language, 'addMember.added'))
      setMessageType('success')
      setTimeout(() => setMessage(''), 2500)
    }
    setAddingId(null)
  }

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
        <TextInput style={styles.searchInput} placeholder={t(language, 'addMember.placeholder')} placeholderTextColor={COLORS.textDim} value={query} onChangeText={handleChangeText} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoFocus />
        {query.length > 0 ? <TouchableOpacity onPress={() => { setQuery(''); setResults([]) }}><Icon name="close" color={COLORS.textDim} size={20} /></TouchableOpacity> : null}
      </View>

      {message ? <View style={[styles.messageBanner, messageType === 'error' ? styles.errorBanner : styles.successBanner]}><Text style={styles.messageText}>{message}</Text></View> : null}
      {query.length > 0 && query.length < MIN_CHARS ? <Text style={styles.hintText}>{t(language, 'addMember.minChars')}</Text> : null}
      {searching ? <View style={styles.loadingContainer}><ActivityIndicator size="small" color={COLORS.accent} /></View> : null}
      {!searching && query.length >= MIN_CHARS && results.length === 0 ? <View style={styles.emptyState}><Icon name="person-search" color={COLORS.border} size={48} /><Text style={styles.emptyTitle}>{t(language, 'addMember.noResults')}</Text></View> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <UserSearchRow user={item} index={index} onAdd={handleAddMember} adding={addingId === item.id} alreadyMember={memberIds.includes(item.id)} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  )
}

export default AddMemberScreen
