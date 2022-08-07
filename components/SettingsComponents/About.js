import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Icon } from 'react-native-elements'

const About = () => {

  const [isExpanded, setIsExpanded] = React.useState(false)

  const expandAnimation = React.useRef(new Animated.Value(40)).current

  function expandLabel(){
    if (!isExpanded){
      setIsExpanded(true)
      Animated.timing(expandAnimation,{
        toValue: 200,
        duration: 200,
        useNativeDriver: false
      }).start()
    } else {
        Animated.timing(expandAnimation,{
          toValue: 40,
          duration: 200,
          useNativeDriver: false
        }).start()
        setTimeout(()=>{ setIsExpanded(false) },700)
    }
  }

  //todo: expand
  return (
    <Animated.View style={styles.container}>
      <Animated.View style={[styles.optionLabel, {height: expandAnimation}]}>
        <Text>baLpa</Text>
      </Animated.View>
    </Animated.View>
  )
}

export default About

const styles = StyleSheet.create({
  container: {
    width:'100%',
    minHeight: 60,
    alignItems:'center',
  },
  applyButton: {
    width:'40%',
    height: 30,
    backgroundColor:'white',
    alignSelf:'center',
    justifyContent:'center',
    alignItems:'center',
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
  },
  languageFont: {
    position:'absolute',
    top:10,
    fontSize:15
  },
  optionLabel: {
    width:'100%',
    height: 30,
    backgroundColor:'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  },
  languageInsideContainer: {
    width:'80%',
    height:'50%',
    backgroundColor:'white',
    borderRadius: 10,
  },
  fontTurkish:{
    marginBottom: 5,
    fontSize: 15,
    fontWeight:'800'
  },
  fontEnglish: {
    marginTop: 5,
    fontSize: 15,
    fontWeight:'800'
  }


})