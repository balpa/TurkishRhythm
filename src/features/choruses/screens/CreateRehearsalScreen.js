import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Icon } from 'react-native-elements'
import DateTimePicker from '@react-native-community/datetimepicker'
import { supabase } from '../../../../lib/supabase'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import { COLORS } from '../../../shared/theme/colors'

const DEFAULT_REGION = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

const CreateRehearsalScreen = ({ route, navigation }) => {
  const { language } = useLanguage()
  const { chorus, rehearsal: existingRehearsal } = route.params
  const isEditing = !!existingRehearsal
  const [title, setTitle] = useState(existingRehearsal?.title || '')
  const [location, setLocation] = useState(existingRehearsal?.location || '')
  const [locationCoords, setLocationCoords] = useState(
    existingRehearsal?.location_lat != null && existingRehearsal?.location_lng != null
      ? {
          latitude: existingRehearsal.location_lat,
          longitude: existingRehearsal.location_lng,
        }
      : null
  )
  const [scheduledAt, setScheduledAt] = useState(existingRehearsal?.scheduled_at ? new Date(existingRehearsal.scheduled_at) : new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [repeatCount, setRepeatCount] = useState('4')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const pickedLocation = route.params?.pickedLocation
    if (!pickedLocation) return

    setLocation(pickedLocation.label)
    setLocationCoords({
      latitude: pickedLocation.latitude,
      longitude: pickedLocation.longitude,
    })
  }, [route.params?.pickedLocation])

  const handleDateChange = (_event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (selectedDate) {
      setScheduledAt((prev) => {
        const updated = new Date(prev)
        updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
        return updated
      })
    }
  }

  const handleTimeChange = (_event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false)
    if (selectedTime) {
      setScheduledAt((prev) => {
        const updated = new Date(prev)
        updated.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0)
        return updated
      })
    }
  }

  const formattedDate = scheduledAt.toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  const formattedTime = scheduledAt.toLocaleTimeString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  )

  const openMapPicker = () => {
    navigation.navigate('PickLocation', {
      initialLocation: locationCoords || {
        latitude: DEFAULT_REGION.latitude,
        longitude: DEFAULT_REGION.longitude,
      },
    })
  }

  const handleSubmit = async () => {
    if (!title.trim() || !location.trim() || !locationCoords) {
      setMessage(t(language, 'rehearsal.fillFields'))
      return
    }

    const normalizedRepeatCount = Math.min(Math.max(parseInt(repeatCount, 10) || 1, 1), 52)

    setSaving(true)
    setMessage('')

    const payload = {
      title: title.trim(),
      agenda: existingRehearsal?.agenda || '',
      location: location.trim(),
      location_lat: locationCoords.latitude,
      location_lng: locationCoords.longitude,
      scheduled_at: scheduledAt.toISOString(),
    }

    let error

    if (isEditing) {
      ;({ error } = await supabase
        .from('rehearsals')
        .update(payload)
        .eq('id', existingRehearsal.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const rehearsalsToInsert = Array.from({ length: repeatWeekly ? normalizedRepeatCount : 1 }, (_, index) => {
        const nextDate = new Date(scheduledAt)
        nextDate.setDate(nextDate.getDate() + (index * 7))

        return {
          ...payload,
          chorus_id: chorus.id,
          created_by: user.id,
          scheduled_at: nextDate.toISOString(),
        }
      })

      ;({ error } = await supabase
        .from('rehearsals')
        .insert(rehearsalsToInsert))
    }

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    navigation.goBack()
  }

  const isValid = title.trim() && location.trim() && locationCoords

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t(language, isEditing ? 'rehearsal.editTitle' : 'rehearsal.createTitle')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.chorusLabel}>{chorus.name}</Text>

        <TextInput
          style={styles.titleInput}
          placeholder={t(language, 'rehearsal.titlePlaceholder')}
          placeholderTextColor={COLORS.textDim}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <View style={styles.eventFields}>
          <TouchableOpacity style={styles.dateRow} activeOpacity={0.7} onPress={() => setShowDatePicker(true)}>
            <Icon name="calendar-today" color={COLORS.accent} size={20} />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>{t(language, 'rehearsal.date')}</Text>
              <Text style={styles.dateValue}>{formattedDate}</Text>
            </View>
            <Icon name="chevron-right" color={COLORS.textDim} size={20} />
          </TouchableOpacity>

          {showDatePicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={scheduledAt}
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

          <TouchableOpacity style={styles.dateRow} activeOpacity={0.7} onPress={() => setShowTimePicker(true)}>
            <Icon name="schedule" color={COLORS.accent} size={20} />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>{t(language, 'rehearsal.time')}</Text>
              <Text style={styles.dateValue}>{formattedTime}</Text>
            </View>
            <Icon name="chevron-right" color={COLORS.textDim} size={20} />
          </TouchableOpacity>

          {showTimePicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={scheduledAt}
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

          <TouchableOpacity style={styles.locationRow} activeOpacity={0.7} onPress={openMapPicker}>
            <Icon name="location-on" color={COLORS.accent} size={20} style={{ marginTop: 2 }} />
            <View style={styles.locationInfo}>
              <Text style={styles.dateLabel}>{t(language, 'rehearsal.location')}</Text>
              <Text style={[styles.locationValue, !location && styles.locationPlaceholder]}>
                {location || t(language, 'rehearsal.pickLocation')}
              </Text>
            </View>
            <Icon name="map" color={COLORS.textDim} size={20} />
          </TouchableOpacity>

          {!isEditing && (
            <>
              <View style={styles.repeatRow}>
                <View style={styles.repeatInfo}>
                  <Text style={styles.repeatTitle}>{t(language, 'rehearsal.repeatWeekly')}</Text>
                  <Text style={styles.repeatHint}>{t(language, 'rehearsal.repeatWeeklyHint')}</Text>
                </View>
                <Switch
                  value={repeatWeekly}
                  onValueChange={setRepeatWeekly}
                  trackColor={{ false: COLORS.border, true: COLORS.accent + '88' }}
                  thumbColor={repeatWeekly ? COLORS.accent : COLORS.textDim}
                />
              </View>

              {repeatWeekly && (
                <View style={styles.repeatCountRow}>
                  <View style={styles.repeatInfo}>
                    <Text style={styles.repeatTitle}>{t(language, 'rehearsal.repeatCount')}</Text>
                    <Text style={styles.repeatHint}>{t(language, 'rehearsal.repeatCountHint')}</Text>
                  </View>
                  <TextInput
                    style={styles.repeatCountInput}
                    value={repeatCount}
                    onChangeText={setRepeatCount}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              )}
            </>
          )}
        </View>

        {message ? <Text style={styles.errorText}>{message}</Text> : null}

        <TouchableOpacity
          style={[styles.createButton, !isValid && styles.createButtonDisabled]}
          activeOpacity={0.7}
          onPress={handleSubmit}
          disabled={saving || !isValid}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>{t(language, isEditing ? 'rehearsal.save' : 'rehearsal.create')}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

    </KeyboardAvoidingView>
  )
}

export default CreateRehearsalScreen

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
  chorusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDim,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
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
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationInfo: {
    flex: 1,
  },
  locationValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 2,
  },
  locationPlaceholder: {
    color: COLORS.textDim,
  },
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  repeatCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
  repeatInfo: {
    flex: 1,
  },
  repeatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  repeatHint: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 4,
    lineHeight: 17,
  },
  repeatCountInput: {
    width: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  errorText: {
    color: '#FB923C',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
})
