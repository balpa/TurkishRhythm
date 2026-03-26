import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { supabase } from '../../../../lib/supabase'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import styles from '../chorusInfoStyles'
import { COLORS } from '../chorusesShared'
import { EditField, InfoRow } from '../components/ChorusInfoSections'

const ChorusInfoScreen = ({ navigation, route }) => {
  const { language } = useLanguage()
  const { chorusId, isAdmin } = route.params
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [chorus, setChorus] = useState(null)
  const [description, setDescription] = useState('')
  const [rehearsalDays, setRehearsalDays] = useState('')
  const [rehearsalTime, setRehearsalTime] = useState('')
  const [rehearsalLocation, setRehearsalLocation] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [foundedYear, setFoundedYear] = useState('')

  const applyChorusToForm = useCallback((data) => {
    setChorus(data)
    setDescription(data.description || '')
    setRehearsalDays(data.rehearsal_days || '')
    setRehearsalTime(data.rehearsal_time || '')
    setRehearsalLocation(data.rehearsal_location || '')
    setContactEmail(data.contact_email || '')
    setContactPhone(data.contact_phone || '')
    setWebsite(data.website || '')
    setFoundedYear(data.founded_year ? String(data.founded_year) : '')
  }, [])

  const fetchChorus = useCallback(async () => {
    const { data, error } = await supabase
      .from('choruses')
      .select('id, name, description, rehearsal_days, rehearsal_time, rehearsal_location, contact_email, contact_phone, website, founded_year, created_at')
      .eq('id', chorusId)
      .single()

    if (!error && data) {
      applyChorusToForm(data)
    }
    setLoading(false)
  }, [applyChorusToForm, chorusId])

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
        founded_year: foundedYear ? parseInt(foundedYear, 10) : null,
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
      applyChorusToForm(chorus)
    }
    setEditing(false)
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.accent} /></View>
  if (!chorus) return <View style={styles.centered}><Text style={styles.errorText}>{t(language, 'chorusInfo.notFound')}</Text></View>

  const createdDate = new Date(chorus.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{chorus.name}</Text>
        {isAdmin && !editing ? <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}><Icon name="edit" color={COLORS.accent} size={20} /></TouchableOpacity> : null}
        {editing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}><Text style={styles.cancelBtnText}>{t(language, 'chorusDetail.cancel')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.saveBtnText}>{t(language, 'bulletin.save')}</Text>}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}><Icon name="groups" color={COLORS.accent} size={48} /></View>
          <Text style={styles.heroName}>{chorus.name}</Text>
          <Text style={styles.heroDate}>{t(language, 'chorusInfo.since')} {createdDate}</Text>
        </View>

        {editing ? (
          <View style={styles.editSection}>
            <EditField icon="description" label={t(language, 'chorusInfo.description')} value={description} onChangeText={setDescription} placeholder={t(language, 'chorusInfo.descriptionPlaceholder')} multiline />
            <EditField icon="event" label={t(language, 'chorusInfo.rehearsalDays')} value={rehearsalDays} onChangeText={setRehearsalDays} placeholder={t(language, 'chorusInfo.rehearsalDaysPlaceholder')} />
            <EditField icon="schedule" label={t(language, 'chorusInfo.rehearsalTime')} value={rehearsalTime} onChangeText={setRehearsalTime} placeholder={t(language, 'chorusInfo.rehearsalTimePlaceholder')} />
            <EditField icon="location-on" label={t(language, 'chorusInfo.rehearsalLocation')} value={rehearsalLocation} onChangeText={setRehearsalLocation} placeholder={t(language, 'chorusInfo.rehearsalLocationPlaceholder')} />
            <EditField icon="email" label={t(language, 'chorusInfo.contactEmail')} value={contactEmail} onChangeText={setContactEmail} placeholder={t(language, 'chorusInfo.contactEmailPlaceholder')} keyboardType="email-address" />
            <EditField icon="phone" label={t(language, 'chorusInfo.contactPhone')} value={contactPhone} onChangeText={setContactPhone} placeholder={t(language, 'chorusInfo.contactPhonePlaceholder')} keyboardType="phone-pad" />
            <EditField icon="language" label={t(language, 'chorusInfo.website')} value={website} onChangeText={setWebsite} placeholder={t(language, 'chorusInfo.websitePlaceholder')} keyboardType="url" />
            <EditField icon="cake" label={t(language, 'chorusInfo.foundedYear')} value={foundedYear} onChangeText={setFoundedYear} placeholder={t(language, 'chorusInfo.foundedYearPlaceholder')} keyboardType="numeric" />
          </View>
        ) : (
          <View style={styles.infoSection}>
            {chorus.description ? <View style={styles.descriptionBlock}><Text style={styles.descriptionText}>{chorus.description}</Text></View> : null}
            <Text style={styles.sectionTitle}>{t(language, 'chorusInfo.rehearsal')}</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="event" label={t(language, 'chorusInfo.rehearsalDays')} value={chorus.rehearsal_days} />
              <InfoRow icon="schedule" label={t(language, 'chorusInfo.rehearsalTime')} value={chorus.rehearsal_time} />
              <InfoRow icon="location-on" label={t(language, 'chorusInfo.rehearsalLocation')} value={chorus.rehearsal_location} />
            </View>
            <Text style={styles.sectionTitle}>{t(language, 'chorusInfo.contact')}</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="email" label={t(language, 'chorusInfo.contactEmail')} value={chorus.contact_email} />
              <InfoRow icon="phone" label={t(language, 'chorusInfo.contactPhone')} value={chorus.contact_phone} />
              <InfoRow icon="language" label={t(language, 'chorusInfo.website')} value={chorus.website} />
            </View>
            {chorus.founded_year ? <><Text style={styles.sectionTitle}>{t(language, 'chorusInfo.general')}</Text><View style={styles.infoCard}><InfoRow icon="cake" label={t(language, 'chorusInfo.foundedYear')} value={chorus.founded_year} /></View></> : null}
            {isAdmin && !chorus.rehearsal_days && !chorus.rehearsal_time && !chorus.rehearsal_location && !chorus.contact_email && !chorus.contact_phone && !chorus.website ? <View style={styles.emptyHint}><Icon name="info-outline" color={COLORS.textDim} size={20} /><Text style={styles.emptyHintText}>{t(language, 'chorusInfo.emptyHint')}</Text></View> : null}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

export default ChorusInfoScreen
