// Flashcard data derived from makam properties
// Each card has a question (front) and answer (back)

export const FLASHCARD_DECKS = {
  duragi: {
    id: 'duragi',
    cards: [
      { id: 'duragi_hicaz', makam: 'Hicaz', answer: 'Dügâh' },
      { id: 'duragi_nihavend', makam: 'Nihavend', answer: 'Rast' },
      { id: 'duragi_ussak', makam: 'Uşşak', answer: 'Dügâh' },
      { id: 'duragi_kurdi', makam: 'Kürdi', answer: 'Dügâh' },
      { id: 'duragi_rast', makam: 'Rast', answer: 'Rast' },
      { id: 'duragi_karcigar', makam: 'Karcığar', answer: 'Dügâh' },
      { id: 'duragi_kurdilihicazkar', makam: 'Kürdilihicazkâr', answer: 'Dügâh' },
      { id: 'duragi_segah', makam: 'Segâh', answer: 'Segâh' },
      { id: 'duragi_huzzam', makam: 'Hüzzam', answer: 'Segâh' },
      { id: 'duragi_sehnaz', makam: 'Şehnaz', answer: 'Dügâh' },
      { id: 'duragi_evic', makam: 'Eviç', answer: 'Segâh' },
      { id: 'duragi_cargah', makam: 'Çargâh', answer: 'Çargâh' },
      { id: 'duragi_buselik', makam: 'Buselik', answer: 'Dügâh' },
      { id: 'duragi_beyati', makam: 'Beyati', answer: 'Dügâh' },
      { id: 'duragi_muhayyer', makam: 'Muhayyer', answer: 'Dügâh' },
      { id: 'duragi_saba', makam: 'Saba', answer: 'Dügâh' },
    ],
  },
  guclusu: {
    id: 'guclusu',
    cards: [
      { id: 'guclusu_hicaz', makam: 'Hicaz', answer: 'Nevâ' },
      { id: 'guclusu_nihavend', makam: 'Nihavend', answer: 'Nevâ' },
      { id: 'guclusu_ussak', makam: 'Uşşak', answer: 'Nevâ' },
      { id: 'guclusu_kurdi', makam: 'Kürdi', answer: 'Nevâ' },
      { id: 'guclusu_rast', makam: 'Rast', answer: 'Nevâ' },
      { id: 'guclusu_karcigar', makam: 'Karcığar', answer: 'Eviç' },
      { id: 'guclusu_segah', makam: 'Segâh', answer: 'Eviç' },
      { id: 'guclusu_huzzam', makam: 'Hüzzam', answer: 'Nevâ' },
      { id: 'guclusu_cargah', makam: 'Çargâh', answer: 'Gerdâniye' },
      { id: 'guclusu_buselik', makam: 'Buselik', answer: 'Hüseyni' },
      { id: 'guclusu_beyati', makam: 'Beyati', answer: 'Nevâ' },
      { id: 'guclusu_muhayyer', makam: 'Muhayyer', answer: 'Tiz Segâh' },
      { id: 'guclusu_saba', makam: 'Saba', answer: 'Çargâh' },
    ],
  },
  seyri: {
    id: 'seyri',
    cards: [
      { id: 'seyri_hicaz', makam: 'Hicaz', answer: 'inici_cikici' },
      { id: 'seyri_nihavend', makam: 'Nihavend', answer: 'inici_cikici' },
      { id: 'seyri_ussak', makam: 'Uşşak', answer: 'cikici' },
      { id: 'seyri_kurdi', makam: 'Kürdi', answer: 'cikici' },
      { id: 'seyri_rast', makam: 'Rast', answer: 'cikici' },
      { id: 'seyri_karcigar', makam: 'Karcığar', answer: 'inici_cikici' },
      { id: 'seyri_kurdilihicazkar', makam: 'Kürdilihicazkâr', answer: 'inici' },
      { id: 'seyri_segah', makam: 'Segâh', answer: 'inici' },
      { id: 'seyri_huzzam', makam: 'Hüzzam', answer: 'inici' },
      { id: 'seyri_cargah', makam: 'Çargâh', answer: 'cikici' },
      { id: 'seyri_buselik', makam: 'Buselik', answer: 'cikici' },
      { id: 'seyri_beyati', makam: 'Beyati', answer: 'inici_cikici' },
      { id: 'seyri_muhayyer', makam: 'Muhayyer', answer: 'inici' },
      { id: 'seyri_saba', makam: 'Saba', answer: 'cikici' },
    ],
  },
  yedeni: {
    id: 'yedeni',
    cards: [
      { id: 'yedeni_hicaz', makam: 'Hicaz', answer: 'Rast' },
      { id: 'yedeni_nihavend', makam: 'Nihavend', answer: 'Irak' },
      { id: 'yedeni_ussak', makam: 'Uşşak', answer: 'Rast' },
      { id: 'yedeni_kurdi', makam: 'Kürdi', answer: 'Rast' },
      { id: 'yedeni_rast', makam: 'Rast', answer: 'Irak' },
      { id: 'yedeni_cargah', makam: 'Çargâh', answer: 'Buselik' },
      { id: 'yedeni_buselik', makam: 'Buselik', answer: 'Rast' },
      { id: 'yedeni_beyati', makam: 'Beyati', answer: 'Rast' },
    ],
  },
}

export const getAllFlashcardIds = () => {
  const ids = []
  for (const deck of Object.values(FLASHCARD_DECKS)) {
    for (const card of deck.cards) {
      ids.push(card.id)
    }
  }
  return ids
}

export const getFlashcardById = (cardId) => {
  for (const deck of Object.values(FLASHCARD_DECKS)) {
    const card = deck.cards.find(c => c.id === cardId)
    if (card) return { ...card, deckId: deck.id }
  }
  return null
}
