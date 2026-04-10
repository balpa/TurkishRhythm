import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import { useIsFocused } from '@react-navigation/native'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { COLORS } from '../src/shared/theme/colors'
import { getMakamFavorites, toggleMakamFavorite } from '../src/shared/favoritesStorage'
import { getRhythmFavorites, toggleRhythmFavorite } from '../src/shared/favoritesStorage'
import { MAKAMS, RHYTHMS, RHYTHM_LIBRARY_BY_KEY } from '../data/data'
import MakamCard from '../components/MakamCard'
import RhythmCard from '../components/RhythmCard'

const MAKAM_IMAGES = {
  hicaz: require("../assets/makams/hicaz.jpg"),
  nihavend: require("../assets/makams/nihavend.jpg"),
  ussak: require("../assets/makams/ussak.jpg"),
  kurdi: require("../assets/makams/kurdi.jpg"),
  rast: require("../assets/makams/rast.jpg"),
  karcigar: require("../assets/makams/karcigar.jpg"),
  kurdilihicazkar: require("../assets/makams/kurdilihicazkar.jpg"),
  segah: require("../assets/makams/segah.jpg"),
  huzzam: require("../assets/makams/huzzam.jpg"),
  huseyni: require("../assets/makams/huseyni.jpg"),
  sehnaz: require("../assets/makams/sehnaz.jpg"),
  evic: require("../assets/makams/evic.jpg"),
  cargah: require("../assets/makams/cargah.jpg"),
  buselik: require("../assets/makams/buselik.jpg"),
  beyati: require("../assets/makams/beyati.jpg"),
  muhayyer: require("../assets/makams/muhayyer.jpg"),
}

const CARD_COLORS = [
  '#B5364E', '#2D8B84', '#CC7A3A', '#6B4C8A', '#3A7D6E',
  '#B8872B', '#C15540', '#2E6B7E', '#8B5E3C', '#7A4460',
]

const Notes = () => {
  const { language } = useLanguage()
  const isFocused = useIsFocused()
  const [makamFavorites, setMakamFavorites] = useState([])
  const [rhythmFavorites, setRhythmFavorites] = useState([])

  const loadFavorites = useCallback(async () => {
    const [makams, rhythms] = await Promise.all([getMakamFavorites(), getRhythmFavorites()])
    setMakamFavorites(makams)
    setRhythmFavorites(rhythms)
  }, [])

  useEffect(() => {
    if (isFocused) loadFavorites()
  }, [isFocused, loadFavorites])

  const handleToggleMakam = async (key) => {
    const updated = await toggleMakamFavorite(key)
    setMakamFavorites(updated)
  }

  const handleToggleRhythm = async (key) => {
    const updated = await toggleRhythmFavorite(key)
    setRhythmFavorites(updated)
  }

  const isEmpty = makamFavorites.length === 0 && rhythmFavorites.length === 0

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="star-border" color={COLORS.border} size={56} />
          <Text style={styles.emptyTitle}>{t(language, 'notes.emptyFavorites')}</Text>
          <Text style={styles.emptySubtitle}>{t(language, 'notes.emptyFavoritesDesc')}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t(language, 'notes.title')}</Text>
        <Text style={styles.pageSubtitle}>{t(language, 'notes.subtitle')}</Text>

        {makamFavorites.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t(language, 'notes.makams')} ({makamFavorites.length})</Text>
            {makamFavorites.map((key, index) => {
              const makam = MAKAMS[key]
              if (!makam) return null
              return (
                <MakamCard
                  key={key}
                  makamName={makam.makamName}
                  makamInfo={makam.info}
                  imageURI={MAKAM_IMAGES[key] || null}
                  color={CARD_COLORS[index % CARD_COLORS.length]}
                  isFavorite={true}
                  onToggleFavorite={() => handleToggleMakam(key)}
                />
              )
            })}
          </>
        )}

        {rhythmFavorites.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t(language, 'notes.rhythms')} ({rhythmFavorites.length})</Text>
            {rhythmFavorites.map((key, index) => {
              const rhythm = RHYTHM_LIBRARY_BY_KEY[key]
              if (!rhythm) return null
              return (
                <RhythmCard
                  key={key}
                  rhythmName={rhythm.name}
                  rhythmTime={rhythm.time}
                  imageURI={rhythm.image}
                  infoText={RHYTHMS[key]}
                  color={CARD_COLORS[(index + 3) % CARD_COLORS.length]}
                  isFavorite={true}
                  onToggleFavorite={() => handleToggleRhythm(key)}
                />
              )
            })}
          </>
        )}
      </ScrollView>
    </View>
  )
}

export default Notes

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 20,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textDim,
    marginLeft: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDim,
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 22,
  },
})
