import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, TextInput } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { Icon } from 'react-native-elements'
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location'
import { CommonActions } from '@react-navigation/native'
import { useLanguage } from '../../../../i18n/LanguageContext'
import { t } from '../../../../i18n/translations'
import { COLORS } from '../../../shared/theme/colors'

const DEFAULT_REGION = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

const formatPickedLocation = (places, coords) => {
  const place = places?.[0]
  if (!place) {
    return `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
  }

  return [
    place.name,
    place.street,
    place.district,
    place.city,
  ].filter(Boolean).join(', ')
}

const PickLocationScreen = ({ route, navigation }) => {
  const { language } = useLanguage()
  const initialLocation = route.params?.initialLocation
  const mapRef = useRef(null)
  const [selectedCoords, setSelectedCoords] = useState(initialLocation || {
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  })
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState('')

  const initialRegion = useMemo(() => ({
    latitude: initialLocation?.latitude ?? DEFAULT_REGION.latitude,
    longitude: initialLocation?.longitude ?? DEFAULT_REGION.longitude,
    latitudeDelta: initialLocation ? 0.015 : DEFAULT_REGION.latitudeDelta,
    longitudeDelta: initialLocation ? 0.015 : DEFAULT_REGION.longitudeDelta,
  }), [initialLocation])

  const handleConfirm = async () => {
    if (!selectedCoords) {
      navigation.goBack()
      return
    }

    setSaving(true)

    let label

    try {
      const places = await Location.reverseGeocodeAsync(selectedCoords)
      label = formatPickedLocation(places, selectedCoords)
    } catch {
      label = formatPickedLocation([], selectedCoords)
    }

    const state = navigation.getState()
    const previousRoute = state.routes[state.routes.length - 2]

    if (previousRoute?.key) {
      navigation.dispatch({
        ...CommonActions.setParams({
          pickedLocation: {
            label,
            latitude: selectedCoords.latitude,
            longitude: selectedCoords.longitude,
          },
        }),
        source: previousRoute.key,
      })
    }

    navigation.goBack()
  }

  const handleSearch = async () => {
    const query = search.trim()
    if (!query) return

    setSearching(true)
    setMessage('')

    try {
      const results = await Location.geocodeAsync(query)
      const firstResult = results?.[0]

      if (!firstResult) {
        setMessage(t(language, 'rehearsal.noMapResults'))
        setSearching(false)
        return
      }

      const nextCoords = {
        latitude: firstResult.latitude,
        longitude: firstResult.longitude,
      }

      setSelectedCoords(nextCoords)
      mapRef.current?.animateToRegion({
        ...nextCoords,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 350)
    } catch {
      setMessage(t(language, 'rehearsal.mapSearchError'))
    } finally {
      setSearching(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="close" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t(language, 'rehearsal.pickLocation')}</Text>
        <TouchableOpacity style={styles.confirmButton} activeOpacity={0.7} onPress={handleConfirm} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmText}>{t(language, 'rehearsal.usePinnedLocation')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" color={COLORS.textDim} size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder={t(language, 'rehearsal.searchLocationPlaceholder')}
          placeholderTextColor={COLORS.textDim}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7} onPress={handleSearch} disabled={searching}>
          {searching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>{t(language, 'rehearsal.search')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {message ? <Text style={styles.messageText}>{message}</Text> : null}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={(event) => setSelectedCoords(event.nativeEvent.coordinate)}
      >
        {selectedCoords && <Marker coordinate={selectedCoords} />}
      </MapView>

      <View style={styles.hintCard}>
        <Icon name="touch-app" color={COLORS.accent} size={18} />
        <Text style={styles.hintText}>{t(language, 'rehearsal.mapHint')}</Text>
      </View>
    </SafeAreaView>
  )
}

export default PickLocationScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: COLORS.bg,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  confirmButton: {
    minWidth: 88,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
  },
  searchInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchButton: {
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  messageText: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    color: '#FB923C',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: COLORS.bg,
  },
  map: {
    flex: 1,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  hintText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
})
