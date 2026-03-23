const translations = {
  tr: {
    // Tab names
    tabs: {
      makams: 'Makamlar',
      rhythms: 'Usuller',
      notes: 'Notalar',
      metronome: 'Metronom',
      settings: 'Ayarlar',
    },

    // Feed page
    feed: {
      title: 'Akış',
      empty: 'Henüz duyuru yok',
      emptyDesc: 'Korolardan paylaşılan herkese açık duyurular burada görünecek',
    },

    // Notes page
    notes: {
      title: 'Notalar',
      subtitle: 'Yakında burada notalarınızı görüntüleyebileceksiniz',
    },

    // Metronome page
    metronome: {
      waiting: 'vuruş bekleniyor...',
      tap: 'DOKUN',
      reset: 'Sıfırla',
      infoTitle: 'Nasıl Kullanılır?',
      infoText: 'Bu uygulamanın amacı, butona her basışınızda, bir önceki basışınız arasındaki farkı hesaplayıp milisaniye cinsinden ekrana yazdırarak ritim duyunuzun performansını göstermek ve pratik yaparak gelişmesine katkıda bulunmaktır.',
      perfect: 'Mükemmel!',
      great: 'Harika',
      good: 'İyi',
      practice: 'Pratik yap',
      legendPerfect: '< 30ms fark — Mükemmel',
      legendGood: '< 60ms fark — İyi',
      legendMedium: '< 100ms fark — Orta',
      legendPractice: '> 100ms fark — Pratik yap',
    },

    // Login page
    login: {
      subtitle: 'Türk müziği eğitim uygulaması',
      signIn: 'Giriş Yap',
      signUp: 'Kayıt Ol',
      email: 'E-posta',
      password: 'Şifre',
      createAccount: 'Hesap Oluştur',
      hasAccount: 'Zaten hesabınız var mı?',
      noAccount: 'Hesabınız yok mu?',
      fillFields: 'Lütfen tüm alanları doldurun',
      checkEmail: 'Kayıt başarılı! E-postanızı kontrol edin.',
      logout: 'Çıkış Yap',
    },

    // Chorus page
    chorus: {
      title: 'Korolarım',
      pageTitle: 'Korolar',
      tab_explore: 'Keşfet',
      tab_my: 'Korolarım',
      yourRating: 'Puanınız',
      searchPlaceholder: 'Koro ara...',
      noResults: 'Koro bulunamadı',
      empty: 'Henüz bir koronuz yok',
      emptyDesc: 'Bir koroya katıldığınızda burada görünecek',
      createChorus: 'Koro Oluştur',
      createChorusDesc: 'Yeni bir koro oluşturun ve üyeleri yönetin',
      chorusName: 'Koro adı',
      chorusDescription: 'Açıklama (opsiyonel)',
      create: 'Oluştur',
      cancel: 'İptal',
      created: 'Koro başarıyla oluşturuldu!',
      noPermission: 'Koro oluşturma yetkiniz bulunmamaktadır',
      fillName: 'Lütfen koro adını girin',
      maxLimit: 'En fazla 5 koro oluşturabilirsiniz',
    },

    // Chorus detail page
    chorusDetail: {
      members: 'üye',
      memberList: 'Üyeler',
      noMembers: 'Henüz üye yok',
      tab_notes: 'Notalar',
      tab_bulletin: 'Duyurular',
      tab_members: 'Üyeler',
      notesEmpty: 'Henüz nota yok',
      notesEmptyDesc: 'Koroya eklenen notalar burada görünecek',
      bulletinEmpty: 'Henüz duyuru yok',
      bulletinEmptyDesc: 'Koro duyuruları burada görünecek',
      roleAdmin: 'Yönetici',
      roleMember: 'Üye',
      deleteNoteTitle: 'Notayı Sil',
      deleteBulletinTitle: 'Duyuruyu Sil',
      deleteMemberTitle: 'Üyeyi Çıkar',
      cancel: 'İptal',
      delete: 'Sil',
    },

    // Add member page
    addMember: {
      title: 'Üye Ekle',
      placeholder: 'E-posta ile ara...',
      minChars: 'En az 3 karakter girin',
      noResults: 'Kullanıcı bulunamadı',
      added: 'Üye başarıyla eklendi!',
    },

    // Bulletin
    bulletin: {
      createTitle: 'Duyuru Oluştur',
      titlePlaceholder: 'Duyuru başlığı',
      contentPlaceholder: 'Duyuru içeriği...',
      create: 'Oluştur',
      fillFields: 'Lütfen başlık ve içerik girin',
      public: 'Herkese Açık',
      private: 'Üyelere Özel',
      publicHint: 'Bu duyuru tüm kullanıcılar tarafından görülebilir',
      privateHint: 'Bu duyuru sadece koro üyeleri tarafından görülebilir',
      eventToggle: 'Etkinlik / Konser',
      eventToggleDesc: 'Tarih ve konum bilgisi ekleyin',
      eventDate: 'Tarih',
      eventTime: 'Saat',
      eventLocationPlaceholder: 'Konum girin...',
      fillLocation: 'Lütfen etkinlik konumunu girin',
      done: 'Tamam',
      concert: 'Konser',
      eventPrice: 'Ücret',
      free: 'Ücretsiz',
      editTitle: 'Duyuruyu Düzenle',
      save: 'Kaydet',
    },

    // Create note page
    createNote: {
      title: 'Nota Ekle',
      upload: 'Yükle',
      pickFile: 'Dosya Seç',
      formats: 'PDF, PNG, JPEG, JPG',
      errorTitle: 'Yükleme Hatası',
    },

    // Chorus info page
    chorusInfo: {
      since: 'Kuruluş:',
      description: 'Açıklama',
      descriptionPlaceholder: 'Koro hakkında bilgi yazın...',
      rehearsal: 'Prova Bilgileri',
      rehearsalDays: 'Prova Günleri',
      rehearsalDaysPlaceholder: 'Örn: Pazartesi, Çarşamba',
      rehearsalTime: 'Prova Saati',
      rehearsalTimePlaceholder: 'Örn: 19:00 - 21:00',
      rehearsalLocation: 'Prova Yeri',
      rehearsalLocationPlaceholder: 'Prova yapılan yer...',
      contact: 'İletişim',
      contactEmail: 'E-posta',
      contactEmailPlaceholder: 'İletişim e-postası',
      contactPhone: 'Telefon',
      contactPhonePlaceholder: 'İletişim telefonu',
      website: 'Web Sitesi',
      websitePlaceholder: 'Web sitesi adresi',
      general: 'Genel',
      foundedYear: 'Kuruluş Yılı',
      foundedYearPlaceholder: 'Örn: 2020',
      emptyHint: 'Koro bilgilerini düzenlemek için sağ üstteki düzenle butonuna dokunun',
      error: 'Hata',
      notFound: 'Koro bulunamadı',
    },

    // Settings page
    settings: {
      title: 'Ayarlar',
      language: 'Dil',
      languageDesc: 'Uygulama dilini değiştirin',
      turkish: 'Türkçe',
      english: 'İngilizce',
      about: 'Hakkında',
      aboutDesc: 'Uygulama bilgileri',
      version: 'Versiyon',
      developer: 'Geliştirici',
      appDescription: 'Türk müziği eğitimi için tasarlanmış bir uygulama. Makamlar, usuller ve ritim çalışması.',
    },
  },

  en: {
    tabs: {
      makams: 'Makams',
      rhythms: 'Rhythms',
      notes: 'Notes',
      metronome: 'Metronome',
      settings: 'Settings',
    },

    feed: {
      title: 'Feed',
      empty: 'No bulletins yet',
      emptyDesc: 'Public announcements from choruses will appear here',
    },

    notes: {
      title: 'Notes',
      subtitle: 'You will be able to view your notes here soon',
    },

    metronome: {
      waiting: 'waiting for tap...',
      tap: 'TAP',
      reset: 'Reset',
      infoTitle: 'How to Use?',
      infoText: 'The purpose of this app is to calculate the time difference between each tap in milliseconds, displaying your rhythm sense performance and helping you improve through practice.',
      perfect: 'Perfect!',
      great: 'Great',
      good: 'Good',
      practice: 'Keep practicing',
      legendPerfect: '< 30ms variance — Perfect',
      legendGood: '< 60ms variance — Good',
      legendMedium: '< 100ms variance — Medium',
      legendPractice: '> 100ms variance — Keep practicing',
    },

    login: {
      subtitle: 'Turkish music education app',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      createAccount: 'Create Account',
      hasAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      fillFields: 'Please fill in all fields',
      checkEmail: 'Registration successful! Check your email.',
      logout: 'Sign Out',
    },

    chorus: {
      title: 'My Choruses',
      pageTitle: 'Choruses',
      tab_explore: 'Explore',
      tab_my: 'My Choruses',
      yourRating: 'Your Rating',
      searchPlaceholder: 'Search choruses...',
      noResults: 'No choruses found',
      empty: 'No choruses yet',
      emptyDesc: 'When you join a chorus, it will appear here',
      createChorus: 'Create Chorus',
      createChorusDesc: 'Create a new chorus and manage members',
      chorusName: 'Chorus name',
      chorusDescription: 'Description (optional)',
      create: 'Create',
      cancel: 'Cancel',
      created: 'Chorus created successfully!',
      noPermission: 'You do not have permission to create a chorus',
      fillName: 'Please enter a chorus name',
      maxLimit: 'You can create a maximum of 5 choruses',
    },

    chorusDetail: {
      members: 'members',
      memberList: 'Members',
      noMembers: 'No members yet',
      tab_notes: 'Notes',
      tab_bulletin: 'Bulletin',
      tab_members: 'Members',
      notesEmpty: 'No notes yet',
      notesEmptyDesc: 'Notes added to the chorus will appear here',
      bulletinEmpty: 'No bulletins yet',
      bulletinEmptyDesc: 'Chorus announcements will appear here',
      roleAdmin: 'Admin',
      roleMember: 'Member',
      deleteNoteTitle: 'Delete Note',
      deleteBulletinTitle: 'Delete Bulletin',
      deleteMemberTitle: 'Remove Member',
      cancel: 'Cancel',
      delete: 'Delete',
    },

    addMember: {
      title: 'Add Member',
      placeholder: 'Search by email...',
      minChars: 'Type at least 3 characters',
      noResults: 'No users found',
      added: 'Member added successfully!',
    },

    bulletin: {
      createTitle: 'Create Bulletin',
      titlePlaceholder: 'Bulletin title',
      contentPlaceholder: 'Bulletin content...',
      create: 'Create',
      fillFields: 'Please enter a title and content',
      public: 'Public',
      private: 'Private',
      publicHint: 'This bulletin will be visible to all users',
      privateHint: 'This bulletin will only be visible to chorus members',
      eventToggle: 'Event / Concert',
      eventToggleDesc: 'Add date and location details',
      eventDate: 'Date',
      eventTime: 'Time',
      eventLocationPlaceholder: 'Enter location...',
      fillLocation: 'Please enter the event location',
      done: 'Done',
      concert: 'Concert',
      eventPrice: 'Price',
      free: 'Free',
      editTitle: 'Edit Bulletin',
      save: 'Save',
    },

    createNote: {
      title: 'Add Note',
      upload: 'Upload',
      pickFile: 'Select File',
      formats: 'PDF, PNG, JPEG, JPG',
      errorTitle: 'Upload Error',
    },

    chorusInfo: {
      since: 'Since:',
      description: 'Description',
      descriptionPlaceholder: 'Write about the chorus...',
      rehearsal: 'Rehearsal Info',
      rehearsalDays: 'Rehearsal Days',
      rehearsalDaysPlaceholder: 'E.g. Monday, Wednesday',
      rehearsalTime: 'Rehearsal Time',
      rehearsalTimePlaceholder: 'E.g. 19:00 - 21:00',
      rehearsalLocation: 'Rehearsal Location',
      rehearsalLocationPlaceholder: 'Rehearsal venue...',
      contact: 'Contact',
      contactEmail: 'Email',
      contactEmailPlaceholder: 'Contact email',
      contactPhone: 'Phone',
      contactPhonePlaceholder: 'Contact phone',
      website: 'Website',
      websitePlaceholder: 'Website address',
      general: 'General',
      foundedYear: 'Founded Year',
      foundedYearPlaceholder: 'E.g. 2020',
      emptyHint: 'Tap the edit button in the top right to add chorus information',
      error: 'Error',
      notFound: 'Chorus not found',
    },

    settings: {
      title: 'Settings',
      language: 'Language',
      languageDesc: 'Change the app language',
      turkish: 'Turkish',
      english: 'English',
      about: 'About',
      aboutDesc: 'App information',
      version: 'Version',
      developer: 'Developer',
      appDescription: 'An app designed for Turkish music education. Makams, rhythms, and rhythm training.',
    },
  },
}

export const t = (language, path) => {
  const keys = path.split('.')
  let value = translations[language] || translations.tr
  for (const key of keys) {
    value = value?.[key]
  }
  return value || path
}

export default translations
