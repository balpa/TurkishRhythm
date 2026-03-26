import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Icon } from 'react-native-elements'
import { supabase } from '../../../../lib/supabase'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import styles from '../bulletinStyles'
import { COLORS } from '../chorusesShared'
import BulletinEventFields from '../components/BulletinEventFields'

const CreateBulletinScreen = ({ route, navigation }) => {
  const { language } = useLanguage()
  const { chorus, bulletin: existingBulletin } = route.params
  const isEditing = !!existingBulletin
  const [title, setTitle] = useState(existingBulletin?.title || '')
  const [content, setContent] = useState(existingBulletin?.content || '')
  const [visibility, setVisibility] = useState(existingBulletin?.visibility || 'private')
  const [isEvent, setIsEvent] = useState(existingBulletin?.is_event || false)
  const [eventDate, setEventDate] = useState(existingBulletin?.event_date ? new Date(existingBulletin.event_date) : new Date())
  const [eventLocation, setEventLocation] = useState(existingBulletin?.event_location || '')
  const [isFree, setIsFree] = useState(!existingBulletin?.event_price || existingBulletin?.event_price === 'free')
  const [eventPrice, setEventPrice] = useState(existingBulletin?.event_price && existingBulletin.event_price !== 'free' ? existingBulletin.event_price : '')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  const handleDateChange = (_event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (selectedDate) setEventDate((current) => { const updated = new Date(current); updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()); return updated })
  }
  const handleTimeChange = (_event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false)
    if (selectedTime) setEventDate((current) => { const updated = new Date(current); updated.setHours(selectedTime.getHours(), selectedTime.getMinutes()); return updated })
  }
  const formattedDate = eventDate.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = eventDate.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { setMessage(t(language, 'bulletin.fillFields')); return }
    if (isEvent && !eventLocation.trim()) { setMessage(t(language, 'bulletin.fillLocation')); return }
    setCreating(true)
    setMessage('')
    const payload = { title: title.trim(), content: content.trim(), visibility, is_event: isEvent, event_date: isEvent ? eventDate.toISOString() : null, event_location: isEvent ? eventLocation.trim() : null, event_price: isEvent ? (isFree ? 'free' : eventPrice.trim()) : null }
    let error
    if (isEditing) {
      ({ error } = await supabase.from('bulletins').update(payload).eq('id', existingBulletin.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      payload.chorus_id = chorus.id
      payload.created_by = user.id
      ;({ error } = await supabase.from('bulletins').insert(payload))
    }
    if (error) { setMessage(error.message); setCreating(false); return }
    setCreating(false)
    navigation.goBack()
  }

  const isValid = title.trim() && content.trim() && (!isEvent || eventLocation.trim())

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}><Icon name="arrow-back" color={COLORS.text} size={22} /></TouchableOpacity>
        <Text style={styles.topBarTitle}>{t(language, isEditing ? 'bulletin.editTitle' : 'bulletin.createTitle')}</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.toggleRow}>
          <TouchableOpacity style={[styles.toggleOption, visibility === 'private' && styles.toggleActive]} activeOpacity={0.7} onPress={() => setVisibility('private')}><Icon name="lock" color={visibility === 'private' ? COLORS.accent : COLORS.textDim} size={18} /><Text style={[styles.toggleText, visibility === 'private' && styles.toggleTextActive]}>{t(language, 'bulletin.private')}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.toggleOption, visibility === 'public' && styles.toggleActive]} activeOpacity={0.7} onPress={() => setVisibility('public')}><Icon name="public" color={visibility === 'public' ? COLORS.accent : COLORS.textDim} size={18} /><Text style={[styles.toggleText, visibility === 'public' && styles.toggleTextActive]}>{t(language, 'bulletin.public')}</Text></TouchableOpacity>
        </View>
        <Text style={styles.hintText}>{visibility === 'public' ? t(language, 'bulletin.publicHint') : t(language, 'bulletin.privateHint')}</Text>

        <TouchableOpacity style={[styles.eventToggle, isEvent && styles.eventToggleActive]} activeOpacity={0.7} onPress={() => setIsEvent(!isEvent)}>
          <View style={[styles.eventIconCircle, isEvent && styles.eventIconCircleActive]}><Icon name="event" color={isEvent ? COLORS.white : COLORS.textDim} size={20} /></View>
          <View style={styles.eventToggleContent}><Text style={[styles.eventToggleTitle, isEvent && styles.eventToggleTitleActive]}>{t(language, 'bulletin.eventToggle')}</Text><Text style={styles.eventToggleDesc}>{t(language, 'bulletin.eventToggleDesc')}</Text></View>
          <View style={[styles.checkbox, isEvent && styles.checkboxActive]}>{isEvent ? <Icon name="check" color={COLORS.white} size={16} /> : null}</View>
        </TouchableOpacity>

        {isEvent ? <BulletinEventFields language={language} eventDate={eventDate} formattedDate={formattedDate} formattedTime={formattedTime} eventLocation={eventLocation} isFree={isFree} eventPrice={eventPrice} showDatePicker={showDatePicker} showTimePicker={showTimePicker} setShowDatePicker={setShowDatePicker} setShowTimePicker={setShowTimePicker} onDateChange={handleDateChange} onTimeChange={handleTimeChange} onChangeLocation={setEventLocation} onToggleFree={() => { setIsFree(!isFree); if (!isFree) setEventPrice('') }} onChangePrice={setEventPrice} /> : null}

        <TextInput style={styles.titleInput} placeholder={t(language, 'bulletin.titlePlaceholder')} placeholderTextColor={COLORS.textDim} value={title} onChangeText={setTitle} maxLength={100} />
        <TextInput style={styles.contentInput} placeholder={t(language, 'bulletin.contentPlaceholder')} placeholderTextColor={COLORS.textDim} value={content} onChangeText={setContent} multiline textAlignVertical="top" />
        {message ? <Text style={styles.errorText}>{message}</Text> : null}
        <TouchableOpacity style={[styles.createButton, !isValid && styles.createButtonDisabled]} activeOpacity={0.7} onPress={handleSubmit} disabled={creating || !isValid}>
          {creating ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.createButtonText}>{t(language, isEditing ? 'bulletin.save' : 'bulletin.create')}</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default CreateBulletinScreen
