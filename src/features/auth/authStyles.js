import { StyleSheet } from 'react-native'
import { COLORS } from '../../shared/theme/colors'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  langToggle: { position: 'absolute', top: 56, right: 20, zIndex: 10, backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  langText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  appTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: 0.5 },
  form: { width: '100%' },
  formTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: COLORS.text, fontWeight: '500' },
  eyeButton: { padding: 8 },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingHorizontal: 4 },
  errorText: { fontSize: 13, color: COLORS.error, fontWeight: '600', flex: 1 },
  successText: { fontSize: 13, color: COLORS.green, fontWeight: '600', flex: 1 },
  submitButton: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 4, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  submitDisabled: { opacity: 0.7 },
  submitText: { fontSize: 17, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 14, color: COLORS.textDim, fontWeight: '500' },
  switchTextAccent: { color: COLORS.accent, fontWeight: '700' },
})

export default styles
