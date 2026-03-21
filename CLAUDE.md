# Koma

A React Native / Expo educational app for learning Turkish classical music — makams (melodic modes), rhythms (usul), and rhythm training via a metronome.

## Tech Stack

- **React Native 0.76** with **Expo SDK 52**
- **React 18.3**
- **React Navigation 6** (Material Top Tabs) for tab-based navigation
- **expo-av** for audio (note: deprecated in SDK 53+, migrate to `expo-audio` when upgrading further)
- **AsyncStorage** for persisting user preferences (theme, language)
- **react-native-elements** for icons and UI primitives
- **react-native-reanimated 3.x** available but most animations use the core `Animated` API
- **Babel** configured with `react-native-reanimated/plugin`

## Project Structure

```
App.js                  # Entry point — top tab navigator with 4 tabs (Makams, Rhythms, Notes, Metronomy)
pages/                  # Screen-level components
  Makams.js             # Lists 16 Turkish makams with expandable cards
  Rhythms.js            # Lists 11 Turkish rhythms with expandable cards
  Metronomy.js          # Tap-based rhythm accuracy trainer
  Notes.js              # Placeholder — not yet implemented
  Intro.js              # Splash screen (auto-dismiss after 2.5s)
  Settings.js           # Container for settings sub-components
  Tuner.js              # Stub — not yet functional
components/
  MakamCard.js          # Expandable card for makam info (animated expand/collapse)
  RhythmCard.js         # Expandable card for rhythm info (nearly identical to MakamCard)
  SettingsComponents/
    LanguageSettings.js # Turkish/English language toggle (AsyncStorage)
    Theme.js            # Dark/Light theme toggle (AsyncStorage)
    About.js            # Simple credits panel
  TunerComponents/
    Tuner.js            # Audio recording stub using expo-av
data/
  data.js               # All makam and rhythm content (Turkish-language descriptions)
assets/                 # Rhythm images (PNG), fonts, icons, logo
```

## Commands

```bash
npm start        # Start Expo dev server
npm run android  # Start on Android
npm run ios      # Start on iOS
npm run web      # Start on web
```

## Key Patterns

- **Animation-heavy UI**: MakamCard and RhythmCard use chained `Animated.timing`/`Animated.spring` sequences for expand/collapse effects. Metronomy uses bounce and spring animations for tap feedback.
- **Color randomization**: Makams and Rhythms pages shuffle a color palette on mount via `useRef` + `useEffect`.
- **Localization**: Turkish is the primary language. English is partially supported. Language is stored in AsyncStorage (`@language`) and passed via props — there is no global context provider.
- **Theme**: Stored in AsyncStorage (`@theme`), passed via props. Dark/Light mode support.
- **Data is static**: All makam/rhythm content lives in `data/data.js` as plain JS objects with string descriptions.

## Known TODOs in Code

- `Metronomy.js`: Timing calculation logic marked as incorrect
- `Notes.js`: Entire page is a placeholder
- `Tuner.js` / `TunerComponents/Tuner.js`: Audio recording works but no pitch detection
- `Theme.js`: Theme/language caching issues on Android noted
- `About.js`: Animation incomplete

## Style Notes

- All UI text is primarily in Turkish
- The app uses a pastel pink color scheme (`#F0DBDB` base)
- No TypeScript — plain JavaScript throughout
- No testing framework configured
- No linter configured
