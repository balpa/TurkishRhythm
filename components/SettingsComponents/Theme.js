import { View, Text, Animated, StyleSheet, TouchableOpacity, Button } from 'react-native'
import React, {useState,useEffect} from 'react'
import { Icon } from 'react-native-elements'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Theme = ({language}) => {

  const THEME_TEXT = language == 'Turkish' ? 'Tema' : 'Theme'
  const DARKMODE_TEXT = language == 'Turkish' ? 'Karanlık' : 'Dark'
  const LIGHTMODE_TEXT = language == 'Turkish' ? 'Aydınlık' : 'Light'
  const APPLY_TEXT = language == 'Turkish' ? 'Uygula' : 'Apply'

  const [themeFromCache, setThemeFromCache] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [checkedTheme, setCheckedTheme] = useState('Dark')
  //todo: write and get language info from AsyncStorage

  const expandAnimation = React.useRef(new Animated.Value(40)).current
  const insideOpacity = React.useRef(new Animated.Value(0)).current
  const letterSpacingAnim = React.useRef(new Animated.Value(0)).current
  const applyButtonAnim = React.useRef(new Animated.Value(0)).current


  const setThemeToAsyncStorage = async() => {
    try {await AsyncStorage.setItem('@theme', checkedTheme)} // set lang data to cache storage
    catch (e) {console.log(e)}
  }
  
  const submitTheme = () => {
    setThemeToAsyncStorage()
    setTimeout(()=>{expandLabel()},400)
  }

  useEffect(async()=>{      // get theme data from local storage (cache)
    try {
      const value = await AsyncStorage.getItem('@theme')
      if(value !== null) setThemeFromCache(value);console.log('Theme: ', value);setCheckedTheme(value)
    } catch(e) {console.log(e)}
  },[])


  const expandLabel = () => {
    if (!isExpanded){
      setIsExpanded(true)
      Animated.timing(expandAnimation,{
        toValue: 200,
        duration: 200,
        useNativeDriver: false
      }).start(()=>{
        Animated.timing(insideOpacity,{
          toValue: 1,
          duration: 200,
          useNativeDriver: false
        }).start(()=>{
          Animated.timing(letterSpacingAnim,{
            toValue:3,
            duration:200,
            useNativeDriver:false
          }).start(()=>{
            Animated.timing(applyButtonAnim,{
              toValue: 30,
              duration: 500,
              useNativeDriver:false
            }).start()
          })
        })
      })
    } else {
      Animated.timing(applyButtonAnim,{
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start(()=>{
        Animated.timing(insideOpacity,{
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }).start(()=>{
          Animated.timing(expandAnimation,{
            toValue: 40,
            duration: 200,
            useNativeDriver: false
          }).start(()=>{
            Animated.timing(letterSpacingAnim,{
              toValue:0,
              duration:200,
              useNativeDriver:false
            }).start() 
          }) 
      })
      })
    setTimeout(()=>{
      setIsExpanded(false)
    },700)
    }
  }

  //todo: checked language function (change lang actually)
  const LanguageInside = () => {
    return (
      <Animated.View style={[styles.languageInsideContainer, {opacity: insideOpacity}]}>
        <View style={{width:'100%', height:'100%',flexDirection:'row', alignItems:'center', justifyContent:'space-evenly'}}>
          <View style={{flex: 1}}>
            <TouchableOpacity onPress={()=>setCheckedTheme('Dark')}>
              <View>
                <Icon 
                  name={checkedTheme == 'Dark' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  color={checkedTheme == 'Dark' ? 'crimson' : 'black'}/>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setCheckedTheme('Light')}>
              <View>
                <Icon 
                  name={checkedTheme == 'Light' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  color={checkedTheme == 'Light' ? 'crimson' : 'black'} />
              </View>
            </TouchableOpacity> 
          </View>
          <View style={{flex: 1, alignItems:'flex-start', justifyContent: 'center'}}>
            <Text 
              style={checkedTheme == 'Dark' 
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
              }>{DARKMODE_TEXT}</Text>
            <Text 
              style={checkedTheme == 'Light'
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
              }>{LIGHTMODE_TEXT}</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.9} style={{width:'100%', height:'100%'}}>
        <Animated.View 
          style={[styles.applyButton, {height:applyButtonAnim}]}>
          <TouchableOpacity onPress={()=>{submitTheme()}} style={{width:'100%', height: '100%', justifyContent:'center', alignItems:'center'}}>
            <Text style={{color:'crimson'}}>{APPLY_TEXT}</Text>
          </TouchableOpacity>
        </Animated.View>
        </TouchableOpacity>
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
          <Animated.Text style={[styles.languageFont, {letterSpacing: letterSpacingAnim}]}>{THEME_TEXT}</Animated.Text>
          {isExpanded && <LanguageInside />}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

export default Theme

const styles = StyleSheet.create({
  container: {
    width:'100%',
    minHeight: 60,
    alignItems:'center',
  },
  applyButton: {
    width:'40%',
    height: 30,
    backgroundColor:'white',
    alignSelf:'center',
    justifyContent:'center',
    alignItems:'center',
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
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