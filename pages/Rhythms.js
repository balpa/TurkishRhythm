import { View, Text, ScrollView, ColorPropType } from 'react-native'
import React, { useState, useEffect } from 'react'
import RhythmCard from '../components/RhythmCard'

export default function Rhythms() {

  const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E"]
  const COLOR_PALETTE_2 = ["7C3E66", "F2EBE9", "A5BECC", "243A73"]

  const [rhythms, setRhytms] = useState([])



  return (
    <View style={{ width: "100%", height:'100%' }}>
      <ScrollView contentContainerStyle={{flexGrow:1 }}>
        <RhythmCard rhythmName={'Nim Sofyan'} rhythmTime={"2/4"} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]} />
        <RhythmCard rhythmName={'Semai'} rhythmTime={'3/4'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Sofyan'} rhythmTime={'4/8'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Türk Aksağı'} rhythmTime={'5/4'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Yürük Semai'} rhythmTime={'6/4'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Devr-i Hindi'} rhythmTime={'7/8'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Düyek'} rhythmTime={'8/8'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Müsemmen'} rhythmTime={'8/8'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Aksak'} rhythmTime={'9/4'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Raks Aksağı'} rhythmTime={'9/8'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
        <RhythmCard rhythmName={'Curcuna'} rhythmTime={'10/16'} color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}/>
      </ScrollView>
    </View>
  )
}