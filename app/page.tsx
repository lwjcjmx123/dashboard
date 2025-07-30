"use client";

import { useEffect, useState } from "react";
import { useClientUserSettings } from "@/lib/client-data-hooks";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import Dashboard from "@/components/Dashboard/Dashboard";
import Calendar from "@/components/Calendar/Calendar";
import Tasks from "@/components/Tasks/Tasks";
import Finance from "@/components/Finance/Finance";
import Notes from "@/components/Notes/Notes";
import Pomodoro from "@/components/Pomodoro/Pomodoro";
import Analytics from "@/components/Analytics/Analytics";
import Settings from "@/components/Settings/Settings";

type ViewType =
  | "dashboard"
  | "calendar"
  | "tasks"
  | "finance"
  | "notes"
  | "pomodoro"
  | "analytics"
  | "settings";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDark, setIsDark] = useState(false);

  const { settings: userSettings, loading, error } = useClientUserSettings();

  const handleViewChange = (view: string) => {
    setCurrentView(view as ViewType);
  };

  useEffect(() => {
    if (userSettings?.theme) {
      const theme = userSettings.theme;
      setIsDark(theme === "dark");
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [userSettings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            onNavigate={(view: string) => setCurrentView(view as ViewType)}
          />
        );
      case "calendar":
        return (
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        );
      case "tasks":
        return <Tasks />;
      case "finance":
        return <Finance />;
      case "notes":
        return <Notes />;
      case "pomodoro":
        return <Pomodoro />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard
            onNavigate={(view: string) => setCurrentView(view as ViewType)}
          />
        );
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? "dark" : ""}`}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedDate={selectedDate} onViewChange={handleViewChange} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
