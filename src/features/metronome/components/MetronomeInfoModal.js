import React from 'react'
import { Modal, TouchableOpacity, Animated, View, Text } from 'react-native'
import { Icon } from 'react-native-elements'
import { t } from '../../../../i18n/translations'
import styles from '../metronomeStyles'
import { COLORS } from '../metronomeShared'

const MetronomeInfoModal = ({ visible, language, animation, onClose }) => (
  <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.modalTouchBlocker}>
        <Animated.View style={[styles.modalCard, { opacity: animation, transform: [{ scale: animation.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
          <View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t(language, 'metronome.infoTitle')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalClose}>
                <Icon name="close" color={COLORS.textDim} size={22} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>{t(language, 'metronome.infoText')}</Text>
            <View style={styles.modalLegend}>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: COLORS.green }]} /><Text style={styles.legendText}>{t(language, 'metronome.legendPerfect')}</Text></View>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} /><Text style={styles.legendText}>{t(language, 'metronome.legendGood')}</Text></View>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: COLORS.error }]} /><Text style={styles.legendText}>{t(language, 'metronome.legendMedium')}</Text></View>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} /><Text style={styles.legendText}>{t(language, 'metronome.legendPractice')}</Text></View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
)

export default MetronomeInfoModal
