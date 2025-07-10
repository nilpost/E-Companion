interface Translations {
  [key: string]: {
    [locale: string]: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    ja: 'ホーム'
  },
  'nav.community': {
    en: 'Community',
    ja: 'コミュニティ'
  },
  'nav.booking': {
    en: 'Booking',
    ja: '予約'
  },
  'nav.health': {
    en: 'Health',
    ja: '健康'
  },
  'nav.chat': {
    en: 'Chat',
    ja: 'チャット'
  },

  // Authentication
  'auth.welcome': {
    en: 'Welcome to PetCare',
    ja: 'PetCareへようこそ'
  },
  'auth.description': {
    en: 'Your community-centric pet care platform with gamification and social features',
    ja: 'ゲーミフィケーションとソーシャル機能を備えたコミュニティ中心のペットケアプラットフォーム'
  },
  'auth.login': {
    en: 'Login',
    ja: 'ログイン'
  },
  'auth.register': {
    en: 'Register',
    ja: '登録'
  },
  'auth.welcome_back': {
    en: 'Welcome back!',
    ja: 'おかえりなさい！'
  },
  'auth.sign_in_description': {
    en: 'Sign in to your PetCare account',
    ja: 'PetCareアカウントにサインインしてください'
  },
  'auth.join_petcare': {
    en: 'Join PetCare',
    ja: 'PetCareに参加'
  },
  'auth.create_account_description': {
    en: 'Create your account and start your pet care journey',
    ja: 'アカウントを作成して、ペットケアの旅を始めましょう'
  },
  'auth.username': {
    en: 'Username',
    ja: 'ユーザー名'
  },
  'auth.password': {
    en: 'Password',
    ja: 'パスワード'
  },
  'auth.email': {
    en: 'Email',
    ja: 'メールアドレス'
  },
  'auth.first_name': {
    en: 'First Name',
    ja: '名前'
  },
  'auth.last_name': {
    en: 'Last Name',
    ja: '姓'
  },
  'auth.role': {
    en: 'Role',
    ja: '役割'
  },
  'auth.confirm_password': {
    en: 'Confirm Password',
    ja: 'パスワードの確認'
  },

  // Roles
  'role.owner': {
    en: 'Pet Owner',
    ja: 'ペットオーナー'
  },
  'role.trainer': {
    en: 'Pet Trainer',
    ja: 'ペットトレーナー'
  },
  'role.vet': {
    en: 'Veterinarian',
    ja: '獣医師'
  },
  'role.groomer': {
    en: 'Pet Groomer',
    ja: 'ペットグルーマー'
  },

  // Dashboard
  'dashboard.welcome_back': {
    en: 'Welcome back, {name}!',
    ja: 'おかえりなさい、{name}さん！'
  },
  'dashboard.level_parent': {
    en: 'Level {level} Pet Parent',
    ja: 'レベル{level}のペット親'
  },
  'dashboard.xp_points': {
    en: 'XP Points',
    ja: 'XPポイント'
  },
  'dashboard.xp_to_next_level': {
    en: '{xp} XP to next level',
    ja: '次のレベルまで{xp}XP'
  },
  'dashboard.your_pets': {
    en: 'Your Pets',
    ja: 'あなたのペット'
  },
  'dashboard.add_pet': {
    en: '+ Add Pet',
    ja: '+ ペットを追加'
  },
  'dashboard.no_pets': {
    en: 'No pets added yet',
    ja: 'まだペットが追加されていません'
  },
  'dashboard.add_first_pet': {
    en: 'Add Your First Pet',
    ja: '最初のペットを追加'
  },
  'dashboard.recent_activities': {
    en: 'Recent Activities',
    ja: '最近のアクティビティ'
  },
  'dashboard.no_activities': {
    en: 'No recent activities',
    ja: '最近のアクティビティはありません'
  },
  'dashboard.recent_achievements': {
    en: 'Recent Achievements',
    ja: '最近の実績'
  },
  'dashboard.no_badges': {
    en: 'No badges earned yet',
    ja: 'まだバッジを獲得していません'
  },

  // Health
  'health.dashboard': {
    en: 'Health Dashboard',
    ja: '健康ダッシュボード'
  },
  'health.weight': {
    en: 'Weight',
    ja: '体重'
  },
  'health.heart_rate': {
    en: 'Heart Rate',
    ja: '心拍数'
  },
  'health.steps_today': {
    en: 'steps today',
    ja: '今日の歩数'
  },
  'health.calories_burned': {
    en: 'calories burned',
    ja: '消費カロリー'
  },
  'health.live_tracking': {
    en: 'Live Tracking',
    ja: 'ライブトラッキング'
  },
  'health.current_walk': {
    en: 'Current walk route',
    ja: '現在の散歩ルート'
  },
  'health.distance': {
    en: 'Distance',
    ja: '距離'
  },
  'health.duration': {
    en: 'Duration',
    ja: '時間'
  },
  'health.speed': {
    en: 'Speed',
    ja: 'スピード'
  },
  'health.recent_activities': {
    en: 'Recent Activities',
    ja: '最近のアクティビティ'
  },
  'health.no_health_records': {
    en: 'No health records yet',
    ja: 'まだ健康記録がありません'
  },
  'health.upcoming_reminders': {
    en: 'Upcoming Reminders',
    ja: '今後のリマインダー'
  },

  // Social
  'social.community_feed': {
    en: 'Community Feed',
    ja: 'コミュニティフィード'
  },
  'social.share_moment': {
    en: "Share your pet's moment...",
    ja: 'ペットの瞬間をシェア...'
  },
  'social.post': {
    en: 'Post',
    ja: '投稿'
  },
  'social.no_posts': {
    en: 'No posts yet. Be the first to share!',
    ja: 'まだ投稿がありません。最初にシェアしよう！'
  },
  'social.posting': {
    en: 'Posting...',
    ja: '投稿中...'
  },

  // Booking
  'booking.book_services': {
    en: 'Book Services',
    ja: 'サービスを予約'
  },
  'booking.dog_walking': {
    en: 'Dog Walking',
    ja: '犬の散歩'
  },
  'booking.professional_walkers': {
    en: 'Professional walkers',
    ja: 'プロの散歩者'
  },
  'booking.veterinary': {
    en: 'Veterinary',
    ja: '獣医'
  },
  'booking.health_checkups': {
    en: 'Health checkups',
    ja: '健康診断'
  },
  'booking.grooming': {
    en: 'Grooming',
    ja: 'グルーミング'
  },
  'booking.professional_grooming': {
    en: 'Professional grooming',
    ja: 'プロのグルーミング'
  },
  'booking.training': {
    en: 'Training',
    ja: 'トレーニング'
  },
  'booking.behavioral_training': {
    en: 'Behavioral training',
    ja: '行動トレーニング'
  },
  'booking.upcoming_appointments': {
    en: 'Upcoming Appointments',
    ja: '今後の予約'
  },
  'booking.no_appointments': {
    en: 'No upcoming appointments',
    ja: '今後の予約はありません'
  },
  'booking.available_providers': {
    en: 'Available Providers',
    ja: '利用可能なプロバイダー'
  },
  'booking.no_providers': {
    en: 'No providers available',
    ja: '利用可能なプロバイダーがありません'
  },
  'booking.book': {
    en: 'Book',
    ja: '予約'
  },
  'booking.view': {
    en: 'View',
    ja: '表示'
  },

  // Chat
  'chat.messages': {
    en: 'Messages',
    ja: 'メッセージ'
  },
  'chat.pet_care_faq': {
    en: 'Pet Care FAQ',
    ja: 'ペットケアFAQ'
  },
  'chat.general_chat': {
    en: 'General Chat',
    ja: '一般チャット'
  },
  'chat.direct_messages': {
    en: 'Direct Messages',
    ja: 'ダイレクトメッセージ'
  },
  'chat.start_conversation': {
    en: 'Start a conversation',
    ja: '会話を開始'
  },
  'chat.find_message': {
    en: 'Find and message other pet parents or service providers',
    ja: '他のペットの親やサービスプロバイダーを見つけてメッセージを送る'
  },
  'chat.no_messages': {
    en: 'No messages yet. Start the conversation!',
    ja: 'まだメッセージがありません。会話を始めよう！'
  },
  'chat.type_message': {
    en: 'Type a message...',
    ja: 'メッセージを入力...'
  },

  // Common
  'common.healthy': {
    en: 'Healthy',
    ja: '健康'
  },
  'common.checkup_due': {
    en: 'Checkup Due',
    ja: '検診期日'
  },
  'common.today': {
    en: 'Today',
    ja: '今日'
  },
  'common.yesterday': {
    en: 'Yesterday',
    ja: '昨日'
  },
  'common.days_ago': {
    en: '{days} days ago',
    ja: '{days}日前'
  },
  'common.hours_ago': {
    en: '{hours} hours ago',
    ja: '{hours}時間前'
  },
  'common.just_now': {
    en: 'Just now',
    ja: 'たった今'
  },
  'common.cancel': {
    en: 'Cancel',
    ja: 'キャンセル'
  },
  'common.save': {
    en: 'Save',
    ja: '保存'
  },
  'common.delete': {
    en: 'Delete',
    ja: '削除'
  },
  'common.edit': {
    en: 'Edit',
    ja: '編集'
  },
  'common.loading': {
    en: 'Loading...',
    ja: '読み込み中...'
  },
  'common.error': {
    en: 'Error',
    ja: 'エラー'
  },
  'common.success': {
    en: 'Success',
    ja: '成功'
  },

  // Pet Form
  'pet.add_pet': {
    en: 'Add Your Pet',
    ja: 'ペットを追加'
  },
  'pet.create_profile': {
    en: 'Create a profile for your furry friend',
    ja: 'あなたの毛皮の友達のプロフィールを作成'
  },
  'pet.name': {
    en: 'Name',
    ja: '名前'
  },
  'pet.species': {
    en: 'Species',
    ja: '種類'
  },
  'pet.breed': {
    en: 'Breed',
    ja: '品種'
  },
  'pet.age': {
    en: 'Age',
    ja: '年齢'
  },
  'pet.weight': {
    en: 'Weight',
    ja: '体重'
  },
  'pet.gender': {
    en: 'Gender',
    ja: '性別'
  },
  'pet.color': {
    en: 'Color',
    ja: '色'
  },
  'pet.medical_notes': {
    en: 'Medical Notes',
    ja: '医療メモ'
  },
  'pet.dog': {
    en: 'Dog',
    ja: '犬'
  },
  'pet.cat': {
    en: 'Cat',
    ja: '猫'
  },
  'pet.bird': {
    en: 'Bird',
    ja: '鳥'
  },
  'pet.rabbit': {
    en: 'Rabbit',
    ja: 'ウサギ'
  },
  'pet.other': {
    en: 'Other',
    ja: 'その他'
  },
  'pet.male': {
    en: 'Male',
    ja: 'オス'
  },
  'pet.female': {
    en: 'Female',
    ja: 'メス'
  }
};

