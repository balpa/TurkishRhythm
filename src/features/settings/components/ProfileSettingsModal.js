import React from 'react'
import { Modal, TouchableOpacity, Animated, View, Text, TextInput, ActivityIndicator } from 'react-native'
import { Icon } from 'react-native-elements'
import { t } from '../../../../i18n/translations'
import styles from '../settingsStyles'
import { COLORS, createModalAnimation, formatProfileDate } from '../settingsShared'

const ProfileSettingsModal = ({
  visible,
  language,
  animation,
  profileLoading,
  profileSaving,
  profileData,
  displayName,
  onClose,
  onChangeDisplayName,
  onSubmit,
}) => {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalTouchBlocker}>
          <Animated.View style={[styles.modalCard, createModalAnimation(animation)]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t(language, 'settings.profile')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalClose}>
                <Icon name="close" color={COLORS.textDim} size={22} />
              </TouchableOpacity>
            </View>

            {profileLoading ? (
              <View style={styles.profileLoadingWrap}>
                <ActivityIndicator color={COLORS.accent} size="small" />
              </View>
            ) : (
              <>
                <View style={styles.profileInfoCard}>
                  <View style={styles.profileInfoRow}>
                    <Text style={styles.profileInfoLabel}>{t(language, 'settings.email')}</Text>
                    <Text style={styles.profileInfoValue}>{profileData?.email || '-'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.profileInfoRow}>
                    <Text style={styles.profileInfoLabel}>{t(language, 'settings.memberSince')}</Text>
                    <Text style={styles.profileInfoValue}>{formatProfileDate(profileData?.createdAt, language)}</Text>
                  </View>
                </View>

                <Text style={styles.profileFieldLabel}>{t(language, 'settings.displayName')}</Text>
                <View style={styles.modalInput}>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder={t(language, 'settings.displayNamePlaceholder')}
                    placeholderTextColor={COLORS.textDim}
                    value={displayName}
                    onChangeText={onChangeDisplayName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                <Text style={styles.profileHelperText}>{t(language, 'settings.displayNameHint')}</Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={onClose}>
                    <Text style={styles.cancelText}>{t(language, 'chorus.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createButton, profileSaving && { opacity: 0.7 }]}
                    activeOpacity={0.8}
                    onPress={onSubmit}
                    disabled={profileSaving}
                  >
                    {profileSaving ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.createText}>{t(language, 'bulletin.save')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default ProfileSettingsModal
