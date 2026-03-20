import { View, StyleSheet, Text } from 'react-native'
import React from 'react'

const Notes = () => {
  return (
    <View style={styles.container}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>{'🎵'}</Text>
        <Text style={styles.emptyTitle}>Notalar</Text>
        <Text style={styles.emptySubtitle}>Yakında burada notalarınızı görüntüleyebileceksiniz</Text>
      </View>
    </View>
  )
}

export default Notes

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1B1B2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F0E6D3',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9090B0',
    textAlign: 'center',
    lineHeight: 22,
  },
})
