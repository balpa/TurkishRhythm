import React from 'react'
import { Modal, TouchableOpacity, Animated, View, Text, ActivityIndicator, ScrollView } from 'react-native'
import { Icon } from 'react-native-elements'
import { t } from '../../../../i18n/translations'
import styles from '../settingsStyles'
import { COLORS, createModalAnimation, formatProfileDate } from '../settingsShared'

const RequestRow = ({ item, language, processingId, onReview }) => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <Text style={styles.requestTitle}>{item.chorus_name}</Text>
      <Text style={[styles.requestStatus, item.status === 'pending' ? styles.requestPending : item.status === 'approved' ? styles.requestApproved : styles.requestRejected]}>
        {t(language, `settings.requestStatus_${item.status}`)}
      </Text>
    </View>
    <Text style={styles.requestMeta}>{item.display_name || item.email || '-'}</Text>
    {item.email ? <Text style={styles.requestMeta}>{item.email}</Text> : null}
    {item.reason ? <Text style={styles.requestReason}>{item.reason}</Text> : null}
    <Text style={styles.requestMeta}>{formatProfileDate(item.created_at, language)}</Text>
    {item.status === 'pending' ? (
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.reviewRejectButton} activeOpacity={0.7} onPress={() => onReview(item, 'rejected')} disabled={processingId === item.id}>
          {processingId === item.id ? <ActivityIndicator color={COLORS.error} size="small" /> : <Text style={styles.reviewRejectText}>{t(language, 'settings.reject')}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.reviewApproveButton} activeOpacity={0.7} onPress={() => onReview(item, 'approved')} disabled={processingId === item.id}>
          {processingId === item.id ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.reviewApproveText}>{t(language, 'settings.approve')}</Text>}
        </TouchableOpacity>
      </View>
    ) : null}
  </View>
)

const AdminRequestReviewModal = ({ visible, language, animation, requests, loading, processingId, onClose, onReview }) => (
  <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.modalTouchBlocker}>
        <Animated.View style={[styles.modalCard, createModalAnimation(animation), styles.reviewModalCard]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t(language, 'settings.adminRequests')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Icon name="close" color={COLORS.textDim} size={22} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.profileLoadingWrap}>
              <ActivityIndicator color={COLORS.accent} size="small" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {requests.length === 0 ? (
                <Text style={styles.emptyReviewText}>{t(language, 'settings.noAdminRequests')}</Text>
              ) : (
                requests.map((item) => <RequestRow key={item.id} item={item} language={language} processingId={processingId} onReview={onReview} />)
              )}
            </ScrollView>
          )}
        </Animated.View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
)

export default AdminRequestReviewModal
