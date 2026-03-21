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
      deleteTitle: 'Notayı Sil',
      cancel: 'İptal',
      delete: 'Sil',
    },

    // Create note page
    createNote: {
      title: 'Nota Ekle',
      upload: 'Yükle',
      pickFile: 'Dosya Seç',
      formats: 'PDF, PNG, JPEG, JPG',
      errorTitle: 'Yükleme Hatası',
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
      deleteTitle: 'Delete Note',
      cancel: 'Cancel',
      delete: 'Delete',
    },

    createNote: {
      title: 'Add Note',
      upload: 'Upload',
      pickFile: 'Select File',
      formats: 'PDF, PNG, JPEG, JPG',
      errorTitle: 'Upload Error',
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
