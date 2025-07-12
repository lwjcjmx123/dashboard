import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  BarChart3,
  Clock,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { PomodoroSession } from "../../types";
import { generateId, minutesToHours } from "../../utils/dateUtils";

const Pomodoro: React.FC = () => {
  const { state, dispatch } = useApp();
  const { pomodoroSessions, settings, tasks } = state;
  const isDark = settings.theme === "dark";

  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro.workDuration * 60);
  const [sessionType, setSessionType] = useState<
    "work" | "break" | "long-break"
  >("work");
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const playNotificationSound = useCallback(() => {
    try {
      // 定义AudioContext类型
      type AudioContextType = typeof AudioContext;
      // 使用类型断言避免any
      const AudioContextClass: AudioContextType =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: AudioContextType })
          .webkitAudioContext;

      if (!AudioContextClass) {
        console.log("AudioContext not supported");
        return;
      }

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
      // 使用下划线表示未使用的变量
      console.log("Audio not supported", error);
    }
  }, []);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
    playNotificationSound();

    // Save session
    if (startTimeRef.current) {
      const session: PomodoroSession = {
        id: generateId(),
        taskId: selectedTaskId || undefined,
        duration:
          sessionType === "work"
            ? settings.pomodoro.workDuration
            : sessionType === "break"
            ? settings.pomodoro.shortBreakDuration
            : settings.pomodoro.longBreakDuration,
        startTime: startTimeRef.current,
        endTime: new Date(),
        completed: true,
        notes: sessionNotes,
        type: sessionType,
      };

      dispatch({ type: "ADD_POMODORO_SESSION", payload: session });
    }

    // Auto-start next session
    if (sessionType === "work") {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      if (newCount >= settings.pomodoro.sessionsUntilLongBreak) {
        setSessionType("long-break");
        setTimeLeft(settings.pomodoro.longBreakDuration * 60);
        setSessionCount(0);
      } else {
        setSessionType("break");
        setTimeLeft(settings.pomodoro.shortBreakDuration * 60);
      }
    } else {
      setSessionType("work");
      setTimeLeft(settings.pomodoro.workDuration * 60);
    }

    setSessionNotes("");
    startTimeRef.current = null;
  }, [
    sessionType,
    sessionCount,
    settings,
    selectedTaskId,
    sessionNotes,
    dispatch,
    playNotificationSound,
  ]);

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
    console.log("handleStart called");
    playNotificationSound();
    handleSessionComplete();
    setIsActive(true);
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }
  };

  const handlePause = () => {
    console.log("handlePause called");
    setIsActive(false);
  };

  const handleReset = () => {
    console.log("handleReset called");
    setIsActive(false);
    const duration =
      sessionType === "work"
        ? settings.pomodoro.workDuration
        : sessionType === "break"
        ? settings.pomodoro.shortBreakDuration
        : settings.pomodoro.longBreakDuration;
    setTimeLeft(duration * 60);
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 添加一个函数来处理会话类型切换
  const switchSessionType = (type: "work" | "break" | "long-break") => {
    setSessionType(type);
    const duration =
      type === "work"
        ? settings.pomodoro.workDuration
        : type === "break"
        ? settings.pomodoro.shortBreakDuration
        : settings.pomodoro.longBreakDuration;
    setTimeLeft(duration * 60);
    setIsActive(false);
    startTimeRef.current = null;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgressPercentage = (): number => {
    const totalTime =
      sessionType === "work"
        ? settings.pomodoro.workDuration * 60
        : sessionType === "break"
        ? settings.pomodoro.shortBreakDuration * 60
        : settings.pomodoro.longBreakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const todaySessions = pomodoroSessions.filter((session) => {
    const today = new Date();
    const sessionDate = new Date(session.startTime);
    return sessionDate.toDateString() === today.toDateString();
  });

  const todayWorkSessions = todaySessions.filter(
    (s) => s.type === "work"
  ).length;
  const todayTotalTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const sessionTypeColors = {
    work: "from-red-500 to-red-600",
    break: "from-green-500 to-green-600",
    "long-break": "from-blue-500 to-blue-600",
  };

  const sessionTypeLabels = {
    work: "Work Session",
    break: "Short Break",
    "long-break": "Long Break",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pomodoro Timer
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Focus with the Pomodoro Technique
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatsVisible(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <BarChart3 size={20} />
            Stats
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <Settings size={20} />
            Settings
          </button>
        </div>
      </div>

      {/* Main Timer */}
      <div className="flex justify-center">
        <div
          className={`relative w-80 h-80 rounded-full p-8 ${
            isDark ? "bg-gray-800" : "bg-white"
          } shadow-2xl overflow-visible`}
          style={{ pointerEvents: "auto" }}
        >
          {/* Progress Ring */}
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <svg
              className="w-full h-full transform -rotate-90 pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isDark ? "#374151" : "#e5e7eb"}
                strokeWidth="2"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${
                  2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)
                }`}
                className="transition-all duration-1000 ease-in-out"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      sessionType === "work"
                        ? "#ef4444"
                        : sessionType === "break"
                        ? "#10b981"
                        : "#3b82f6"
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      sessionType === "work"
                        ? "#dc2626"
                        : sessionType === "break"
                        ? "#059669"
                        : "#2563eb"
                    }
                  />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Timer Content */}
          <div className="flex flex-col items-center justify-center h-full relative z-10">
            <div className="text-center mb-4">
              {/* Session Type Selector */}
              <div className="flex justify-center mb-2 text-xs">
                <button
                  onClick={() => switchSessionType("work")}
                  className={`px-3 py-1 rounded-l-md ${
                    sessionType === "work"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Work
                </button>
                <button
                  onClick={() => switchSessionType("break")}
                  className={`px-3 py-1 ${
                    sessionType === "break"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Break
                </button>
                <button
                  onClick={() => switchSessionType("long-break")}
                  className={`px-3 py-1 rounded-r-md ${
                    sessionType === "long-break"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Long
                </button>
              </div>

              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {sessionTypeLabels[sessionType]}
              </p>
              <p className="text-5xl font-bold text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Session {sessionCount + 1} of{" "}
                {settings.pomodoro.sessionsUntilLongBreak}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 relative z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log("Reset clicked", e);
                  handleReset();
                }}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 border-2 border-red-500 z-20 cursor-pointer"
              >
                <RotateCcw
                  size={20}
                  className="text-gray-600 dark:text-gray-400 pointer-events-none"
                />
              </button>

              <button
                onClick={() => (isActive ? handlePause() : handleStart())}
                className={`p-4 rounded-full bg-gradient-to-r ${sessionTypeColors[sessionType]} text-white hover:shadow-lg transition-all duration-200 border-2 border-blue-500 z-20 cursor-pointer`}
              >
                {isActive ? (
                  <Pause size={24} className="pointer-events-none" />
                ) : (
                  <Play size={24} className="pointer-events-none" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Selection */}
        <div
          className={`p-6 rounded-xl border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Link to Task
          </h3>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-200 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">No task selected</option>
            {tasks
              .filter((t) => !t.completed)
              .map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
          </select>
        </div>

        {/* Session Notes */}
        <div
          className={`p-6 rounded-xl border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Session Notes
          </h3>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="What did you work on?"
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={4}
          />
        </div>
      </div>

      {/* Today's Progress */}
      <div
        className={`p-6 rounded-xl border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {todayWorkSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Work Sessions
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {minutesToHours(todayTotalTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Time
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {todaySessions.filter((s) => s.type === "break").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Breaks Taken
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div
        className={`p-6 rounded-xl border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Sessions
        </h3>
        <div className="space-y-3">
          {pomodoroSessions
            .slice(-5)
            .reverse()
            .map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      session.type === "work"
                        ? "bg-red-500"
                        : session.type === "break"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {sessionTypeLabels[session.type]}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
              No sessions completed yet
            </p>
          )}
        </div>
      </div>

      {/* Stats Modal */}
      {statsVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-3xl rounded-xl p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pomodoro Statistics
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
              <div
                className={`p-4 rounded-xl border ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Today
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {todayWorkSessions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Work Sessions
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {minutesToHours(todayTotalTime)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Time
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  All Time
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {pomodoroSessions.filter((s) => s.type === "work").length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Work Sessions
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {minutesToHours(
                        pomodoroSessions.reduce((sum, s) => sum + s.duration, 0)
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Time
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Breaks
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {
                        pomodoroSessions.filter((s) => s.type === "break")
                          .length
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Short Breaks
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {
                        pomodoroSessions.filter((s) => s.type === "long-break")
                          .length
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Long Breaks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Session History
            </h4>
            <div className="overflow-auto max-h-80">
              <table className="w-full">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Duration</th>
                    <th className="px-4 py-2 text-left">Task</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pomodoroSessions
                    .slice()
                    .reverse()
                    .map((session) => {
                      const task = tasks.find((t) => t.id === session.taskId);
                      return (
                        <tr
                          key={session.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${
                                  session.type === "work"
                                    ? "bg-red-500"
                                    : session.type === "break"
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                              />
                              {sessionTypeLabels[session.type]}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(session.startTime).toLocaleDateString()}{" "}
                            {new Date(session.startTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {session.duration}m
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {task ? task.title : "No task"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {session.notes || "-"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {pomodoroSessions.length === 0 && (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No sessions recorded yet
                </p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStatsVisible(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md rounded-xl p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pomodoro Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.pomodoro.workDuration}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_SETTINGS",
                      payload: {
                        pomodoro: {
                          ...settings.pomodoro,
                          workDuration: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.pomodoro.shortBreakDuration}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_SETTINGS",
                      payload: {
                        pomodoro: {
                          ...settings.pomodoro,
                          shortBreakDuration: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Long Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.pomodoro.longBreakDuration}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_SETTINGS",
                      payload: {
                        pomodoro: {
                          ...settings.pomodoro,
                          longBreakDuration: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sessions Until Long Break
                </label>
                <input
                  type="number"
                  value={settings.pomodoro.sessionsUntilLongBreak}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_SETTINGS",
                      payload: {
                        pomodoro: {
                          ...settings.pomodoro,
                          sessionsUntilLongBreak: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
