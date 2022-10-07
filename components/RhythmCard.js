import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, Platform } from 'react-native'
import React, {useState, useEffect, useRef} from 'react'
import { ForceTouchGestureHandler, ScrollView } from 'react-native-gesture-handler'

const RhythmCard = ({ rhythmName, rhythmTime, color, imageURI, infoText, theme }) => {

  // TODO: name and time styling

  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState("")
  const [shadowOptions, setShadowOptions] = useState({})

   useEffect(() => {          // platform based shadow options
    if (Platform.OS === "android") {
      setPlatform("android")
      setShadowOptions({
        elevation: 20
      })
    } else if (Platform.OS === "ios") {
      setPlatform("ios")
      setShadowOptions({
        shadowColor: '#171717',
        shadowOffset: {width: -1, height: 3},
        shadowOpacity: 0.4,
        shadowRadius: 5, 
      })
    }

  }, [])

  const yAnim = useRef(new Animated.Value(0)).current
  const borderRadiusAnim = useRef(new Animated.Value(0)).current
  const marginAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const scaleAnimOnClick = useRef(new Animated.Value(1)).current
  const letterSpacingAnim = useRef(new Animated.Value(0)).current

  function showInfoPanel(){
    
    Animated.timing(scaleAnimOnClick, {   // on click animation
      toValue: 0.98,
      duration: 100,
      useNativeDriver: false
    }).start(()=>{
      Animated.timing(scaleAnimOnClick, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false
      }).start()
    })

    if (!isOpen){
      setIsOpen(true)

      setTimeout(()=>{    // letter spacing anim on opening the comp
        Animated.timing(letterSpacingAnim, {
          toValue: 2,
          duration: 200,
          useNativeDriver: false
        }).start()
      },900)

      Animated.timing(yAnim, {        // opening animation
        toValue: 300,
        duration: 200,
        useNativeDriver: false
      }).start(()=>{
          Animated.timing(borderRadiusAnim, {
            toValue: 20,
            duration: 200,
            useNativeDriver: false
          }).start(()=>{
            Animated.timing(marginAnim, {
              toValue: 20,
              duration: 200,
              useNativeDriver: false
            }).start(()=>{
              Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
              }).start()
            })
          })
      })
    } else {

      setTimeout(()=>{    // letter spacing anim on opening the comp
        Animated.timing(letterSpacingAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }).start()
      },900)

      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start(()=>{
        Animated.timing(marginAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }).start(()=>{
          Animated.timing(borderRadiusAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
          }).start(()=>{
            Animated.timing(yAnim, {      // closing animation
              toValue: 0,
              duration: 200,
              useNativeDriver: false
            }).start()
    })})})
      setTimeout(() => {          // timeout for waiting the closing animation to finish
        setIsOpen(false)
      },800)
    }
  }

  return (
    <Animated.View 
      style={[
        styles.rhythmCardContainer, 
        shadowOptions,
        {backgroundColor: `#${color}`},
        {transform: [{scale: scaleAnimOnClick}]}
      ]}>
      <TouchableOpacity style={{width:'100%'}} onPress={()=>showInfoPanel()}>
        <View style={{width:'100%', flexDirection:'row'}}>
            <Text style={styles.rhythmTime}>{rhythmTime}</Text>
            <Animated.Text 
              numberOfLines={1}
              style={[
                styles.rhythmName,
                {letterSpacing: letterSpacingAnim}
              ]}>
              {rhythmName}
            </Animated.Text>
        </View>
      </TouchableOpacity>
      {isOpen && 
      <Animated.View 
        style={[
          styles.rhythmInfoContainer, 
          {height: yAnim, borderRadius: borderRadiusAnim, margin: marginAnim }
        ]}>
        <Animated.View style={[styles.imageContainer, {opacity: opacityAnim}]}>
          <Image source={imageURI} style={styles.rhythmImage}/>
        </Animated.View>

        <Animated.View style={[styles.infoScrollContainer, {opacity: opacityAnim}]}>
          <ScrollView nestedScrollEnabled={true}>
            <Text>
              {infoText}
            </Text>
          </ScrollView>
        </Animated.View>

      </Animated.View>
      }
    </Animated.View>
  )
}

export default RhythmCard


const styles = StyleSheet.create({
  rhythmCardContainer: {
    width: "90%",
    margin: 10,
    borderRadius: 12,
    padding: 10,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center',

  },
  shadow: {
    shadowColor: '#171717',
    shadowOffset: {width: -1, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  rhythmInfoContainer: {
    width: '100%',
    height: 300,
    backgroundColor:'white',
    borderWidth:2,
    padding:10,
    flexDirection:'column',
    justifyContent:'space-evenly',

  },
  imageContainer: {
    width: '100%',
    height: '40%',
  },
  infoScrollContainer: {
    width: '100%',
    height: '60%',
  },
  rhythmTime: {
    fontSize:25, 
    fontWeight: "900", 
    width:'30%'
  },
  rhythmName: {
    fontSize:25, 
    fontWeight: "700", 
    width:'55%', 
    textAlign:'center',
  },
  rhythmImage: {
    height:undefined, 
    width:'90%', 
    alignSelf:'center', 
    aspectRatio:2.7
  }
})