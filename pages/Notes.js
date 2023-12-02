import { View, StyleSheet, Text } from 'react-native'
import React from 'react'

const Notes = () => {
  return (
    <View style={styles.container}>
        <Text>add notes here. can store locally and search from etc.</Text>
    </View>
  )
}

export default Notes

const styles = StyleSheet.create({
  container:{
    width: '100%',
    height: '100%',
    alignItems: 'center',
    padding: 10,
  },
  optionLabel:{
    width: '90%',
    height: 40,
    backgroundColor: 'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  }

})