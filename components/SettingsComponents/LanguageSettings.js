import { View, Text, Animated, StyleSheet, TouchableOpacity, Button } from 'react-native'
import React, {useState,useEffect} from 'react'
import { Icon } from 'react-native-elements'
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageSettings = ({language}) => {

  const LANGUAGE_TEXT = language == 'Turkish' ? 'Dil' : 'Language'
  const TURKISH_TEXT = language == 'Turkish' ? 'Türkçe' : 'Turkish'
  const ENGLISH_TEXT = language == 'Turkish' ? 'İngilizce' : 'English'
  const APPLY_TEXT = language == 'Turkish' ? 'Uygula' : 'Apply'

  const [languageFromCache, setLanguageFromCache] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [checkedLanguage, setCheckedLanguage] = useState('Turkish')
  //todo: write and get language info from AsyncStorage

  const expandAnimation = React.useRef(new Animated.Value(40)).current
  const insideOpacity = React.useRef(new Animated.Value(0)).current
  const letterSpacingAnim = React.useRef(new Animated.Value(0)).current
  const applyButtonAnim = React.useRef(new Animated.Value(0)).current


  const setLanguageToAsyncStorage = async() => {
    try {await AsyncStorage.setItem('@language', checkedLanguage)} // set lang data to cache storage
    catch (e) {console.log(e)}
  }
  
  const submitLanguage = () => {
    setLanguageToAsyncStorage()
    setTimeout(()=>{expandLabel()},400)
  }

  useEffect(async()=>{      // get language data from local storage (cache)
    try {
      const value = await AsyncStorage.getItem('@language')
      if(value !== null) setLanguageFromCache(value);console.log('LANGUAGE: ', value);setCheckedLanguage(value)
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
              duration: 100,
              useNativeDriver:false
            }).start()
          })
        })
      })
    } else {
      Animated.timing(applyButtonAnim,{
        toValue: 0,
        duration: 100,
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
            <TouchableOpacity onPress={()=>setCheckedLanguage('Turkish')}>
              <View>
                <Icon 
                  name={checkedLanguage == 'Turkish' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  color={checkedLanguage == 'Turkish' ? '#774360' : 'black'}/>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setCheckedLanguage('English')}>
              <View>
                <Icon 
                  name={checkedLanguage == 'English' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  color={checkedLanguage == 'English' ? '#774360' : 'black'} />
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
              }>{TURKISH_TEXT}</Text>
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
              }>{ENGLISH_TEXT}</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.9} style={{width:'100%', height:'100%'}}>
        <Animated.View 
          style={[styles.applyButton, {height:applyButtonAnim}]}>
          <TouchableOpacity onPress={()=>{submitLanguage()}} style={{width:'100%', height: '100%', justifyContent:'center', alignItems:'center'}}>
            <Text style={{color:'#774360', fontWeight:'700'}}>{APPLY_TEXT}</Text>
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
          <Animated.Text style={[styles.languageFont, {letterSpacing: letterSpacingAnim}]}>{LANGUAGE_TEXT}</Animated.Text>
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
  applyButton: {
    width:'40%',
    height: 30,
    backgroundColor:'wheat',
    alignSelf:'center',
    justifyContent:'center',
    alignItems:'center',
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
  },
  languageFont: {
    position:'absolute',
    top:10,
    fontSize:17,
    fontWeight:'800'
  },
  optionLabel: {
    width:'100%',
    height: 30,
    backgroundColor:'#774360',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  },
  languageInsideContainer: {
    width:'80%',
    height:'50%',
    backgroundColor:'wheat',
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