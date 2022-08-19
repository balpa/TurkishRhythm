import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Icon } from 'react-native-elements'

const About = ({language}) => {

  const ABOUT_TEXT = language == 'Turkish' ? 'Hakkında' : 'About'

  const [isExpanded, setIsExpanded] = React.useState(false)

  const expandAnimation = React.useRef(new Animated.Value(40)).current

  const expandLabel = () => {
    if (!isExpanded){
      setIsExpanded(true)
      Animated.timing(expandAnimation,{
        toValue: 100,
        duration: 200,
        useNativeDriver: false
      }).start()
    } else {
        Animated.timing(expandAnimation,{
          toValue: 40,
          duration: 200,
          useNativeDriver: false
        }).start()
        setIsExpanded(false)
    }
  }

  const InsideAbout = () => {
    return (
      <View>
        <Text>baLpa</Text>
      </View>
    )
  }

  //todo: expand & animation
  return (
    <Animated.View style={styles.container}>
      <Animated.View style={[styles.optionLabel, {height: expandAnimation}]}>
        <TouchableOpacity 
          onPress={()=>{expandLabel()}}
          activeOpacity={0.9}
          style={{
            justifyContent:'center',
            alignItems:'center',
            width:'100%',
            height:'100%'
          }}>
          <Text style={styles.languageFont}>{ABOUT_TEXT}</Text>
          {isExpanded && <InsideAbout />}
        </TouchableOpacity>
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
    fontSize:17,
    fontWeight:'900'
  },
  optionLabel: {
    width:'100%',
    height: 30,
    backgroundColor:'#e7ab79',
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