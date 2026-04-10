import * as FileSystem from 'expo-file-system'
import Pitchfinder from 'pitchfinder'

// Turkish classical music note names mapped to Western equivalents
// Based on the Bolahenk (A4 = 440Hz) standard tuning
export const TURKISH_NOTES = [
  { name: 'Kaba Çargâh', western: 'C3', freq: 130.81 },
  { name: 'Yegâh', western: 'D3', freq: 146.83 },
  { name: 'Kaba Nim Hicaz', western: 'Eb3', freq: 155.56 },
  { name: 'Kaba Hicaz', western: 'E3', freq: 164.81 },
  { name: 'Hüseyni Aşiran', western: 'E3+', freq: 170.00 },
  { name: 'Acem Aşiran', western: 'F3', freq: 174.61 },
  { name: 'Irak', western: 'F#3', freq: 185.00 },
  { name: 'Rast', western: 'G3', freq: 196.00 },
  { name: 'Nim Zirgüle', western: 'Ab3', freq: 207.65 },
  { name: 'Dügâh', western: 'A3', freq: 220.00 },
  { name: 'Kürdi', western: 'Bb3', freq: 233.08 },
  { name: 'Segâh', western: 'B3-', freq: 240.00 },
  { name: 'Buselik', western: 'B3', freq: 246.94 },
  { name: 'Çargâh', western: 'C4', freq: 261.63 },
  { name: 'Nim Hicaz', western: 'Db4', freq: 277.18 },
  { name: 'Hicaz', western: 'D4-', freq: 285.00 },
  { name: 'Sabâ', western: 'D4-', freq: 290.00 },
  { name: 'Nevâ', western: 'D4', freq: 293.66 },
  { name: 'Nim Hisar', western: 'Eb4', freq: 311.13 },
  { name: 'Hisar', western: 'E4-', freq: 320.00 },
  { name: 'Hüseyni', western: 'E4', freq: 329.63 },
  { name: 'Acem', western: 'F4', freq: 349.23 },
  { name: 'Eviç', western: 'F#4', freq: 369.99 },
  { name: 'Gerdâniye', western: 'G4', freq: 392.00 },
  { name: 'Nim Şehnaz', western: 'Ab4', freq: 415.30 },
  { name: 'Şehnaz', western: 'A4-', freq: 430.00 },
  { name: 'Muhayyer', western: 'A4', freq: 440.00 },
  { name: 'Sünbüle', western: 'Bb4', freq: 466.16 },
  { name: 'Tiz Segâh', western: 'B4-', freq: 480.00 },
  { name: 'Tiz Buselik', western: 'B4', freq: 493.88 },
  { name: 'Tiz Çargâh', western: 'C5', freq: 523.25 },
  { name: 'Tiz Nevâ', western: 'D5', freq: 587.33 },
]

const WESTERN_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Get the closest note info for a given frequency
 */
export const getNoteInfo = (frequency) => {
  if (!frequency || frequency < 50 || frequency > 2000) return null

  // Find closest Turkish note
  let closestTurkish = TURKISH_NOTES[0]
  let minDiff = Infinity

  for (const note of TURKISH_NOTES) {
    const diff = Math.abs(frequency - note.freq)
    if (diff < minDiff) {
      minDiff = diff
      closestTurkish = note
    }
  }

  // Calculate cents deviation from closest Turkish note
  const cents = Math.round(1200 * Math.log2(frequency / closestTurkish.freq))

  // Also get standard Western note
  const semitone = 12 * Math.log2(frequency / 440) + 69
  const roundedSemitone = Math.round(semitone)
  const octave = Math.floor(roundedSemitone / 12) - 1
  const noteIndex = ((roundedSemitone % 12) + 12) % 12
  const westernName = `${WESTERN_NOTES[noteIndex]}${octave}`

  return {
    turkishName: closestTurkish.name,
    westernName,
    cents,
    frequency: Math.round(frequency * 10) / 10,
    referenceFreq: closestTurkish.freq,
  }
}

/**
 * Detect pitch from a WAV file URI
 * Uses YIN algorithm from pitchfinder
 */
export const detectPitch = async (uri) => {
  try {
    // Read the WAV file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    // Decode base64 to buffer
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Parse WAV header to get PCM data
    const pcmData = parseWavPCM(bytes.buffer)
    if (!pcmData || pcmData.length < 1024) return null

    // Use YIN algorithm for pitch detection
    const detectPitchFn = Pitchfinder.YIN({ sampleRate: 44100 })
    const pitch = detectPitchFn(pcmData)

    return pitch
  } catch (e) {
    return null
  }
}

/**
 * Parse WAV file buffer to extract PCM float samples
 */
const parseWavPCM = (arrayBuffer) => {
  try {
    const view = new DataView(arrayBuffer)

    // Verify WAV header
    const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))
    if (riff !== 'RIFF') return null

    const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11))
    if (wave !== 'WAVE') return null

    // Find data chunk
    let offset = 12
    let dataOffset = 0
    let dataSize = 0
    let bitsPerSample = 16
    let numChannels = 1

    while (offset < view.byteLength - 8) {
      const chunkId = String.fromCharCode(
        view.getUint8(offset), view.getUint8(offset + 1),
        view.getUint8(offset + 2), view.getUint8(offset + 3)
      )
      const chunkSize = view.getUint32(offset + 4, true)

      if (chunkId === 'fmt ') {
        numChannels = view.getUint16(offset + 10, true)
        bitsPerSample = view.getUint16(offset + 22, true)
      } else if (chunkId === 'data') {
        dataOffset = offset + 8
        dataSize = chunkSize
        break
      }

      offset += 8 + chunkSize
    }

    if (dataOffset === 0 || dataSize === 0) return null

    // Convert to float32 array
    const bytesPerSample = bitsPerSample / 8
    const numSamples = Math.floor(dataSize / (bytesPerSample * numChannels))
    const floatData = new Float32Array(numSamples)

    for (let i = 0; i < numSamples; i++) {
      const sampleOffset = dataOffset + i * bytesPerSample * numChannels

      if (sampleOffset + bytesPerSample > view.byteLength) break

      if (bitsPerSample === 16) {
        const sample = view.getInt16(sampleOffset, true)
        floatData[i] = sample / 32768
      } else if (bitsPerSample === 32) {
        const sample = view.getFloat32(sampleOffset, true)
        floatData[i] = sample
      } else if (bitsPerSample === 8) {
        const sample = view.getUint8(sampleOffset)
        floatData[i] = (sample - 128) / 128
      }
    }

    return floatData
  } catch (e) {
    return null
  }
}
