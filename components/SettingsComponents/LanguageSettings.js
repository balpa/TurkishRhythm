import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'

const LanguageSettings = () => {

  const [isExpanded, setIsExpanded] = React.useState(false)

  const expandAnimation = React.useRef(new Animated.Value(60)).current

  function expandLabel(){
    setIsExpanded(!isExpanded)
    if (!isExpanded){
      Animated.timing(expandAnimation,{
        toValue: 150,
        duration: 400,
        useNativeDriver: false
      }).start()
    } else {
      Animated.timing(expandAnimation,{
        toValue: 60,
        duration: 400,
        useNativeDriver: false
      }).start() 
    }
  }

  return (
    <Animated.View style={styles.container}>
      <Animated.View style={[styles.optionLabel, {height: expandAnimation}]}>
        <TouchableOpacity
          onPress={()=>expandLabel()}  
          style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
            <Text>Language</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

export default LanguageSettings

const styles = StyleSheet.create({
  container: {
    width:'100%',
    minHeight: 60,
    alignItems:'center',
    padding:10
  },
  optionLabel: {
    width:'100%',
    height: 40,
    backgroundColor:'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  }

})