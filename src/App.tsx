import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Calendar from './components/Calendar/Calendar';
import Tasks from './components/Tasks/Tasks';
import Finance from './components/Finance/Finance';
import Notes from './components/Notes/Notes';
import Pomodoro from './components/Pomodoro/Pomodoro';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const { currentView, settings } = state;

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <Calendar />;
      case 'tasks':
        return <Tasks />;
      case 'finance':
        return <Finance />;
      case 'notes':
        return <Notes />;
      case 'pomodoro':
        return <Pomodoro />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen ${settings.theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;