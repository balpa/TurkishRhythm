import { View, Text, ScrollView, ColorPropType } from 'react-native'
import React, { useState, useEffect } from 'react'
import RhythmCard from '../components/RhythmCard'

export default function Rhythms() {

  const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E"]
  const COLOR_PALETTE_2 = ["7C3E66", "F2EBE9", "A5BECC", "243A73"]

  const INFO_TEXTS = {
    nimsofyan: `
      İki zamanlıdır.
      2/4 lük ve 2/8 lik değerlerde vurulur.
      DÜM 1 zamanlı – kuvvetli
      TEK 1 zamanlı – yarı (orta) kuvvetlidir.
    `,
    semai: `
      Üç zamanlıdır.
      3/4 lük ve 3/8 lik değerlerde vurulur.
      DÜM 1 zamanlı – kuvvetli
      TEK 1 zamanlı – yarı kuvvetli
      TEK 1 zamanlı – zayıftır.
    `,
    sofyan: `
      Dört zamanlıdır.
      İki Nim Sofyan’ın birleşmesinden meydana gelir.
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE 1 zamanlı – yarı kuvvetli
      KE 1 zamanlı – zayıftır.
      4/8, 4/4,4/2 lik değerlerde vurulur.
    `,
    turkaksagi: `
      Beş zamanlıdır.
      Bir Nim Sofyan ve bir Semai’nin birleşmesiyle meydana gelir.
      DÜ- ÜM 2 zamanlı – kuvvetli
      TE- EK 2 zamanlı – yarı kuvvetli
      TEK 1 zamanlı – zayıftır.
      5/8 ve 5/4 lük değerlerde vurulur.
    `,
    yuruksemai:`
      Altı zamanlıdır.
      İki Semai veya üç Nim Sofyan’dan meydana gelmiştir.
      DÜM l zamanlı – kuvvetli
      TEK l zamanlı – yarı kuvvetli
      TEK l zamanlı – zayıf
      DÜM l zamanlı – zayıf
      TE-EK 2 zamanlı – yan kuvvetlidir
      6/8, 6/4 ve 6/2 lik değerlerde vurulur.
      6/4 Sengin Semai, 6/2 Ağır Sengin Semai olur.
    `,
    devrihindi:`
      Yedi zamanlıdır.
      Bir Semai ve bir Sofyan’dan meydana gelir. (Bazen bir Semai ve iki Nim Sofyan vurulur.)
      DÜM 2 zamanlı – kuvvetli
      TEK l zamanlı – yarı kuvvetli
      TEK l zamanlı – zayıf
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE – EK 2 zamanlı – zayıftır.
      7/8 ve 7/4 lük değerlerde vurulur.
    `,
    duyek:`
      Sekiz zamanlıdır. îki Sofyan’dan meydana gelir.
      DÜM l zamanlı – yarı kuvvetli
      TE-EK 2 zamanlı – kuvvetli
      TEK l zamanlı – yarı kuvvetli
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE-EK 2 zamanlı – zayıftır.
      8/8 ve 8/4 lük vurulur. 8/4 Ağır Düyek adını alır.
    `,
    musemmen:`
      Sekiz zamanlıdır.
      Eskiden bu usüle Katikofti de denilmiştir.
      Bir Semai, bir Nim Sofyan ve yine bir Semai’den meydana gelir.
      DÜ-Ü-ÜM 3 zamanlı – kuvvetli
      TE-EK 2 zamanlı – zayıf
      TE-E-EK 3 zamanlı – yarı kuvvetlidir.
      8/8 lik değerde vurulur.
    `,
    aksak:`
      Dokuz zamanlıdır. Bir Sofyan ve bir Türk Aksağından oluşur.
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE 1 zamanlı – yarı kuvvetli
      KE 1 zamanlı – zayıf
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE-EK 2 zamanlı – yarı kuvvetli
      TEK 1 zamanlı – zayıftır.
    `,
    raksaksagi: `
      Dokuz zamanlıdır.
      Bir Türk Aksağı ve bir Sofyan’dan 
      meydana gelir.
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE-E-EK 3 zamanlı – yarı kuvvetli
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE-EK 2 zamanlı – zayıftır.
      9/8 lik değerde vurulur.
    `,
    curcuna: `
      On zamanlıdır. İki Türk Aksağından meydana gelir.
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE 1 zamanlı -zayıf
      KA-A 2 zamanlı – yarı kuvvetli
      DÜ-ÜM 2 zamanlı – kuvvetli
      TE-EK 2 zamanlı – yarı kuvvetli
      TEK 1 zamanlı – zayıftır.
    `  


  }

  const [rhythms, setRhytms] = useState([])

  return (
    <View style={{ width: "100%", height:'100%' }}>
      <ScrollView contentContainerStyle={{flexGrow:1 }}>
        <RhythmCard 
          infoText={INFO_TEXTS.nimsofyan}
          rhythmName={'Nim Sofyan'} 
          imageURI={require("../assets/nimsofyan.png")} 
          rhythmTime={"2/4"} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]} />
        <RhythmCard 
          infoText={INFO_TEXTS.semai}
          rhythmName={'Semai'}
          imageURI={require("../assets/semai.png")} 
          rhythmTime={'3/4'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.sofyan} 
          rhythmName={'Sofyan'} 
          imageURI={require("../assets/sofyan.png")} 
          rhythmTime={'4/8'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.turkaksagi} 
          rhythmName={'Türk Aksağı'} 
          imageURI={require("../assets/turkaksagi.png")} 
          rhythmTime={'5/4'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.yuruksemai} 
          rhythmName={'Yürük Semai'} 
          imageURI={require("../assets/yuruksemai.png")} 
          rhythmTime={'6/4'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.devrihindi} 
          rhythmName={'Devr-i Hindi'} 
          imageURI={require("../assets/devrihindi.png")} 
          rhythmTime={'7/8'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.duyek} 
          rhythmName={'Düyek'} 
          imageURI={require("../assets/duyek.png")} 
          rhythmTime={'8/8'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.musemmen} 
          rhythmName={'Müsemmen'} 
          imageURI={require("../assets/musemmen.png")} 
          rhythmTime={'8/8'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.aksak} 
          rhythmName={'Aksak'} 
          imageURI={require("../assets/aksak.png")} 
          rhythmTime={'9/4'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.raksaksagi} 
          rhythmName={'Raks Aksağı'} 
          imageURI={require("../assets/raksaksagi.png")} 
          rhythmTime={'9/8'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard 
          infoText={INFO_TEXTS.curcuna} 
          rhythmName={'Curcuna'} 
          imageURI={require("../assets/curcuna.png")} 
          rhythmTime={'10/16'} 
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
      </ScrollView>
    </View>
  )
}