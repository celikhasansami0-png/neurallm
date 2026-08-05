"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LangCode = "en" | "tr" | "ar" | "fr" | "de" | "es";

export const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
];

export const RTL_LANGS: LangCode[] = ["ar"];

type Dict = Record<string, string>;

const en: Dict = {
  nav_dashboard: "Dashboard",
  nav_assistant: "Assistant",
  nav_agents: "Agents",
  nav_tasks: "Tasks",
  nav_approvals: "Approvals",
  nav_workflows: "Workflows",
  nav_reports: "Reports",
  nav_integrations: "Integrations",
  nav_settings: "Settings",
  search_placeholder: "Search...",
  chats_label: "Chats",
  new_chat: "New chat",
  greeting: "Good Morning, {name}.",
  greeting_subtitle: "Here's what's happening today.",
  metric_tasks_completed: "Tasks Completed Today",
  metric_pending_approvals: "Pending Approvals",
  metric_active_agents: "Active Agents",
  chart_task_volume: "Task Volume",
  chart_agent_performance: "Agent Performance",
  recent_activity: "Recent Activity",
  no_activity: "No activity yet. Create a task to get started.",
  loading_dashboard: "Loading your dashboard…",
  work_email: "Work email",
  password: "Password",
  log_in: "Log in",
  logging_in: "Logging in…",
  forgot_password: "Forgot password?",
  invalid_credentials: "Invalid email or password.",
  login_tagline: "Pick up where your agents left off.",
  language: "Language",
  install_title: "Install Managent on your device",
  install_subtitle: "Add Managent to your home screen or desktop for the fastest experience.",
  install_now: "Install Now",
  install_skip: "Continue in browser",
  install_done: "You can now close your browser. Open Managent from your desktop.",
  install_mac_title: "On Mac",
  install_mac_steps: "Click the Install Now button above, or use Safari's Share menu and choose \"Add to Dock\".",
  install_windows_title: "On Windows",
  install_windows_steps: "Click the Install Now button above, or click the install icon in your browser's address bar.",
  install_iphone_title: "On iPhone",
  install_iphone_steps: "Tap the Share icon in Safari, then choose \"Add to Home Screen\".",
  install_android_title: "On Android",
  install_android_steps: "Tap the menu icon in Chrome, then choose \"Install app\" or \"Add to Home screen\".",
};

const tr: Dict = {
  nav_dashboard: "Panel",
  nav_assistant: "Asistan",
  nav_agents: "Ajanlar",
  nav_tasks: "Görevler",
  nav_approvals: "Onaylar",
  nav_workflows: "İş Akışları",
  nav_reports: "Raporlar",
  nav_integrations: "Entegrasyonlar",
  nav_settings: "Ayarlar",
  search_placeholder: "Ara...",
  chats_label: "Sohbetler",
  new_chat: "Yeni sohbet",
  greeting: "Günaydın, {name}.",
  greeting_subtitle: "Bugün olanlar burada.",
  metric_tasks_completed: "Bugün Tamamlanan Görevler",
  metric_pending_approvals: "Bekleyen Onaylar",
  metric_active_agents: "Aktif Ajanlar",
  chart_task_volume: "Görev Hacmi",
  chart_agent_performance: "Ajan Performansı",
  recent_activity: "Son Aktiviteler",
  no_activity: "Henüz aktivite yok. Başlamak için bir görev oluştur.",
  loading_dashboard: "Panonuz yükleniyor…",
  work_email: "İş e-postası",
  password: "Şifre",
  log_in: "Giriş yap",
  logging_in: "Giriş yapılıyor…",
  forgot_password: "Şifremi unuttum",
  invalid_credentials: "E-posta veya şifre hatalı.",
  login_tagline: "Ajanlarınızın kaldığı yerden devam edin.",
  language: "Dil",
  install_title: "Managent'i cihazınıza kurun",
  install_subtitle: "En hızlı deneyim için Managent'i ana ekranınıza veya masaüstünüze ekleyin.",
  install_now: "Şimdi Kur",
  install_skip: "Tarayıcıda devam et",
  install_done: "Artık tarayıcınızı kapatabilirsiniz. Managent'i masaüstünüzden açın.",
  install_mac_title: "Mac'te",
  install_mac_steps: "Yukarıdaki Şimdi Kur düğmesine tıklayın veya Safari'nin Paylaş menüsünden \"Dock'a Ekle\"yi seçin.",
  install_windows_title: "Windows'ta",
  install_windows_steps: "Yukarıdaki Şimdi Kur düğmesine tıklayın veya tarayıcınızın adres çubuğundaki kurulum simgesine tıklayın.",
  install_iphone_title: "iPhone'da",
  install_iphone_steps: "Safari'de Paylaş simgesine dokunun, ardından \"Ana Ekrana Ekle\"yi seçin.",
  install_android_title: "Android'de",
  install_android_steps: "Chrome'da menü simgesine dokunun, ardından \"Uygulamayı yükle\" veya \"Ana ekrana ekle\"yi seçin.",
};

