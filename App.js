import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Metronomy from './pages/Metronomy';
import Rhythms from './pages/Rhythms';
import Makams from './pages/Makams';
import Intro from './pages/Intro'
import Notes from './pages/Notes';
import { Icon } from 'react-native-elements'
import { NavigationContainer } from '@react-navigation/native';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createMaterialTopTabNavigator()

const COLORS = {
  bg: '#1B1B2F',
  surface: '#262640',
  accent: '#E45A84',
  gold: '#C9B458',
  border: '#3A3A5C',
  text: '#F0E6D3',
  textDim: '#9090B0',
  tabBar: '#15152A',
}

const App = () => {
  const [showIntroPage, setShowIntroPage] = useState(true)

  const tabNavigatorScreenOpts = {
    tabBarShowLabel: false,
    tabBarStyle: {
      backgroundColor: COLORS.tabBar,
      paddingTop: Platform.OS === 'ios' ? 50 : 35,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarIndicatorStyle: {
      backgroundColor: COLORS.accent,
      height: 3,
      borderRadius: 2,
    },
    tabBarPressColor: COLORS.surface,
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <NavigationContainer>
        <StatusBar style='light' backgroundColor={COLORS.tabBar} />
        <Tab.Navigator
          screenOptions={({ route }) => (tabNavigatorScreenOpts)}>
          <Tab.Screen
            name="Makams"
            children={() => <Makams />}
            options={{
              tabBarIcon: ({ focused }) =>
                <Icon
                  name='music'
                  type='font-awesome'
                  color={focused ? COLORS.accent : COLORS.textDim}
                  size={20}
                />
            }} />
          <Tab.Screen
            name="Rhythms"
            children={() => <Rhythms />}
            options={{
              tabBarIcon: ({ focused }) =>
                <Icon
                  name="drum"
                  type='font-awesome-5'
                  color={focused ? COLORS.accent : COLORS.textDim}
                  size={20}
                />
            }} />
          <Tab.Screen
            name="Notes"
            children={() => <Notes />}
            options={{
              tabBarIcon: ({ focused }) =>
                <Icon
                  name="scroll"
                  type='font-awesome-5'
                  color={focused ? COLORS.accent : COLORS.textDim}
                  size={20}
                />
            }} />
          <Tab.Screen
            name="Metronomy"
            children={() => <Metronomy />}
            options={{
              tabBarIcon: ({ focused }) =>
                <Icon
                  name='play'
                  type='font-awesome-5'
                  color={focused ? COLORS.accent : COLORS.textDim}
                  size={18}
                />
            }} />
        </Tab.Navigator>
      </NavigationContainer>
      {showIntroPage && <Intro setShowIntroPage={setShowIntroPage} />}
    </GestureHandlerRootView>)
}

export default App
