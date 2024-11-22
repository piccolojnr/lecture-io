"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    language: "en",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      //   const response = await fetch("/api/settings", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(settings),
      //   });
      //   if (!response.ok) {
      //     throw new Error("Failed to save settings");
      //   }
      //   setMessage("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {message && (
        <div className="mb-4 text-center text-sm font-medium text-green-500">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="darkMode" className="text-lg font-medium">
            Dark Mode
          </label>
          <input
            type="checkbox"
            id="darkMode"
            checked={settings.darkMode}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, darkMode: e.target.checked }))
            }
            className="w-6 h-6"
          />
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <label htmlFor="notifications" className="text-lg font-medium">
            Enable Notifications
          </label>
          <input
            type="checkbox"
            id="notifications"
            checked={settings.notifications}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                notifications: e.target.checked,
              }))
            }
            className="w-6 h-6"
          />
        </div>

        {/* Language Selection */}
        <div>
          <label htmlFor="language" className="text-lg font-medium mb-2 block">
            Language
          </label>
          <select
            id="language"
            value={settings.language}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, language: e.target.value }))
            }
            className="w-full p-2 border rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="text-right">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