const ar: Dict = {
  nav_dashboard: "الرئيسية",
  nav_assistant: "المساعد",
  nav_agents: "الوكلاء",
  nav_tasks: "المهام",
  nav_approvals: "الموافقات",
  nav_workflows: "سير العمل",
  nav_reports: "التقارير",
  nav_integrations: "التكاملات",
  nav_settings: "الإعدادات",
  search_placeholder: "بحث...",
  chats_label: "المحادثات",
  new_chat: "محادثة جديدة",
  greeting: "صباح الخير، {name}.",
  greeting_subtitle: "إليك ما يحدث اليوم.",
  metric_tasks_completed: "المهام المكتملة اليوم",
  metric_pending_approvals: "الموافقات المعلقة",
  metric_active_agents: "الوكلاء النشطون",
  chart_task_volume: "حجم المهام",
  chart_agent_performance: "أداء الوكيل",
  recent_activity: "النشاط الأخير",
  no_activity: "لا يوجد نشاط بعد. أنشئ مهمة للبدء.",
  loading_dashboard: "جاري تحميل لوحتك…",
  work_email: "البريد الإلكتروني للعمل",
  password: "كلمة المرور",
  log_in: "تسجيل الدخول",
  logging_in: "جاري تسجيل الدخول…",
  forgot_password: "نسيت كلمة المرور؟",
  invalid_credentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  login_tagline: "تابع من حيث توقف وكلاؤك.",
  language: "اللغة",
  install_title: "ثبّت Managent على جهازك",
  install_subtitle: "أضف Managent إلى الشاشة الرئيسية أو سطح المكتب لأسرع تجربة.",
  install_now: "ثبّت الآن",
  install_skip: "المتابعة في المتصفح",
  install_done: "يمكنك الآن إغلاق متصفحك. افتح Managent من سطح المكتب.",
  install_mac_title: "على Mac",
  install_mac_steps: "انقر على زر \"ثبّت الآن\" أعلاه، أو استخدم قائمة المشاركة في Safari واختر \"إضافة إلى Dock\".",
  install_windows_title: "على Windows",
  install_windows_steps: "انقر على زر \"ثبّت الآن\" أعلاه، أو انقر على أيقونة التثبيت في شريط عنوان المتصفح.",
  install_iphone_title: "على iPhone",
  install_iphone_steps: "اضغط على أيقونة المشاركة في Safari، ثم اختر \"إضافة إلى الشاشة الرئيسية\".",
  install_android_title: "على Android",
  install_android_steps: "اضغط على أيقونة القائمة في Chrome، ثم اختر \"تثبيت التطبيق\" أو \"إضافة إلى الشاشة الرئيسية\".",
};

