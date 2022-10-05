import { View, Text, StyleSheet, Image, Animated} from 'react-native'
import React, {useState, useEffect, useRef} from 'react'

const Intro = ({setShowIntroPage}) => {

  let scaleAnim = useRef(new Animated.Value(1)).current
  let zIndexAnim = useRef(new Animated.Value(0)).current

  useEffect(()=>{
    // setTimeout(()=>{    //z index animation for kinda debugging scrollview
    //   Animated.timing(zIndexAnim, {
    //     toValue: -5,
    //     duration: 50
    //   })
    // },2500)

    setTimeout(() => {    //zoom out animation for intro page
      Animated.spring(scaleAnim, {
          toValue: 0,
          friction: 8,
          tension: 30,
          useNativeDriver: false
      }).start();
    } , 2000)
    setTimeout(()=>{setShowIntroPage(false)},2500)
  },[])

  return (
    <Animated.View 
      style={[
        styles.container, 
        {transform: [{scale: scaleAnim}]},
        {zIndex: zIndexAnim}
        ]}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo/logo-low-res.png')} style={styles.logo}/>
      </View>
    </Animated.View>
  )
}

export default Intro

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    width: '100%',
    height: '100%',
    backgroundColor:'#2c1a31',
  },
  logoContainer: {
    position: 'absolute',
    width: '50%',
  },  
  logo: {
    height: undefined,
    width: 200,
    height: 200,
    alignSelf: 'center',
    aspectRatio: 1,
    borderRadius: 200/2
  }
})