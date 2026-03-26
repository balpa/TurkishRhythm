import { StyleSheet } from 'react-native'
import { COLORS } from './feedShared'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pastCard: {
    opacity: 0.5,
  },
  cardSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSourceIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardSourceName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardDate: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: '600',
    marginLeft: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
    marginBottom: 10,
  },
  eventInfo: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  attendanceCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  attendanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  attendanceStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
  attendanceStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  attendanceStat: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attendanceStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  attendanceStatLabel: {
    fontSize: 10,
    color: COLORS.textDim,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  attendanceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attendanceButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  attendanceButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
    textAlign: 'center',
  },
  attendanceButtonTextActive: {
    color: '#fff',
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventInfoText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  cardAuthor: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
})

export default styles
