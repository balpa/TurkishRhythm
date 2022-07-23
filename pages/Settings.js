import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'

function Settings(){

  const [isLanguageLabelClicked, setIsLanguageLabelClicked] = React.useState(false)

  const LanguageExpanded = () => {
    return (
      <>
      <View>
        <Text>EXPANDED</Text>
      </View>
      </>
    )
  }

  function expandPanel(optionName){
    if (optionName == 'language') {
      setIsLanguageLabelClicked(!isLanguageLabelClicked)
    }
  }

  //TODO: create a setting component for each

  return (
    <View style={styles.container}>
      <Animated.View style={styles.optionLabel}>
        <TouchableOpacity 
          onPress={()=>expandPanel('language')} 
          style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
          <Text>Language</Text>
          {isLanguageLabelClicked && <LanguageExpanded />}
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={styles.optionLabel}>
        <TouchableOpacity style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
          <Text>Language</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={styles.optionLabel}>
        <TouchableOpacity style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
          <Text>Language</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container:{
    width:'100%',
    height:'100%',
    alignItems:'center',
    padding:10
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