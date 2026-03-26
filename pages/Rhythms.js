import { View, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useState, useMemo, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import RhythmCard from '../components/RhythmCard'
import { RHYTHMS, RHYTHM_LIBRARY } from '../data/data'

const RETRO_PALETTE = [
  '#B5364E', '#2D8B84', '#CC7A3A', '#6B4C8A', '#3A7D6E',
  '#B8872B', '#C15540', '#2E6B7E', '#8B5E3C', '#7A4460',
  '#5B6E8A', '#A04B3A', '#3D8A5C', '#8E6B3E', '#4B7A8A',
  '#6A5B8A', '#7E6B2E', '#8A3A5C', '#2E7D5B', '#5C8A3D',
  '#8A4B6A', '#4A6B8E',
]

const rhythmList = RHYTHM_LIBRARY

const Rhythms = () => {
  const [search, setSearch] = useState('')
  const colorsByKey = useMemo(() => {
    const shuffled = [...RETRO_PALETTE].sort(() => Math.random() - 0.5)
    return rhythmList.reduce((acc, item, index) => {
      acc[item.key] = shuffled[index % shuffled.length]
      return acc
    }, {})
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return rhythmList
    const q = search.toLowerCase()
    return rhythmList.filter(r =>
      r.name.toLowerCase().includes(q) || r.time.includes(q)
    )
  }, [search])

  const renderItem = useCallback(({ item }) => (
    <RhythmCard
      infoText={RHYTHMS[item.key]}
      rhythmName={item.name}
      imageURI={item.image}
      rhythmTime={item.time}
      color={colorsByKey[item.key]}
    />
  ), [colorsByKey])

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" color="#9090B0" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Usul ara..."
          placeholderTextColor="#9090B0"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" color="#9090B0" size={20} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
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
    backgroundColor: '#1B1B2F',
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262640',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#3A3A5C',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#F0E6D3',
    paddingVertical: 12,
    marginLeft: 10,
  },
})
