import { Linking, Platform } from 'react-native'
import { COLORS } from '../../shared/theme/colors'

export { COLORS }

export const TABS = ['notes', 'bulletin', 'rehearsals', 'leaderboard', 'members']
export const MAX_CHORUS_NOTES = 50
export const ATTENDANCE_STATUSES = ['attending', 'maybe', 'absent']
export const CACHE_TTL = 30_000

export const getUserDisplayName = (profile, fallbackId) => {
  return profile?.display_name || profile?.email || (fallbackId ? `${fallbackId.substring(0, 8)}...` : '-')
}

export const applyAttendanceToBulletins = (items, attendanceRows, currentUserId) => {
  const attendanceMap = {}

  attendanceRows.forEach((row) => {
    if (!attendanceMap[row.bulletin_id]) {
      attendanceMap[row.bulletin_id] = {
        attending: 0,
        maybe: 0,
        absent: 0,
        currentUserStatus: null,
      }
    }

    if (ATTENDANCE_STATUSES.includes(row.status)) {
      attendanceMap[row.bulletin_id][row.status] += 1
    }

    if (row.user_id === currentUserId) {
      attendanceMap[row.bulletin_id].currentUserStatus = row.status
    }
  })

  return items.map((item) => {
    const attendance = attendanceMap[item.id] || {
      attending: 0,
      maybe: 0,
      absent: 0,
      currentUserStatus: null,
    }

    return {
      ...item,
      attendance_summary: {
        attending: attendance.attending,
        maybe: attendance.maybe,
        absent: attendance.absent,
      },
      my_attendance_status: attendance.currentUserStatus,
    }
  })
}

export const applyAttendanceToRehearsals = (items, attendanceRows, currentUserId) => {
  const attendanceMap = {}

  attendanceRows.forEach((row) => {
    if (!attendanceMap[row.rehearsal_id]) {
      attendanceMap[row.rehearsal_id] = {
        attending: 0,
        maybe: 0,
        absent: 0,
        currentUserStatus: null,
      }
    }

    if (ATTENDANCE_STATUSES.includes(row.status)) {
      attendanceMap[row.rehearsal_id][row.status] += 1
    }

    if (row.user_id === currentUserId) {
      attendanceMap[row.rehearsal_id].currentUserStatus = row.status
    }
  })

  return items.map((item) => {
    const attendance = attendanceMap[item.id] || {
      attending: 0,
      maybe: 0,
      absent: 0,
      currentUserStatus: null,
    }

    return {
      ...item,
      attendance_summary: {
        attending: attendance.attending,
        maybe: attendance.maybe,
        absent: attendance.absent,
      },
      my_attendance_status: attendance.currentUserStatus,
    }
  })
}

export const openLocationInMaps = async (location) => {
  if (!location?.label?.trim() && (location?.latitude == null || location?.longitude == null)) return

  const hasCoordinates = location?.latitude != null && location?.longitude != null
  const encodedLabel = encodeURIComponent(location?.label?.trim() || '')
  const coordinateQuery = hasCoordinates ? `${location.latitude},${location.longitude}` : null
  const primaryUrl = Platform.OS === 'ios'
    ? hasCoordinates
      ? `http://maps.apple.com/?ll=${coordinateQuery}&q=${encodedLabel || coordinateQuery}`
      : `http://maps.apple.com/?q=${encodedLabel}`
    : hasCoordinates
      ? `geo:${coordinateQuery}?q=${coordinateQuery}${encodedLabel ? `(${encodedLabel})` : ''}`
      : `geo:0,0?q=${encodedLabel}`
  const fallbackUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinateQuery}`
    : `https://www.google.com/maps/search/?api=1&query=${encodedLabel}`

  const targetUrl = await Linking.canOpenURL(primaryUrl) ? primaryUrl : fallbackUrl
  await Linking.openURL(targetUrl)
}
