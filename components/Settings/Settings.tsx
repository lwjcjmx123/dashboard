import React from 'react';
import { Moon, Sun, Globe, Clock, DollarSign, Bell, Database, Shield } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const { settings } = state;
  const isDark = settings.theme === 'dark';

  const handleSettingChange = (key: string, value: any) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        [key]: value
      }
    });
  };

  const handleNestedSettingChange = (parentKey: string, childKey: string, value: any) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        [parentKey]: {
          ...settings[parentKey as keyof typeof settings],
          [childKey]: value
        }
      }
    });
  };

  const exportData = () => {
    const dataToExport = {
      tasks: state.tasks,
      events: state.events,
      bills: state.bills,
      expenses: state.expenses,
      notes: state.notes,
      pomodoroSessions: state.pomodoroSessions,
      settings: state.settings,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pms-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate the imported data structure
        if (importedData.tasks && importedData.events && importedData.bills) {
          dispatch({ type: 'LOAD_DATA', payload: importedData });
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      dispatch({ type: 'LOAD_DATA', payload: {
        tasks: [],
        events: [],
        bills: [],
        expenses: [],
        notes: [],
        pomodoroSessions: [],
      }});
      alert('All data has been cleared.');
    }
  };

  const settingSections = [
    {
      title: 'Appearance',
      icon: isDark ? Sun : Moon,
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
          value: settings.notifications.tasks,
          onChange: (value: boolean) => handleNestedSettingChange('notifications', 'tasks', value),
        },
        {
          label: 'Bill Notifications',
          description: 'Receive alerts for upcoming bill payments',
          type: 'toggle',
          value: settings.notifications.bills,
          onChange: (value: boolean) => handleNestedSettingChange('notifications', 'bills', value),
        },
        {
          label: 'Pomodoro Notifications',
          description: 'Get notified when Pomodoro sessions start and end',
          type: 'toggle',
          value: settings.notifications.pomodoro,
          onChange: (value: boolean) => handleNestedSettingChange('notifications', 'pomodoro', value),
        },
        {
          label: 'Event Notifications',
          description: 'Receive reminders for calendar events',
          type: 'toggle',
          value: settings.notifications.events,
          onChange: (value: boolean) => handleNestedSettingChange('notifications', 'events', value),
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
          value: settings.pomodoro.workDuration,
          onChange: (value: number) => handleNestedSettingChange('pomodoro', 'workDuration', value),
        },
        {
          label: 'Short Break Duration',
          description: 'Duration of short breaks (minutes)',
          type: 'number',
          value: settings.pomodoro.shortBreakDuration,
          onChange: (value: number) => handleNestedSettingChange('pomodoro', 'shortBreakDuration', value),
        },
        {
          label: 'Long Break Duration',
          description: 'Duration of long breaks (minutes)',
          type: 'number',
          value: settings.pomodoro.longBreakDuration,
          onChange: (value: number) => handleNestedSettingChange('pomodoro', 'longBreakDuration', value),
        },
        {
          label: 'Sessions Until Long Break',
          description: 'Number of work sessions before a long break',
          type: 'number',
          value: settings.pomodoro.sessionsUntilLongBreak,
          onChange: (value: number) => handleNestedSettingChange('pomodoro', 'sessionsUntilLongBreak', value),
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
              className={`rounded-xl border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } p-6`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
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
                          onChange={(e) => setting.onChange(e.target.value)}
                          className={`px-3 py-2 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {setting.type === 'toggle' && (
                        <button
                          onClick={() => setting.onChange(!setting.value)}
                          className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${
                            setting.value
                              ? 'bg-blue-600'
                              : isDark ? 'bg-gray-600' : 'bg-gray-200'
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
                          onChange={(e) => setting.onChange(parseInt(e.target.value))}
                          className={`w-20 px-3 py-2 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
        <div className={`rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
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
        <div className={`rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
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
                  Local Storage Only
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your data is stored locally on your device and never transmitted to external servers. 
                You have complete control over your privacy and data security.
              </p>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Data Privacy:</strong> All your personal information, tasks, notes, and financial data 
                remain on your device. The application works entirely offline and does not collect or 
                transmit any personal data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;