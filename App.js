import { StatusBar } from 'expo-status-bar';
import { View, Animated, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Metronomy from './pages/Metronomy';
import Rhythms from './pages/Rhythms';
import Makams from './pages/Makams';
import Intro from './pages/Intro'
import Choruses from './pages/Choruses';
import Feed from './pages/Feed';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Icon } from 'react-native-elements'
import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { LanguageProvider } from './i18n/LanguageContext';
import { supabase } from './lib/supabase';
import { COLORS } from './src/shared/theme/colors';

const Tab = createMaterialTopTabNavigator()
const { width: SCREEN_WIDTH } = Dimensions.get('window')

const TAB_COUNT = 6
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT
const BAR_HEIGHT = 40
const SAFE_BOTTOM = Platform.OS === 'ios' ? 28 : 12
const CURVE_WIDTH = TAB_WIDTH * 2
const CURVE_HEIGHT = 30
const CIRCLE_SIZE = 46
const ICON_RISE = 10

const TAB_ICONS = [
  { name: 'dynamic-feed', type: 'material' },
  { name: 'queue-music', type: 'material' },
  { name: 'graphic-eq', type: 'material' },
  { name: 'groups', type: 'material' },
  { name: 'timer', type: 'material' },
  { name: 'settings', type: 'material' },
]

const FluidTabBar = ({ state, navigation, position }) => {
  const routes = state.routes

  const curveTranslateX = position.interpolate({
    inputRange: routes.map((_, i) => i),
    outputRange: routes.map((_, i) => i * TAB_WIDTH + TAB_WIDTH / 2 - CURVE_WIDTH / 2),
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.curveContainer, { transform: [{ translateX: curveTranslateX }] }]}>
        <Svg width={CURVE_WIDTH} height={CURVE_HEIGHT} viewBox="0 0 202.9 45.5" preserveAspectRatio="none">
          <Path
            d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3c5-2.9,9.2-5.2,15.2-7
              c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7c8.8,5,9.9,7.1,20.6,14.3
              c8.3,5.5,12.4,8.2,18.1,10.5c9.2,3.6,17.6,4.2,23.3,4H6.7z"
            fill={COLORS.tabBar}
          />
        </Svg>
      </Animated.View>

      <View style={styles.bar}>
        {routes.map((route, index) => {
          const icon = TAB_ICONS[index]

          const iconTranslateY = position.interpolate({
            inputRange: routes.map((_, i) => i),
            outputRange: routes.map((_, i) => i === index ? -ICON_RISE : 0),
            extrapolate: 'clamp',
          })

          const circleScale = position.interpolate({
            inputRange: routes.map((_, i) => i),
            outputRange: routes.map((_, i) => i === index ? 1 : 0),
            extrapolate: 'clamp',
          })

          const iconOpacity = position.interpolate({
            inputRange: routes.map((_, i) => i),
            outputRange: routes.map((_, i) => i === index ? 1 : 0.45),
            extrapolate: 'clamp',
          })

          const iconScale = position.interpolate({
            inputRange: routes.map((_, i) => i),
            outputRange: routes.map((_, i) => i === index ? 1.15 : 1),
            extrapolate: 'clamp',
          })

          const onPress = () => {
            if (state.index !== index) navigation.navigate(route.name)
          }

          return (
            <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.6} style={styles.tab}>
              <Animated.View style={[styles.iconContainer, {
                transform: [{ translateY: iconTranslateY }, { scale: iconScale }],
              }]}>
                <Animated.View style={[styles.activeCircle, {
                  transform: [{ scale: circleScale }],
                  opacity: circleScale,
                }]} />
                <Animated.View style={[styles.iconInner, { opacity: iconOpacity }]}>
                  <Icon name={icon.name} type={icon.type} color={COLORS.white} size={22} />
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.safeArea} />
    </View>
  )
}

const App = () => {
  const [showIntroPage, setShowIntroPage] = useState(true)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const renderSettingsScreen = () => <Settings onLogout={handleLogout} />

  if (authLoading) {
    return (
      <LanguageProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
          {showIntroPage && <Intro setShowIntroPage={setShowIntroPage} />}
        </View>
      </LanguageProvider>
    )
  }

  if (!session) {
    return (
      <LanguageProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
          <StatusBar style='light' backgroundColor={COLORS.bg} />
          <Login onLogin={(s) => setSession(s)} />
        </View>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ flex: 1, paddingTop: Constants.statusBarHeight, backgroundColor: COLORS.bg }}>
      <NavigationContainer>
        <StatusBar style='light' backgroundColor={COLORS.bg} />
        <Tab.Navigator
          tabBarPosition="bottom"
          tabBar={props => <FluidTabBar {...props} />}
          screenOptions={{
            lazy: true,
            lazyPreloadDistance: 0,
            swipeEnabled: true,
            animationEnabled: true,
          }}
        >
          <Tab.Screen name="Feed" component={Feed} />
          <Tab.Screen name="Makams" component={Makams} />
          <Tab.Screen name="Rhythms" component={Rhythms} />
          <Tab.Screen name="Choruses" component={Choruses} />
          <Tab.Screen name="Metronomy" component={Metronomy} />
          <Tab.Screen name="Settings" children={renderSettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      </View>
      {showIntroPage && <Intro setShowIntroPage={setShowIntroPage} />}
    </GestureHandlerRootView>
    </LanguageProvider>
  )
}

export default App

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  curveContainer: {
    position: 'absolute',
    bottom: BAR_HEIGHT + SAFE_BOTTOM,
    width: CURVE_WIDTH,
    height: CURVE_HEIGHT,
    zIndex: 1,
  },
  activeCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    position: 'absolute',
  },
  bar: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    backgroundColor: COLORS.tabBar,
    alignItems: 'center',
    zIndex: 2,
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
    overflow: 'visible',
  },
  safeArea: {
    height: SAFE_BOTTOM,
    backgroundColor: COLORS.tabBar,
  },
})
