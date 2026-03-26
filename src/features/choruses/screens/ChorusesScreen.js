import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ChorusDetail from './ChorusDetailScreen'
import CreateNote from '../../../../pages/CreateNote'
import NoteViewer from '../../../../pages/NoteViewer'
import AddMember from '../../../../pages/AddMember'
import CreateBulletin from '../../../../pages/CreateBulletin'
import ChorusInfo from '../../../../pages/ChorusInfo'
import CreateRehearsal from './CreateRehearsalScreen'
import PickLocation from './PickLocationScreen'
import ChorusListScreen from './ChorusListScreen'
import { COLORS } from '../chorusesShared'

const Stack = createNativeStackNavigator()

const ChorusesScreen = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="ChorusList" component={ChorusListScreen} />
      <Stack.Screen name="ChorusDetail" component={ChorusDetail} />
      <Stack.Screen name="CreateNote" component={CreateNote} />
      <Stack.Screen name="NoteViewer" component={NoteViewer} />
      <Stack.Screen name="CreateBulletin" component={CreateBulletin} />
      <Stack.Screen name="CreateRehearsal" component={CreateRehearsal} />
      <Stack.Screen name="PickLocation" component={PickLocation} />
      <Stack.Screen name="AddMember" component={AddMember} />
      <Stack.Screen name="ChorusInfo" component={ChorusInfo} />
    </Stack.Navigator>
  )
}

export default ChorusesScreen