const fr: Dict = {
  nav_dashboard: "Tableau de bord",
  nav_assistant: "Assistant",
  nav_agents: "Agents",
  nav_tasks: "Tâches",
  nav_approvals: "Approbations",
  nav_workflows: "Flux de travail",
  nav_reports: "Rapports",
  nav_integrations: "Intégrations",
  nav_settings: "Paramètres",
  search_placeholder: "Rechercher...",
  chats_label: "Discussions",
  new_chat: "Nouvelle discussion",
  greeting: "Bonjour, {name}.",
  greeting_subtitle: "Voici ce qui se passe aujourd'hui.",
  metric_tasks_completed: "Tâches terminées aujourd'hui",
  metric_pending_approvals: "Approbations en attente",
  metric_active_agents: "Agents actifs",
  chart_task_volume: "Volume des tâches",
  chart_agent_performance: "Performance des agents",
  recent_activity: "Activité récente",
  no_activity: "Aucune activité pour le moment. Créez une tâche pour commencer.",
  loading_dashboard: "Chargement de votre tableau de bord…",
  work_email: "E-mail professionnel",
  password: "Mot de passe",
  log_in: "Se connecter",
  logging_in: "Connexion…",
  forgot_password: "Mot de passe oublié ?",
  invalid_credentials: "E-mail ou mot de passe invalide.",
  login_tagline: "Reprenez là où vos agents se sont arrêtés.",
  language: "Langue",
  install_title: "Installer Managent sur votre appareil",
  install_subtitle: "Ajoutez Managent à votre écran d'accueil ou bureau pour la meilleure expérience.",
  install_now: "Installer maintenant",
  install_skip: "Continuer dans le navigateur",
  install_done: "Vous pouvez maintenant fermer votre navigateur. Ouvrez Managent depuis votre bureau.",
  install_mac_title: "Sur Mac",
  install_mac_steps: "Cliquez sur le bouton Installer maintenant ci-dessus, ou utilisez le menu Partager de Safari et choisissez \"Ajouter au Dock\".",
  install_windows_title: "Sur Windows",
  install_windows_steps: "Cliquez sur le bouton Installer maintenant ci-dessus, ou cliquez sur l'icône d'installation dans la barre d'adresse.",
  install_iphone_title: "Sur iPhone",
  install_iphone_steps: "Appuyez sur l'icône Partager dans Safari, puis choisissez \"Sur l'écran d'accueil\".",
  install_android_title: "Sur Android",
  install_android_steps: "Appuyez sur l'icône de menu dans Chrome, puis choisissez \"Installer l'application\".",
};

const de: Dict = {
  nav_dashboard: "Dashboard",
  nav_assistant: "Assistent",
  nav_agents: "Agenten",
  nav_tasks: "Aufgaben",
  nav_approvals: "Genehmigungen",
  nav_workflows: "Arbeitsabläufe",
  nav_reports: "Berichte",
  nav_integrations: "Integrationen",
  nav_settings: "Einstellungen",
  search_placeholder: "Suchen...",
  chats_label: "Chats",
  new_chat: "Neuer Chat",
  greeting: "Guten Morgen, {name}.",
  greeting_subtitle: "Das passiert heute.",
  metric_tasks_completed: "Heute erledigte Aufgaben",
  metric_pending_approvals: "Offene Genehmigungen",
  metric_active_agents: "Aktive Agenten",
  chart_task_volume: "Aufgabenvolumen",
  chart_agent_performance: "Agentenleistung",
  recent_activity: "Letzte Aktivität",
  no_activity: "Noch keine Aktivität. Erstelle eine Aufgabe, um loszulegen.",
  loading_dashboard: "Dashboard wird geladen…",
  work_email: "Geschäftliche E-Mail",
  password: "Passwort",
  log_in: "Anmelden",
  logging_in: "Anmeldung läuft…",
  forgot_password: "Passwort vergessen?",
  invalid_credentials: "Ungültige E-Mail oder Passwort.",
  login_tagline: "Mach dort weiter, wo deine Agenten aufgehört haben.",
  language: "Sprache",
  install_title: "Managent auf deinem Gerät installieren",
  install_subtitle: "Füge Managent für die schnellste Nutzung deinem Startbildschirm oder Desktop hinzu.",
  install_now: "Jetzt installieren",
  install_skip: "Im Browser fortfahren",
  install_done: "Du kannst deinen Browser jetzt schließen. Öffne Managent über deinen Desktop.",
  install_mac_title: "Auf dem Mac",
  install_mac_steps: "Klicke oben auf \"Jetzt installieren\" oder nutze das Teilen-Menü von Safari und wähle \"Zum Dock hinzufügen\".",
  install_windows_title: "Unter Windows",
  install_windows_steps: "Klicke oben auf \"Jetzt installieren\" oder klicke auf das Installationssymbol in der Adressleiste.",
  install_iphone_title: "Auf dem iPhone",
  install_iphone_steps: "Tippe in Safari auf das Teilen-Symbol und wähle \"Zum Home-Bildschirm\".",
  install_android_title: "Auf Android",
  install_android_steps: "Tippe in Chrome auf das Menüsymbol und wähle \"App installieren\".",
};

