import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Home from './pages/Home';
import Rhythms from './pages/Rhythms';
import { Icon } from 'react-native-elements'
import { NavigationContainer } from '@react-navigation/native';




const Tab = createMaterialTopTabNavigator();

export default function App() {
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
          backgroundColor:'tomato',
          height: 5
        }

      })}>
        <Tab.Screen name="Home" component={Home} options={{
          tabBarIcon: () => <Icon name="touch-app" color='black' />,
        }} />
        <Tab.Screen name="Rhythms" component={Rhythms} options={{
          tabBarIcon: () => <Icon name="album" color='black' />,
        }} />
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
