import React from 'react';
import { Moon, Sun, Globe, Clock, DollarSign, Bell, Database, Shield } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_SETTINGS } from '@/lib/graphql/queries';
import { UPDATE_USER_SETTINGS } from '@/lib/graphql/mutations';

interface SelectSetting {
  label: string;
  description: string;
  type: 'select';
  value: string;
  options: { value: string; label: string; }[];
  onChange: (value: string) => void;
}

interface ToggleSetting {
  label: string;
  description: string;
  type: 'toggle';
  value: boolean;
  onChange: (value: boolean) => void;
}

interface NumberSetting {
  label: string;
  description: string;
  type: 'number';
  value: number;
  onChange: (value: number) => void;
}

type Setting = SelectSetting | ToggleSetting | NumberSetting;

const Settings: React.FC = () => {
  const { data, loading } = useQuery(GET_USER_SETTINGS);
  const [updateSettings] = useMutation(UPDATE_USER_SETTINGS, {
    refetchQueries: [{ query: GET_USER_SETTINGS }],
  });

  const settings = data?.userSettings;

  const handleSettingChange = async (key: string, value: any) => {
    try {
      await updateSettings({
        variables: {
          input: {
            [key]: value
          }
        }
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const exportData = () => {
    // This would export all user data
    console.log('Export data functionality would be implemented here');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // This would import user data
    console.log('Import data functionality would be implemented here');
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // This would clear all user data
      console.log('Clear all data functionality would be implemented here');
    }
  };

  if (loading || !settings) {
    return <div className="p-6">Loading settings...</div>;
  }

  const settingSections: {
    title: string;
    icon: any;
    settings: Setting[];
  }[] = [
    {
      title: 'Appearance',
      icon: settings.theme === 'dark' ? Sun : Moon,
      settings: [
        {
          label: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'select',
          value: settings.theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ],
          onChange: (value: string) => handleSettingChange('theme', value),
        },
        {
          label: 'Color Scheme',
          description: 'Select your preferred accent color',
          type: 'select',
          value: settings.colorScheme,
          options: [
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' },
            { value: 'purple', label: 'Purple' },
            { value: 'red', label: 'Red' },
          ],
          onChange: (value: string) => handleSettingChange('colorScheme', value),
        },
      ],
    },
    {
      title: 'Regional',
      icon: Globe,
      settings: [
        {
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          value: settings.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
          ],
          onChange: (value: string) => handleSettingChange('language', value),
        },
        {
          label: 'Time Format',
          description: 'Choose 12-hour or 24-hour time format',
          type: 'select',
          value: settings.timeFormat,
          options: [
            { value: '12', label: '12-hour (AM/PM)' },
            { value: '24', label: '24-hour' },
          ],
          onChange: (value: string) => handleSettingChange('timeFormat', value),
        },
      ],
    },
    {
      title: 'Currency',
      icon: DollarSign,
      settings: [
        {
          label: 'Default Currency',
          description: 'Set your preferred currency for financial tracking',
          type: 'select',
          value: settings.currency,
          options: [
            { value: 'USD', label: 'US Dollar ($)' },
            { value: 'EUR', label: 'Euro (€)' },
            { value: 'GBP', label: 'British Pound (£)' },
            { value: 'JPY', label: 'Japanese Yen (¥)' },
            { value: 'CAD', label: 'Canadian Dollar (C$)' },
            { value: 'AUD', label: 'Australian Dollar (A$)' },
          ],
          onChange: (value: string) => handleSettingChange('currency', value),
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          label: 'Task Notifications',
          description: 'Get notified about task deadlines and reminders',
          type: 'toggle',
          value: settings.notifyTasks,
          onChange: (value: boolean) => handleSettingChange('notifyTasks', value),
        },
        {
          label: 'Bill Notifications',
          description: 'Receive alerts for upcoming bill payments',
          type: 'toggle',
          value: settings.notifyBills,
          onChange: (value: boolean) => handleSettingChange('notifyBills', value),
        },
        {
          label: 'Pomodoro Notifications',
          description: 'Get notified when Pomodoro sessions start and end',
          type: 'toggle',
          value: settings.notifyPomodoro,
          onChange: (value: boolean) => handleSettingChange('notifyPomodoro', value),
        },
        {
          label: 'Event Notifications',
          description: 'Receive reminders for calendar events',
          type: 'toggle',
          value: settings.notifyEvents,
          onChange: (value: boolean) => handleSettingChange('notifyEvents', value),
        },
      ],
    },
    {
      title: 'Pomodoro Settings',
      icon: Clock,
      settings: [
        {
          label: 'Work Duration',
          description: 'Duration of work sessions (minutes)',
          type: 'number',
          value: settings.workDuration,
          onChange: (value: number) => handleSettingChange('workDuration', value),
        },
        {
          label: 'Short Break Duration',
          description: 'Duration of short breaks (minutes)',
          type: 'number',
          value: settings.shortBreakDuration,
          onChange: (value: number) => handleSettingChange('shortBreakDuration', value),
        },
        {
          label: 'Long Break Duration',
          description: 'Duration of long breaks (minutes)',
          type: 'number',
          value: settings.longBreakDuration,
          onChange: (value: number) => handleSettingChange('longBreakDuration', value),
        },
        {
          label: 'Sessions Until Long Break',
          description: 'Number of work sessions before a long break',
          type: 'number',
          value: settings.sessionsUntilLongBreak,
          onChange: (value: number) => handleSettingChange('sessionsUntilLongBreak', value),
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
            Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your Personal Management System
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
                  <Icon className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h3>
              </div>
              
              <div className="space-y-6">
                {section.settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {setting.description}
                      </p>
                    </div>
                    
                    <div className="ml-4">
                      {setting.type === 'select' && (
                        <select
                          value={setting.value}
                          onChange={(e) => (setting.onChange as (value: string) => void)(e.target.value)}
                          className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {(setting as SelectSetting).options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {setting.type === 'toggle' && (
                        <button
                          onClick={() => (setting as ToggleSetting).onChange(!(setting as ToggleSetting).value)}
                          className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${
                            setting.value
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              setting.value ? 'translate-x-6' : 'translate-x-1'
                            } mt-1`}
                          />
                        </button>
                      )}
                      
                      {setting.type === 'number' && (
                        <input
                          type="number"
                          value={setting.value}
                          onChange={(e) => (setting as NumberSetting).onChange(parseInt(e.target.value))}
                          className="w-20 px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <Database className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Management
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Export Data
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download a backup of all your data
                </p>
              </div>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Export
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Import Data
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Restore data from a backup file
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 cursor-pointer"
                >
                  Import
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Clear All Data
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete all your data
                </p>
              </div>
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Shield className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Privacy & Security
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-green-600 dark:text-green-400" size={16} />
                <span className="text-sm font-medium text-green-800 dark:text-green-400">
                  Database Storage
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your data is stored in a local SQLite database with GraphQL API access. 
                All data remains on your server and you have complete control over your privacy and data security.
              </p>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Data Privacy:</strong> All your personal information, tasks, notes, and financial data 
                are stored in your local database. The application provides a secure GraphQL API for data access 
                and does not transmit any personal data to external servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;