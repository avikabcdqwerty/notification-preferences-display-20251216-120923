import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { NotificationPreferences } from "../NotificationPreferences";
import { fetchNotificationTypes } from "../../api/api";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n/i18n";
import userEvent from "@testing-library/user-event";

// Mock API
jest.mock("../../api/api");
const mockedFetchNotificationTypes = fetchNotificationTypes as jest.MockedFunction<typeof fetchNotificationTypes>;

describe("NotificationPreferences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading indicator initially", async () => {
    mockedFetchNotificationTypes.mockReturnValue(
      new Promise(() => {
        /* never resolves */
      })
    );
    render(
      <I18nextProvider i18n={i18n}>
        <NotificationPreferences />
      </I18nextProvider>
    );
    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  });

  it("renders notification types after successful fetch", async () => {
    mockedFetchNotificationTypes.mockResolvedValue({
      notification_types: [
        {
          key: "email_alert",
          description: "Email Alert",
          is_active: true,
          is_deprecated: false,
        },
        {
          key: "sms_alert",
          description: "SMS Alert",
          is_active: true,
          is_deprecated: true,
          deprecated_reason: "This type is no longer supported.",
        },
      ],
    });

    render(
      <I18nextProvider i18n={i18n}>
        <NotificationPreferences />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Email Alert")).toBeInTheDocument();
      expect(screen.getByText("SMS Alert")).toBeInTheDocument();
      expect(screen.getByText(/deprecated/i)).toBeInTheDocument();
      expect(screen.getByText(/no longer supported/i)).toBeInTheDocument();
    });
  });

  it("shows empty state if no notification types", async () => {
    mockedFetchNotificationTypes.mockResolvedValue({
      notification_types: [],
    });

    render(
      <I18nextProvider i18n={i18n}>
        <NotificationPreferences />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no notification types/i)).toBeInTheDocument();
    });
  });

  it("shows error message on API error", async () => {
    mockedFetchNotificationTypes.mockRejectedValue({ message: "Network error" });

    render(
      <I18nextProvider i18n={i18n}>
        <NotificationPreferences />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it("shows unauthenticated error if 401", async () => {
    mockedFetchNotificationTypes.mockRejectedValue({
      response: { status: 401 },
      message: "Unauthorized",
    });

    render(
      <I18nextProvider i18n={i18n}>
        <NotificationPreferences />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/must be logged in/i)).toBeInTheDocument();
    });
  });

  it("is accessible: all notification cards have region role and aria-label", async () => {
    mockedFetchNotificationTypes.mockResolvedValue({
      notification_types: [
        {
          key: "push_alert",
          description: "Push Alert",
          is_active: true,
          is_deprecated: false,
        },
      ],
    });

    render(
      <I18nextProvider i18n={i18n}>
        <NotificationPreferences />
      </I18nextProvider>
    );

    await waitFor(() => {
      const card = screen.getByTestId("notification-type-card-push_alert");
      expect(card).toHaveAttribute("role", "region");
      expect(card).toHaveAttribute("aria-label");
    });
  });

  it("supports keyboard navigation", async () => {
    mockedFetchNotificationTypes.mockResolvedValue({
      notification_types: [
        {
          key: "keyboard_alert",
          description: "Keyboard Alert",
          is_active: true,
          is_deprecated: false,
        },
      ],
    });

    render(
      <I18nextProvider i18n={i18n}>
        <NotificationPreferences />
      </I18nextProvider>
    );

    await waitFor(() => {
      const card = screen.getByTestId("notification-type-card-keyboard_alert");
      card.focus();
      expect(card).toHaveFocus();
    });
  });
});