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
import { registerCustomIconType } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

registerCustomIconType('font-awesome-5', FontAwesome5)

const Tab = createMaterialTopTabNavigator()

const App = () => {
  const [showIntroPage, setShowIntroPage] = useState(true)

  const tabNavigatorScreenOpts = {
    tabBarShowLabel: false,
    tabBarStyle: {
      backgroundColor: '#F0DBDB',
      paddingTop: 50
    },
    tabBarIndicatorStyle: {
      backgroundColor: `black`,
      height: 5
    }
  }

  return (
    <>
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
            name="Notes"
            children={() => <Notes />}
            options={{
              tabBarIcon: () =>
                <Icon
                  name="scroll"
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
        </Tab.Navigator>
        <StatusBar style='dark' />
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
