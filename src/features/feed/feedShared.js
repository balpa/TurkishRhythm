import { COLORS } from '../../shared/theme/colors'

export { COLORS }

export const PAGE_SIZE = 10
export const ATTENDANCE_STATUSES = ['attending', 'maybe', 'absent']

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
