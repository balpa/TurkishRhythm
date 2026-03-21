import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Animated, Easing, Image, Modal } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { Swipeable } from 'react-native-gesture-handler'
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

const TABS = ['notes', 'bulletin', 'members']
const SwipeableNoteCard = ({ note, language, onPress, onDelete }) => {
  const swipeRef = useRef(null)

  const isImage = note.file_type?.startsWith('image/')
  const uploaderEmail = note.profiles?.email || note.uploaded_by?.substring(0, 8) + '...'
  const date = new Date(note.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )

  const handleDelete = () => {
    swipeRef.current?.close()
    onDelete(note)
  }

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteAction} activeOpacity={0.7} onPress={handleDelete}>
      <Icon name="delete" color="#fff" size={22} />
    </TouchableOpacity>
  )

  return (
    <View style={styles.swipeContainer}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        rightThreshold={40}
      >
        <TouchableOpacity style={styles.noteCard} activeOpacity={0.8} onPress={onPress}>
          {isImage ? (
            <Image source={{ uri: note.file_url }} style={styles.noteImage} />
          ) : (
            <View style={styles.noteFileIcon}>
              <Icon name="picture-as-pdf" color={COLORS.accent} size={28} />
            </View>
          )}
          <View style={styles.noteInfo}>
            <Text style={styles.noteFileName} numberOfLines={1}>{note.file_name}</Text>
            <Text style={styles.noteMeta}>{uploaderEmail} • {date}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  )
}

const MemberItem = ({ member, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 60,
      useNativeDriver: true,
    }).start()
  }, [])

  const roleColor = member.role === 'admin' ? COLORS.gold : COLORS.green
  const initial = (member.email || '?')[0].toUpperCase()

  return (
    <Animated.View style={[styles.memberRow, { opacity: fadeAnim }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberEmail} numberOfLines={1}>{member.email}</Text>
        <Text style={[styles.memberRole, { color: roleColor }]}>
          {member.role === 'admin' ? 'Admin' : 'Member'}
        </Text>
      </View>
    </Animated.View>
  )
}

