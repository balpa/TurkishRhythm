import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Metronomy from './pages/Metronomy';
import Rhythms from './pages/Rhythms';
import Makams from './pages/Makams';
import Settings from './pages/Settings';
import Intro from './pages/Intro'
import { Icon } from 'react-native-elements'
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createMaterialTopTabNavigator()

const App = () => {
  //settings page removed for now

  const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]
  const DARK_MODE_PALETTE = ['#4c3a51', '#774360', '#b25068', '#e7ab79']

  const [tabBarIndicatorColor, setTabBarIndicatorColor] = useState('white')
  const [languageFromCache, setLanguageFromCache] = useState('')
  const [themeFromCache, setThemeFromCache] = useState('')
  const [showIntroPage, setShowIntroPage] = useState(true)

  const tabNavigatorScreenOpts = {
    tabBarShowLabel: false,
    tabBarStyle: {
      backgroundColor: themeFromCache == 'Dark' ? '#4c3a51' : 'white',
      marginTop: 40,
    },
    tabBarIndicatorStyle: {
      backgroundColor: `#${tabBarIndicatorColor}`,
      height: 5
    }
  }

  useEffect(async()=>{      // get language and theme data from local storage (cache)
    try {
      const value = await AsyncStorage.getItem('@language')
      const themeVal = await AsyncStorage.getItem('@theme')

      if(value !== null) setLanguageFromCache(value) 
      else setLanguageFromCache('Turkish')

      if(themeVal !== null) setThemeFromCache(themeVal)
      else setThemeFromCache('Dark') //default theme
      
    } catch(e) {console.log(e)}
  },[])

  useEffect(() => {     // set random tab bar indicator color at first render
    setTabBarIndicatorColor(COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)])
  }, [])
  
  return (<>

    <NavigationContainer>
     {Platform.OS == 'android' && <StatusBar 
        backgroundColor={
          themeFromCache == 'Light'
          ? 'white' 
          : '#4c3a51'} 
        style={
          themeFromCache == 'Light'
          ? 'dark' 
          : 'light'}
        />}
      <Tab.Navigator 
        screenOptions={({ route }) => (tabNavigatorScreenOpts)}>
        <Tab.Screen 
          name="Makams" 
          children={()=> <Makams language={languageFromCache} theme={themeFromCache}/>}
          options={{
            tabBarIcon: () => 
              <Icon 
                name="music-note" 
                color={themeFromCache == 'Dark' ? 'wheat' : 'black'} 
              />}} />
        <Tab.Screen 
          name="Rhythms" 
          children={()=> <Rhythms language={languageFromCache} theme={themeFromCache}/>}
          options={{
            tabBarIcon: () => 
              <Icon 
                name="album" 
                color={themeFromCache == 'Dark' ? 'wheat' : 'black'} 
              />}} />
        <Tab.Screen 
          name="Metronomy" 
          children={()=> <Metronomy language={languageFromCache} theme={themeFromCache} />} 
          options={{
            tabBarIcon: () => 
              <Icon 
                name="touch-app" 
                color={themeFromCache == 'Dark' ? 'wheat' : 'black'} 
              />}} />
        {/* {Platform.OS == 'ios' && <Tab.Screen 
          name="Settings" 
          children={()=> <Settings language={languageFromCache} theme={themeFromCache}/>}
          options={{
            tabBarIcon: () => 
              <Icon 
                name="settings" 
                color={themeFromCache == 'Dark' ? 'wheat' : 'black'} 
              />}} />} */}
      </Tab.Navigator>

    </NavigationContainer>
    {showIntroPage && <Intro setShowIntroPage={setShowIntroPage} />}
  </>)
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
