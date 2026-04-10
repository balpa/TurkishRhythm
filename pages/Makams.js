import { View, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Icon } from 'react-native-elements'
import MakamCard from '../components/MakamCard'
import { MAKAMS } from '../data/data'
import { getMakamFavorites, toggleMakamFavorite } from '../src/shared/favoritesStorage'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { COLORS } from '../src/shared/theme/colors'

const RETRO_PALETTE = [
  '#B5364E', '#2D8B84', '#CC7A3A', '#8B5E3C', '#C4566A',
  '#3A7D6E', '#B8872B', '#6B4C8A', '#C15540', '#2E6B7E',
  '#9B6B2F', '#7A4460', '#3D8A5C', '#A04B3A', '#5B6E8A',
  '#8E6B3E', '#6A5B8A', '#2E7D5B', '#A0604B', '#4B7A8A',
  '#8A4B6A', '#5C8A3D', '#7E6B2E', '#4A6B8E', '#8A3A5C',
  '#3A8A6E', '#8E5B3A', '#5B4A8A',
]

const makamList = [
  { key: 'hicaz', img: require("../assets/makams/hicaz.jpg") },
  { key: 'nihavend', img: require("../assets/makams/nihavend.jpg") },
  { key: 'ussak', img: require("../assets/makams/ussak.jpg") },
  { key: 'kurdi', img: require("../assets/makams/kurdi.jpg") },
  { key: 'rast', img: require("../assets/makams/rast.jpg") },
  { key: 'karcigar', img: require("../assets/makams/karcigar.jpg") },
  { key: 'kurdilihicazkar', img: require("../assets/makams/kurdilihicazkar.jpg") },
  { key: 'segah', img: require("../assets/makams/segah.jpg") },
  { key: 'huzzam', img: require("../assets/makams/huzzam.jpg") },
  { key: 'huseyni', img: require("../assets/makams/huseyni.jpg") },
  { key: 'sehnaz', img: require("../assets/makams/sehnaz.jpg") },
  { key: 'evic', img: require("../assets/makams/evic.jpg") },
  { key: 'cargah', img: require("../assets/makams/cargah.jpg") },
  { key: 'buselik', img: require("../assets/makams/buselik.jpg") },
  { key: 'beyati', img: require("../assets/makams/beyati.jpg") },
  { key: 'muhayyer', img: require("../assets/makams/muhayyer.jpg") },
  { key: 'saba', img: null },
  { key: 'suzinak', img: null },
  { key: 'mahur', img: null },
  { key: 'acemasiran', img: null },
  { key: 'sultaniyegah', img: null },
  { key: 'tahir', img: null },
  { key: 'ferahnak', img: null },
  { key: 'nikriz', img: null },
  { key: 'hicazkar', img: null },
  { key: 'isfahan', img: null },
  { key: 'bestenigar', img: null },
  { key: 'acemkurdi', img: null },
]

const Makams = () => {
  const { language } = useLanguage()
  const [search, setSearch] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    getMakamFavorites().then(setFavorites)
  }, [])

  const colorsByKey = useMemo(() => {
    const shuffled = [...RETRO_PALETTE].sort(() => Math.random() - 0.5)
    return makamList.reduce((acc, item, index) => {
      acc[item.key] = shuffled[index % shuffled.length]
      return acc
    }, {})
  }, [])

  const filtered = useMemo(() => {
    let list = makamList
    if (showFavoritesOnly) {
      list = list.filter(m => favorites.includes(m.key))
    }
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(m =>
      MAKAMS[m.key].makamName.toLowerCase().includes(q)
    )
  }, [search, showFavoritesOnly, favorites])

  const handleToggleFavorite = useCallback(async (key) => {
    const updated = await toggleMakamFavorite(key)
    setFavorites(updated)
  }, [])

  const renderItem = useCallback(({ item }) => (
    <MakamCard
      makamName={MAKAMS[item.key].makamName}
      makamInfo={MAKAMS[item.key].info}
      imageURI={item.img}
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
          placeholder={t(language, 'search.makams')}
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

export default Makams

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg,
    flex: 1,
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
