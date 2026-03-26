import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import {
  applyAttendanceToBulletins,
  applyAttendanceToRehearsals,
  ATTENDANCE_STATUSES,
  CACHE_TTL,
} from '../chorusDetailShared'

const emptySummary = { attending: 0, maybe: 0, absent: 0 }

const updateAttendanceSummary = (items, itemId, previousStatus, nextStatus) => (
  items.map((item) => {
    if (item.id !== itemId) return item

    const summary = { ...(item.attendance_summary || emptySummary) }
    if (previousStatus && ATTENDANCE_STATUSES.includes(previousStatus)) {
      summary[previousStatus] = Math.max(0, (summary[previousStatus] || 0) - 1)
    }
    summary[nextStatus] = (summary[nextStatus] || 0) + 1

    return {
      ...item,
      my_attendance_status: nextStatus,
      attendance_summary: summary,
    }
  })
)

const useChorusDetailData = ({ chorus, activeTab }) => {
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const [attendanceEnabled, setAttendanceEnabled] = useState(true)
  const [attendanceSavingId, setAttendanceSavingId] = useState(null)
  const [rehearsals, setRehearsals] = useState([])
  const [rehearsalsLoading, setRehearsalsLoading] = useState(true)
  const [rehearsalAttendanceSavingId, setRehearsalAttendanceSavingId] = useState(null)
  const [members, setMembers] = useState([])
  const [notes, setNotes] = useState([])
  const [bulletins, setBulletins] = useState([])
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(true)
  const [bulletinsLoading, setBulletinsLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null)

  const cacheRef = useRef({
    members: { data: null, timestamp: 0 },
    notes: { data: null, timestamp: 0 },
    bulletins: { data: null, timestamp: 0 },
    rehearsals: { data: null, timestamp: 0 },
  })

  useEffect(() => {
    const loadCurrentUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const metadata = user?.user_metadata || {}
      setCurrentUserId(user?.id || '')
      setCurrentUserName(metadata.display_name || metadata.full_name || '')
    }

    loadCurrentUserName()
  }, [])

  const getCachedValue = useCallback((key, force = false) => {
    const entry = cacheRef.current[key]
    if (force || !entry?.data) return null
    return Date.now() - entry.timestamp < CACHE_TTL ? entry.data : null
  }, [])

  const setCachedValue = useCallback((key, data) => {
    cacheRef.current[key] = { data, timestamp: Date.now() }
  }, [])

  const invalidateCache = useCallback((...keys) => {
    keys.forEach((key) => {
      cacheRef.current[key] = { data: null, timestamp: 0 }
    })
  }, [])

  const fetchMembers = useCallback(async (force = false) => {
    const cached = getCachedValue('members', force)
    if (cached) {
      setMembers(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('chorus_members')
      .select('role, user_id, joined_at, profiles(*)')
      .eq('chorus_id', chorus.id)
      .order('joined_at', { ascending: true })

    if (error) {
      console.log('Fetch members error:', error.message)
    }

    if (!error && data) {
      const nextMembers = data.map((member) => ({
        id: member.user_id,
        role: member.role,
        display_name: member.user_id === currentUserId
          ? currentUserName || member.profiles?.display_name || ''
          : member.profiles?.display_name || '',
        email: member.profiles?.email || `${member.user_id.substring(0, 8)}...`,
        joined_at: member.joined_at,
      }))

      setMembers(nextMembers)
      setCachedValue('members', nextMembers)
    }

    setLoading(false)
  }, [chorus.id, currentUserId, currentUserName, getCachedValue, setCachedValue])

  const fetchNotes = useCallback(async (force = false) => {
    const cached = getCachedValue('notes', force)
    if (cached) {
      setNotes(cached)
      setNotesLoading(false)
      return
    }

    setNotesLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('id, file_url, file_name, file_type, created_at, uploaded_by, profiles(*)')
      .eq('chorus_id', chorus.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Fetch notes error:', error.message)
    }

    if (!error && data) {
      setNotes(data)
      setCachedValue('notes', data)
    }

    setNotesLoading(false)
  }, [chorus.id, getCachedValue, setCachedValue])

  const fetchBulletins = useCallback(async (force = false) => {
    const cached = getCachedValue('bulletins', force)
    if (cached) {
      setAttendanceEnabled(cached.attendanceEnabled)
      setBulletins(cached.items)
      setBulletinsLoading(false)
      return
    }

    setBulletinsLoading(true)
    const { data, error } = await supabase
      .from('bulletins')
      .select('id, title, content, visibility, is_event, event_date, event_location, event_price, created_at, created_by, profiles(*)')
      .eq('chorus_id', chorus.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Fetch bulletins error:', error.message)
    }

    if (!error && data) {
      const eventBulletinIds = data.filter((item) => item.is_event).map((item) => item.id)

      if (eventBulletinIds.length === 0) {
        const nextBulletins = applyAttendanceToBulletins(data, [], currentUserId)
        setAttendanceEnabled(true)
        setBulletins(nextBulletins)
        setCachedValue('bulletins', { items: nextBulletins, attendanceEnabled: true })
      } else {
        const { data: attendanceRows, error: attendanceError } = await supabase
          .from('bulletin_attendance')
          .select('bulletin_id, user_id, status')
          .in('bulletin_id', eventBulletinIds)

        if (attendanceError) {
          if (attendanceError.code !== '42P01') {
            console.log('Fetch attendance error:', attendanceError.message)
          }

          const nextBulletins = applyAttendanceToBulletins(data, [], currentUserId)
          setAttendanceEnabled(false)
          setBulletins(nextBulletins)
          setCachedValue('bulletins', { items: nextBulletins, attendanceEnabled: false })
        } else {
          const nextBulletins = applyAttendanceToBulletins(data, attendanceRows || [], currentUserId)
          setAttendanceEnabled(true)
          setBulletins(nextBulletins)
          setCachedValue('bulletins', { items: nextBulletins, attendanceEnabled: true })
        }
      }
    }

    setBulletinsLoading(false)
  }, [chorus.id, currentUserId, getCachedValue, setCachedValue])

  const fetchRehearsals = useCallback(async (force = false) => {
    const cached = getCachedValue('rehearsals', force)
    if (cached) {
      setRehearsals(cached)
      setRehearsalsLoading(false)
      return
    }

    setRehearsalsLoading(true)
    const { data, error } = await supabase
      .from('rehearsals')
      .select('id, title, agenda, location, location_lat, location_lng, scheduled_at, created_at')
      .eq('chorus_id', chorus.id)
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.log('Fetch rehearsals error:', error.message)
      setRehearsals([])
      setCachedValue('rehearsals', [])
      setRehearsalsLoading(false)
      return
    }

    const rehearsalIds = (data || []).map((item) => item.id)
    if (rehearsalIds.length === 0) {
      setRehearsals([])
      setCachedValue('rehearsals', [])
      setRehearsalsLoading(false)
      return
    }

    const { data: attendanceRows, error: attendanceError } = await supabase
      .from('rehearsal_attendance')
      .select('rehearsal_id, user_id, status')
      .in('rehearsal_id', rehearsalIds)

    if (attendanceError) {
      console.log('Fetch rehearsal attendance error:', attendanceError.message)
      const nextRehearsals = applyAttendanceToRehearsals(data || [], [], currentUserId)
      setRehearsals(nextRehearsals)
      setCachedValue('rehearsals', nextRehearsals)
    } else {
      const nextRehearsals = applyAttendanceToRehearsals(data || [], attendanceRows || [], currentUserId)
      setRehearsals(nextRehearsals)
      setCachedValue('rehearsals', nextRehearsals)
    }

    setRehearsalsLoading(false)
  }, [chorus.id, currentUserId, getCachedValue, setCachedValue])

  const loadTabData = useCallback((tab, force = false) => {
    if (tab === 'members') return fetchMembers(force)
    if (tab === 'bulletin') return fetchBulletins(force)
    if (tab === 'rehearsals') return fetchRehearsals(force)
    return fetchNotes(force)
  }, [fetchBulletins, fetchMembers, fetchNotes, fetchRehearsals])

  useEffect(() => {
    fetchMembers(true)
  }, [fetchMembers])

  useEffect(() => {
    loadTabData(activeTab)
  }, [activeTab, loadTabData])

  useEffect(() => {
    if (!currentUserId) return
    invalidateCache('members', 'bulletins', 'rehearsals')
    fetchMembers(true)
    if (activeTab !== 'notes') {
      loadTabData(activeTab, true)
    }
  }, [activeTab, currentUserId, fetchMembers, invalidateCache, loadTabData])

  const refreshActiveTab = useCallback((force = true) => {
    fetchMembers(force)
    loadTabData(activeTab, force)
  }, [activeTab, fetchMembers, loadTabData])

  const handleAttendanceChange = useCallback(async (bulletin, status) => {
    if (!currentUserId || !attendanceEnabled) return

    const previousStatus = bulletin.my_attendance_status
    setAttendanceSavingId(bulletin.id)
    setBulletins((previous) => updateAttendanceSummary(previous, bulletin.id, previousStatus, status))
    invalidateCache('bulletins')

    const { error } = await supabase
      .from('bulletin_attendance')
      .upsert({
        bulletin_id: bulletin.id,
        user_id: currentUserId,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'bulletin_id,user_id' })

    if (error) {
      if (error.code === '42P01') {
        setAttendanceEnabled(false)
      } else {
        console.log('Attendance update error:', error.message)
      }
      fetchBulletins(true)
    }

    setAttendanceSavingId(null)
  }, [attendanceEnabled, currentUserId, fetchBulletins, invalidateCache])

  const handleRehearsalAttendanceChange = useCallback(async (rehearsal, status) => {
    if (!currentUserId) return

    const previousStatus = rehearsal.my_attendance_status
    setRehearsalAttendanceSavingId(rehearsal.id)
    setRehearsals((previous) => updateAttendanceSummary(previous, rehearsal.id, previousStatus, status))
    invalidateCache('rehearsals')

    const { error } = await supabase
      .from('rehearsal_attendance')
      .upsert({
        rehearsal_id: rehearsal.id,
        user_id: currentUserId,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'rehearsal_id,user_id' })

    if (error) {
      console.log('Rehearsal attendance update error:', error.message)
      fetchRehearsals(true)
    }

    setRehearsalAttendanceSavingId(null)
  }, [currentUserId, fetchRehearsals, invalidateCache])

  const confirmDelete = useCallback(async () => {
    if (!deleteModal) return

    const { type, item } = deleteModal

    if (type === 'note') {
      const filePath = item.file_url.split('/notes/')[1]
      const { error: storageError } = await supabase.storage.from('notes').remove([filePath])
      if (storageError) console.log('Storage delete error:', storageError.message)
      const { error: dbError } = await supabase.from('notes').delete().eq('id', item.id)
      if (dbError) console.log('DB delete error:', dbError.message)
      invalidateCache('notes')
      fetchNotes(true)
    } else if (type === 'bulletin') {
      const { error } = await supabase.from('bulletins').delete().eq('id', item.id)
      if (error) console.log('Bulletin delete error:', error.message)
      invalidateCache('bulletins')
      fetchBulletins(true)
    } else if (type === 'rehearsal') {
      const { error } = await supabase.from('rehearsals').delete().eq('id', item.id)
      if (error) console.log('Rehearsal delete error:', error.message)
      invalidateCache('rehearsals')
      fetchRehearsals(true)
    } else if (type === 'member') {
      const { error } = await supabase
        .from('chorus_members')
        .delete()
        .eq('chorus_id', chorus.id)
        .eq('user_id', item.id)
      if (error) console.log('Member delete error:', error.message)
      invalidateCache('members')
      fetchMembers(true)
    }

    setDeleteModal(null)
  }, [chorus.id, deleteModal, fetchBulletins, fetchMembers, fetchNotes, fetchRehearsals, invalidateCache])

  return {
    attendanceEnabled,
    attendanceSavingId,
    bulletins,
    bulletinsLoading,
    confirmDelete,
    currentUserId,
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
  }
}

export default useChorusDetailData
