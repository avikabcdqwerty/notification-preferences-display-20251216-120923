import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/NotificationTypeCard.scss";

interface NotificationType {
  key: string;
  description: string;
  is_active: boolean;
  is_deprecated: boolean;
  deprecated_reason?: string | null;
}

interface NotificationTypeCardProps {
  notificationType: NotificationType;
  locale: string;
}

export const NotificationTypeCard: React.FC<NotificationTypeCardProps> = ({
  notificationType,
  locale,
}) => {
  const { t } = useTranslation();

  const {
    key,
    description,
    is_active,
    is_deprecated,
    deprecated_reason,
  } = notificationType;

  // Accessibility: visually mark deprecated types, provide tooltip/explanation
  const deprecatedLabel = is_deprecated
    ? t("notificationTypeCard.deprecated")
    : null;

  return (
    <div
      className={`notification-type-card${is_deprecated ? " notification-type-card--deprecated" : ""}`}
      aria-label={
        is_deprecated
          ? t("notificationTypeCard.deprecatedAria", { key })
          : t("notificationTypeCard.aria", { key })
      }
      tabIndex={0}
      role="region"
      aria-describedby={`notification-type-desc-${key}`}
      data-testid={`notification-type-card-${key}`}
    >
      <div className="notification-type-card__header">
        <span className="notification-type-card__key" id={`notification-type-key-${key}`}>
          {key}
        </span>
        {is_deprecated && (
          <span
            className="notification-type-card__deprecated"
            aria-label={deprecatedLabel}
            tabIndex={0}
            role="tooltip"
            title={deprecated_reason || t("notificationTypeCard.deprecatedTooltip")}
          >
            {deprecatedLabel}
            <span className="notification-type-card__icon" aria-hidden="true">
              &#9888;
            </span>
          </span>
        )}
      </div>
      <div
        className="notification-type-card__description"
        id={`notification-type-desc-${key}`}
      >
        {description}
      </div>
      {is_deprecated && deprecated_reason && (
        <div className="notification-type-card__deprecated-reason" aria-live="polite">
          <span className="notification-type-card__deprecated-reason-label">
            {t("notificationTypeCard.deprecatedReason")}
          </span>
          <span className="notification-type-card__deprecated-reason-text">
            {deprecated_reason}
          </span>
        </div>
      )}
    </div>
  );
};