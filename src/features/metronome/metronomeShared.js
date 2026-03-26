import { Dimensions } from 'react-native'
import { COLORS } from '../../shared/theme/colors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export { COLORS }
export const TAP_BUTTON_SIZE = SCREEN_WIDTH * 0.48
export const MAX_HISTORY_DOTS = 8
