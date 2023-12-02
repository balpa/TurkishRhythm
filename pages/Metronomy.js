import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Icon } from 'react-native-elements'

const Metronomy = () => {
  const { infoPanel, infoPanelMargin, infoPanelText, container, msInfoContainer, hitMeButton, msText,
    w100JCAI, w100h100JCAI, resetButton } = styles
  const COLOR_PALETTE_1 = ["FEF9A7", "FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]

  const MILLISECONDS_TEXT = 'milisaniye'
  const BETWEEN_TAPS_TEXT = 'vuruşlar arası'
  const HIT_BUTTON_TEXT = 'dokun'
  const RESET_BUTTON_TEXT = 'reset'
  const infoText = `Bu uygulamanın amacı, butona her basışınızda,
  bir önceki basışınız arasındaki farkı hesaplayıp milisaniye cinsinden
  ekrana yazdırarak ritim duyunuzun performansını göstermek ve pratik yaparak
  gelişmesine katkıda bulunmaktır.`

  const [time, setTime] = useState(0)
  const [isOn, setisOn] = useState(false)
  const [timeArray, setTimeArray] = useState([])
  const [previousTime, setPreviousTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [msColor, setMsColor] = useState('black')
  const [shadowOptions, setShadowOptions] = useState({})
  const [openInfoPanel, setOpenInfoPanel] = useState(false)
  const [score, setScore] = useState(0)

  const yAnim = useRef(new Animated.Value(500)).current
  const scaleAnim = useRef(new Animated.Value(0)).current
  const infoPanelPositionAnim = useRef(new Animated.Value(-200)).current
  const topAnimDependingOnInfoContainer = useRef(new Animated.Value(75)).current
  const msContainerScaleAnim = useRef(new Animated.Value(1)).current

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
    }, 1000)
  }, [])

  useEffect(() => {           // change color of text depending on time difference. its done to show if user is doing okay
    if (timeArray[timeArray.length - 1] - timeArray[timeArray.length - 2] < 50) { setMsColor('green'); setScore(score + 1) }
    else if (timeArray[timeArray.length - 1] - timeArray[timeArray.length - 2] < 75) { setMsColor('#b7ec09'); setScore(score - 1) }
    else { setMsColor('red'); setScore(score - 2) }
  }, [currentTime])

  useEffect(() => {         // if timearray size is bigger than 20, set the array to last 10 elements. IDK why 20 :)
    if (timeArray.length > 50) {
      setTimeArray(timeArray.slice(45, 50))
    }
  }, [timeArray])

  useEffect(() => {           // bounce animation for ms container
    bounceAnimation()
  }, [time])

  const createTime = () => new Date().getTime()

  const calc = () => {            // calculate the time difference
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 75,
      useNativeDriver: false
    }).start(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 75,
        useNativeDriver: false
      }).start()
    })

    let now = createTime()
    let diff = parseInt((now - previousTime) / 2)

    if (diff.toString().length > 7) {      // if number is so big which means it's in milliseconds, reduce to 3 digits
      diff = diff.toString().slice(0, 3)
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

      Animated.timing(infoPanelPositionAnim, { //info panel position opening anim
        toValue: 0,
        duration: 400,
        useNativeDriver: false
      }).start()

    } else {
      Animated.timing(topAnimDependingOnInfoContainer, {  //ms container top margin closin anim
        toValue: 75,
        duration: 450,
        useNativeDriver: false
      }).start()

      Animated.timing(infoPanelPositionAnim, { //info panel position closing anim
        toValue: -200,
        duration: 400,
        useNativeDriver: false
      }).start()

      setTimeout(() => { setOpenInfoPanel(false) }, 450)
    }


  }

  const bounceAnimation = () => {
    Animated.timing(msContainerScaleAnim, {
      toValue: 1.02,
      duration: 50,
      useNativeDriver: false
    }).start(() => {
      Animated.timing(msContainerScaleAnim, {
        toValue: 0.98,
        duration: 50,
        useNativeDriver: false
      }).start(() => {
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
      <Animated.View style={infoPanelMargin}>
        <Text style={infoPanelText}>
          {infoText}
        </Text>
      </Animated.View>
    )
  }

  return (
    <View style={[container, { backgroundColor: '#F0DBDB' }]}>
      <TouchableOpacity
        onPress={() => expandInfoPanel()}
        style={{
          position: 'absolute',
          right: 0,
          width: '10%',
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
        <Icon name={openInfoPanel == true ? 'close' : 'info'} color={'black'} />
      </TouchableOpacity>
      <Animated.View
        style={[
          { width: '80%', marginTop: 10 },
          { transform: [{ translateY: infoPanelPositionAnim }] }
        ]}>
        {openInfoPanel && <InfoPanel />}
      </Animated.View>
      <Animated.View style={[
        msInfoContainer,
        { transform: [{ scale: msContainerScaleAnim }] },
        { top: topAnimDependingOnInfoContainer }]}>
        <Text
          style={[msText, { color: msColor }]}>{time}{"\n"}
          <Text style={{ fontSize: 20 }}>{MILLISECONDS_TEXT}{'\n'}</Text>
          <Text style={{ fontSize: 14 }}>{BETWEEN_TAPS_TEXT}</Text>
        </Text>
      </Animated.View>
      <Animated.View style={[
        hitMeButton,
        shadowOptions,
        { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={w100h100JCAI}
          onPress={() => calc()}>
          <Text style={{ fontSize: 40, color: '#b25068', fontWeight: '900' }}
          >{HIT_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[
        resetButton,
        Platform.OS == 'android' ? { borderBottomLeftRadius: 25, borderBottomRightRadius: 25 } : {},
        { transform: [{ translateY: yAnim }] }]}>
        <TouchableOpacity style={w100JCAI} onPress={() => reset()}>
          <Text style={{ fontSize: 40, color: 'wheat', fontWeight: '900' }}>{RESET_BUTTON_TEXT}</Text>
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
    borderWidth: 3,
    borderColor: 'black',
    backgroundColor: '#b25068',
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
    backgroundColor: '#FBFACD',
    borderRadius: 25,
    position: 'absolute',
    bottom: 250,
    borderWidth: 3,
    borderColor: 'black',
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
    position: 'absolute',
    width: '90%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: 'white',
    borderColor: 'black'
  },
  msText: {
    padding: 1,
    fontSize: 100,
    textShadowColor: 'black',
    textShadowRadius: 0.5,
    textShadowOffset: { width: 0.1, height: 0.1 },
    fontWeight: "900",
    textAlign: 'center',
    position: 'absolute',
    paddingBottom: 25
  },
  w100h100JCAI: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  w100JCAI: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
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
  },
  infoPanelText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: 'black',
    letterSpacing: 0.3
  }
})