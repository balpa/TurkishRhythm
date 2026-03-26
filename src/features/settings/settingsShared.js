import { Animated } from 'react-native'
import { COLORS } from '../../shared/theme/colors'

export { COLORS }

export const createModalAnimation = (animatedValue) => ({
  opacity: animatedValue,
  transform: [
    {
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.85, 1],
      }),
    },
  ],
})

export const openModalAnimation = (animatedValue) => {
  animatedValue.setValue(0)
  Animated.spring(animatedValue, {
    toValue: 1,
    friction: 7,
    tension: 80,
    useNativeDriver: true,
  }).start()
}

export const closeModalAnimation = (animatedValue, onComplete) => {
  Animated.timing(animatedValue, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  }).start(({ finished }) => {
    if (finished && onComplete) {
      onComplete()
    }
  })
}

export const formatProfileDate = (value, language) => {
  if (!value) return '-'

  try {
    return new Date(value).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return value
  }
}
