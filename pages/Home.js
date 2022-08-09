import { View, Text, Button, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native'
import React, { useState, useEffect} from 'react'
import { Icon } from 'react-native-elements'
import { ScreenStackHeaderBackButtonImage } from 'react-native-screens'

export default function Home() {

  //TODO: change component name related to metronome

    const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]

    const [time, setTime] = useState(0)
    const [isOn, setisOn] = useState(false)
    const [timeArray, setTimeArray] = useState([])
    const [previousTime, setPreviousTime] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [msColor, setMsColor] = useState('black')
    const [prevTimeForColoring, setPrevTimeForColoring] = useState(0)
    const [hitMeColor, setHitMeColor] = useState('white')
    const [resetColor, setResetColor] = useState('white')
    const [platform, setPlatform] = useState("")
    const [shadowOptions, setShadowOptions] = useState({})

    const yAnim = React.useRef(new Animated.Value(500)).current
    const scaleAnim = React.useRef(new Animated.Value(0)).current

    useEffect(() => {          // platform based shadow options
      if (Platform.OS === "android") {
        setPlatform("android")
        setShadowOptions({
          elevation: 20
        })
    }
      else if (Platform.OS === "ios") {
        setPlatform("ios")
        setShadowOptions({
          shadowColor: '#171717',
          shadowOffset: {width: -1, height: 3},
          shadowOpacity: 0.4,
          shadowRadius: 5, 
        })
      }
  
    }, [])

    useEffect(() => {           // animations on first render
      setTimeout(() => {
        Animated.spring(yAnim, {
          toValue: 0,
          friction: 4,
          tension: 5,
          useNativeDriver: false
        }).start()
  
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 5,
          useNativeDriver: false
        }).start()
      },1000)
    }, [])

    useEffect(() => {           // change color of text depending on time difference. its done to show if user is doing okay

      if ( timeArray[timeArray.length-1]-timeArray[timeArray.length-2] < 75 ) setMsColor('green') 
      else if (timeArray[timeArray.length-1]-timeArray[timeArray.length-2] < 100) setMsColor('#b7ec09')
      else setMsColor('red')

    },[currentTime])

    useEffect(() => {         // if timearray size is bigger than 20, set the array to last 10 elements. IDK why 20 :)
      if (timeArray.length > 50){
        setTimeArray(timeArray.slice(45,50))
      }
    },[timeArray])

    useEffect(() => {         // choose random color for buttons on first render
      setHitMeColor(COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)])
      setResetColor(COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)])
    },[])


    function createTime(){      // create current time in milliseconds
      let now = new Date().getTime()
      return now
    }

    function calc(){            // calculate the time difference

      // animations for hitting the button
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 75,
        useNativeDriver: false
      }).start(()=>{
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 75,
          useNativeDriver: false
        }).start()
      })

      let now = createTime()
      let diff = parseInt((now - previousTime)/2)

      if (diff.toString().length > 7){      // if number is so big which means it's in milliseconds, reduce to 3 digits
        diff = diff.toString().slice(0,3)

      }

      setTime(diff)
      if (previousTime == 0) setPreviousTime(now)
      else setPreviousTime(currentTime)
      setCurrentTime(now)
      setTimeArray(old => [...old, diff])

      }
    

    function reset(){           // reset all 
      setTime(0)
      setCurrentTime(0)
      setPreviousTime(0)
      setisOn(false)
      setTimeArray([])
    }


  return (
    <View style={styles.container}>
      <View style={{top:25}}>
        <Text style={{textAlign:'center', fontSize:12, fontWeight:'700'}}>
          Bu uygulamanın amacı; butona her basışınızda,
          bir önceki basışınız arasındaki farkı hesaplayıp milisaniye cinsinden
          ekrana yazdırarak ritim duyusunu göstermek ve pratik yaparak
          gelişmesine katkıda bulunmaktır.
        </Text>
      </View>
      <Text 
        style={{
          padding:1,
          fontSize:100,
          textShadowColor:'black',
          textShadowRadius:2,
          textShadowOffset:{width:0.5,height:0.5}, 
          fontWeight:"900", 
          textAlign:'center', 
          color: msColor, 
          position:'absolute', 
          top:150}}>{time}{"\n"}
        <Text style={{fontSize: 20}}>milisaniye{'\n'}</Text>
        <Text style={{fontSize: 14}}>vuruşlar arası</Text>
      </Text>
      <Animated.View style={[styles.hitMeButton, shadowOptions, {backgroundColor:`#${hitMeColor}`}, {transform: [{scale: scaleAnim}]}]}>
        <TouchableOpacity style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}} onPress={()=> calc()}>
          <Text style={{ fontSize: 40 }}>dokun</Text>
        </TouchableOpacity>
      </Animated.View> 

      <Animated.View style={[styles.resetButton, {backgroundColor: `#${resetColor}`}, {transform: [{translateY: yAnim}]}]}>
        <TouchableOpacity style={{width:"100%", justifyContent:'center', alignItems:'center'}} onPress={()=>reset()}>
          <Text style={{ fontSize: 40 }}>sıfırla</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height: "100%",
    width: "100%"
  },
  resetButton: {
    position: 'absolute',
    bottom: 0,
    borderWidth: 2,
    borderColor:'black',
    backgroundColor: 'rgba(230,230,230,1)',
    width: "100%",
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  hitMeButton: {
    width: 300,
    height: 100,
    borderRadius: 30,
    position: 'absolute',
    bottom: 250,
    borderWidth: 2,
    borderColor:'black',
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#171717',
    // shadowOffset: {width: -1, height: 3},
    // shadowOpacity: 0.4,
    // shadowRadius: 5,

  }
})