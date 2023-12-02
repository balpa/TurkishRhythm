import { View, StyleSheet } from 'react-native'
import React from 'react'
import LanguageSettings from '../components/SettingsComponents/LanguageSettings'
import About from '../components/SettingsComponents/About'
import Theme from '../components/SettingsComponents/Theme'

const Settings = ({language, theme}) => {

  return (
    <View style={[styles.container, {backgroundColor: theme == 'Dark' ? '#2c1a31' : 'white'}]}>
      <LanguageSettings language={language} theme={theme} />
      <Theme language={language} theme={theme}/>
      <About language={language} theme={theme}/>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container:{
    width: '100%',
    height: '100%',
    alignItems: 'center',
    padding: 10,
  },
  optionLabel:{
    width: '90%',
    height: 40,
    backgroundColor: 'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  }

})