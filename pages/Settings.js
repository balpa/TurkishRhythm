import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native'
import React from 'react'
import { Icon } from 'react-native-elements'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

const COLORS = {
  bg: '#1B1B2F',
  surface: '#262640',
  accent: '#E45A84',
  border: '#3A3A5C',
  text: '#F0E6D3',
  textDim: '#9090B0',
}

const Settings = () => {
  const { language, changeLanguage } = useLanguage()

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t(language, 'settings.title')}</Text>

        {/* Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="language" color={COLORS.accent} size={22} />
            <Text style={styles.sectionTitle}>{t(language, 'settings.language')}</Text>
          </View>
          <Text style={styles.sectionDesc}>{t(language, 'settings.languageDesc')}</Text>

          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionButton, language === 'tr' && styles.optionActive]}
              activeOpacity={0.7}
              onPress={() => changeLanguage('tr')}
            >
              <Text style={styles.flagText}>🇹🇷</Text>
              <Text style={[styles.optionText, language === 'tr' && styles.optionTextActive]}>
                {t(language, 'settings.turkish')}
              </Text>
              {language === 'tr' && <Icon name="check-circle" color={COLORS.accent} size={18} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, language === 'en' && styles.optionActive]}
              activeOpacity={0.7}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.flagText}>🇬🇧</Text>
              <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>
                {t(language, 'settings.english')}
              </Text>
              {language === 'en' && <Icon name="check-circle" color={COLORS.accent} size={18} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="info-outline" color={COLORS.accent} size={22} />
            <Text style={styles.sectionTitle}>{t(language, 'settings.about')}</Text>
          </View>

          <Text style={styles.aboutText}>{t(language, 'settings.appDescription')}</Text>

          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t(language, 'settings.version')}</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t(language, 'settings.developer')}</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://github.com/balpa')}>
                <Text style={[styles.infoValue, { color: COLORS.accent }]}>baLpa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    marginBottom: 16,
    marginLeft: 32,
  },
  optionRow: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  optionActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(228, 90, 132, 0.08)',
  },
  flagText: {
    fontSize: 22,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDim,
    flex: 1,
  },
  optionTextActive: {
    color: COLORS.text,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 21,
    marginBottom: 16,
  },
  infoRows: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDim,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
})
