import { View, Text, TextInput, TouchableOpacity, Animated, Easing, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { Icon } from 'react-native-elements'
import { supabase } from '../../../../lib/supabase'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import styles from '../authStyles'
import { COLORS } from '../../../shared/theme/colors'

const LoginScreen = ({ onLogin }) => {
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
  }, [fadeAnim, formSlide, logoScale])

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
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
    } else if (data?.session) {
      onLogin(data.session)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.langToggle} activeOpacity={0.7} onPress={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}>
        <Text style={styles.langText}>{language === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoCircle}>
              <Icon name="music-note" color={COLORS.white} size={40} />
            </View>
            <Text style={styles.appTitle}>Koma</Text>
          </Animated.View>

          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: formSlide }] }]}>
            <Text style={styles.formTitle}>{isSignUp ? t(language, 'login.signUp') : t(language, 'login.signIn')}</Text>

            <View style={styles.inputContainer}>
              <Icon name="mail-outline" color={COLORS.textDim} size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder={t(language, 'login.email')} placeholderTextColor={COLORS.textDim} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-outline" color={COLORS.textDim} size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder={t(language, 'login.password')} placeholderTextColor={COLORS.textDim} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Icon name={showPassword ? 'visibility' : 'visibility-off'} color={COLORS.textDim} size={20} />
              </TouchableOpacity>
            </View>

            {error ? <View style={styles.messageRow}><Icon name="error-outline" color={COLORS.error} size={16} /><Text style={styles.errorText}>{error}</Text></View> : null}
            {success ? <View style={styles.messageRow}><Icon name="check-circle-outline" color={COLORS.green} size={16} /><Text style={styles.successText}>{success}</Text></View> : null}

            <TouchableOpacity style={[styles.submitButton, loading && styles.submitDisabled]} activeOpacity={0.8} onPress={handleAuth} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.submitText}>{isSignUp ? t(language, 'login.createAccount') : t(language, 'login.signIn')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={switchMode} style={styles.switchButton}>
              <Text style={styles.switchText}>
                {isSignUp ? t(language, 'login.hasAccount') : t(language, 'login.noAccount')} <Text style={styles.switchTextAccent}>{isSignUp ? t(language, 'login.signIn') : t(language, 'login.signUp')}</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default LoginScreen
