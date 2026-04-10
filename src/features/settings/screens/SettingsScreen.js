import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import { supabase } from '../../../../lib/supabase'
import styles from '../settingsStyles'
import { COLORS, openModalAnimation, closeModalAnimation } from '../settingsShared'
import CreateChorusModal from '../components/CreateChorusModal'
import ProfileSettingsModal from '../components/ProfileSettingsModal'
import { AboutSection, FeedbackBanner, LanguageSection } from '../components/SettingsSections'
import AdminAccessModal from '../components/AdminAccessModal'
import AdminRequestReviewModal from '../components/AdminRequestReviewModal'
import ProgressScreen from '../../gamification/screens/ProgressScreen'
import TunerScreen from '../../tuner/TunerScreen'

const SettingsScreen = ({ onLogout }) => {
  const { language, changeLanguage } = useLanguage()
  const [showProgress, setShowProgress] = useState(false)
  const [showTuner, setShowTuner] = useState(false)
  const [canCreateChorus, setCanCreateChorus] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showAdminRequestModal, setShowAdminRequestModal] = useState(false)
  const [showAdminReviewModal, setShowAdminReviewModal] = useState(false)
  const [chorusName, setChorusName] = useState('')
  const [chorusDesc, setChorusDesc] = useState('')
  const [requestChorusName, setRequestChorusName] = useState('')
  const [requestReason, setRequestReason] = useState('')
  const [creating, setCreating] = useState(false)
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [displayName, setDisplayName] = useState('')
  const [canReviewAdminRequests, setCanReviewAdminRequests] = useState(false)
  const [latestAdminRequest, setLatestAdminRequest] = useState(null)
  const [adminRequests, setAdminRequests] = useState([])
  const [adminRequestsLoading, setAdminRequestsLoading] = useState(false)
  const [adminReviewProcessingId, setAdminReviewProcessingId] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const modalAnim = useRef(new Animated.Value(0)).current
  const profileModalAnim = useRef(new Animated.Value(0)).current
  const adminRequestModalAnim = useRef(new Animated.Value(0)).current
  const adminReviewModalAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadAccessState()
    loadProfile()
  }, [])

  const showFeedbackMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const loadAccessState = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('can_create_chorus, can_review_admin_requests')
      .eq('id', user.id)
      .single()

    if (data) {
      setCanCreateChorus(data.can_create_chorus)
      setCanReviewAdminRequests(!!data.can_review_admin_requests)
    }

    const { data: requestData } = await supabase
      .from('admin_requests')
      .select('id, chorus_name, reason, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setLatestAdminRequest(requestData || null)
  }

  const loadProfile = async () => {
    setProfileLoading(true)

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setProfileData(null)
      setDisplayName('')
      setProfileLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const metadata = user.user_metadata || {}
    const nextDisplayName = profile?.display_name || metadata.display_name || metadata.full_name || ''

    setProfileData({
      email: profile?.email || user.email || '-',
      createdAt: profile?.created_at || user.created_at,
      userId: user.id,
    })
    setDisplayName(nextDisplayName)
    setProfileLoading(false)
  }

  const openCreateModal = () => {
    if (!canCreateChorus) {
      showFeedbackMessage(t(language, 'chorus.noPermission'), 'error')
      return
    }
    setShowCreateModal(true)
    setChorusName('')
    setChorusDesc('')
    openModalAnimation(modalAnim)
  }

  const closeCreateModal = () => {
    closeModalAnimation(modalAnim, () => {
      setShowCreateModal(false)
    })
  }

  const openProfileModal = async () => {
    setShowProfileModal(true)
    openModalAnimation(profileModalAnim)
    await loadProfile()
  }

  const closeProfileModal = () => {
    closeModalAnimation(profileModalAnim, () => {
      setShowProfileModal(false)
    })
  }

  const openAdminRequestModal = () => {
    setShowAdminRequestModal(true)
    setRequestChorusName(latestAdminRequest?.chorus_name || '')
    setRequestReason(latestAdminRequest?.reason || '')
    openModalAnimation(adminRequestModalAnim)
  }

  const closeAdminRequestModal = () => {
    closeModalAnimation(adminRequestModalAnim, () => {
      setShowAdminRequestModal(false)
    })
  }

  const loadAdminRequests = async () => {
    setAdminRequestsLoading(true)
    const { data, error } = await supabase
      .from('admin_requests')
      .select('id, user_id, email, display_name, chorus_name, reason, status, created_at')
      .order('created_at', { ascending: false })

    if (!error) {
      setAdminRequests(data || [])
    }
    setAdminRequestsLoading(false)
  }

  const openAdminReviewModal = async () => {
    setShowAdminReviewModal(true)
    openModalAnimation(adminReviewModalAnim)
    await loadAdminRequests()
  }

  const closeAdminReviewModal = () => {
    closeModalAnimation(adminReviewModalAnim, () => {
      setShowAdminReviewModal(false)
    })
  }

  const handleSaveProfile = async () => {
    setProfileSaving(true)

    const trimmedDisplayName = displayName.trim()
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: trimmedDisplayName,
        full_name: trimmedDisplayName,
      },
    })

    if (error) {
      setProfileSaving(false)
      showFeedbackMessage(error.message, 'error')
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ display_name: trimmedDisplayName || null })
      .eq('id', profileData?.userId)

    if (profileError && profileError.code !== '42703') {
      setProfileSaving(false)
      showFeedbackMessage(profileError.message, 'error')
      return
    }

    const metadata = data.user?.user_metadata || {}
    setDisplayName(metadata.display_name || metadata.full_name || trimmedDisplayName)
    setProfileData(prev => prev ? { ...prev, displayName: trimmedDisplayName || '' } : prev)
    setProfileSaving(false)
    closeProfileModal()
    showFeedbackMessage(t(language, 'settings.profileSaved'), 'success')
  }

  const handleSubmitAdminRequest = async () => {
    if (!requestChorusName.trim()) {
      showFeedbackMessage(t(language, 'settings.adminRequestFillName'), 'error')
      return
    }

    setRequestSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      user_id: user.id,
      email: profileData?.email || user.email || null,
      display_name: displayName.trim() || null,
      chorus_name: requestChorusName.trim(),
      reason: requestReason.trim() || null,
      status: 'pending',
    }

    const { error } = await supabase.from('admin_requests').insert(payload)

    if (error) {
      setRequestSubmitting(false)
      if (error.code === '23505') {
        showFeedbackMessage(t(language, 'settings.adminRequestPending'), 'error')
      } else {
        showFeedbackMessage(error.message, 'error')
      }
      return
    }

    setRequestSubmitting(false)
    closeAdminRequestModal()
    await loadAccessState()
    showFeedbackMessage(t(language, 'settings.adminRequestSent'), 'success')
  }

  const handleReviewAdminRequest = async (request, status) => {
    setAdminReviewProcessingId(request.id)
    const { data: { user } } = await supabase.auth.getUser()

    const { error: requestError } = await supabase
      .from('admin_requests')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', request.id)

    if (requestError) {
      setAdminReviewProcessingId(null)
      showFeedbackMessage(requestError.message, 'error')
      return
    }

    if (status === 'approved') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ can_create_chorus: true })
        .eq('id', request.user_id)

      if (profileError) {
        setAdminReviewProcessingId(null)
        showFeedbackMessage(profileError.message, 'error')
        return
      }
    }

    setAdminReviewProcessingId(null)
    await loadAdminRequests()
    showFeedbackMessage(
      status === 'approved' ? t(language, 'settings.adminRequestApproved') : t(language, 'settings.adminRequestRejected'),
      'success'
    )
  }

  const handleCreateChorus = async () => {
    if (!chorusName.trim()) {
      setMessage(t(language, 'chorus.fillName'))
      setMessageType('error')
      return
    }

    setCreating(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()

    // Check admin chorus limit (max 5)
    const { count, error: countError } = await supabase
      .from('chorus_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'admin')

    if (countError) {
      setCreating(false)
      setMessage(countError.message)
      setMessageType('error')
      return
    }

    if (count >= 5) {
      setCreating(false)
      setMessage(t(language, 'chorus.maxLimit'))
      setMessageType('error')
      return
    }

    const { data: chorus, error: chorusError } = await supabase
      .from('choruses')
      .insert({ name: chorusName.trim(), description: chorusDesc.trim() || null, created_by: user.id })
      .select()
      .single()

    if (chorusError) {
      setCreating(false)
      setMessage(chorusError.message)
      setMessageType('error')
      return
    }

    // Add creator as admin member
    await supabase
      .from('chorus_members')
      .insert({ chorus_id: chorus.id, user_id: user.id, role: 'admin' })

    setCreating(false)
    closeCreateModal()
    setMessage(t(language, 'chorus.created'))
    setMessageType('success')
    setTimeout(() => setMessage(''), 3000)
  }

  if (showProgress) {
    return <ProgressScreen onBack={() => setShowProgress(false)} />
  }

  if (showTuner) {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }} onPress={() => setShowTuner(false)} activeOpacity={0.7} accessibilityLabel="Back" accessibilityRole="button">
            <Icon name="arrow-back" color={COLORS.text} size={20} />
          </TouchableOpacity>
        </View>
        <TunerScreen />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t(language, 'settings.title')}</Text>

        {/* Progress / Gamification */}
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
          onPress={() => setShowProgress(true)}
          accessibilityLabel="Progress"
          accessibilityRole="button"
        >
          <View style={styles.profileButtonIcon}>
            <Icon name="emoji-events" color={COLORS.accent} size={24} />
          </View>
          <View style={styles.profileButtonContent}>
            <Text style={styles.profileButtonTitle}>{t(language, 'gamification.progressButton')}</Text>
            <Text style={styles.profileButtonDesc}>{t(language, 'gamification.progressDesc')}</Text>
          </View>
          <Icon name="chevron-right" color={COLORS.textDim} size={22} />
        </TouchableOpacity>

        {/* Tuner */}
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
          onPress={() => setShowTuner(true)}
          accessibilityLabel="Tuner"
          accessibilityRole="button"
        >
          <View style={styles.profileButtonIcon}>
            <Icon name="music-note" color={COLORS.accent} size={24} />
          </View>
          <View style={styles.profileButtonContent}>
            <Text style={styles.profileButtonTitle}>{t(language, 'tuner.tunerButton')}</Text>
            <Text style={styles.profileButtonDesc}>{t(language, 'tuner.tunerDesc')}</Text>
          </View>
          <Icon name="chevron-right" color={COLORS.textDim} size={22} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
          onPress={openProfileModal}
          accessibilityLabel="Profile settings"
          accessibilityRole="button"
        >
          <View style={styles.profileButtonIcon}>
            <Icon name="person-outline" color={COLORS.accent} size={24} />
          </View>
          <View style={styles.profileButtonContent}>
            <Text style={styles.profileButtonTitle}>{t(language, 'settings.profile')}</Text>
            <Text style={styles.profileButtonDesc}>
              {profileLoading
                ? t(language, 'settings.loadingProfile')
                : profileData?.email || t(language, 'settings.profileDesc')}
            </Text>
          </View>
          <Icon name="chevron-right" color={COLORS.textDim} size={22} />
        </TouchableOpacity>

        {/* Create Chorus */}
        <TouchableOpacity
          style={[styles.createChorusButton, !canCreateChorus && styles.createChorusDisabled]}
          activeOpacity={0.7}
          onPress={openCreateModal}
          accessibilityLabel="Create chorus"
          accessibilityRole="button"
        >
          <View style={styles.createChorusIcon}>
            <Icon name="add-circle-outline" color={canCreateChorus ? COLORS.accent : COLORS.textDim} size={24} />
          </View>
          <View style={styles.createChorusContent}>
            <Text style={[styles.createChorusTitle, !canCreateChorus && { color: COLORS.textDim }]}>
              {t(language, 'chorus.createChorus')}
            </Text>
            <Text style={styles.createChorusDesc}>{t(language, 'chorus.createChorusDesc')}</Text>
          </View>
          {!canCreateChorus && (
            <Icon name="lock-outline" color={COLORS.textDim} size={18} />
          )}
          {canCreateChorus && (
            <Icon name="chevron-right" color={COLORS.textDim} size={22} />
          )}
        </TouchableOpacity>

        {!canCreateChorus && (
          <TouchableOpacity
            style={[
              styles.accessRequestButton,
              latestAdminRequest?.status === 'pending' && styles.accessRequestPending,
              latestAdminRequest?.status === 'approved' && styles.accessRequestApproved,
            ]}
            activeOpacity={latestAdminRequest?.status === 'pending' ? 1 : 0.7}
            onPress={latestAdminRequest?.status === 'pending' ? undefined : openAdminRequestModal}
            accessibilityLabel="Admin request"
            accessibilityRole="button"
          >
            <View style={styles.accessRequestIcon}>
              <Icon
                name={latestAdminRequest?.status === 'pending' ? 'hourglass-top' : 'verified-user'}
                color={latestAdminRequest?.status === 'pending' ? COLORS.gold : COLORS.accent}
                size={24}
              />
            </View>
            <View style={styles.accessRequestContent}>
              <Text style={styles.accessRequestTitle}>{t(language, 'settings.adminAccess')}</Text>
              <Text style={styles.accessRequestDesc}>
                {latestAdminRequest?.status === 'pending'
                  ? t(language, 'settings.adminRequestPending')
                  : latestAdminRequest?.status === 'rejected'
                    ? t(language, 'settings.adminRequestRejectedDesc')
                    : t(language, 'settings.adminAccessDesc')}
              </Text>
            </View>
            <Icon
              name={latestAdminRequest?.status === 'pending' ? 'lock-outline' : 'chevron-right'}
              color={COLORS.textDim}
              size={22}
            />
          </TouchableOpacity>
        )}

        {canReviewAdminRequests && (
          <TouchableOpacity style={styles.accessRequestButton} activeOpacity={0.7} onPress={openAdminReviewModal} accessibilityLabel="Admin review" accessibilityRole="button">
            <View style={styles.accessRequestIcon}>
              <Icon name="manage-accounts" color={COLORS.accent} size={24} />
            </View>
            <View style={styles.accessRequestContent}>
              <Text style={styles.accessRequestTitle}>{t(language, 'settings.adminRequests')}</Text>
              <Text style={styles.accessRequestDesc}>{t(language, 'settings.adminRequestsDesc')}</Text>
            </View>
            <Icon name="chevron-right" color={COLORS.textDim} size={22} />
          </TouchableOpacity>
        )}

        {/* Feedback message */}
        <FeedbackBanner message={message} messageType={messageType} />

        <LanguageSection language={language} changeLanguage={changeLanguage} />
        <AboutSection language={language} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={onLogout} accessibilityLabel="Sign out" accessibilityRole="button">
          <Icon name="logout" color={COLORS.accent} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>{t(language, 'login.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <CreateChorusModal
        visible={showCreateModal}
        language={language}
        animation={modalAnim}
        chorusName={chorusName}
        chorusDesc={chorusDesc}
        creating={creating}
        onClose={closeCreateModal}
        onChangeName={setChorusName}
        onChangeDesc={setChorusDesc}
        onSubmit={handleCreateChorus}
      />

      <ProfileSettingsModal
        visible={showProfileModal}
        language={language}
        animation={profileModalAnim}
        profileLoading={profileLoading}
        profileSaving={profileSaving}
        profileData={profileData}
        displayName={displayName}
        onClose={closeProfileModal}
        onChangeDisplayName={setDisplayName}
        onSubmit={handleSaveProfile}
      />

      <AdminAccessModal
        visible={showAdminRequestModal}
        language={language}
        animation={adminRequestModalAnim}
        chorusName={requestChorusName}
        reason={requestReason}
        submitting={requestSubmitting}
        onClose={closeAdminRequestModal}
        onChangeChorusName={setRequestChorusName}
        onChangeReason={setRequestReason}
        onSubmit={handleSubmitAdminRequest}
      />

      <AdminRequestReviewModal
        visible={showAdminReviewModal}
        language={language}
        animation={adminReviewModalAnim}
        requests={adminRequests}
        loading={adminRequestsLoading}
        processingId={adminReviewProcessingId}
        onClose={closeAdminReviewModal}
        onReview={handleReviewAdminRequest}
      />
    </View>
  )
}

export default SettingsScreen
