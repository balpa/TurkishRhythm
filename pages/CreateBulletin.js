import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Icon } from 'react-native-elements'
import DateTimePicker from '@react-native-community/datetimepicker'
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

const CreateBulletin = ({ route, navigation }) => {
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

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (selectedDate) setEventDate(prev => {
      const updated = new Date(prev)
      updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      return updated
    })
  }

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false)
    if (selectedTime) setEventDate(prev => {
      const updated = new Date(prev)
      updated.setHours(selectedTime.getHours(), selectedTime.getMinutes())
      return updated
    })
  }

  const formattedDate = eventDate.toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  const formattedTime = eventDate.toLocaleTimeString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  )

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage(t(language, 'bulletin.fillFields'))
      return
    }

    if (isEvent && !eventLocation.trim()) {
      setMessage(t(language, 'bulletin.fillLocation'))
      return
    }

    setCreating(true)
    setMessage('')

    const payload = {
      title: title.trim(),
      content: content.trim(),
      visibility,
      is_event: isEvent,
      event_date: isEvent ? eventDate.toISOString() : null,
      event_location: isEvent ? eventLocation.trim() : null,
      event_price: isEvent ? (isFree ? 'free' : eventPrice.trim()) : null,
    }

    let error
    if (isEditing) {
      ({ error } = await supabase
        .from('bulletins')
        .update(payload)
        .eq('id', existingBulletin.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      payload.chorus_id = chorus.id
      payload.created_by = user.id
      ;({ error } = await supabase
        .from('bulletins')
        .insert(payload))
    }

    if (error) {
      setMessage(error.message)
      setCreating(false)
      return
    }

    setCreating(false)
    navigation.goBack()
  }

  const isValid = title.trim() && content.trim() && (!isEvent || eventLocation.trim())

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t(language, isEditing ? 'bulletin.editTitle' : 'bulletin.createTitle')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Visibility toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleOption, visibility === 'private' && styles.toggleActive]}
            activeOpacity={0.7}
            onPress={() => setVisibility('private')}
          >
            <Icon name="lock" color={visibility === 'private' ? COLORS.accent : COLORS.textDim} size={18} />
            <Text style={[styles.toggleText, visibility === 'private' && styles.toggleTextActive]}>
              {t(language, 'bulletin.private')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, visibility === 'public' && styles.toggleActive]}
            activeOpacity={0.7}
            onPress={() => setVisibility('public')}
          >
            <Icon name="public" color={visibility === 'public' ? COLORS.accent : COLORS.textDim} size={18} />
            <Text style={[styles.toggleText, visibility === 'public' && styles.toggleTextActive]}>
              {t(language, 'bulletin.public')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hintText}>
          {visibility === 'public'
            ? t(language, 'bulletin.publicHint')
            : t(language, 'bulletin.privateHint')}
        </Text>

        {/* Event toggle */}
        <TouchableOpacity
          style={[styles.eventToggle, isEvent && styles.eventToggleActive]}
          activeOpacity={0.7}
          onPress={() => setIsEvent(!isEvent)}
        >
          <View style={[styles.eventIconCircle, isEvent && styles.eventIconCircleActive]}>
            <Icon name="event" color={isEvent ? '#fff' : COLORS.textDim} size={20} />
          </View>
          <View style={styles.eventToggleContent}>
            <Text style={[styles.eventToggleTitle, isEvent && styles.eventToggleTitleActive]}>
              {t(language, 'bulletin.eventToggle')}
            </Text>
            <Text style={styles.eventToggleDesc}>
              {t(language, 'bulletin.eventToggleDesc')}
            </Text>
          </View>
          <View style={[styles.checkbox, isEvent && styles.checkboxActive]}>
            {isEvent && <Icon name="check" color="#fff" size={16} />}
          </View>
        </TouchableOpacity>

        {/* Event fields */}
        {isEvent && (
          <View style={styles.eventFields}>
            {/* Date selector */}
            <TouchableOpacity
              style={styles.dateRow}
              activeOpacity={0.7}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar-today" color={COLORS.accent} size={20} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>{t(language, 'bulletin.eventDate')}</Text>
                <Text style={styles.dateValue}>{formattedDate}</Text>
              </View>
              <Icon name="chevron-right" color={COLORS.textDim} size={20} />
            </TouchableOpacity>

            {showDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  themeVariant="dark"
                  locale={language === 'tr' ? 'tr-TR' : 'en-US'}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerDoneText}>{t(language, 'bulletin.done')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Time selector */}
            <TouchableOpacity
              style={styles.dateRow}
              activeOpacity={0.7}
              onPress={() => setShowTimePicker(true)}
            >
              <Icon name="schedule" color={COLORS.accent} size={20} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>{t(language, 'bulletin.eventTime')}</Text>
                <Text style={styles.dateValue}>{formattedTime}</Text>
              </View>
              <Icon name="chevron-right" color={COLORS.textDim} size={20} />
            </TouchableOpacity>

            {showTimePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={eventDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  themeVariant="dark"
                  locale={language === 'tr' ? 'tr-TR' : 'en-US'}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.pickerDone} onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.pickerDoneText}>{t(language, 'bulletin.done')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Location input */}
            <View style={styles.locationRow}>
              <Icon name="location-on" color={COLORS.accent} size={20} style={{ marginTop: 14 }} />
              <TextInput
                style={styles.locationInput}
                placeholder={t(language, 'bulletin.eventLocationPlaceholder')}
                placeholderTextColor={COLORS.textDim}
                value={eventLocation}
                onChangeText={setEventLocation}
              />
            </View>

            {/* Price row */}
            <View style={styles.priceRow}>
              <Icon name="confirmation-number" color={COLORS.accent} size={20} />
              <Text style={styles.priceLabel}>{t(language, 'bulletin.eventPrice')}</Text>
              <View style={styles.priceRight}>
                <TouchableOpacity
                  style={[styles.freeCheckbox, isFree && styles.freeCheckboxActive]}
                  activeOpacity={0.7}
                  onPress={() => { setIsFree(!isFree); if (!isFree) setEventPrice('') }}
                >
                  {isFree && <Icon name="check" color="#fff" size={14} />}
                </TouchableOpacity>
                <Text style={[styles.freeLabel, isFree && styles.freeLabelActive]}>
                  {t(language, 'bulletin.free')}
                </Text>
                {!isFree && (
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textDim}
                    value={eventPrice}
                    onChangeText={setEventPrice}
                    keyboardType="numeric"
                  />
                )}
              </View>
            </View>
          </View>
        )}

        {/* Title input */}
        <TextInput
          style={styles.titleInput}
          placeholder={t(language, 'bulletin.titlePlaceholder')}
          placeholderTextColor={COLORS.textDim}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Content input */}
        <TextInput
          style={styles.contentInput}
          placeholder={t(language, 'bulletin.contentPlaceholder')}
          placeholderTextColor={COLORS.textDim}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {message ? (
          <Text style={styles.errorText}>{message}</Text>
        ) : null}

        {/* Create button */}
        <TouchableOpacity
          style={[styles.createButton, !isValid && styles.createButtonDisabled]}
          activeOpacity={0.7}
          onPress={handleSubmit}
          disabled={creating || !isValid}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>{t(language, isEditing ? 'bulletin.save' : 'bulletin.create')}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default CreateBulletin

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
  form: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  toggleActive: {
    backgroundColor: COLORS.bg,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  toggleTextActive: {
    color: COLORS.accent,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textDim,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  // Event toggle
  eventToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventToggleActive: {
    borderColor: COLORS.accent + '60',
  },
  eventIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIconCircleActive: {
    backgroundColor: COLORS.accent,
  },
  eventToggleContent: {
    flex: 1,
  },
  eventToggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  eventToggleTitleActive: {
    color: COLORS.accent,
  },
  eventToggleDesc: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkboxActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  // Event fields
  eventFields: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 2,
  },
  pickerContainer: {
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  pickerDone: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pickerDoneText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    gap: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 14,
  },
  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  priceRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  freeCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeCheckboxActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  freeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  freeLabelActive: {
    color: COLORS.green,
  },
  priceInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 80,
    textAlign: 'right',
  },
  // Form inputs
  titleInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  contentInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
    marginBottom: 16,
  },
  errorText: {
    color: '#FB923C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
})
