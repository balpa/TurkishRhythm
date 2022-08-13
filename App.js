import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Home from './pages/Home';
import Rhythms from './pages/Rhythms';
import Tuner from './pages/Tuner';
import Settings from './pages/Settings';
import { Icon } from 'react-native-elements'
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Tab = createMaterialTopTabNavigator();

const App = () => {

  const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]

  const [tabBarIndicatorColor, setTabBarIndicatorColor] = useState('white')
  const [languageFromCache, setLanguageFromCache] = useState('')
  const [themeFromCache, setThemeFromCache] = useState('')

  useEffect(async()=>{      // get language data from local storage (cache)
    try {
      const value = await AsyncStorage.getItem('@language')
      const themeVal = await AsyncStorage.getItem('@theme')
      if(value !== null) setLanguageFromCache(value);console.log('LANGUAGE: ', value)
      if(themeVal !== null) setThemeFromCache(themeVal);console.log('THEME: ',themeVal)
    } catch(e) {console.log(e)}
  },[])

  useEffect(() => {     // set random tab bar indicator color at first render
    setTabBarIndicatorColor(COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)])
  }, [])
  
  //todo: makam page
  return (

    <NavigationContainer>

      <Tab.Navigator 
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'white',
            marginTop: 40
          },
          tabBarIndicatorStyle: {
            backgroundColor: `#${tabBarIndicatorColor}`,
            height: 5
          }
      })}>
        <Tab.Screen 
          name="Home" 
          children={()=> <Home language={languageFromCache} />} 
          options={{tabBarIcon: () => <Icon name="touch-app" color='black' />}} />
        <Tab.Screen 
          name="Rhythms" 
          children={()=> <Rhythms language={languageFromCache}/>}
          options={{tabBarIcon: () => <Icon name="album" color='black' />}} />
        <Tab.Screen 
          name="Settings" 
          children={()=> <Settings language={languageFromCache} theme={themeFromCache}/>}
          options={{tabBarIcon: () => <Icon name="settings" color='black' />}} />
      </Tab.Navigator>

    </NavigationContainer>

  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
