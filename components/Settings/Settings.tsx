import React from "react";
import {
  Moon,
  Sun,
  Globe,
  Clock,
  DollarSign,
  Bell,
  Database,
  Shield,
} from "lucide-react";
import { useClientUserSettings } from "@/lib/client-data-hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

interface SelectSetting {
  label: string;
  description: string;
  type: "select";
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface ToggleSetting {
  label: string;
  description: string;
  type: "toggle";
  value: boolean;
  onChange: (value: boolean) => void;
}

interface NumberSetting {
  label: string;
  description: string;
  type: "number";
  value: number;
  onChange: (value: number) => void;
}

type Setting = SelectSetting | ToggleSetting | NumberSetting;

const Settings: React.FC = () => {
  const { settings, updateSettings, loading } = useClientUserSettings();
  const { language, setLanguage, t } = useLanguage();
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();

  const handleSettingChange = async (key: string, value: any) => {
    try {
      await updateSettings({
        [key]: value,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  const handleColorSchemeChange = (
    newScheme: "blue" | "green" | "purple" | "red"
  ) => {
    setColorScheme(newScheme);
  };

  const handleLanguageChange = (newLanguage: "zh" | "en") => {
    setLanguage(newLanguage);
  };

  const exportData = () => {
    // This would export all user data
    console.log("Export data functionality would be implemented here");
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // This would import user data
    console.log("Import data functionality would be implemented here");
  };

  const clearAllData = () => {
    if (window.confirm(t("clearAllDataConfirm"))) {
      // This would clear all user data
      console.log("Clear all data functionality would be implemented here");
    }
  };

  if (loading || !settings) {
    return <div className="p-6">{t("loading")}</div>;
  }

  const settingSections: {
    title: string;
    icon: any;
    settings: Setting[];
  }[] = [
    {
      title: t("appearance"),
      icon: theme === "dark" ? Sun : Moon,
      settings: [
        {
          label: t("colorScheme"),
          description: t("colorSchemeDescription"),
          type: "select",
          value: colorScheme,
          options: [
            { value: "blue", label: t("blue") },
            { value: "green", label: t("green") },
            { value: "purple", label: t("purple") },
            { value: "red", label: t("red") },
          ],
          onChange: (value: string) =>
            handleColorSchemeChange(
              value as "blue" | "green" | "purple" | "red"
            ),
        },
      ],
    },
    {
      title: t("regional"),
      icon: Globe,
      settings: [
        {
          label: t("language"),
          description: t("languageDescription"),
          type: "select",
          value: language,
          options: [
            { value: "zh", label: t("chinese") },
            { value: "en", label: t("english") },
          ],
          onChange: (value: string) =>
            handleLanguageChange(value as "zh" | "en"),
        },
        {
          label: t("timeFormat"),
          description: t("timeFormatDescription"),
          type: "select",
          value: settings.timeFormat,
          options: [
            { value: "12", label: t("12hour") },
            { value: "24", label: t("24hour") },
          ],
          onChange: (value: string) => handleSettingChange("timeFormat", value),
        },
      ],
    },
    {
      title: t("currency"),
      icon: DollarSign,
      settings: [
        {
          label: t("defaultCurrency"),
          description: t("defaultCurrencyDescription"),
          type: "select",
          value: settings.currency,
          options: [
            { value: "CNY", label: "Chinese Yuan (¥)" },
            { value: "USD", label: "US Dollar ($)" },
            { value: "EUR", label: "Euro (€)" },
            { value: "GBP", label: "British Pound (£)" },
            { value: "JPY", label: "Japanese Yen (¥)" },
          ],
          onChange: (value: string) => handleSettingChange("currency", value),
        },
      ],
    },
    {
      title: t("notifications"),
      icon: Bell,
      settings: [
        {
          label: t("taskNotifications"),
          description: t("taskNotificationsDescription"),
          type: "toggle",
          value: settings.notifyTasks,
          onChange: (value: boolean) =>
            handleSettingChange("notifyTasks", value),
        },
        {
          label: t("billNotifications"),
          description: t("billNotificationsDescription"),
          type: "toggle",
          value: settings.notifyBills,
          onChange: (value: boolean) =>
            handleSettingChange("notifyBills", value),
        },
        {
          label: t("pomodoroNotifications"),
          description: t("pomodoroNotificationsDescription"),
          type: "toggle",
          value: settings.notifyPomodoro,
          onChange: (value: boolean) =>
            handleSettingChange("notifyPomodoro", value),
        },
        {
          label: t("eventNotifications"),
          description: t("eventNotificationsDescription"),
          type: "toggle",
          value: settings.notifyEvents,
          onChange: (value: boolean) =>
            handleSettingChange("notifyEvents", value),
        },
      ],
    },
    {
      title: t("pomodoroSettings"),
      icon: Clock,
      settings: [
        {
          label: t("workDuration"),
          description: t("workDurationDescription"),
          type: "number",
          value: settings.workDuration,
          onChange: (value: number) =>
            handleSettingChange("workDuration", value),
        },
        {
          label: t("shortBreakDuration"),
          description: t("shortBreakDurationDescription"),
          type: "number",
          value: settings.shortBreakDuration,
          onChange: (value: number) =>
            handleSettingChange("shortBreakDuration", value),
        },
        {
          label: t("longBreakDuration"),
          description: t("longBreakDurationDescription"),
          type: "number",
          value: settings.longBreakDuration,
          onChange: (value: number) =>
            handleSettingChange("longBreakDuration", value),
        },
        {
          label: t("sessionsUntilLongBreak"),
          description: t("sessionsUntilLongBreakDescription"),
          type: "number",
          value: settings.sessionsUntilLongBreak,
          onChange: (value: number) =>
            handleSettingChange("sessionsUntilLongBreak", value),
        },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("settingsTitle")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("settingsSubtitle")}
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Icon
                    className="text-primary-600 dark:text-primary-400"
                    size={20}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h3>
              </div>

              <div className="space-y-6">
                {section.settings.map((setting, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {setting.description}
                      </p>
                    </div>

                    <div className="ml-4">
                      {setting.type === "select" && (
                        <select
                          value={setting.value}
                          onChange={(e) =>
                            (setting.onChange as (value: string) => void)(
                              e.target.value
                            )
                          }
                          className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {(setting as SelectSetting).options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {setting.type === "toggle" && (
                        <button
                          onClick={() =>
                            (setting as ToggleSetting).onChange(
                              !(setting as ToggleSetting).value
                            )
                          }
                          className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${
                            setting.value
                              ? "bg-primary-600"
                              : "bg-gray-200 dark:bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              setting.value ? "translate-x-6" : "translate-x-1"
                            } mt-1`}
                          />
                        </button>
                      )}

                      {setting.type === "number" && (
                        <input
                          type="number"
                          value={setting.value}
                          onChange={(e) =>
                            (setting as NumberSetting).onChange(
                              parseInt(e.target.value)
                            )
                          }
                          className="w-20 px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Data Management */}
        <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Database
                className="text-primary-600 dark:text-primary-400"
                size={20}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("dataManagement")}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {t("exportData")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("exportDataDescription")}
                </p>
              </div>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                {t("export")}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {t("importData")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("importDataDescription")}
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 cursor-pointer"
                >
                  {t("import")}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {t("clearAllData")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("clearAllDataDescription")}
                </p>
              </div>
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                {t("clearAll")}
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Shield
                className="text-primary-600 dark:text-primary-400"
                size={20}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("privacySecurity")}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield
                  className="text-green-600 dark:text-green-400"
                  size={16}
                />
                <span className="text-sm font-medium text-green-800 dark:text-green-400">
                  {t("databaseStorage")}
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t("databaseStorageDescription")}
              </p>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>{t("dataPrivacy")}:</strong>{" "}
                {t("dataPrivacyDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
