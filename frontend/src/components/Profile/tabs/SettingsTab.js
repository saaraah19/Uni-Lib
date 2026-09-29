import React, { useState } from "react";
import api from "../../../services/api";
import { useTheme } from "../../../context/ThemeContext";
/**
 * SettingsTab Component
 *
 * Displays user settings including:
 * - Theme toggle (light/dark mode)
 * - Notification preferences
 * - Password change functionality
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isDarkMode - Current theme mode
 * @param {Function} props.onThemeToggle - Function to toggle theme
 * @returns {React.ReactElement} Settings tab content
 *
 * @example
 * <SettingsTab isDarkMode={false} onThemeToggle={handleToggle} />
 */
const SettingsTab = () => {
  const { isDarkMode, toggleTheme } = useTheme(); //

  const [notifications, setNotifications] = useState(true);
  // --- NOUVEL ÉTAT POUR LE MOT DE PASSE ---
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  // --- FONCTION DE MISE À JOUR ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    // Validation rapide
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setStatus({
        type: "error",
        msg: "Les nouveaux mots de passe ne correspondent pas.",
      });
    }
    if (passwordData.newPassword.length < 6) {
      return setStatus({
        type: "error",
        msg: "Le nouveau mot de passe doit faire au moins 6 caractères.",
      });
    }

    setLoading(true);
    try {
      const response = await api.put("/users/update-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setStatus({ type: "success", msg: response.data.message });
      // Réinitialiser les champs après succès
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Une erreur est survenue.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Settings
      </h2>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-colors duration-300">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-xl">🎨</span> Theme
          </h3>
          <div className="flex gap-4">
            <button
              onClick={toggleTheme} // Just call toggle directly
              className={`
                flex-1 p-4 border-2 rounded-xl
                transition-all duration-200
                ${
                  !isDarkMode
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }
              `}
            >
              <div className="text-2xl mb-2">☀️</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Light Mode
              </div>
              {!isDarkMode && (
                <div className="text-xs text-blue-500 mt-1">Active</div>
              )}
            </button>

            <button
              onClick={toggleTheme} // Same function works for both
              className={`
                flex-1 p-4 border-2 rounded-xl
                transition-all duration-200
                ${
                  isDarkMode
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }
              `}
            >
              <div className="text-2xl mb-2">🌙</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Dark Mode
              </div>
              {isDarkMode && (
                <div className="text-xs text-blue-500 mt-1">Active</div>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-colors duration-300">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-xl">🔔</span> Notifications
          </h3>
          <div className="space-y-4">
            {/* Loan Reminders */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  Loan Reminders
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified before due dates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="
                  w-12 h-6
                  bg-gray-200 dark:bg-gray-700
                  rounded-full
                  peer
                  peer-checked:after:translate-x-full
                  peer-checked:after:border-white
                  after:content-['']
                  after:absolute after:top-[2px] after:left-[2px]
                  after:bg-white after:border-gray-300 after:border after:rounded-full
                  after:h-5 after:w-5 after:transition-all
                  peer-checked:bg-blue-500
                "
                ></div>
              </label>
            </div>

            {/* Favorite Updates */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  Favorite Updates
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when favorite books are available
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div
                  className="
                  w-12 h-6
                  bg-gray-200 dark:bg-gray-700
                  rounded-full
                  peer
                  peer-checked:after:translate-x-full
                  peer-checked:after:border-white
                  after:content-['']
                  after:absolute after:top-[2px] after:left-[2px]
                  after:bg-white after:border-gray-300 after:border after:rounded-full
                  after:h-5 after:w-5 after:transition-all
                  peer-checked:bg-red-500
                "
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-colors duration-300">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-xl">🔒</span> Change Password
          </h3>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              required
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  oldPassword: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="New Password"
              required
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            {/* Message de retour (Succès ou Erreur) */}
            {status.msg && (
              <div
                className={`p-3 rounded-lg text-sm text-center ${
                  status.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {status.msg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
