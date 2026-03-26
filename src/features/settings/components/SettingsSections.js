import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { Icon } from 'react-native-elements'
import { t } from '../../../../i18n/translations'
import styles from '../settingsStyles'
import { COLORS } from '../settingsShared'

export const FeedbackBanner = ({ message, messageType }) => {
  if (!message) return null

  const isError = messageType === 'error'

  return (
    <View style={[styles.feedbackRow, isError ? styles.feedbackError : styles.feedbackSuccess]}>
      <Icon
        name={isError ? 'error-outline' : 'check-circle-outline'}
        color={isError ? COLORS.error : COLORS.green}
        size={18}
      />
      <Text style={[styles.feedbackText, { color: isError ? COLORS.error : COLORS.green }]}>
        {message}
      </Text>
    </View>
  )
}

export const LanguageSection = ({ language, changeLanguage }) => (
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
        {language === 'tr' ? <Icon name="check-circle" color={COLORS.accent} size={18} /> : null}
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
        {language === 'en' ? <Icon name="check-circle" color={COLORS.accent} size={18} /> : null}
      </TouchableOpacity>
    </View>
  </View>
)

export const AboutSection = ({ language }) => (
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
)
