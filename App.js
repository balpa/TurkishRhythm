import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Metronomy from './pages/Metronomy';
import Rhythms from './pages/Rhythms';
import Makams from './pages/Makams';
import Settings from './pages/Settings';
import Intro from './pages/Intro'
import { Icon } from 'react-native-elements'
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { registerCustomIconType } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

registerCustomIconType('font-awesome-5', FontAwesome5) // font awesome 5 not registered by def

const Tab = createMaterialTopTabNavigator()

// SAFE AREA - COLORS - BORDER FOR MAKAMS/RHYTHMS

const App = () => {
  //settings page removed for now (android cache problem)

  const COLOR_PALETTE_1 = ["FEF9A7", "FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]
  const DARK_MODE_PALETTE = ['#4c3a51', '#774360', '#b25068', '#e7ab79']

  const [tabBarIndicatorColor, setTabBarIndicatorColor] = useState('white')
  const [showIntroPage, setShowIntroPage] = useState(true)

  const tabNavigatorScreenOpts = {
    tabBarShowLabel: false,
    tabBarStyle: {
      backgroundColor: '#F0DBDB',
      //marginTop: 40,
    },
    tabBarIndicatorStyle: {
      backgroundColor: `black`,
      height: 5
    }
  }

  useEffect(() => {     // set random tab bar indicator color at first render
    setTabBarIndicatorColor(COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)])
  }, [])

  return (<>

    <NavigationContainer>
      {Platform.OS == 'android' && <StatusBar
        backgroundColor={'#F0DBDB'}
        style={themeFromCache == 'Light' ? 'dark' : 'light'}
      />}
      <Tab.Navigator
        screenOptions={({ route }) => (tabNavigatorScreenOpts)}>
        <Tab.Screen
          name="Makams"
          children={() => <Makams />}
          options={{
            tabBarIcon: () =>
              <Icon
                name='music'
                type='font-awesome'
                color={'black'}
              />
          }} />
        <Tab.Screen
          name="Rhythms"
          children={() => <Rhythms />}
          options={{
            tabBarIcon: () =>
              <Icon
                name="drum"
                type='font-awesome-5'
                color={'black'}
              />
          }} />
        <Tab.Screen
          name="Metronomy"
          children={() => <Metronomy />}
          options={{
            tabBarIcon: () =>
              <Icon
                name='play'
                type='font-awesome-5'
                color={'black'}
                style={{ transform: [{ scale: 0.85 }] }}
              />
          }} />
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