const es: Dict = {
  nav_dashboard: "Panel",
  nav_assistant: "Asistente",
  nav_agents: "Agentes",
  nav_tasks: "Tareas",
  nav_approvals: "Aprobaciones",
  nav_workflows: "Flujos de trabajo",
  nav_reports: "Informes",
  nav_integrations: "Integraciones",
  nav_settings: "Configuración",
  search_placeholder: "Buscar...",
  chats_label: "Chats",
  new_chat: "Nuevo chat",
  greeting: "Buenos días, {name}.",
  greeting_subtitle: "Esto es lo que pasa hoy.",
  metric_tasks_completed: "Tareas completadas hoy",
  metric_pending_approvals: "Aprobaciones pendientes",
  metric_active_agents: "Agentes activos",
  chart_task_volume: "Volumen de tareas",
  chart_agent_performance: "Rendimiento del agente",
  recent_activity: "Actividad reciente",
  no_activity: "Aún no hay actividad. Crea una tarea para empezar.",
  loading_dashboard: "Cargando tu panel…",
  work_email: "Correo de trabajo",
  password: "Contraseña",
  log_in: "Iniciar sesión",
  logging_in: "Iniciando sesión…",
  forgot_password: "¿Olvidaste tu contraseña?",
  invalid_credentials: "Correo o contraseña inválidos.",
  login_tagline: "Continúa donde lo dejaron tus agentes.",
  language: "Idioma",
  install_title: "Instala Managent en tu dispositivo",
  install_subtitle: "Añade Managent a tu pantalla de inicio o escritorio para la experiencia más rápida.",
  install_now: "Instalar ahora",
  install_skip: "Continuar en el navegador",
  install_done: "Ya puedes cerrar tu navegador. Abre Managent desde tu escritorio.",
  install_mac_title: "En Mac",
  install_mac_steps: "Haz clic en el botón Instalar ahora arriba, o usa el menú Compartir de Safari y elige \"Añadir al Dock\".",
  install_windows_title: "En Windows",
  install_windows_steps: "Haz clic en el botón Instalar ahora arriba, o haz clic en el icono de instalación en la barra de direcciones.",
  install_iphone_title: "En iPhone",
  install_iphone_steps: "Toca el icono Compartir en Safari y elige \"Añadir a pantalla de inicio\".",
  install_android_title: "En Android",
  install_android_steps: "Toca el icono de menú en Chrome y elige \"Instalar aplicación\".",
};

const DICTS: Record<LangCode, Dict> = { en, tr, ar, fr, de, es };

function getUserKey(): string {
  if (typeof window === "undefined") return "anon";
  try {
    const token = window.localStorage.getItem("managent_token");
    if (!token) return "anon";
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub || payload.email || "anon";
  } catch {
    return "anon";
  }
}

type Ctx = { lang: LangCode; setLang: (l: LangCode) => void; t: (key: string, vars?: Record<string, string | number>) => string; dir: "ltr" | "rtl" };
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const key = `managent_lang_${getUserKey()}`;
    const stored = window.localStorage.getItem(key) as LangCode | null;
    if (stored && DICTS[stored]) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: LangCode) => {
    setLangState(l);
    const key = `managent_lang_${getUserKey()}`;
    window.localStorage.setItem(key, l);
  };

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    dir: RTL_LANGS.includes(lang) ? "rtl" : "ltr",
    t: (key: string, vars?: Record<string, string | number>) => {
      let str = DICTS[lang][key] || DICTS.en[key] || key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
  }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
