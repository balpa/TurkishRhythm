import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native'
import React, { useState } from 'react'
import { Icon } from 'react-native-elements'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

const COLORS = {
  bg: '#1B1B2F',
  surface: '#262640',
  accent: '#E45A84',
  border: '#3A3A5C',
  text: '#F0E6D3',
  textDim: '#9090B0',
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

const FilePreview = ({ file, onRemove }) => {
  const isImage = IMAGE_TYPES.includes(file.mimeType)
  const ext = file.name?.split('.').pop()?.toUpperCase() || '?'

  return (
    <View style={styles.previewItem}>
      {isImage ? (
        <Image source={{ uri: file.uri }} style={styles.previewImage} />
      ) : (
        <View style={styles.filePreview}>
          <Icon name="picture-as-pdf" color={COLORS.accent} size={36} />
          <Text style={styles.fileExt}>{ext}</Text>
          <Text style={styles.fileName} numberOfLines={2}>{file.name}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.removeButton} activeOpacity={0.7} onPress={onRemove}>
        <Icon name="close" color="#fff" size={16} />
      </TouchableOpacity>
    </View>
  )
}

const CreateNote = ({ route, navigation }) => {
  const { language } = useLanguage()
  const { chorus } = route.params
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'],
      multiple: true,
      copyToCacheDirectory: true,
    })

    if (!result.canceled && result.assets) {
      setFiles(prev => [...prev, ...result.assets])
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      for (const file of files) {
        const ext = file.name?.split('.').pop() || 'bin'
        const filePath = `${chorus.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        })
        const arrayBuffer = decode(base64)

        const { error: storageError } = await supabase.storage
          .from('notes')
          .upload(filePath, arrayBuffer, {
            contentType: file.mimeType || 'application/octet-stream',
          })

        if (storageError) {
          console.log('Storage upload error:', storageError.message)
          Alert.alert(t(language, 'createNote.errorTitle'), storageError.message)
          setUploading(false)
          return
        }

        const { data: urlData } = supabase.storage.from('notes').getPublicUrl(filePath)

        const { error: dbError } = await supabase.from('notes').insert({
          chorus_id: chorus.id,
          uploaded_by: user.id,
          file_url: urlData.publicUrl,
          file_name: file.name || `file.${ext}`,
          file_type: file.mimeType || 'application/octet-stream',
        })

        if (dbError) {
          console.log('DB insert error:', dbError.message)
          Alert.alert(t(language, 'createNote.errorTitle'), dbError.message)
          setUploading(false)
          return
        }
      }

      navigation.goBack()
    } catch (err) {
      console.log('Upload error:', err.message)
      Alert.alert(t(language, 'createNote.errorTitle'), err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t(language, 'createNote.title')}</Text>
        <TouchableOpacity
          style={[styles.uploadButton, files.length === 0 && styles.uploadButtonDisabled]}
          activeOpacity={0.7}
          onPress={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.uploadText, files.length === 0 && styles.uploadTextDisabled]}>
              {t(language, 'createNote.upload')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.chorusLabel}>{chorus.name}</Text>

        {files.length > 0 && (
          <View style={styles.previewGrid}>
            {files.map((file, index) => (
              <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addArea} activeOpacity={0.7} onPress={pickFiles}>
          <Icon name="note-add" color={COLORS.textDim} size={40} />
          <Text style={styles.addText}>{t(language, 'createNote.pickFile')}</Text>
          <Text style={styles.addSubtext}>{t(language, 'createNote.formats')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default CreateNote

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  uploadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  uploadButtonDisabled: {
    backgroundColor: COLORS.surface,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  uploadTextDisabled: {
    color: COLORS.textDim,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  chorusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDim,
    marginBottom: 16,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  previewItem: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: 160,
    height: 200,
    resizeMode: 'cover',
  },
  filePreview: {
    width: 160,
    height: 200,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  fileExt: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 1,
  },
  fileName: {
    fontSize: 11,
    color: COLORS.textDim,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addArea: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  addText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  addSubtext: {
    fontSize: 12,
    color: COLORS.border,
  },
})
