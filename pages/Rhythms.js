import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import RhythmCard from '../components/RhythmCard'
import { RHYTHMS } from '../data/data'
import * as Font from 'expo-font'

const Rhythms = ({ theme, language }) => {

  const COLOR_PALETTE_2 = ["7C3E66", "F2EBE9", "A5BECC", "243A73"]

  const fontSizeAnim = useRef(new Animated.Value(20)).current

  let fonts = {
    'customFont': require('../assets/fonts/Mom.ttf')
  }

  const COLOR_PALETTE_1 = useRef([])
  const [rhythms, setRhytms] = useState([])
  const [isFontLoaded, setIsFontLoaded] = useState(false)

  useEffect(() => {
    if (isFontLoaded) {
      Animated.timing(fontSizeAnim, {
        toValue: 14,
        duration: 5000,
        useNativeDriver: false
      }).start()
    }
  }, [isFontLoaded])

  useEffect(() => { // load font
    async function loadFont() {
      await Font.loadAsync(fonts).then(() => setIsFontLoaded(true))
    }
    loadFont()
  }, [])

  useEffect(() => { // random color
    COLOR_PALETTE_1.current = [
      "FEF9A7", "FAC213",
      "F77E21", "D61C4E",
      "990000", "FF5B00",
      "D4D925", "FFEE63"].sort(() => Math.random() - 0.5)
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.ritimTextContainer}>
          {isFontLoaded &&
            <Animated.Text
              style={[
                styles.ritimText,
                { fontSize: fontSizeAnim },
                { fontFamily: 'customFont' }]
              }>
              RITIMLER
            </Animated.Text>}
        </View>
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.nimsofyan}
          rhythmName={'Nim Sofyan'}
          imageURI={require("../assets/nimsofyan.png")}
          rhythmTime={"2/4"}
          color={COLOR_PALETTE_1.current[0]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.semai}
          rhythmName={'Semai'}
          imageURI={require("../assets/semai.png")}
          rhythmTime={'3/4'}
          color={COLOR_PALETTE_1.current[1]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.sofyan}
          rhythmName={'Sofyan'}
          imageURI={require("../assets/sofyan.png")}
          rhythmTime={'4/8'}
          color={COLOR_PALETTE_1.current[2]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.turkaksagi}
          rhythmName={'Türk Aksağı'}
          imageURI={require("../assets/turkaksagi.png")}
          rhythmTime={'5/4'}
          color={COLOR_PALETTE_1.current[3]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.yuruksemai}
          rhythmName={'Yürük Semai'}
          imageURI={require("../assets/yuruksemai.png")}
          rhythmTime={'6/4'}
          color={COLOR_PALETTE_1.current[4]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.devrihindi}
          rhythmName={'Devr-i Hindi'}
          imageURI={require("../assets/devrihindi.png")}
          rhythmTime={'7/8'}
          color={COLOR_PALETTE_1.current[5]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.duyek}
          rhythmName={'Düyek'}
          imageURI={require("../assets/duyek.png")}
          rhythmTime={'8/8'}
          color={COLOR_PALETTE_1.current[6]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.musemmen}
          rhythmName={'Müsemmen'}
          imageURI={require("../assets/musemmen.png")}
          rhythmTime={'8/8'}
          color={COLOR_PALETTE_1.current[7]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.aksak}
          rhythmName={'Aksak'}
          imageURI={require("../assets/aksak.png")}
          rhythmTime={'9/4'}
          color={COLOR_PALETTE_1.current[0]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.raksaksagi}
          rhythmName={'Raks Aksağı'}
          imageURI={require("../assets/raksaksagi.png")}
          rhythmTime={'9/8'}
          color={COLOR_PALETTE_1.current[1]} />
        <RhythmCard
          theme={theme}
          infoText={RHYTHMS.curcuna}
          rhythmName={'Curcuna'}
          imageURI={require("../assets/curcuna.png")}
          rhythmTime={'10/16'}
          color={COLOR_PALETTE_1.current[2]} />
      </ScrollView>
    </View>
  )
}

export default Rhythms

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0DBDB'
  },
  ritimTextContainer: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ritimText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 20,
  }
})