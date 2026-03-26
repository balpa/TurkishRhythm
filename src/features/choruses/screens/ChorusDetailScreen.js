import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Easing, Modal, Alert } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import {
  COLORS,
  MAX_CHORUS_NOTES,
  TABS,
} from '../chorusDetailShared'
import styles from '../chorusDetailStyles'
import {
  SwipeableBulletinCard,
  SwipeableMemberItem,
  SwipeableNoteCard,
  SwipeableRehearsalCard,
} from '../components/ChorusDetailCards'
import useChorusDetailData from '../hooks/useChorusDetailData'

const ChorusDetailScreen = ({ route, navigation }) => {
  const { language } = useLanguage()
  const { chorus } = route.params
  const isAdmin = chorus.role === 'admin'
  const [activeTab, setActiveTab] = useState('notes')

  const headerAnim = useRef(new Animated.Value(0)).current
  const {
    attendanceEnabled,
    attendanceSavingId,
    bulletins,
    bulletinsLoading,
    confirmDelete,
    deleteModal,
    handleAttendanceChange,
    handleRehearsalAttendanceChange,
    loading,
    members,
    notes,
    notesLoading,
    refreshActiveTab,
    rehearsalAttendanceSavingId,
    rehearsals,
    rehearsalsLoading,
    setDeleteModal,
  } = useChorusDetailData({ chorus, activeTab })

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [headerAnim])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshActiveTab(true)
    })
    return unsubscribe
  }, [navigation, refreshActiveTab])

  const getDeleteModalTitle = () => {
    if (!deleteModal) return ''
    if (deleteModal.type === 'note') return t(language, 'chorusDetail.deleteNoteTitle')
    if (deleteModal.type === 'bulletin') return t(language, 'chorusDetail.deleteBulletinTitle')
    if (deleteModal.type === 'rehearsal') return t(language, 'chorusDetail.deleteRehearsalTitle')
    return t(language, 'chorusDetail.deleteMemberTitle')
  }

  const getDeleteModalDesc = () => {
    if (!deleteModal) return ''
    if (deleteModal.type === 'note') return deleteModal.item.file_name
    if (deleteModal.type === 'bulletin') return deleteModal.item.title
    if (deleteModal.type === 'rehearsal') return deleteModal.item.title
    return deleteModal.item.email
  }

  const formattedDate = new Date(chorus.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const getTabIcon = (tab) => {
    if (tab === 'notes') return 'description'
    if (tab === 'bulletin') return 'campaign'
    if (tab === 'rehearsals') return 'event-note'
    return 'people'
  }

  const renderTabContent = () => {
    if (activeTab === 'members') {
      if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="small" color={COLORS.accent} /></View>
      }
      return members.length === 0 ? (
        <Text style={styles.emptyText}>{t(language, 'chorusDetail.noMembers')}</Text>
      ) : (
        members.map((member, index) => (
          <SwipeableMemberItem
            key={member.id}
            member={member}
            index={index}
            language={language}
            isAdmin={isAdmin}
            onDelete={(memberToDelete) => setDeleteModal({ type: 'member', item: memberToDelete })}
          />
        ))
      )
    }

    if (activeTab === 'notes') {
      if (notesLoading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="small" color={COLORS.accent} /></View>
      }
      if (notes.length === 0) {
        return (
          <View style={styles.emptyTabState}>
            <Icon name="description" color={COLORS.border} size={48} />
            <Text style={styles.emptyTabTitle}>{t(language, 'chorusDetail.notesEmpty')}</Text>
            <Text style={styles.emptyTabDesc}>{t(language, 'chorusDetail.notesEmptyDesc')}</Text>
          </View>
        )
      }
      return notes.map((note) => (
        <SwipeableNoteCard
          key={note.id}
          note={note}
          language={language}
          isAdmin={isAdmin}
          onPress={() => navigation.navigate('NoteViewer', { note })}
          onDelete={(noteToDelete) => setDeleteModal({ type: 'note', item: noteToDelete })}
        />
      ))
    }

    if (activeTab === 'bulletin') {
      if (bulletinsLoading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="small" color={COLORS.accent} /></View>
      }
      if (bulletins.length === 0) {
        return (
          <View style={styles.emptyTabState}>
            <Icon name="campaign" color={COLORS.border} size={48} />
            <Text style={styles.emptyTabTitle}>{t(language, 'chorusDetail.bulletinEmpty')}</Text>
            <Text style={styles.emptyTabDesc}>{t(language, 'chorusDetail.bulletinEmptyDesc')}</Text>
          </View>
        )
      }
      return bulletins.map((bulletin) => (
        <SwipeableBulletinCard
          key={bulletin.id}
          bulletin={bulletin}
          language={language}
          isAdmin={isAdmin}
          attendanceEnabled={attendanceEnabled}
          attendanceSavingId={attendanceSavingId}
          onAttendanceChange={handleAttendanceChange}
          onDelete={(bulletinToDelete) => setDeleteModal({ type: 'bulletin', item: bulletinToDelete })}
          onEdit={(bulletinToEdit) => navigation.navigate('CreateBulletin', { chorus, bulletin: bulletinToEdit })}
        />
      ))
    }

    if (rehearsalsLoading) {
      return <View style={styles.loadingContainer}><ActivityIndicator size="small" color={COLORS.accent} /></View>
    }
    if (rehearsals.length === 0) {
      return (
        <View style={styles.emptyTabState}>
          <Icon name="event-note" color={COLORS.border} size={48} />
          <Text style={styles.emptyTabTitle}>{t(language, 'chorusDetail.rehearsalsEmpty')}</Text>
          <Text style={styles.emptyTabDesc}>{t(language, 'chorusDetail.rehearsalsEmptyDesc')}</Text>
        </View>
      )
    }
    return rehearsals.map((rehearsal) => (
      <SwipeableRehearsalCard
        key={rehearsal.id}
        rehearsal={rehearsal}
        language={language}
        isAdmin={isAdmin}
        attendanceSavingId={rehearsalAttendanceSavingId}
        onAttendanceChange={handleRehearsalAttendanceChange}
        onDelete={(rehearsalToDelete) => setDeleteModal({ type: 'rehearsal', item: rehearsalToDelete })}
        onEdit={(rehearsalToEdit) => navigation.navigate('CreateRehearsal', { chorus, rehearsal: rehearsalToEdit })}
      />
    ))
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{chorus.name}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={[styles.infoCard, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <View style={styles.infoIconCircle}>
            <Icon name="groups" color="#fff" size={32} />
          </View>
          <Text style={styles.chorusName}>{chorus.name}</Text>
          {chorus.description ? <Text style={styles.chorusDesc}>{chorus.description}</Text> : null}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="calendar-today" color={COLORS.textDim} size={14} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="people" color={COLORS.textDim} size={14} />
              <Text style={styles.metaText}>{loading ? '...' : `${members.length} ${t(language, 'chorusDetail.members')}`}</Text>
            </View>
            <View style={[styles.roleBadge, { borderColor: isAdmin ? COLORS.gold : COLORS.green }]}>
              <Text style={[styles.roleText, { color: isAdmin ? COLORS.gold : COLORS.green }]}>
                {isAdmin ? t(language, 'chorusDetail.roleAdmin') : t(language, 'chorusDetail.roleMember')}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} activeOpacity={0.7} onPress={() => setActiveTab(tab)}>
              <Icon name={getTabIcon(tab)} color={activeTab === tab ? COLORS.accent : COLORS.textDim} size={20} />
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {t(language, `chorusDetail.tab_${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {((activeTab === 'notes' || activeTab === 'bulletin') || (isAdmin && (activeTab === 'members' || activeTab === 'rehearsals'))) && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => {
            if (activeTab === 'notes' && notes.length >= MAX_CHORUS_NOTES) {
              Alert.alert(t(language, 'createNote.limitTitle'), t(language, 'createNote.limitReached'))
              return
            }

            const screens = { notes: 'CreateNote', bulletin: 'CreateBulletin', rehearsals: 'CreateRehearsal', members: 'AddMember' }
            navigation.navigate(screens[activeTab], { chorus })
          }}
        >
          <Icon name={activeTab === 'members' ? 'person-add' : 'add'} color="#fff" size={22} />
        </TouchableOpacity>
      )}

      <Modal visible={deleteModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Icon name="delete-outline" color={COLORS.accent} size={36} />
            <Text style={styles.modalTitle}>{getDeleteModalTitle()}</Text>
            <Text style={styles.modalDesc}>{getDeleteModalDesc()}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.7} onPress={() => setDeleteModal(null)}>
                <Text style={styles.modalCancelText}>{t(language, 'chorusDetail.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} activeOpacity={0.7} onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>{t(language, 'chorusDetail.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ChorusDetailScreen
