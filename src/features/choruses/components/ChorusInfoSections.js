import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { Icon } from 'react-native-elements'
import styles from '../chorusInfoStyles'
import { COLORS } from '../chorusesShared'

export const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Icon name={icon} color={COLORS.accent} size={20} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
)

export const EditField = ({ icon, label, value, onChangeText, placeholder, keyboardType, multiline }) => (
  <View style={styles.editField}>
    <View style={styles.editFieldHeader}>
      <Icon name={icon} color={COLORS.accent} size={18} />
      <Text style={styles.editFieldLabel}>{label}</Text>
    </View>
    <TextInput
      style={[styles.editInput, multiline && styles.editInputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textDim}
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
)
