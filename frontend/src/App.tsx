import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NotificationPreferences } from "./components/NotificationPreferences";
import { getAuthToken, isAuthenticated, logout } from "./auth/auth";
import "./i18n/i18n";
import "./styles/App.scss";

const LoginPrompt: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="login-prompt" role="alert" aria-live="assertive">
      <h2>{t("errors.unauthenticated")}</h2>
      <button
        className="login-prompt__button"
        onClick={() => {
          // Redirect to login page or trigger login modal
          window.location.href = "/login";
        }}
        aria-label={t("loginPrompt.buttonLabel")}
      >
        {t("loginPrompt.button")}
      </button>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Check authentication status (token presence and validity)
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setAuthed(true);
      } else {
        setAuthed(false);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!authChecked) {
    // Loading indicator for auth check
    return (
      <div className="app__loading" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
      </div>
    );
  }

  return authed ? <>{children}</> : <LoginPrompt />;
};

const App: React.FC = () => {
  return (
    <Router>
      <main className="app" aria-label="Notification Preferences Application">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <NotificationPreferences />
              </ProtectedRoute>
            }
          />
          {/* Add more routes as needed, e.g. login, settings */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;