import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Example translation resources (expand as needed)
const resources = {
  en: {
    translation: {
      notificationPreferences: {
        title: "Notification Preferences",
        heading: "Your Notification Preferences",
        description: "View all available notification types and their descriptions.",
        loading: "Loading notification types...",
        empty: "No notification types available.",
        listLabel: "Notification types list",
      },
      notificationTypeCard: {
        deprecated: "Deprecated",
        deprecatedTooltip: "This notification type is deprecated.",
        deprecatedReason: "Reason:",
        deprecatedAria: "{{key}} (deprecated notification type)",
        aria: "{{key}} notification type",
      },
      errors: {
        unauthenticated: "You must be logged in to view your notification preferences.",
        fetch_failed: "Failed to load notification types. Please try again later.",
      },
    },
  },
  fr: {
    translation: {
      notificationPreferences: {
        title: "Préférences de notification",
        heading: "Vos préférences de notification",
        description: "Consultez tous les types de notifications disponibles et leurs descriptions.",
        loading: "Chargement des types de notifications...",
        empty: "Aucun type de notification disponible.",
        listLabel: "Liste des types de notifications",
      },
      notificationTypeCard: {
        deprecated: "Obsolète",
        deprecatedTooltip: "Ce type de notification est obsolète.",
        deprecatedReason: "Raison :",
        deprecatedAria: "{{key}} (type de notification obsolète)",
        aria: "Type de notification {{key}}",
      },
      errors: {
        unauthenticated: "Vous devez être connecté pour voir vos préférences de notification.",
        fetch_failed: "Échec du chargement des types de notifications. Veuillez réessayer plus tard.",
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator"],
      caches: ["localStorage", "cookie"],
    },
  });

export default i18n;