type Locale = 'en' | 'ja';

class I18n {
  private currentLocale: Locale = 'en';

  constructor() {
    // Get initial locale from localStorage or browser
    const savedLocale = localStorage.getItem('petcare-locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ja')) {
      this.currentLocale = savedLocale;
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('ja')) {
        this.currentLocale = 'ja';
      }
    }
  }

  setLocale(locale: Locale) {
    this.currentLocale = locale;
    localStorage.setItem('petcare-locale', locale);
    
    // Dispatch custom event for components to react to locale changes
    window.dispatchEvent(new CustomEvent('localeChange', { detail: locale }));
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  t(key: string, variables?: Record<string, string | number>): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    let text = translation[this.currentLocale] || translation['en'] || key;

    // Replace variables in the format {variable}
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        text = text.replace(new RegExp(`{${varKey}}`, 'g'), String(varValue));
      });
    }

    return text;
  }

  // Utility method for date formatting based on locale
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (this.currentLocale === 'ja') {
      return dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  // Utility method for time formatting
  formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (this.currentLocale === 'ja') {
      return dateObj.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMs < 60000) { // Less than 1 minute
      return this.t('common.just_now');
    } else if (diffInHours < 1) { // Less than 1 hour
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}${this.currentLocale === 'ja' ? '分前' : ' minutes ago'}`;
    } else if (diffInHours < 24) { // Less than 24 hours
      return this.t('common.hours_ago', { hours: diffInHours.toString() });
    } else if (diffInDays === 1) {
      return this.t('common.yesterday');
    } else if (diffInDays < 7) {
      return this.t('common.days_ago', { days: diffInDays.toString() });
    } else {
      return this.formatDate(dateObj);
    }
  }
}

export const i18n = new I18n();

// React hook for components
export function useTranslation() {
  const [, forceUpdate] = useState({});

  // Listen for locale changes
  useEffect(() => {
    const handleLocaleChange = () => forceUpdate({});
    window.addEventListener('localeChange', handleLocaleChange);
    return () => window.removeEventListener('localeChange', handleLocaleChange);
  }, []);

  return {
    t: i18n.t.bind(i18n),
    locale: i18n.getLocale(),
    setLocale: i18n.setLocale.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatTime: i18n.formatTime.bind(i18n),
    getRelativeTime: i18n.getRelativeTime.bind(i18n),
  };
}

// Export for direct usage
export default i18n;
