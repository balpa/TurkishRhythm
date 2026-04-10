import { View, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Icon } from 'react-native-elements'
import RhythmCard from '../components/RhythmCard'
import { RHYTHMS, RHYTHM_LIBRARY } from '../data/data'
import { getRhythmFavorites, toggleRhythmFavorite } from '../src/shared/favoritesStorage'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { COLORS } from '../src/shared/theme/colors'

const RETRO_PALETTE = [
  '#B5364E', '#2D8B84', '#CC7A3A', '#6B4C8A', '#3A7D6E',
  '#B8872B', '#C15540', '#2E6B7E', '#8B5E3C', '#7A4460',
  '#5B6E8A', '#A04B3A', '#3D8A5C', '#8E6B3E', '#4B7A8A',
  '#6A5B8A', '#7E6B2E', '#8A3A5C', '#2E7D5B', '#5C8A3D',
  '#8A4B6A', '#4A6B8E',
]

const rhythmList = RHYTHM_LIBRARY

const Rhythms = () => {
  const { language } = useLanguage()
  const [search, setSearch] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    getRhythmFavorites().then(setFavorites)
  }, [])

  const colorsByKey = useMemo(() => {
    const shuffled = [...RETRO_PALETTE].sort(() => Math.random() - 0.5)
    return rhythmList.reduce((acc, item, index) => {
      acc[item.key] = shuffled[index % shuffled.length]
      return acc
    }, {})
  }, [])

  const filtered = useMemo(() => {
    let list = rhythmList
    if (showFavoritesOnly) {
      list = list.filter(r => favorites.includes(r.key))
    }
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(r =>
      r.name.toLowerCase().includes(q) || r.time.includes(q)
    )
  }, [search, showFavoritesOnly, favorites])

  const handleToggleFavorite = useCallback(async (key) => {
    const updated = await toggleRhythmFavorite(key)
    setFavorites(updated)
  }, [])

  const renderItem = useCallback(({ item }) => (
    <RhythmCard
      infoText={RHYTHMS[item.key]}
      rhythmName={item.name}
      imageURI={item.image}
      rhythmTime={item.time}
      color={colorsByKey[item.key]}
      isFavorite={favorites.includes(item.key)}
      onToggleFavorite={() => handleToggleFavorite(item.key)}
    />
  ), [colorsByKey, favorites, handleToggleFavorite])

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" color={COLORS.textDim} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder={t(language, 'search.rhythms')}
          placeholderTextColor={COLORS.textDim}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Clear search" accessibilityRole="button">
            <Icon name="close" color={COLORS.textDim} size={20} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setShowFavoritesOnly(v => !v)} style={styles.favFilterButton} accessibilityLabel="Filter favorites" accessibilityRole="button">
          <Icon
            name={showFavoritesOnly ? 'star' : 'star-border'}
            color={showFavoritesOnly ? '#FFD700' : COLORS.textDim}
            size={22}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        extraData={favorites}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        windowSize={7}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
      />
    </View>
  )
}

export default Rhythms

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 12,
    marginLeft: 10,
  },
  favFilterButton: {
    marginLeft: 10,
    padding: 4,
  },
})
