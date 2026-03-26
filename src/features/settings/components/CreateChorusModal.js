import React from 'react'
import { Modal, TouchableOpacity, Animated, View, Text, TextInput, ActivityIndicator } from 'react-native'
import { Icon } from 'react-native-elements'
import { t } from '../../../../i18n/translations'
import styles from '../settingsStyles'
import { COLORS, createModalAnimation } from '../settingsShared'

const CreateChorusModal = ({
  visible,
  language,
  animation,
  chorusName,
  chorusDesc,
  creating,
  onClose,
  onChangeName,
  onChangeDesc,
  onSubmit,
}) => {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalTouchBlocker}>
          <Animated.View style={[styles.modalCard, createModalAnimation(animation)]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t(language, 'chorus.createChorus')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalClose}>
                <Icon name="close" color={COLORS.textDim} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInput}>
              <TextInput
                style={styles.modalTextInput}
                placeholder={t(language, 'chorus.chorusName')}
                placeholderTextColor={COLORS.textDim}
                value={chorusName}
                onChangeText={onChangeName}
                autoFocus
              />
            </View>

            <View style={styles.modalInput}>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder={t(language, 'chorus.chorusDescription')}
                placeholderTextColor={COLORS.textDim}
                value={chorusDesc}
                onChangeText={onChangeDesc}
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={onClose}>
                <Text style={styles.cancelText}>{t(language, 'chorus.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, creating && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={onSubmit}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.createText}>{t(language, 'chorus.create')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default CreateChorusModal
