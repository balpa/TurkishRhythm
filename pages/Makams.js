import { View, Text, Animated, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import MakamCard from '../components/MakamCard'


const Makams = ({language, theme}) => {
  const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]
  const MAKAM_INFOS = {
    Hicaz: `Hicaz makamı bla bla...`,
    Nihavend: `Nihavend info`,
    Huzzam: `huzzam info`,
    Segah: `segah info`
  }
  return (
    <View style={[styles.container, {backgroundColor:theme == 'Dark' ? '#2c1a31' : 'white'}]}>
      <ScrollView contentContainerStyle={{flexGrow:1 }}>
        <MakamCard 
          makamName={'Hicaz'}
          makamInfo={MAKAM_INFOS.Hicaz}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />
          <MakamCard 
          makamName={'Nihavend'}
          makamInfo={MAKAM_INFOS.Nihavend}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />
          <MakamCard 
          makamName={'Hüzzam'}
          makamInfo={MAKAM_INFOS.Huzzam}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />
          <MakamCard 
          makamName={'Segah'}
          makamInfo={MAKAM_INFOS.Segah}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />

      </ScrollView>
    </View>
  )
}

export default Makams

const styles = StyleSheet.create({
  container:{
    width:'100%',
    height:'100%',
  },
  optionLabel:{
    width:'90%',
    height: 40,
    backgroundColor:'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  }

})