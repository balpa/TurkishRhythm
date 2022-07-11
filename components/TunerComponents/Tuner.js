import { View, Text } from 'react-native'
import React from 'react'
import { Audio } from 'expo-av';
import { Button } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';

function Tuner() {

  // TODO: This just records audio. i dont need saving the file

  const [recording, setRecording] = React.useState();


  async function startRecording() {
    try {
      console.log('Requesting permissions..')
      await Audio.requestPermissionsAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })
      console.log('Starting recording..')
      const { recording } = await Audio.Recording.createAsync(
         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      )
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err)
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    console.log('Recording stopped and stored at', uri);
  }
  return (
    <View>
      <Text>Tuner</Text>
      <Button onPress={()=>startRecording()} title='start'/>
      <Button onPress={()=>stopRecording()} title='stop'/>
    </View>
  )
}

export default Tuner