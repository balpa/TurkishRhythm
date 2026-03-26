import React from 'react'
import { Modal, TouchableOpacity, Animated, View, Text, TextInput, ActivityIndicator } from 'react-native'
import { Icon } from 'react-native-elements'
import { t } from '../../../../i18n/translations'
import styles from '../settingsStyles'
import { COLORS, createModalAnimation } from '../settingsShared'

const AdminAccessModal = ({
  visible,
  language,
  animation,
  chorusName,
  reason,
  submitting,
  onClose,
  onChangeChorusName,
  onChangeReason,
  onSubmit,
}) => (
  <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.modalTouchBlocker}>
        <Animated.View style={[styles.modalCard, createModalAnimation(animation)]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t(language, 'settings.adminRequestTitle')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Icon name="close" color={COLORS.textDim} size={22} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalHelperText}>{t(language, 'settings.adminRequestDesc')}</Text>

          <View style={styles.modalInput}>
            <TextInput
              style={styles.modalTextInput}
              placeholder={t(language, 'settings.adminRequestChorusName')}
              placeholderTextColor={COLORS.textDim}
              value={chorusName}
              onChangeText={onChangeChorusName}
              autoFocus
            />
          </View>

          <View style={styles.modalInput}>
            <TextInput
              style={[styles.modalTextInput, styles.multilineInput]}
              placeholder={t(language, 'settings.adminRequestReason')}
              placeholderTextColor={COLORS.textDim}
              value={reason}
              onChangeText={onChangeReason}
              multiline
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={onClose}>
              <Text style={styles.cancelText}>{t(language, 'chorus.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.createButton, submitting && { opacity: 0.7 }]} activeOpacity={0.8} onPress={onSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.createText}>{t(language, 'settings.sendRequest')}</Text>}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
)

export default AdminAccessModal
