import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
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

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Icon name={icon} color={COLORS.accent} size={20} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
)

const EditField = ({ icon, label, value, onChangeText, placeholder, keyboardType, multiline }) => (
  <View style={styles.editField}>
    <View style={styles.editFieldHeader}>
      <Icon name={icon} color={COLORS.accent} size={18} />
      <Text style={styles.editFieldLabel}>{label}</Text>
    </View>
    <TextInput
      style={[styles.editInput, multiline && styles.editInputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textDim}
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
)

const ChorusInfo = ({ navigation, route }) => {
  const { language } = useLanguage()
  const { chorusId, isAdmin } = route.params
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [chorus, setChorus] = useState(null)

  // Edit state
  const [description, setDescription] = useState('')
  const [rehearsalDays, setRehearsalDays] = useState('')
  const [rehearsalTime, setRehearsalTime] = useState('')
  const [rehearsalLocation, setRehearsalLocation] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [foundedYear, setFoundedYear] = useState('')

  const fetchChorus = useCallback(async () => {
    const { data, error } = await supabase
      .from('choruses')
      .select('id, name, description, rehearsal_days, rehearsal_time, rehearsal_location, contact_email, contact_phone, website, founded_year, created_at')
      .eq('id', chorusId)
      .single()

    if (!error && data) {
      setChorus(data)
      setDescription(data.description || '')
      setRehearsalDays(data.rehearsal_days || '')
      setRehearsalTime(data.rehearsal_time || '')
      setRehearsalLocation(data.rehearsal_location || '')
      setContactEmail(data.contact_email || '')
      setContactPhone(data.contact_phone || '')
      setWebsite(data.website || '')
      setFoundedYear(data.founded_year ? String(data.founded_year) : '')
    }
    setLoading(false)
  }, [chorusId])

  useEffect(() => {
    fetchChorus()
  }, [fetchChorus])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('choruses')
      .update({
        description,
        rehearsal_days: rehearsalDays || null,
        rehearsal_time: rehearsalTime || null,
        rehearsal_location: rehearsalLocation || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        website: website || null,
        founded_year: foundedYear ? parseInt(foundedYear) : null,
      })
      .eq('id', chorusId)

    setSaving(false)
    if (error) {
      Alert.alert(t(language, 'chorusInfo.error'), error.message)
    } else {
      setEditing(false)
      fetchChorus()
    }
  }

  const handleCancel = () => {
    if (chorus) {
      setDescription(chorus.description || '')
      setRehearsalDays(chorus.rehearsal_days || '')
      setRehearsalTime(chorus.rehearsal_time || '')
      setRehearsalLocation(chorus.rehearsal_location || '')
      setContactEmail(chorus.contact_email || '')
      setContactPhone(chorus.contact_phone || '')
      setWebsite(chorus.website || '')
      setFoundedYear(chorus.founded_year ? String(chorus.founded_year) : '')
    }
    setEditing(false)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  if (!chorus) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t(language, 'chorusInfo.notFound')}</Text>
      </View>
    )
  }

  const createdDate = new Date(chorus.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{chorus.name}</Text>
        {isAdmin && !editing && (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Icon name="edit" color={COLORS.accent} size={20} />
          </TouchableOpacity>
        )}
        {editing && (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>{t(language, 'chorusDetail.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{t(language, 'bulletin.save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Chorus icon and name */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Icon name="groups" color={COLORS.accent} size={48} />
          </View>
          <Text style={styles.heroName}>{chorus.name}</Text>
          <Text style={styles.heroDate}>{t(language, 'chorusInfo.since')} {createdDate}</Text>
        </View>

        {editing ? (
          /* Edit mode */
          <View style={styles.editSection}>
            <EditField
              icon="description"
              label={t(language, 'chorusInfo.description')}
              value={description}
              onChangeText={setDescription}
              placeholder={t(language, 'chorusInfo.descriptionPlaceholder')}
              multiline
            />
            <EditField
              icon="event"
              label={t(language, 'chorusInfo.rehearsalDays')}
              value={rehearsalDays}
              onChangeText={setRehearsalDays}
              placeholder={t(language, 'chorusInfo.rehearsalDaysPlaceholder')}
            />
            <EditField
              icon="schedule"
              label={t(language, 'chorusInfo.rehearsalTime')}
              value={rehearsalTime}
              onChangeText={setRehearsalTime}
              placeholder={t(language, 'chorusInfo.rehearsalTimePlaceholder')}
            />
            <EditField
              icon="location-on"
              label={t(language, 'chorusInfo.rehearsalLocation')}
              value={rehearsalLocation}
              onChangeText={setRehearsalLocation}
              placeholder={t(language, 'chorusInfo.rehearsalLocationPlaceholder')}
            />
            <EditField
              icon="email"
              label={t(language, 'chorusInfo.contactEmail')}
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder={t(language, 'chorusInfo.contactEmailPlaceholder')}
              keyboardType="email-address"
            />
            <EditField
              icon="phone"
              label={t(language, 'chorusInfo.contactPhone')}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder={t(language, 'chorusInfo.contactPhonePlaceholder')}
              keyboardType="phone-pad"
            />
            <EditField
              icon="language"
              label={t(language, 'chorusInfo.website')}
              value={website}
              onChangeText={setWebsite}
              placeholder={t(language, 'chorusInfo.websitePlaceholder')}
              keyboardType="url"
            />
            <EditField
              icon="cake"
              label={t(language, 'chorusInfo.foundedYear')}
              value={foundedYear}
              onChangeText={setFoundedYear}
              placeholder={t(language, 'chorusInfo.foundedYearPlaceholder')}
              keyboardType="numeric"
            />
          </View>
        ) : (
          /* View mode */
          <View style={styles.infoSection}>
            {/* Description */}
            {chorus.description ? (
              <View style={styles.descriptionBlock}>
                <Text style={styles.descriptionText}>{chorus.description}</Text>
              </View>
            ) : null}

            {/* Rehearsal info */}
            <Text style={styles.sectionTitle}>{t(language, 'chorusInfo.rehearsal')}</Text>
            <View style={styles.infoCard}>
              <InfoRow
                icon="event"
                label={t(language, 'chorusInfo.rehearsalDays')}
                value={chorus.rehearsal_days}
              />
              <InfoRow
                icon="schedule"
                label={t(language, 'chorusInfo.rehearsalTime')}
                value={chorus.rehearsal_time}
              />
              <InfoRow
                icon="location-on"
                label={t(language, 'chorusInfo.rehearsalLocation')}
                value={chorus.rehearsal_location}
              />
            </View>

            {/* Contact info */}
            <Text style={styles.sectionTitle}>{t(language, 'chorusInfo.contact')}</Text>
            <View style={styles.infoCard}>
              <InfoRow
                icon="email"
                label={t(language, 'chorusInfo.contactEmail')}
                value={chorus.contact_email}
              />
              <InfoRow
                icon="phone"
                label={t(language, 'chorusInfo.contactPhone')}
                value={chorus.contact_phone}
              />
              <InfoRow
                icon="language"
                label={t(language, 'chorusInfo.website')}
                value={chorus.website}
              />
            </View>

            {/* General */}
            {chorus.founded_year ? (
              <>
                <Text style={styles.sectionTitle}>{t(language, 'chorusInfo.general')}</Text>
                <View style={styles.infoCard}>
                  <InfoRow
                    icon="cake"
                    label={t(language, 'chorusInfo.foundedYear')}
                    value={chorus.founded_year}
                  />
                </View>
              </>
            ) : null}

            {/* Empty state for admins */}
            {isAdmin && !chorus.rehearsal_days && !chorus.rehearsal_time && !chorus.rehearsal_location && !chorus.contact_email && !chorus.contact_phone && !chorus.website && (
              <View style={styles.emptyHint}>
                <Icon name="info-outline" color={COLORS.textDim} size={20} />
                <Text style={styles.emptyHintText}>{t(language, 'chorusInfo.emptyHint')}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

export default ChorusInfo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.textDim,
    fontSize: 16,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 12,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    color: COLORS.textDim,
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroDate: {
    fontSize: 13,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  // Info section
  infoSection: {
    paddingHorizontal: 16,
  },
  descriptionBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  // Edit section
  editSection: {
    paddingHorizontal: 16,
    gap: 14,
  },
  editField: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  editFieldLabel: {
    fontSize: 13,
    color: COLORS.textDim,
    fontWeight: '700',
  },
  editInput: {
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Empty hint
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyHintText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDim,
    lineHeight: 18,
  },
})
