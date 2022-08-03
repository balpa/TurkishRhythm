import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Icon } from 'react-native-elements'

const LanguageSettings = () => {

  const [isExpanded, setIsExpanded] = React.useState(false)
  const [checkedLanguage, setCheckedLanguage] = React.useState('Turkish')
  //todo: write and get language info from AsyncStorage

  const expandAnimation = React.useRef(new Animated.Value(40)).current
  const insideOpacity = React.useRef(new Animated.Value(0)).current
  const letterSpacingAnim = React.useRef(new Animated.Value(0)).current


  function expandLabel(){
    if (!isExpanded){
      setIsExpanded(true)
      Animated.timing(expandAnimation,{
        toValue: 200,
        duration: 500,
        useNativeDriver: false
      }).start(()=>{
        Animated.timing(insideOpacity,{
          toValue: 1,
          duration: 200,
          useNativeDriver: false
        }).start(()=>{
          Animated.timing(letterSpacingAnim,{
            toValue:3,
            duration:700,
            useNativeDriver:false
          }).start()
        })
      })
    } else {
      Animated.timing(insideOpacity,{
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(()=>{
        Animated.timing(expandAnimation,{
          toValue: 40,
          duration: 400,
          useNativeDriver: false
        }).start(()=>{
          Animated.timing(letterSpacingAnim,{
            toValue:0,
            duration:700,
            useNativeDriver:false
          }).start() 
        }) 
    })
    setTimeout(()=>{
      setIsExpanded(false)
    },700)
    }
  }

  //todo: checked language function (change lang actually)
  function LanguageInside(){
    return (
      <Animated.View style={[styles.languageInsideContainer, {opacity: insideOpacity}]}>
        <View style={{width:'100%', height:'100%',flexDirection:'row', alignItems:'center', justifyContent:'space-evenly'}}>
          <View style={{flex: 1}}>
            <TouchableOpacity onPress={()=>setCheckedLanguage('Turkish')}>
              <View>
                <Icon 
                  name={checkedLanguage == 'Turkish' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  color={checkedLanguage == 'Turkish' ? 'crimson' : 'black'}/>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setCheckedLanguage('English')}>
              <View>
                <Icon 
                  name={checkedLanguage == 'English' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  color={checkedLanguage == 'English' ? 'crimson' : 'black'} />
              </View>
            </TouchableOpacity> 
          </View>
          <View style={{flex: 1, alignItems:'flex-start', justifyContent: 'center'}}>
            <Text 
              style={checkedLanguage == 'Turkish' 
              ? {
                  textDecorationLine:'underline',
                  marginBottom:5,
                  fontSize:15,
                  fontWeight:'800'
                }
              :
                {
                  textDecorationLine:'none',
                  marginBottom:5,
                  fontSize: 15,
                  fontWeight:'800'
                }
              }>Turkish</Text>
            <Text 
              style={checkedLanguage == 'English'
              ? {
                  textDecorationLine:'underline',
                  marginTop:5,
                  fontSize: 15,
                  fontWeight: '800'
                }
              : 
                {
                  textDecorationLine:'none',
                  marginTop:5,
                  fontSize: 15,
                  fontWeight:'800'
                }
              }>English</Text>
          </View>
        </View>
      </Animated.View>
    )
  }

  // todo: expanded panel inside
  return (
    <Animated.View style={styles.container}>
      <Animated.View style={[styles.optionLabel, {height: expandAnimation}]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={()=>expandLabel()}  
          style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
          <Animated.Text style={[styles.languageFont, {letterSpacing: letterSpacingAnim}]}>Language</Animated.Text>
          {isExpanded && <LanguageInside />}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

export default LanguageSettings

const styles = StyleSheet.create({
  container: {
    width:'100%',
    minHeight: 60,
    alignItems:'center',
  },
  languageFont: {
    position:'absolute',
    top:10,
    fontSize:15
  },
  optionLabel: {
    width:'100%',
    height: 30,
    backgroundColor:'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  },
  languageInsideContainer: {
    width:'80%',
    height:'50%',
    backgroundColor:'white',
    borderRadius: 10,
  },
  fontTurkish:{
    marginBottom: 5,
    fontSize: 15,
    fontWeight:'800'
  },
  fontEnglish: {
    marginTop: 5,
    fontSize: 15,
    fontWeight:'800'
  }


})