import { View, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useRef } from 'react'
import MakamCard from '../components/MakamCard'
import { MAKAMS } from '../data/data'

// retro american sign palette — warm, saturated, vintage feel
const RETRO_PALETTE = [
  '#B5364E', // cherry red
  '#2D8B84', // vintage teal
  '#CC7A3A', // burnt orange
  '#8B5E3C', // saddle brown
  '#C4566A', // dusty rose
  '#3A7D6E', // seafoam
  '#B8872B', // antique gold
  '#6B4C8A', // deep plum
  '#C15540', // terracotta
  '#2E6B7E', // slate teal
  '#9B6B2F', // bourbon
  '#7A4460', // wine
  '#3D8A5C', // forest sage
  '#A04B3A', // rust
  '#5B6E8A', // steel blue
  '#8E6B3E', // caramel
]

const Makams = () => {
  const colors = useRef([...RETRO_PALETTE])

  useEffect(() => {
    colors.current = [...RETRO_PALETTE].sort(() => Math.random() - 0.5)
  }, [])

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
  ]

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {makamList.map((m, i) => (
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
})
