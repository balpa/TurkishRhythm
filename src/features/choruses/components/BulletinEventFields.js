import React from 'react'
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native'
import { Icon } from 'react-native-elements'
import DateTimePicker from '@react-native-community/datetimepicker'
import { t } from '../../../../i18n/translations'
import styles from '../bulletinStyles'
import { COLORS } from '../chorusesShared'

const BulletinEventFields = ({ language, eventDate, formattedDate, formattedTime, eventLocation, isFree, eventPrice, showDatePicker, showTimePicker, setShowDatePicker, setShowTimePicker, onDateChange, onTimeChange, onChangeLocation, onToggleFree, onChangePrice }) => (
  <View style={styles.eventFields}>
    <TouchableOpacity style={styles.dateRow} activeOpacity={0.7} onPress={() => setShowDatePicker(true)}>
      <Icon name="calendar-today" color={COLORS.accent} size={20} />
      <View style={styles.dateInfo}><Text style={styles.dateLabel}>{t(language, 'bulletin.eventDate')}</Text><Text style={styles.dateValue}>{formattedDate}</Text></View>
      <Icon name="chevron-right" color={COLORS.textDim} size={20} />
    </TouchableOpacity>
    {showDatePicker ? <View style={styles.pickerContainer}><DateTimePicker value={eventDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} minimumDate={new Date()} themeVariant="dark" locale={language === 'tr' ? 'tr-TR' : 'en-US'} />{Platform.OS === 'ios' ? <TouchableOpacity style={styles.pickerDone} onPress={() => setShowDatePicker(false)}><Text style={styles.pickerDoneText}>{t(language, 'bulletin.done')}</Text></TouchableOpacity> : null}</View> : null}
    <TouchableOpacity style={styles.dateRow} activeOpacity={0.7} onPress={() => setShowTimePicker(true)}>
      <Icon name="schedule" color={COLORS.accent} size={20} />
      <View style={styles.dateInfo}><Text style={styles.dateLabel}>{t(language, 'bulletin.eventTime')}</Text><Text style={styles.dateValue}>{formattedTime}</Text></View>
      <Icon name="chevron-right" color={COLORS.textDim} size={20} />
    </TouchableOpacity>
    {showTimePicker ? <View style={styles.pickerContainer}><DateTimePicker value={eventDate} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onTimeChange} themeVariant="dark" locale={language === 'tr' ? 'tr-TR' : 'en-US'} />{Platform.OS === 'ios' ? <TouchableOpacity style={styles.pickerDone} onPress={() => setShowTimePicker(false)}><Text style={styles.pickerDoneText}>{t(language, 'bulletin.done')}</Text></TouchableOpacity> : null}</View> : null}
    <View style={styles.locationRow}><Icon name="location-on" color={COLORS.accent} size={20} style={{ marginTop: 14 }} /><TextInput style={styles.locationInput} placeholder={t(language, 'bulletin.eventLocationPlaceholder')} placeholderTextColor={COLORS.textDim} value={eventLocation} onChangeText={onChangeLocation} /></View>
    <View style={styles.priceRow}>
      <Icon name="confirmation-number" color={COLORS.accent} size={20} />
      <Text style={styles.priceLabel}>{t(language, 'bulletin.eventPrice')}</Text>
      <View style={styles.priceRight}>
        <TouchableOpacity style={[styles.freeCheckbox, isFree && styles.freeCheckboxActive]} activeOpacity={0.7} onPress={onToggleFree}>{isFree ? <Icon name="check" color={COLORS.white} size={14} /> : null}</TouchableOpacity>
        <Text style={[styles.freeLabel, isFree && styles.freeLabelActive]}>{t(language, 'bulletin.free')}</Text>
        {!isFree ? <TextInput style={styles.priceInput} placeholder="0" placeholderTextColor={COLORS.textDim} value={eventPrice} onChangeText={onChangePrice} keyboardType="numeric" /> : null}
      </View>
    </View>
  </View>
)

export default BulletinEventFields
