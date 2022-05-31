import { View, Text, StyleSheet, Animated, Image } from 'react-native'
import React, {useState, useEFfect} from 'react'
import { ForceTouchGestureHandler, ScrollView, TouchableOpacity } from 'react-native-gesture-handler'

const RhythmCard = ({ rhythmName, rhythmTime, color, imageURI, infoText }) => {

  // TODO: name and time styling

  const [isOpen, setIsOpen] = useState(false)

  const yAnim = React.useRef(new Animated.Value(0)).current
  const borderRadiusAnim = React.useRef(new Animated.Value(0)).current
  const marginAnim = React.useRef(new Animated.Value(0)).current
  const opacityAnim = React.useRef(new Animated.Value(0)).current


  function showInfoPanel(){
    
    if (!isOpen){
      setIsOpen(true)

      Animated.timing(yAnim, {        // opening animation
        toValue: 300,
        duration: 500,
        useNativeDriver: false
      }).start(()=>{
          Animated.timing(borderRadiusAnim, {
            toValue: 20,
            duration: 300,
            useNativeDriver: false
          }).start(()=>{
            Animated.timing(marginAnim, {
              toValue: 20,
              duration: 300,
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
        duration: 300,
        useNativeDriver: false
      }).start(()=>{
        Animated.timing(borderRadiusAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }).start(()=>{
          Animated.timing(yAnim, {      // closing animation
            toValue: 0,
            duration: 500,
            useNativeDriver: false
          }).start()
    })})})
      setTimeout(() => {          // timeout for waiting the closing animation to finish
        setIsOpen(false)
      },1300)
    }

  }


  return (
    <View style={[styles.rhythmCardContainer, styles.shadow, {backgroundColor: `#${color}`}]}>
      <TouchableOpacity style={{width:'100%'}} onPress={()=>showInfoPanel()}>
        <View style={{width:'100%', flexDirection:'row'}}>
            <Text style={{fontSize:25, fontWeight: "900", width:'30%'}}>{rhythmTime}</Text>
            <Text style={{fontSize:25, fontWeight: "700", width:'50%', textAlign:'center'}}>{rhythmName}</Text>
        </View>
      </TouchableOpacity>
      {isOpen && 
      <Animated.View style={[styles.rhythmInfoContainer, {height: yAnim, borderRadius: borderRadiusAnim, margin: marginAnim }]}>

        <Animated.View style={[styles.imageContainer, {opacity: opacityAnim}]}>
          <Image source={imageURI} style={{height:undefined, width:'90%', alignSelf:'center', aspectRatio:2.7}}/>
        </Animated.View>

        <Animated.View style={[styles.infoScrollConrainer, {opacity: opacityAnim}]}>
          <ScrollView>
            <Text>
              {infoText}
            </Text>
            <Text>DİNLE BUTONU:TODO</Text>
          </ScrollView>
        </Animated.View>

      </Animated.View>
      }
    </View>
  )
}

export default RhythmCard


const styles = StyleSheet.create({
  rhythmCardContainer: {
    width: "90%",
    minHeight: 100,
    height: "auto",
    margin: 5,
    borderRadius: 20,
    padding: 10,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center'

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
  infoScrollConrainer: {
    width: '100%',
  }
})