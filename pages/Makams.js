import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Icon } from 'react-native-elements'
import MakamCard from '../components/MakamCard'
import { MAKAMS } from '../data/data'

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
  const colors = useRef([...RETRO_PALETTE])
  const [search, setSearch] = useState('')

  useEffect(() => {
    colors.current = [...RETRO_PALETTE].sort(() => Math.random() - 0.5)
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return makamList
    const q = search.toLowerCase()
    return makamList.filter(m =>
      MAKAMS[m.key].makamName.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" color="#9090B0" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Makam ara..."
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {filtered.map((m, i) => (
          <MakamCard
            key={m.key}
            makamName={MAKAMS[m.key].makamName}
            makamInfo={MAKAMS[m.key].info}
            imageURI={m.img}
            color={colors.current[i % colors.current.length]}
          />
        ))}
      </ScrollView>
    </View>
  )
}

export default Makams

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1B1B2F',
    width: '100%',
    height: '100%',
    paddingTop: 10,
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
