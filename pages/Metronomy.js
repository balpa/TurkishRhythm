import { View, Text, Button, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native'
import React, { useState, useEffect} from 'react'
import { Icon } from 'react-native-elements'


const Metronomy = ({language, theme}) => {
  //TODO: re-styling
  //MIGHT NEED TO CHANGE THE LOGIC FOR MS COUNTER

    const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]

    const MILLISECONDS_TEXT = language == 'Turkish' ? 'milisaniye' : 'milliseconds'
    const BETWEEN_TAPS_TEXT = language == 'Turkish' ? 'vuruşlar arası' : 'between taps'
    const HIT_BUTTON_TEXT = language == 'Turkish' ? 'dokun' : 'hit'
    const RESET_BUTTON_TEXT = language == 'Turkish' ? 'sıfırla' : 'reset'
    const INFO_TEXT = language == 'Turkish' ? 'BİLGİ' : 'INFO'


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
    const [openInfoPanel, setOpenInfoPanel] = useState(false)
    const [score, setScore] = useState(0)
    const [showScore, setShowScore] = useState(true)

    const yAnim = React.useRef(new Animated.Value(500)).current
    const scaleAnim = React.useRef(new Animated.Value(0)).current
    const infoPanelPositionAnim = React.useRef(new Animated.Value(-200)).current
    const topAnimDependingOnInfoContainer = React.useRef(new Animated.Value(75)).current
    const msContainerScaleAnim = React.useRef(new Animated.Value(1)).current

    const createRandomColorFromArray = () => {
      return COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]
    }

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
      if (timeArray[timeArray.length-1]-timeArray[timeArray.length-2] < 50) {setMsColor('green'); setScore(score+1)}
      else if (timeArray[timeArray.length-1]-timeArray[timeArray.length-2] < 75) {setMsColor('#b7ec09'); setScore(score-1)}
      else {setMsColor('red'); setScore(score-2)}
    },[currentTime])

    useEffect(() => {         // if timearray size is bigger than 20, set the array to last 10 elements. IDK why 20 :)
      if (timeArray.length > 50){
        setTimeArray(timeArray.slice(45,50))
      }
    },[timeArray])

    useEffect(() => {         // choose random color for buttons on first render
      setHitMeColor(createRandomColorFromArray())
      setResetColor(createRandomColorFromArray())
    },[])

    useEffect(()=>{           // bounce animation for ms container
      bounceAnimation()
    },[time])

    useEffect(()=>{
      if (openInfoPanel) setShowScore(false)
      else setShowScore(true)
    },[openInfoPanel])
    
    const createTime = () => {      // create current time in milliseconds
      let now = new Date().getTime()
      return now
    }

    const calc = () => {            // calculate the time difference
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
    
    const reset = () => {           // reset all 
      setTime(0)
      setCurrentTime(0)
      setPreviousTime(0)
      setisOn(false)
      setTimeArray([])
      setScore(0)
    }

    const expandInfoPanel = () => {
      if (openInfoPanel == false) {
        setOpenInfoPanel(true)

        Animated.timing(topAnimDependingOnInfoContainer, {  //ms container top margin cloisng anim
          toValue: 150,
          duration: 450,
          useNativeDriver: false
        }).start()

        Animated.timing(infoPanelPositionAnim,{ //info panel position opening anim
          toValue: 0,
          duration:400,
          useNativeDriver:false
        }).start()

      } else {

        Animated.timing(topAnimDependingOnInfoContainer, {  //ms container top margin closin anim
          toValue: 75,
          duration: 450,
          useNativeDriver: false
        }).start()

        Animated.timing(infoPanelPositionAnim,{ //info panel position closing anim
          toValue: -200,
          duration: 400,
          useNativeDriver: false
        }).start()

        setTimeout(()=>{setOpenInfoPanel(false)},450)
      }


    }

    const bounceAnimation = () => {
      Animated.timing(msContainerScaleAnim, {
        toValue: 1.02,
        duration: 50,
        useNativeDriver: false
      }).start(()=>{
        Animated.timing(msContainerScaleAnim, {
          toValue: 0.98,
          duration: 50,
          useNativeDriver: false
        }).start(()=>{
        Animated.timing(msContainerScaleAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: false
        }).start()
        })
      })  
    }

    const InfoPanel = () => {
      return (
        <Animated.View style={styles.infoPanelMargin}>
        <Text style={
          theme == 'Dark'
          ?{
            textAlign:'center', 
            fontSize:14, 
            fontWeight:'700',
            color:'wheat',
            letterSpacing: 0.3
          }
         :{
            textAlign:'center', 
            fontSize:14, 
            fontWeight:'700',
            color:'black',
            letterSpacing: 0.3
          }}>
          Bu uygulamanın amacı, butona her basışınızda,
          bir önceki basışınız arasındaki farkı hesaplayıp milisaniye cinsinden
          ekrana yazdırarak ritim duyunuzun performansını göstermek ve pratik yaparak
          gelişmesine katkıda bulunmaktır.
        </Text>
      </Animated.View>
      )
    }

  return (
    <View style={[styles.container, {backgroundColor: theme == 'Dark' ? '#2c1a31' : 'white'}]}>
      <TouchableOpacity 
        onPress={()=>expandInfoPanel()}
        style={{
          position:'absolute',
          right: 0,
          width: '10%', 
          height: 50, 
          justifyContent:'center',
          alignItems:'center',
          zIndex: 10
          }}>
        <Icon name={openInfoPanel == true ? 'close' : 'info'} color={theme == 'Dark' ? 'wheat' : 'black'}/>
      </TouchableOpacity>
      <Animated.View 
        style={[
          {width: '80%',marginTop: 10},
          {transform: [{translateY: infoPanelPositionAnim}]}
        ]}>
        {openInfoPanel && <InfoPanel />}
      </Animated.View>
      <Animated.View style={[
        styles.msInfoContainer,
        {transform: [{scale: msContainerScaleAnim}]},
        {top: topAnimDependingOnInfoContainer},
        {backgroundColor: theme == 'Dark' ? '#3c2a41' : 'white'},
        {borderColor: theme == 'Dark' ? 'wheat' : 'black'}]}>
        <Text 
          style={[styles.msText,{color: msColor}]}>{time}{"\n"}
          <Text style={{fontSize: 20}}>{MILLISECONDS_TEXT}{'\n'}</Text>
          <Text style={{fontSize: 14}}>{BETWEEN_TAPS_TEXT}</Text>
        </Text>
      </Animated.View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
         {showScore && `Skor: ${score >= 0 ? score : '-0'}`}
        </Text>
      </View>
      <Animated.View style={[
        styles.hitMeButton, 
        shadowOptions, 
        {backgroundColor:`#774360`}, 
        {transform: [{scale: scaleAnim}]}]}>
        <TouchableOpacity 
          style={styles.w100h100JCAI} 
          onPress={()=> calc()}>
          <Text style={
            theme == 'Dark' 
            ? {fontSize: 40, color:'wheat', fontWeight: '900'}
            : {fontSize:40, color:'black', fontWeight:'900'}}
            >{HIT_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      </Animated.View> 
      <Animated.View style={[
        styles.resetButton, 
        Platform.OS == 'android' ? {borderBottomLeftRadius: 25, borderBottomRightRadius: 25} : {},
        {backgroundColor: `#b25068`}, 
        {transform: [{translateY: yAnim}]}]}>
        <TouchableOpacity style={styles.w100JCAI} onPress={()=>reset()}>
          <Text style={
            theme == 'Dark'
            ? {fontSize:40,color:'wheat', fontWeight: '900'}
            : {fontSize:40,color:'black', fontWeight: '900'}}>{RESET_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

export default Metronomy

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height: "100%",
    width: "100%",
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    borderWidth: 2,
    borderColor:'wheat',
    backgroundColor: 'rgba(230,230,230,1)',
    width: '90%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25
  },
  hitMeButton: {
    width: 300,
    height: 100,
    borderRadius: 25,
    position: 'absolute',
    bottom: 250,
    borderWidth: 2,
    borderColor:'wheat',
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#171717',
    // shadowOffset: {width: -1, height: 3},
    // shadowOpacity: 0.4,
    // shadowRadius: 5,

  },
  infoPanelMargin: {
    marginBottom: 10
  },
  infoPanel: {
    top: 25,
  },
  msInfoContainer: {
    position:'absolute',
    width:'90%',
    height:200,
    justifyContent:'center',
    alignItems:'center',
    borderWidth: 2,
    borderRadius:20,
  },
  msText: {
    padding:1,
    fontSize:100,
    textShadowColor:'black',
    textShadowRadius:0.5,
    textShadowOffset:{width:0.1,height:0.1}, 
    fontWeight:"900", 
    textAlign:'center', 
    position:'absolute', 
    paddingBottom: 25 
  },
  w100h100JCAI: { 
  width: '100%',
  height: '100%',
  justifyContent:'center',
  alignItems:'center'  
  },
  w100JCAI: {
    width:'100%',
    justifyContent:'center',
    alignItems:'center'
  },
  scoreContainer: {
    position: 'absolute',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    left: 0
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: 'wheat'
  }
})