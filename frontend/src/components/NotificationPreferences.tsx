import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { NotificationTypeCard } from "./NotificationTypeCard";
import { fetchNotificationTypes } from "../api/api";
import "../styles/NotificationPreferences.scss";

interface NotificationType {
  key: string;
  description: string;
  is_active: boolean;
  is_deprecated: boolean;
  deprecated_reason?: string | null;
}

export const NotificationPreferences: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotificationTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotificationTypes(i18n.language);
      setNotificationTypes(data.notification_types);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError(t("errors.unauthenticated"));
      } else {
        setError(t("errors.fetch_failed"));
      }
    } finally {
      setLoading(false);
    }
  }, [i18n.language, t]);

  useEffect(() => {
    loadNotificationTypes();
    // Re-fetch when language changes
  }, [loadNotificationTypes]);

  return (
    <section
      className="notification-preferences"
      aria-labelledby="notification-preferences-title"
      tabIndex={-1}
    >
      <h1 id="notification-preferences-title" className="sr-only">
        {t("notificationPreferences.title")}
      </h1>
      <div className="notification-preferences__header">
        <span className="notification-preferences__heading">
          {t("notificationPreferences.heading")}
        </span>
        <span className="notification-preferences__desc">
          {t("notificationPreferences.description")}
        </span>
      </div>
      {loading ? (
        <div
          className="notification-preferences__loading"
          role="status"
          aria-live="polite"
        >
          <span className="spinner" aria-hidden="true" />
          {t("notificationPreferences.loading")}
        </div>
      ) : error ? (
        <div
          className="notification-preferences__error"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      ) : (
        <ul className="notification-preferences__list" aria-label={t("notificationPreferences.listLabel")}>
          {notificationTypes.length === 0 ? (
            <li className="notification-preferences__empty">
              {t("notificationPreferences.empty")}
            </li>
          ) : (
            notificationTypes.map((nt) => (
              <li key={nt.key} className="notification-preferences__item">
                <NotificationTypeCard
                  notificationType={nt}
                  locale={i18n.language}
                />
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
};