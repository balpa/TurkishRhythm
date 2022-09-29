import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import LanguageSettings from '../components/SettingsComponents/LanguageSettings'
import About from '../components/SettingsComponents/About'
import Theme from '../components/SettingsComponents/Theme'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = ({language, theme}) => {

  //todo: theme color changes

  const [denemeMetin, setDenemeMetin] = useState('')


  return (
    <View style={[styles.container, {backgroundColor:theme == 'Dark' ? '#2c1a31' : 'white'}]}>
      <LanguageSettings language={language} theme={theme} />
      <Theme language={language} theme={theme}/>
      <About language={language} theme={theme}/>
      {/* <TouchableOpacity style={{width: 100, height: 100, backgroundColor: 'green'}}
      onPress={async()=>{
        try {await AsyncStorage.setItem('@deneme', 'async');console.log('YAZDI')}
        catch(e){console.log(e)}
      }}>
        <Text>fdsf</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{width: 100, height: 100, backgroundColor: 'red'}}
      onPress={async()=>{
        try {
          const value = await AsyncStorage.getItem('@deneme')
          setDenemeMetin(value)
          console.log(value)
        }
        catch (e) {console.log(e)}
      }}>
        <Text>
          {denemeMetin}
        </Text>
      </TouchableOpacity> */}
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container:{
    width:'100%',
    height:'100%',
    alignItems:'center',
    padding:10,
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