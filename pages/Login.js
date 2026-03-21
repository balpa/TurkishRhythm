import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Easing, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { Icon } from 'react-native-elements'
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
  error: '#FB923C',
  green: '#4ADE80',
}

const Login = ({ onLogin }) => {
  const { language, changeLanguage } = useLanguage()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const logoScale = useRef(new Animated.Value(0.5)).current
  const formSlide = useRef(new Animated.Value(40)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(formSlide, { toValue: 0, duration: 500, delay: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start()
  }, [])

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSuccess('')
  }

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t(language, 'login.fillFields'))
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password })
      setLoading(false)
      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess(t(language, 'login.checkEmail'))
        setIsSignUp(false)
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      setLoading(false)
      if (signInError) {
        setError(signInError.message)
      } else if (data?.session) {
        onLogin(data.session)
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Language toggle */}
      <TouchableOpacity
        style={styles.langToggle}
        activeOpacity={0.7}
        onPress={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}
      >
        <Text style={styles.langText}>{language === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Title */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoCircle}>
              <Icon name="music-note" color="#fff" size={40} />
            </View>
            <Text style={styles.appTitle}>Koma</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: formSlide }] }]}>
            <Text style={styles.formTitle}>
              {isSignUp ? t(language, 'login.signUp') : t(language, 'login.signIn')}
            </Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Icon name="mail-outline" color={COLORS.textDim} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t(language, 'login.email')}
                placeholderTextColor={COLORS.textDim}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" color={COLORS.textDim} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t(language, 'login.password')}
                placeholderTextColor={COLORS.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Icon name={showPassword ? 'visibility' : 'visibility-off'} color={COLORS.textDim} size={20} />
              </TouchableOpacity>
            </View>

            {/* Error / Success */}
            {error ? (
              <View style={styles.messageRow}>
                <Icon name="error-outline" color={COLORS.error} size={16} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            {success ? (
              <View style={styles.messageRow}>
                <Icon name="check-circle-outline" color={COLORS.green} size={16} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitDisabled]}
              activeOpacity={0.8}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>
                  {isSignUp ? t(language, 'login.createAccount') : t(language, 'login.signIn')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch mode */}
            <TouchableOpacity onPress={switchMode} style={styles.switchButton}>
              <Text style={styles.switchText}>
                {isSignUp ? t(language, 'login.hasAccount') : t(language, 'login.noAccount')}
                {' '}
                <Text style={styles.switchTextAccent}>
                  {isSignUp ? t(language, 'login.signIn') : t(language, 'login.signUp')}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  langToggle: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },
  successText: {
    fontSize: 13,
    color: COLORS.green,
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: COLORS.textDim,
    fontWeight: '500',
  },
  switchTextAccent: {
    color: COLORS.accent,
    fontWeight: '700',
  },
})
