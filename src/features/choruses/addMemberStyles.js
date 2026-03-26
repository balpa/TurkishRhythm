import { StyleSheet } from 'react-native'
import { COLORS } from '../../shared/theme/colors'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, flex: 1, textAlign: 'center', marginHorizontal: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, marginTop: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 14, marginLeft: 10 },
  hintText: { color: COLORS.textDim, fontSize: 13, textAlign: 'center', marginTop: 16 },
  loadingContainer: { paddingVertical: 30, alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${COLORS.accent}30`, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  userInfo: { flex: 1 },
  userEmail: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  alreadyBadge: { marginLeft: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDim, marginTop: 12 },
  messageBanner: { marginHorizontal: 16, marginTop: 10, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  errorBanner: { backgroundColor: '#FB923C20' },
  successBanner: { backgroundColor: '#4ADE8020' },
  messageText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
})

export default styles
