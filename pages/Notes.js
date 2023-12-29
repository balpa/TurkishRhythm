import { View, StyleSheet, Text } from 'react-native'
import React from 'react'

const Notes = () => {
  return (
    <View style={styles.container}>
        <View style={styles.existingNotesWrapper}></View>
        <View style={styles.uploadNoteWrapper}>
          <View style={styles.uploadButton}>
            <Text>Upload</Text>
          </View>
        </View>
    </View>
  )
}

export default Notes

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0DBDB',
    paddingTop: 10
  },
  optionLabel: {
    width: '90%',
    height: 40,
    backgroundColor: 'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  },
  existingNotesWrapper: {
    width: '100%',
    height: '90%',
    backgroundColor: 'red'
  },
  uploadNoteWrapper: {
    width: '100%',
    height: '10%',
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadButton: {
    width: '5pt',
    height: '50pt',
    backgroundColor: 'yellow'
  }
})