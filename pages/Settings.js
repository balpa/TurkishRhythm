import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Modal, TextInput, ActivityIndicator, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { supabase } from '../lib/supabase'

const COLORS = {
  bg: '#1B1B2F',
  surface: '#262640',
  accent: '#E45A84',
  border: '#3A3A5C',
  text: '#F0E6D3',
  textDim: '#9090B0',
  green: '#4ADE80',
  error: '#FB923C',
}

const Settings = ({ onLogout }) => {
  const { language, changeLanguage } = useLanguage()
  const [canCreateChorus, setCanCreateChorus] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [chorusName, setChorusName] = useState('')
  const [chorusDesc, setChorusDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const modalAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('can_create_chorus')
      .eq('id', user.id)
      .single()

    if (data) setCanCreateChorus(data.can_create_chorus)
  }

  const openCreateModal = () => {
    if (!canCreateChorus) {
      setMessage(t(language, 'chorus.noPermission'))
      setMessageType('error')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    setShowCreateModal(true)
    setChorusName('')
    setChorusDesc('')
    modalAnim.setValue(0)
    Animated.spring(modalAnim, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }).start()
  }

  const closeCreateModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowCreateModal(false)
    })
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t(language, 'settings.title')}</Text>

        {/* Create Chorus */}
        <TouchableOpacity
          style={[styles.createChorusButton, !canCreateChorus && styles.createChorusDisabled]}
          activeOpacity={0.7}
          onPress={openCreateModal}
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

        {/* Feedback message */}
        {message ? (
          <View style={[styles.feedbackRow, messageType === 'error' ? styles.feedbackError : styles.feedbackSuccess]}>
            <Icon
              name={messageType === 'error' ? 'error-outline' : 'check-circle-outline'}
              color={messageType === 'error' ? COLORS.error : COLORS.green}
              size={18}
            />
            <Text style={[styles.feedbackText, { color: messageType === 'error' ? COLORS.error : COLORS.green }]}>
              {message}
            </Text>
          </View>
        ) : null}

        {/* Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="language" color={COLORS.accent} size={22} />
            <Text style={styles.sectionTitle}>{t(language, 'settings.language')}</Text>
          </View>
          <Text style={styles.sectionDesc}>{t(language, 'settings.languageDesc')}</Text>

          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionButton, language === 'tr' && styles.optionActive]}
              activeOpacity={0.7}
              onPress={() => changeLanguage('tr')}
            >
              <Text style={styles.flagText}>🇹🇷</Text>
              <Text style={[styles.optionText, language === 'tr' && styles.optionTextActive]}>
                {t(language, 'settings.turkish')}
              </Text>
              {language === 'tr' && <Icon name="check-circle" color={COLORS.accent} size={18} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, language === 'en' && styles.optionActive]}
              activeOpacity={0.7}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.flagText}>🇬🇧</Text>
              <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>
                {t(language, 'settings.english')}
              </Text>
              {language === 'en' && <Icon name="check-circle" color={COLORS.accent} size={18} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="info-outline" color={COLORS.accent} size={22} />
            <Text style={styles.sectionTitle}>{t(language, 'settings.about')}</Text>
          </View>

          <Text style={styles.aboutText}>{t(language, 'settings.appDescription')}</Text>

          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t(language, 'settings.version')}</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t(language, 'settings.developer')}</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://github.com/balpa')}>
                <Text style={[styles.infoValue, { color: COLORS.accent }]}>baLpa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={onLogout}>
          <Icon name="logout" color={COLORS.accent} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>{t(language, 'login.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Create Chorus Modal */}
      <Modal visible={showCreateModal} transparent animationType="none" onRequestClose={closeCreateModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeCreateModal}>
          <TouchableOpacity activeOpacity={1} style={{ width: '100%' }}>
            <Animated.View style={[styles.modalCard, {
              opacity: modalAnim,
              transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
            }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t(language, 'chorus.createChorus')}</Text>
                <TouchableOpacity onPress={closeCreateModal} style={styles.modalClose}>
                  <Icon name="close" color={COLORS.textDim} size={22} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalInput}>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder={t(language, 'chorus.chorusName')}
                  placeholderTextColor={COLORS.textDim}
                  value={chorusName}
                  onChangeText={setChorusName}
                  autoFocus
                />
              </View>

              <View style={styles.modalInput}>
                <TextInput
                  style={[styles.modalTextInput, { minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder={t(language, 'chorus.chorusDescription')}
                  placeholderTextColor={COLORS.textDim}
                  value={chorusDesc}
                  onChangeText={setChorusDesc}
                  multiline
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={closeCreateModal}>
                  <Text style={styles.cancelText}>{t(language, 'chorus.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.createButton, creating && { opacity: 0.7 }]}
                  activeOpacity={0.8}
                  onPress={handleCreateChorus}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.createText}>{t(language, 'chorus.create')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  createChorusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  createChorusDisabled: {
    opacity: 0.6,
  },
  createChorusIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  createChorusContent: {
    flex: 1,
  },
  createChorusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  createChorusDesc: {
    fontSize: 12,
    color: COLORS.textDim,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  feedbackError: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    marginBottom: 16,
    marginLeft: 32,
  },
  optionRow: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  optionActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(228, 90, 132, 0.08)',
  },
  flagText: {
    fontSize: 22,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDim,
    flex: 1,
  },
  optionTextActive: {
    color: COLORS.text,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 21,
    marginBottom: 16,
  },
  infoRows: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDim,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 0.3,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalClose: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.bg,
  },
  modalInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  modalTextInput: {
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
  },
  createText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
})
