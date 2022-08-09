import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import LanguageSettings from '../components/SettingsComponents/LanguageSettings'
import About from '../components/SettingsComponents/About'

const Settings = ({language}) => {

  return (
    <View style={styles.container}>
      <LanguageSettings />
      <About />
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