import { View, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useState, useMemo, useCallback } from 'react'
import { Icon } from 'react-native-elements'
import RhythmCard from '../components/RhythmCard'
import { RHYTHMS } from '../data/data'

const RETRO_PALETTE = [
  '#B5364E', '#2D8B84', '#CC7A3A', '#6B4C8A', '#3A7D6E',
  '#B8872B', '#C15540', '#2E6B7E', '#8B5E3C', '#7A4460',
  '#5B6E8A', '#A04B3A', '#3D8A5C', '#8E6B3E', '#4B7A8A',
  '#6A5B8A', '#7E6B2E', '#8A3A5C', '#2E7D5B', '#5C8A3D',
  '#8A4B6A', '#4A6B8E',
]

const rhythmList = [
  { key: 'nimsofyan', name: 'Nim Sofyan', time: '2/4', img: require("../assets/nimsofyan.png") },
  { key: 'semai', name: 'Semai', time: '3/4', img: require("../assets/semai.png") },
  { key: 'sofyan', name: 'Sofyan', time: '4/4', img: require("../assets/sofyan.png") },
  { key: 'turkaksagi', name: 'Türk Aksağı', time: '5/4', img: require("../assets/turkaksagi.png") },
  { key: 'fer', name: 'Fer', time: '5/8', img: null },
  { key: 'yuruksemai', name: 'Yürük Semai', time: '6/8', img: require("../assets/yuruksemai.png") },
  { key: 'senginsemai', name: 'Sengin Semai', time: '6/4', img: null },
  { key: 'devrihindi', name: 'Devr-i Hindi', time: '7/8', img: require("../assets/devrihindi.png") },
  { key: 'duyek', name: 'Düyek', time: '8/8', img: require("../assets/duyek.png") },
  { key: 'musemmen', name: 'Müsemmen', time: '8/8', img: require("../assets/musemmen.png") },
  { key: 'agirduyek', name: 'Ağır Düyek', time: '8/4', img: null },
  { key: 'aksak', name: 'Aksak', time: '9/4', img: require("../assets/aksak.png") },
  { key: 'raksaksagi', name: 'Raks Aksağı', time: '9/8', img: require("../assets/raksaksagi.png") },
  { key: 'evfer', name: 'Evfer', time: '9/4', img: null },
  { key: 'agiraksak', name: 'Ağır Aksak', time: '9/2', img: null },
  { key: 'curcuna', name: 'Curcuna', time: '10/8', img: require("../assets/curcuna.png") },
  { key: 'agiraksaksemaisi', name: 'Ağır Aksak Semai', time: '10/2', img: null },
  { key: 'frenkcin', name: 'Frenkçin', time: '14/8', img: null },
  { key: 'cifteduyek', name: 'Çifte Düyek', time: '16/8', img: null },
  { key: 'berefsan', name: 'Berefşan', time: '16/4', img: null },
  { key: 'cenber', name: 'Çenber', time: '24/4', img: null },
  { key: 'devrikebir', name: 'Devr-i Kebir', time: '28/4', img: null },
]

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
      imageURI={item.img}
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