const ChorusDetail = ({ route, navigation }) => {
  const { language } = useLanguage()
  const { chorus } = route.params
  const [members, setMembers] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notes')
  const [tabBarWidth, setTabBarWidth] = useState(0)

  const headerAnim = useRef(new Animated.Value(0)).current
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    const index = TABS.indexOf(activeTab)
    Animated.spring(tabIndicatorAnim, {
      toValue: index,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start()
  }, [activeTab])

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('chorus_members')
      .select('role, user_id, joined_at, profiles(email)')
      .eq('chorus_id', chorus.id)
      .order('joined_at', { ascending: true })

    if (error) {
      console.log('Fetch members error:', error.message)
    }
    if (!error && data) {
      setMembers(data.map(m => ({
        id: m.user_id,
        role: m.role,
        email: m.profiles?.email || m.user_id.substring(0, 8) + '...',
        joined_at: m.joined_at,
      })))
    }
    setLoading(false)
  }, [chorus.id])

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('id, file_url, file_name, file_type, created_at, uploaded_by, profiles(email)')
      .eq('chorus_id', chorus.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Fetch notes error:', error.message)
    }
    if (!error && data) {
      setNotes(data)
    }
    setNotesLoading(false)
  }, [chorus.id])

  useEffect(() => {
    fetchMembers()
    fetchNotes()
  }, [fetchMembers, fetchNotes])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotes()
    })
    return unsubscribe
  }, [navigation, fetchNotes])

  const [deleteModal, setDeleteModal] = useState(null)

  const handleDeleteNote = async (note) => {
    setDeleteModal(note)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    const filePath = deleteModal.file_url.split('/notes/')[1]

    const { error: storageError } = await supabase.storage.from('notes').remove([filePath])
    if (storageError) console.log('Storage delete error:', storageError.message)

    const { error: dbError } = await supabase.from('notes').delete().eq('id', deleteModal.id)
    if (dbError) console.log('DB delete error:', dbError.message)

    setDeleteModal(null)
    fetchNotes()
  }

  const formattedDate = new Date(chorus.created_at).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const getTabLabel = (tab) => t(language, `chorusDetail.tab_${tab}`)
  const getTabIcon = (tab) => {
    if (tab === 'notes') return 'description'
    if (tab === 'bulletin') return 'campaign'
    return 'people'
  }

  const renderTabContent = () => {
    if (activeTab === 'members') {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        )
      }
      return members.length === 0 ? (
        <Text style={styles.emptyText}>{t(language, 'chorusDetail.noMembers')}</Text>
      ) : (
        members.map((member, index) => (
          <MemberItem key={member.id} member={member} index={index} />
        ))
      )
    }

    if (activeTab === 'notes') {
      if (notesLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        )
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
          onPress={() => navigation.navigate('NoteViewer', { note })}
          onDelete={handleDeleteNote}
        />
      ))
    }

    if (activeTab === 'bulletin') {
      return (
        <View style={styles.emptyTabState}>
          <Icon name="campaign" color={COLORS.border} size={48} />
          <Text style={styles.emptyTabTitle}>{t(language, 'chorusDetail.bulletinEmpty')}</Text>
          <Text style={styles.emptyTabDesc}>{t(language, 'chorusDetail.bulletinEmptyDesc')}</Text>
        </View>
      )
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{chorus.name}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Chorus info card */}
        <Animated.View style={[styles.infoCard, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <View style={styles.infoIconCircle}>
            <Icon name="groups" color="#fff" size={32} />
          </View>
          <Text style={styles.chorusName}>{chorus.name}</Text>
          {chorus.description ? (
            <Text style={styles.chorusDesc}>{chorus.description}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="calendar-today" color={COLORS.textDim} size={14} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="people" color={COLORS.textDim} size={14} />
              <Text style={styles.metaText}>
                {loading ? '...' : `${members.length} ${t(language, 'chorusDetail.members')}`}
              </Text>
            </View>
            <View style={[styles.roleBadge, { borderColor: chorus.role === 'admin' ? COLORS.gold : COLORS.green }]}>
              <Text style={[styles.roleText, { color: chorus.role === 'admin' ? COLORS.gold : COLORS.green }]}>
                {chorus.role === 'admin' ? 'Admin' : 'Member'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Tabs */}
        <View
          style={styles.tabBar}
          onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
        >
          {/* Animated indicator */}
          {tabBarWidth > 0 && (
            <Animated.View style={[styles.tabIndicator, {
              width: (tabBarWidth - 8) / 3,
              transform: [{
                translateX: tabIndicatorAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, (tabBarWidth - 8) / 3, ((tabBarWidth - 8) / 3) * 2],
                }),
              }],
            }]} />
          )}

          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab)}
            >
              <Icon
                name={getTabIcon(tab)}
                color={activeTab === tab ? COLORS.accent : COLORS.textDim}
                size={20}
              />
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {getTabLabel(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Floating + button for notes and bulletin tabs */}
      {(activeTab === 'notes' || activeTab === 'bulletin') && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => {
            const screen = activeTab === 'notes' ? 'CreateNote' : 'CreateBulletin'
            navigation.navigate(screen, { chorus })
          }}
        >
          <Icon name="add" color="#fff" size={22} />
        </TouchableOpacity>
      )}
      {/* Delete confirmation modal */}
      <Modal visible={deleteModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Icon name="delete-outline" color={COLORS.accent} size={36} />
            <Text style={styles.modalTitle}>{t(language, 'chorusDetail.deleteTitle')}</Text>
            <Text style={styles.modalDesc}>{deleteModal?.file_name}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
                onPress={() => setDeleteModal(null)}
              >
                <Text style={styles.modalCancelText}>{t(language, 'chorusDetail.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                activeOpacity={0.7}
                onPress={confirmDelete}
              >
                <Text style={styles.modalDeleteText}>{t(language, 'chorusDetail.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ChorusDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  chorusName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  chorusDesc: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  roleBadge: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.bg,
    borderRadius: 11,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Members
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accent,
  },
  memberInfo: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 14,
    paddingVertical: 20,
  },
  // Empty tab states
  emptyTabState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 6,
  },
  emptyTabDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 19,
  },
  // Notes
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
  },
  noteFileIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteFileName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  noteMeta: {
    fontSize: 11,
    color: COLORS.textDim,
    marginTop: 3,
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  // Swipeable note
  swipeContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  deleteAction: {
    width: 70,
    backgroundColor: '#D9534F',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Delete modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#D9534F',
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
})
