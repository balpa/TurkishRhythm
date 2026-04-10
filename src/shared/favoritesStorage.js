import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  MAKAM_FAVORITES: '@favorites_makams',
  RHYTHM_FAVORITES: '@favorites_rhythms',
}

export const getMakamFavorites = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.MAKAM_FAVORITES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const getRhythmFavorites = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.RHYTHM_FAVORITES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const toggleMakamFavorite = async (key) => {
  try {
    const favorites = await getMakamFavorites()
    const index = favorites.indexOf(key)
    if (index >= 0) {
      favorites.splice(index, 1)
    } else {
      favorites.push(key)
    }
    await AsyncStorage.setItem(KEYS.MAKAM_FAVORITES, JSON.stringify(favorites))
    return favorites
  } catch {
    return []
  }
}

export const toggleRhythmFavorite = async (key) => {
  try {
    const favorites = await getRhythmFavorites()
    const index = favorites.indexOf(key)
    if (index >= 0) {
      favorites.splice(index, 1)
    } else {
      favorites.push(key)
    }
    await AsyncStorage.setItem(KEYS.RHYTHM_FAVORITES, JSON.stringify(favorites))
    return favorites
  } catch {
    return []
  }
}
