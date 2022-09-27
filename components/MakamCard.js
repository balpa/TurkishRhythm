import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, Platform, ScrollView } from 'react-native'
import React, {useState, useEffect} from 'react'
import { ForceTouchGestureHandler } from 'react-native-gesture-handler'

const MakamCard = ({ makamName, color, imageURI, makamInfo, theme }) => {

  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState("")
  const [shadowOptions, setShadowOptions] = useState({})

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


  const yAnim = React.useRef(new Animated.Value(0)).current
  const borderRadiusAnim = React.useRef(new Animated.Value(0)).current
  const marginAnim = React.useRef(new Animated.Value(0)).current
  const opacityAnim = React.useRef(new Animated.Value(0)).current


  function showInfoPanel(){
    
    if (!isOpen){
      setIsOpen(true)

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

  //TODO: SCROLLWIEW NOT WORKING ON ANDROID
  return (
    <View style={[styles.rhythmCardContainer, shadowOptions ,{backgroundColor: `#${color}`}]}>
      <TouchableOpacity style={{width:'100%'}} onPress={()=>showInfoPanel()}>
        <View style={{width:'100%', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
            <Text 
              style={{
                fontSize:25, 
                fontWeight: "700", 
                width:'75%', 
                textAlign:'center'}}>{makamName}</Text>
        </View>
      </TouchableOpacity>
      {isOpen && 
      <Animated.View 
        style={[
          styles.rhythmInfoContainer, 
          {height: yAnim, borderRadius: borderRadiusAnim, margin: marginAnim }]}>
        <Animated.View 
          style={[
            styles.imageContainer, 
            {opacity: opacityAnim}]}>
          <Image source={imageURI} style={{height:undefined, width:'90%', alignSelf:'center', aspectRatio:2.7}}/>
        </Animated.View>

        <Animated.View style={[styles.infoScrollContainer, {opacity: opacityAnim}]}>

          <ScrollView>
            <Text>
              {makamInfo}
            </Text>
          </ScrollView>

        </Animated.View>

      </Animated.View>
      }
    </View>
  )
}

export default MakamCard


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
    flex: 1
  }
})