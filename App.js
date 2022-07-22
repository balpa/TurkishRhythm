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



const Tab = createMaterialTopTabNavigator();

export default function App() {

  const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]

  const [tabBarIndicatorColor, setTabBarIndicatorColor] = useState('white')

  useEffect(() => {     // set random tab bar indicator color at first render
    setTabBarIndicatorColor(COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)])
  }, [])
  
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
          component={Home} 
          options={{tabBarIcon: () => <Icon name="touch-app" color='black' />}} />
        <Tab.Screen 
          name="Rhythms" 
          component={Rhythms} 
          options={{tabBarIcon: () => <Icon name="album" color='black' />}} />
        <Tab.Screen 
          name="Tuner" 
          component={Tuner} 
          options={{tabBarIcon: () => <Icon name="music-note" color='black' />}} />
        <Tab.Screen 
          name="Settings" 
          component={Settings} 
          options={{tabBarIcon: () => <Icon name="settings" color='black' />}} />
      </Tab.Navigator>

    </NavigationContainer>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
