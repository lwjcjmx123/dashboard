import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  BarChart3,
  Clock,
  Square,
} from "lucide-react";
import {
  useClientPomodoroSessions,
  useClientTasks,
  useClientUserSettings,
} from "@/lib/client-data-hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { minutesToHours } from "@/utils/dateUtils";
import dayjs from "dayjs";

const Pomodoro: React.FC = () => {
  const { sessions: pomodoroSessions, createSession } =
    useClientPomodoroSessions();
  const { tasks } = useClientTasks();
  const { settings: userSettings, updateSettings } = useClientUserSettings();

  const { t } = useLanguage();
  const { colorScheme } = useTheme();

  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes
  const [sessionType, setSessionType] = useState<
    "WORK" | "BREAK" | "LONG_BREAK"
  >("WORK");
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<any>(null);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Update timeLeft when settings change
  useEffect(() => {
    if (userSettings) {
      const duration =
        sessionType === "WORK"
          ? userSettings.workDuration
          : sessionType === "BREAK"
          ? userSettings.shortBreakDuration
          : userSettings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
  }, [userSettings, sessionType]);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        context.currentTime + 0.5
      );

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.log("Audio not supported", error);
    }
  }, []);

  const handleFinishEarly = useCallback(async () => {
    if (!startTimeRef.current || !userSettings) return;

    setIsActive(false);

    // Calculate actual duration in minutes
    const actualDuration = Math.ceil(
      (dayjs().valueOf() - dayjs(startTimeRef.current).valueOf()) / (1000 * 60)
    );

    // Prepare session data for completion modal
    const sessionData = {
      duration: actualDuration,
      startTime: startTimeRef.current.toISOString(),
      endTime: dayjs().toISOString(),
      completed: true,
      notes: sessionNotes,
      type: sessionType,
      taskId: selectedTaskId || undefined,
    };

    try {
      await createSession(sessionData);

      // Show completion modal with session data
      setCompletedSessionData({
        ...sessionData,
        taskTitle: selectedTaskId
          ? tasks.find((t) => t.id === selectedTaskId)?.title || "Unknown Task"
          : undefined,
      });
      setShowCompletionModal(true);
    } catch (error) {
      console.error("Error saving pomodoro session:", error);

      // If saving fails, still reset the session
      const duration =
        sessionType === "WORK"
          ? userSettings.workDuration
          : sessionType === "BREAK"
          ? userSettings.shortBreakDuration
          : userSettings.longBreakDuration;
      setTimeLeft(duration * 60);
      setSessionNotes("");
      startTimeRef.current = null;
    }
  }, [
    sessionType,
    userSettings,
    selectedTaskId,
    sessionNotes,
    createSession,
    tasks,
  ]);

  const handleSessionComplete = useCallback(async () => {
    setIsActive(false);
    playNotificationSound();

    // Save session
    if (startTimeRef.current && userSettings) {
      const sessionData = {
        duration:
          sessionType === "WORK"
            ? userSettings.workDuration
            : sessionType === "BREAK"
            ? userSettings.shortBreakDuration
            : userSettings.longBreakDuration,
        startTime: startTimeRef.current.toISOString(),
        endTime: dayjs().toISOString(),
        completed: true,
        notes: sessionNotes,
        type: sessionType,
        taskId: selectedTaskId || undefined,
      };

      try {
        await createSession(sessionData);

        // Show completion modal with session data
        setCompletedSessionData({
          ...sessionData,
          taskTitle: selectedTaskId
            ? tasks.find((t) => t.id === selectedTaskId)?.title
            : null,
        });
        setShowCompletionModal(true);
      } catch (error) {
        console.error("Error saving pomodoro session:", error);
      }
    }

    setSessionNotes("");
    startTimeRef.current = null;
  }, [
    sessionType,
    sessionCount,
    userSettings,
    selectedTaskId,
    sessionNotes,
    createSession,
    playNotificationSound,
    tasks,
  ]);

  const handleContinueAfterCompletion = useCallback(() => {
    setShowCompletionModal(false);
    setCompletedSessionData(null);

    // Auto-start next session
    if (completedSessionData?.type === "WORK" && userSettings) {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      if (newCount >= userSettings.sessionsUntilLongBreak) {
        setSessionType("LONG_BREAK");
        setTimeLeft(userSettings.longBreakDuration * 60);
        setSessionCount(0);
      } else {
        setSessionType("BREAK");
        setTimeLeft(userSettings.shortBreakDuration * 60);
      }

      // Auto-start break session
      setTimeout(() => {
        setIsActive(true);
        startTimeRef.current = dayjs().toDate();
      }, 1000);
    } else if (userSettings) {
      // After break, start work session
      setSessionType("WORK");
      setTimeLeft(userSettings.workDuration * 60);

      // Auto-start work session
      setTimeout(() => {
        setIsActive(true);
        startTimeRef.current = dayjs().toDate();
      }, 1000);
    }
  }, [completedSessionData, sessionCount, userSettings]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, handleSessionComplete]);

  const handleStart = () => {
    setIsActive(true);
    if (!startTimeRef.current) {
      startTimeRef.current = dayjs().toDate();
    }
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    if (userSettings) {
      const duration =
        sessionType === "WORK"
          ? userSettings.workDuration
          : sessionType === "BREAK"
          ? userSettings.shortBreakDuration
          : userSettings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const switchSessionType = (type: "WORK" | "BREAK" | "LONG_BREAK") => {
    setSessionType(type);
    if (userSettings) {
      const duration =
        type === "WORK"
          ? userSettings.workDuration
          : type === "BREAK"
          ? userSettings.shortBreakDuration
          : userSettings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
    setIsActive(false);
    startTimeRef.current = null;
  };

  const formatTimeFromSeconds = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgressPercentage = (): number => {
    if (!userSettings) return 0;
    const totalTime =
      sessionType === "WORK"
        ? userSettings.workDuration * 60
        : sessionType === "BREAK"
        ? userSettings.shortBreakDuration * 60
        : userSettings.longBreakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const todaySessions = pomodoroSessions.filter((session: any) => {
    return dayjs().isSame(dayjs(session.startTime), "day");
  });

  const todayWorkSessions = todaySessions.filter(
    (s: any) => s.type === "WORK"
  ).length;
  const todayTotalTime = todaySessions.reduce(
    (sum: number, s: any) => sum + s.duration,
    0
  );

  const sessionTypeColors = {
    WORK: "from-primary-500 to-primary-600",
    BREAK: "from-primary-500 to-primary-600",
    LONG_BREAK: "from-primary-500 to-primary-600",
  };

  const sessionTypeLabels = {
    WORK: t("workSession"),
    BREAK: t("shortBreak"),
    LONG_BREAK: t("longBreak"),
  };

  if (!userSettings) {
    return <div className="p-6">{t("loading")}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("pomodoro")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("focusWithPomodoroTechnique")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatsVisible(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <BarChart3 size={20} />
            {t("stats")}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <Settings size={20} />
            {t("settings")}
          </button>
        </div>
      </div>

      {/* Main Timer - 简约现代风格 */}
      <div className="flex justify-center">
        <div className="relative w-80 h-80 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          {/* Progress Ring */}
          <div className="absolute inset-6">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={
                  sessionType === "WORK"
                    ? "#ef4444"
                    : sessionType === "BREAK"
                    ? "#10b981"
                    : "#3b82f6"
                }
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${
                  2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)
                }`}
                className="transition-all duration-500 ease-out"
              />
            </svg>
          </div>

          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Session Type */}
            <div className="flex justify-center mb-2">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 relative z-10">
                <button
                  onClick={() => switchSessionType("WORK")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    sessionType === "WORK"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                  style={{ pointerEvents: "auto" }}
                >
                  {t("work")}
                </button>
                <button
                  onClick={() => switchSessionType("BREAK")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    sessionType === "BREAK"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                  style={{ pointerEvents: "auto" }}
                >
                  {t("break")}
                </button>
                <button
                  onClick={() => switchSessionType("LONG_BREAK")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    sessionType === "LONG_BREAK"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                  style={{ pointerEvents: "auto" }}
                >
                  {t("long")}
                </button>
              </div>
            </div>

            {/* Time */}
            <div className="text-4xl font-light text-gray-800 dark:text-white mb-2">
              {formatTimeFromSeconds(timeLeft)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {sessionTypeLabels[sessionType]}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              {t("sessionOf")} {sessionCount + 1} {t("of")}{" "}
              {userSettings.sessionsUntilLongBreak}
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center relative z-10">
              <button
                onClick={handleReset}
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={isActive ? handlePause : handleStart}
                className="p-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
              </button>
              {isActive && startTimeRef.current && (
                <button
                  onClick={handleFinishEarly}
                  className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
                  title={t("finishEarly")}
                  style={{ pointerEvents: "auto" }}
                >
                  <Square size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Selection */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("selectTask")}
          </h3>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option key="" value="">
              {t("noTaskSelected")}
            </option>
            {tasks
              .filter((t: any) => !t.completed)
              .map((task: any) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
          </select>
        </div>

        {/* Session Notes */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("sessionNotes")}
          </h3>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder={t("whatDidYouWorkOn")}
            className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
          />
        </div>
      </div>

      {/* Today's Progress */}
      <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("todaysProgress")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {todayWorkSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("workSessions")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {minutesToHours(todayTotalTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("totalTime")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {todaySessions.filter((s: any) => s.type === "BREAK").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("breaksTaken")}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("recentSessions")}
        </h3>
        <div className="space-y-3">
          {pomodoroSessions
            .slice(-5)
            .reverse()
            .map((session: any) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      session.type === "WORK"
                        ? "bg-red-500"
                        : session.type === "BREAK"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {
                        sessionTypeLabels[
                          session.type as keyof typeof sessionTypeLabels
                        ]
                      }
                    </p>
                    {session.taskId && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {tasks.find((t) => t.id === session.taskId)?.title ||
                          "Unknown Task"}
                      </p>
                    )}
                    {session.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        "{session.notes}"
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dayjs(session.startTime).format("HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {session.duration}m
                  </span>
                </div>
              </div>
            ))}
          {pomodoroSessions.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {t("noSessionsCompletedYet")}
            </p>
          )}
        </div>
      </div>

      {/* Stats Modal */}
      {statsVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-3xl rounded-xl p-6 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("pomodoroStatistics")}
              </h3>
              <button
                onClick={() => setStatsVisible(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t("today")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {todayWorkSessions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("workSessions")}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {minutesToHours(todayTotalTime)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("totalTime")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t("allTime")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {
                        pomodoroSessions.filter((s: any) => s.type === "WORK")
                          .length
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("workSessions")}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {minutesToHours(
                        pomodoroSessions.reduce(
                          (sum: number, s: any) => sum + s.duration,
                          0
                        )
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("totalTime")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t("breaks")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {
                        pomodoroSessions.filter((s: any) => s.type === "BREAK")
                          .length
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("shortBreaks")}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {
                        pomodoroSessions.filter(
                          (s: any) => s.type === "LONG_BREAK"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("longBreaks")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStatsVisible(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("pomodoroSettings")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("workDuration")} (minutes)
                </label>
                <input
                  type="number"
                  value={userSettings.workDuration}
                  onChange={(e) =>
                    updateSettings({
                      workDuration: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("shortBreakDuration")} (minutes)
                </label>
                <input
                  type="number"
                  value={userSettings.shortBreakDuration}
                  onChange={(e) =>
                    updateSettings({
                      shortBreakDuration: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("longBreakDuration")} (minutes)
                </label>
                <input
                  type="number"
                  value={userSettings.longBreakDuration}
                  onChange={(e) =>
                    updateSettings({
                      longBreakDuration: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("sessionsUntilLongBreak")}
                </label>
                <input
                  type="number"
                  value={userSettings.sessionsUntilLongBreak}
                  onChange={(e) =>
                    updateSettings({
                      sessionsUntilLongBreak: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Completion Modal */}
      {showCompletionModal && completedSessionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 bg-white dark:bg-gray-800 relative">
            {/* 右上角重置按钮 */}
            <button
              onClick={() => {
                setShowCompletionModal(false);
                setCompletedSessionData(null);
                // Reset to work session
                setSessionType("WORK");
                setTimeLeft(
                  userSettings?.workDuration
                    ? userSettings.workDuration * 60
                    : 25 * 60
                );
                setSessionNotes("");
                startTimeRef.current = null;
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
              title={t("reset")}
            >
              <RotateCcw size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{t("tomatoIcon")}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("sessionCompleted")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("sessionCompletedMessage")}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t("sessionSummary")}
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("sessionType")}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {
                        sessionTypeLabels[
                          completedSessionData.type as keyof typeof sessionTypeLabels
                        ]
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("sessionDuration")}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {completedSessionData.duration} {t("minutes")}
                    </span>
                  </div>

                  {completedSessionData.taskTitle && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("taskWorkedOn")}:
                      </span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {completedSessionData.taskTitle}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("sessionNotesLabel")}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {completedSessionData.notes || t("noNotesAdded")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {completedSessionData.type === "WORK" ? (
                // 工作会话：显示休息和开始下一个会话按钮
                <>
                  <button
                    onClick={handleContinueAfterCompletion}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {t("break")}
                  </button>
                  <button
                    onClick={() => {
                      setShowCompletionModal(false);
                      setCompletedSessionData(null);
                      // Start next work session
                      setSessionType("WORK");
                      setTimeLeft(
                        userSettings?.workDuration
                          ? userSettings.workDuration * 60
                          : 25 * 60
                      );
                      setSessionNotes("");
                      startTimeRef.current = null;
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {t("startNextSession")}
                  </button>
                </>
              ) : (
                // 休息会话：显示继续休息按钮
                <button
                  onClick={handleContinueAfterCompletion}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  {t("continueToBreak")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
