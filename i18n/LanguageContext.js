import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr')

  useEffect(() => {
    AsyncStorage.getItem('@language').then(val => {
      if (val === 'en' || val === 'tr') setLanguage(val)
    })
  }, [])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    AsyncStorage.setItem('@language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
