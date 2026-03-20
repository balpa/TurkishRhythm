import { View, ScrollView, StyleSheet } from 'react-native'
import React, { useEffect, useRef } from 'react'
import RhythmCard from '../components/RhythmCard'
import { RHYTHMS } from '../data/data'

const RETRO_PALETTE = [
  '#B5364E', // cherry red
  '#2D8B84', // vintage teal
  '#CC7A3A', // burnt orange
  '#6B4C8A', // deep plum
  '#3A7D6E', // seafoam
  '#B8872B', // antique gold
  '#C15540', // terracotta
  '#2E6B7E', // slate teal
  '#8B5E3C', // saddle brown
  '#7A4460', // wine
  '#5B6E8A', // steel blue
]

const Rhythms = () => {
  const colors = useRef([...RETRO_PALETTE])

  useEffect(() => {
    colors.current = [...RETRO_PALETTE].sort(() => Math.random() - 0.5)
  }, [])

  const rhythmList = [
    { key: 'nimsofyan', name: 'Nim Sofyan', time: '2/4', img: require("../assets/nimsofyan.png") },
    { key: 'semai', name: 'Semai', time: '3/4', img: require("../assets/semai.png") },
    { key: 'sofyan', name: 'Sofyan', time: '4/4', img: require("../assets/sofyan.png") },
    { key: 'turkaksagi', name: 'Türk Aksağı', time: '5/4', img: require("../assets/turkaksagi.png") },
    { key: 'yuruksemai', name: 'Yürük Semai', time: '6/4', img: require("../assets/yuruksemai.png") },
    { key: 'devrihindi', name: 'Devr-i Hindi', time: '7/8', img: require("../assets/devrihindi.png") },
    { key: 'duyek', name: 'Düyek', time: '8/8', img: require("../assets/duyek.png") },
    { key: 'musemmen', name: 'Müsemmen', time: '8/8', img: require("../assets/musemmen.png") },
    { key: 'aksak', name: 'Aksak', time: '9/4', img: require("../assets/aksak.png") },
    { key: 'raksaksagi', name: 'Raks Aksağı', time: '9/8', img: require("../assets/raksaksagi.png") },
    { key: 'curcuna', name: 'Curcuna', time: '10/8', img: require("../assets/curcuna.png") },
  ]

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {rhythmList.map((r, i) => (
          <RhythmCard
            key={r.key}
            infoText={RHYTHMS[r.key]}
            rhythmName={r.name}
            imageURI={r.img}
            rhythmTime={r.time}
            color={colors.current[i % colors.current.length]}
          />
        ))}
      </ScrollView>
    </View>
  )
}

export default Rhythms

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1B1B2F',
    paddingTop: 10,
  },
})
