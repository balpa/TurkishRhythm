import { Dimensions } from 'react-native'
import { COLORS } from '../../shared/theme/colors'
import { RHYTHM_LIBRARY_BY_KEY } from '../../../data/data'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export { COLORS }
export const TAP_BUTTON_SIZE = SCREEN_WIDTH * 0.48
export const MAX_HISTORY_DOTS = 8
export const PRACTICE_PAD_SIZE = SCREEN_WIDTH * 0.38
export const DEFAULT_PRACTICE_RHYTHM_KEY = 'semai'

export const getPracticeRhythm = (rhythmKey = DEFAULT_PRACTICE_RHYTHM_KEY) => (
  RHYTHM_LIBRARY_BY_KEY[rhythmKey] || RHYTHM_LIBRARY_BY_KEY[DEFAULT_PRACTICE_RHYTHM_KEY]
)
