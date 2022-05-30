import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './pages/Home';
import Rhythms from './pages/Rhythms';
import { Icon } from 'react-native-elements'

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}>
        <Tab.Screen name="Home" component={Home} options={{
          tabBarIcon: () => <Icon name="touch-app" color='black' />,
          tabBarActiveBackgroundColor: 'tomato',

        }} />
        <Tab.Screen name="Rhythms" component={Rhythms} options={{
          tabBarIcon: () => <Icon name="album" color='black' />,
          tabBarActiveBackgroundColor: 'tomato',
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
