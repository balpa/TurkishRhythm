import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Icon } from 'react-native-elements'
import { WebView } from 'react-native-webview'

const { width } = Dimensions.get('window')

const COLORS = {
  bg: '#1B1B2F',
  surface: '#262640',
  text: '#F0E6D3',
  textDim: '#9090B0',
  accent: '#E45A84',
}

const NoteViewer = ({ route, navigation }) => {
  const { note } = route.params
  const isImage = note.file_type?.startsWith('image/')
  const isPdf = note.file_type === 'application/pdf'
  const [loading, setLoading] = useState(true)

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="close" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{note.file_name}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.content}>
        {isImage && (
          <>
            {loading && (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLORS.accent} />
              </View>
            )}
            <Image
              source={{ uri: note.file_url }}
              style={styles.fullImage}
              resizeMode="contain"
              onLoadEnd={() => setLoading(false)}
            />
          </>
        )}

        {isPdf && (
          <WebView
            source={{ uri: note.file_url }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLORS.accent} />
              </View>
            )}
          />
        )}

        {!isImage && !isPdf && (
          <View style={styles.unsupported}>
            <Icon name="insert-drive-file" color={COLORS.textDim} size={64} />
            <Text style={styles.unsupportedText}>{note.file_name}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default NoteViewer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.bg,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
  },
  fullImage: {
    flex: 1,
    width: width,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  unsupported: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  unsupportedText: {
    color: COLORS.textDim,
    fontSize: 14,
  },
})
