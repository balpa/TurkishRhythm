import {View, Text, StyleSheet, ScrollView, Animated} from 'react-native'
import React, {useEffect, useRef, useState} from 'react'
import MakamCard from '../components/MakamCard'
import {MAKAMS} from '../data/data'
import * as Font from 'expo-font'


const Makams = ({language, theme}) => {

  const fontSizeAnim = useRef(new Animated.Value(20)).current

  const [isFontLoaded, setIsFontLoaded] = useState(false)
  const COLOR_PALETTE_1 = useRef([])

  useEffect(()=>{
    if (isFontLoaded){
      Animated.timing(fontSizeAnim, {
        toValue: 14,
        duration: 5000,
        useNativeDriver: false
      }).start()
    }
  },[isFontLoaded])

  let fonts = {
    'customFont': require('../assets/fonts/Mom.ttf') 
  }

  useEffect(async()=>{    // load font at first render
    await Font.loadAsync(fonts).then(()=> setIsFontLoaded(true))
  }, [])

  useEffect(()=> {        // create randomized color arr at 1st render
    COLOR_PALETTE_1.current = [
      "FEF9A7", "FAC213", 
      "F77E21", "D61C4E", 
      "990000", "FF5B00", 
      "D4D925", "FFEE63"].sort(() => Math.random() - 0.5)
  },[])


  // could refactor and render from a list via map etc (image linking wont work, need a sol)
  return (
    <View style={[styles.container, {backgroundColor:theme == 'Dark' ? '#2c1a31' : 'white'}]}>
      <View style={styles.makamTextContainer}>
        {isFontLoaded && <Animated.Text style={[
          styles.makamText, 
          {fontSize: fontSizeAnim},
          {fontFamily: 'customFont' }]}>
          MAKAMLAR
        </Animated.Text>}
      </View>
      <ScrollView contentContainerStyle={{flexGrow:1 }}>
        <MakamCard 
          makamName={MAKAMS.hicaz.makamName}
          makamInfo={MAKAMS.hicaz.info}
          imageURI={require("../assets/makams/hicaz.jpg")}
          color={COLOR_PALETTE_1.current[0]}
          />
        <MakamCard 
          makamName={MAKAMS.nihavend.makamName}
          makamInfo={MAKAMS.nihavend.info}
          imageURI={require("../assets/makams/nihavend.jpg")}
          color={COLOR_PALETTE_1.current[1]}
          />
        <MakamCard 
          makamName={MAKAMS.ussak.makamName}
          makamInfo={MAKAMS.ussak.info}
          imageURI={require("../assets/makams/ussak.jpg")}
          color={COLOR_PALETTE_1.current[2]}
          />
        <MakamCard 
          makamName={MAKAMS.kurdi.makamName}
          makamInfo={MAKAMS.kurdi.info}
          imageURI={require("../assets/makams/kurdi.jpg")}
          color={COLOR_PALETTE_1.current[3]}
          />
        <MakamCard 
          makamName={MAKAMS.rast.makamName}
          makamInfo={MAKAMS.rast.info}
          imageURI={require("../assets/makams/rast.jpg")}
          color={COLOR_PALETTE_1.current[4]}
          />
        <MakamCard 
          makamName={MAKAMS.karcigar.makamName}
          makamInfo={MAKAMS.karcigar.info}
          imageURI={require("../assets/makams/karcigar.jpg")}
          color={COLOR_PALETTE_1.current[5]}
          />
        <MakamCard 
          makamName={MAKAMS.kurdilihicazkar.makamName}
          makamInfo={MAKAMS.kurdilihicazkar.info}
          imageURI={require("../assets/makams/kurdilihicazkar.jpg")}
          color={COLOR_PALETTE_1.current[6]}
          />
        <MakamCard 
          makamName={MAKAMS.segah.makamName}
          makamInfo={MAKAMS.segah.info}
          imageURI={require("../assets/makams/segah.jpg")}
          color={COLOR_PALETTE_1.current[7]}
          />
        <MakamCard 
          makamName={MAKAMS.huzzam.makamName}
          makamInfo={MAKAMS.huzzam.info}
          imageURI={require("../assets/makams/huzzam.jpg")}
          color={COLOR_PALETTE_1.current[0]}
          />
        <MakamCard 
          makamName={MAKAMS.huseyni.makamName}
          makamInfo={MAKAMS.huseyni.info}
          imageURI={require("../assets/makams/huseyni.jpg")}
          color={COLOR_PALETTE_1.current[6]}            
          /> 
        <MakamCard 
          makamName={MAKAMS.sehnaz.makamName}
          makamInfo={MAKAMS.sehnaz.info}
          imageURI={require("../assets/makams/sehnaz.jpg")}
          color={COLOR_PALETTE_1.current[1]}
          />
        <MakamCard 
          makamName={MAKAMS.evic.makamName}
          makamInfo={MAKAMS.evic.info}
          imageURI={require("../assets/makams/evic.jpg")}
          color={COLOR_PALETTE_1.current[2]}
          />
        <MakamCard 
          makamName={MAKAMS.cargah.makamName}
          makamInfo={MAKAMS.cargah.info}
          imageURI={require("../assets/makams/cargah.jpg")}
          color={COLOR_PALETTE_1.current[3]}
          />
        <MakamCard 
          makamName={MAKAMS.buselik.makamName}
          makamInfo={MAKAMS.buselik.info}
          imageURI={require("../assets/makams/buselik.jpg")}
          color={COLOR_PALETTE_1.current[4]}
          />
        <MakamCard 
          makamName={MAKAMS.beyati.makamName}
          makamInfo={MAKAMS.beyati.info}
          imageURI={require("../assets/makams/beyati.jpg")}
          color={COLOR_PALETTE_1.current[5]}
          /> 
        <MakamCard 
          makamName={MAKAMS.muhayyer.makamName}
          makamInfo={MAKAMS.muhayyer.info}
          imageURI={require("../assets/makams/muhayyer.jpg")}
          color={COLOR_PALETTE_1.current[6]}
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
  },
  makamTextContainer: {
    width: '100%',
    height: 40,
    flexDirection:'row',
    alignItems: 'center',
    justifyContent:'center'
  },
  makamText: {
    textAlign:'center',
    color: 'wheat',
    letterSpacing: 2,
    fontSize: 20,
  }

})