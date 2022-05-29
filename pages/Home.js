import { View, Text, Button, StyleSheet } from 'react-native'
import {React, useState} from 'react'

export default function Home() {

  //TODO: change component name related to metronome

    const [time, setTime] = useState(0)
    const [isOn, setisOn] = useState(false)
    const [timeArray, setTimeArray] = useState([])
    const [previousTime, setPreviousTime] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    function createTime(){
      let now = new Date().getTime()
      return now
    }

    function calc(){      // at second press, it shows milliseconds need to fix
      setCurrentTime(createTime())
      let diff = currentTime - previousTime

      if (diff.toString().length > 7){      // if number is so big which means it's in milliseconds, reduce to 3 digits
        diff = diff.toString().slice(0,3)
      }
      setTime(diff)
      setPreviousTime(currentTime)
    }

    function reset(){
      setTime(0)
      setCurrentTime(0)
      setPreviousTime(0)
      setisOn(false)
    }


  return (
    <View style={styles.container}>
      
      <Text style={{fontSize:75}}>{time}</Text>
      <Button onPress={()=>calc()} title="hit"/>
      <Button onPress={()=>reset()} title="reset"/>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
})