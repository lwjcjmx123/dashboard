import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  Clock,
  Edit3,
  Bot,
  Wand2,
} from "lucide-react";
import { createAIParser } from "@/lib/ai-parser";
import {
  useClientTasks,
  useClientBills,
  useClientPomodoroSessions,
  useClientEvents,
} from "@/lib/client-data-hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatDate,
  getMonthDates,
  addMonths,
  isToday,
  getWeekDates,
  addDays,
  formatTime,
} from "@/utils/dateUtils";
import DatePicker from "@/components/UI/DatePicker";
import TimePicker from "@/components/UI/TimePicker";
import dayjs from "dayjs";

type CalendarView = "month" | "week" | "day";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    date: Date;
  } | null>(null);
  const [rightClickedDate, setRightClickedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    category: "personal" as "personal" | "interview",
    // 面试相关字段
    interviewType: "online" as "online" | "offline",
    location: "",
    contact: "",
    meetingId: "",
  });
  const [aiText, setAiText] = useState("");
  const [isAiParsing, setIsAiParsing] = useState(false);
  const { t } = useLanguage();

  const { tasks } = useClientTasks();
  const { bills } = useClientBills();
  const { sessions: pomodoroSessions } = useClientPomodoroSessions();
  const { events, createEvent, updateEvent } = useClientEvents();

  // Generate events from all data sources
  const generateEventsFromData = () => {
    const generatedEvents: any[] = [];

    // Add task events
    tasks.forEach((task: any) => {
      if (task.dueDate) {
        generatedEvents.push({
          id: `task-${task.id}`,
          title: task.title,
          description: task.description,
          startDate: new Date(task.dueDate),
          endDate: new Date(task.dueDate),
          category: "task",
          color:
            task.priority === "URGENT_IMPORTANT"
              ? "#ef4444"
              : task.priority === "URGENT_NOT_IMPORTANT"
              ? "#f59e0b"
              : task.priority === "NOT_URGENT_IMPORTANT"
              ? "#3b82f6"
              : "#6b7280",
          taskId: task.id,
        });
      }
    });

    // Add bill events
    bills.forEach((bill: any) => {
      generatedEvents.push({
        id: `bill-${bill.id}`,
        title: `Bill: ${bill.title}`,
        description: `Amount: $${bill.amount}`,
        startDate: new Date(bill.dueDate),
        endDate: new Date(bill.dueDate),
        category: "bill",
        color: bill.paid ? "#10b981" : "#ef4444",
        billId: bill.id,
      });
    });

    // Add pomodoro session events
    pomodoroSessions.forEach((session: any) => {
      generatedEvents.push({
        id: `pomodoro-${session.id}`,
        title: `Pomodoro: ${session.type}`,
        description: session.notes || `${session.duration}min session`,
        startDate: new Date(session.startTime),
        endDate: new Date(session.endTime),
        category: "pomodoro",
        color: session.type === "WORK" ? "#8b5cf6" : "#10b981",
      });
    });

    return [...events, ...generatedEvents];
  };

  const allEvents = generateEventsFromData();



  // 处理事件点击查看详情
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  // 处理编辑事件
  const handleEditEvent = () => {
    if (!selectedEvent) return;

    // 将选中的事件数据填充到编辑表单中
    const startDate = new Date(selectedEvent.startDate);
    const endDate = new Date(selectedEvent.endDate);

    setNewEvent({
      title: selectedEvent.title || "",
      description: selectedEvent.description || "",
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      startTime: dayjs(startDate).format("HH:mm"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      endTime: dayjs(endDate).format("HH:mm"),
      category: selectedEvent.category || "personal",
      interviewType: selectedEvent.interviewType || "online",
      location: selectedEvent.location || "",
      contact: selectedEvent.contact || "",
      meetingId: selectedEvent.meetingId || "",
    });

    setIsEditingEvent(true);
    setShowEventDetailModal(false);
    setShowAddEventModal(true);
  };

  // 快速创建面试事件
  const handleQuickCreateInterview = () => {
    // 如果有选中的日期，使用选中的日期，否则使用今天
    const targetDate = selectedDate || new Date();
    const dateStr = dayjs(targetDate).format("YYYY-MM-DD");
    setNewEvent({
      title: "",
      description: "",
      startDate: dateStr,
      startTime: "15:00",
      endDate: dateStr,
      endTime: "15:30",
      category: "interview",
      interviewType: "online",
      location: "",
      contact: "",
      meetingId: "",
    });
    setIsEditingEvent(false);
    setSelectedEvent(null);
    setShowAddEventModal(true);
  };

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, date: Date) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      date: date,
    });
    setRightClickedDate(date);
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu(null);
    setRightClickedDate(null);
  };

  // 从右键菜单创建事件
  const handleCreateEventFromContext = (category: "personal" | "interview") => {
    if (!rightClickedDate) return;

    const dateStr = dayjs(rightClickedDate).format("YYYY-MM-DD");
    setNewEvent({
      title: "",
      description: "",
      startDate: dateStr,
      startTime: category === "interview" ? "15:00" : "09:00",
      endDate: dateStr,
      endTime: category === "interview" ? "15:30" : "10:00",
      category: category,
      interviewType: "online",
      location: "",
      contact: "",
      meetingId: "",
    });
    setIsEditingEvent(false);
    setSelectedEvent(null);
    setShowAddEventModal(true);
    closeContextMenu();
  };

  // 处理添加事件
  const handleAddEvent = () => {
    // 如果有选中的日期，使用选中的日期，否则使用今天
    const targetDate = selectedDate || new Date();
    const dateStr = dayjs(targetDate).format("YYYY-MM-DD");
    setNewEvent({
      title: "",
      description: "",
      startDate: dateStr,
      startTime: "09:00",
      endDate: dateStr,
      endTime: "10:00",
      category: "personal",
      interviewType: "online",
      location: "",
      contact: "",
      meetingId: "",
    });
    setIsEditingEvent(false);
    setSelectedEvent(null);
    setShowAddEventModal(true);
  };

  // AI解析文本
    const handleAiParse = async () => {
      if (!aiText.trim()) {
        alert(t("aiInputRequired"));
        return;
      }
  
      setIsAiParsing(true);
      try {
        const aiParser = createAIParser();
        if (!aiParser) {
          alert(t("aiConfigRequired"));
          return;
        }
        const parsedData = await aiParser.parseTextToEvent(aiText);
      
      // 填充解析结果到表单
       setNewEvent({
          ...newEvent,
          title: parsedData.title || newEvent.title,
          description: parsedData.description || newEvent.description,
          startDate: parsedData.startDate || newEvent.startDate,
          startTime: parsedData.startTime || newEvent.startTime,
          endDate: parsedData.endDate || newEvent.endDate,
          endTime: parsedData.endTime || newEvent.endTime,
          category: (parsedData.category === 'meeting' || parsedData.category === 'task') ? 'personal' : parsedData.category,
          location: parsedData.location || newEvent.location,
          contact: parsedData.contact || newEvent.contact,
          interviewType: parsedData.interviewType || newEvent.interviewType,
          meetingId: parsedData.meetingId || newEvent.meetingId,
        });
      
      // 清空AI文本
      setAiText("");
    } catch (error) {
      console.error("AI解析失败:", error);
      alert(t("aiParseFailed"));
    } finally {
      setIsAiParsing(false);
    }
  };

  // 保存事件
  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) {
      alert("请输入事件标题");
      return;
    }

    try {
      const startDateTime = new Date(
        `${newEvent.startDate}T${newEvent.startTime}:00`
      );
      const endDateTime = new Date(
        `${newEvent.endDate}T${newEvent.endTime}:00`
      );

      if (endDateTime <= startDateTime) {
        alert("结束时间必须晚于开始时间");
        return;
      }

      const eventData: any = {
        title: newEvent.title,
        description: newEvent.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        category: newEvent.category,
        color: newEvent.category === "interview" ? "#10b981" : "#3b82f6",
      };

      // 如果是面试事件，添加面试相关字段
      if (newEvent.category === "interview") {
        eventData.interviewType = newEvent.interviewType;
        eventData.location = newEvent.location;
        eventData.contact = newEvent.contact;
        eventData.meetingId = newEvent.meetingId;
      }

      if (isEditingEvent && selectedEvent) {
        // 编辑模式：更新现有事件
        await updateEvent({
          id: selectedEvent.id,
          ...eventData,
        });
      } else {
        // 创建模式：创建新事件
        await createEvent(eventData);
      }

      setShowAddEventModal(false);
      setIsEditingEvent(false);
      setSelectedEvent(null);
      setNewEvent({
        title: "",
        description: "",
        startDate: "",
        startTime: "09:00",
        endDate: "",
        endTime: "10:00",
        category: "personal",
        interviewType: "online",
        location: "",
        contact: "",
        meetingId: "",
      });
    } catch (error) {
      console.error(isEditingEvent ? "更新事件失败:" : "创建事件失败:", error);
      alert(isEditingEvent ? "更新事件失败，请重试" : "创建事件失败，请重试");
    }
  };

  const getDatesForView = () => {
    switch (view) {
      case "month":
        return getMonthDates(currentDate);
      case "week":
        return getWeekDates(currentDate);
      case "day":
        return [currentDate];
      default:
        return getMonthDates(currentDate);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    switch (view) {
      case "month":
        setCurrentDate((prev) =>
          addMonths(prev, direction === "next" ? 1 : -1)
        );
        break;
      case "week":
        setCurrentDate((prev) => addDays(prev, direction === "next" ? 7 : -7));
        break;
      case "day":
        setCurrentDate((prev) => addDays(prev, direction === "next" ? 1 : -1));
        break;
    }
  };

  const getEventsForDate = (date: Date) => {
    return allEvents
      .filter((event: any) => dayjs(event.startDate).isSame(dayjs(date), "day"))
      .sort((a: any, b: any) => {
        // 按开始时间排序
        const timeA = new Date(a.startDate).getTime();
        const timeB = new Date(b.startDate).getTime();
        return timeA - timeB;
      });
  };

  const getViewTitle = () => {
    switch (view) {
      case "month":
        return dayjs(currentDate).format("MMMM YYYY");
      case "week":
        const weekStart = getWeekDates(currentDate)[0];
        const weekEnd = getWeekDates(currentDate)[6];
        return `${dayjs(weekStart).format("MMM D")} - ${dayjs(weekEnd).format(
          "MMM D, YYYY"
        )}`;
      case "day":
        return dayjs(currentDate).format("dddd, MMMM D, YYYY");
      default:
        return "";
    }
  };

  const viewButtons = [
    { id: "month", label: t("month") },
    { id: "week", label: t("week") },
    { id: "day", label: t("day") },
  ];

  const dates = getDatesForView();

  return (
    <div className="p-6 space-y-6" onClick={closeContextMenu}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("calendar")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors duration-200"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[250px] text-center">
              {getViewTitle()}
            </h3>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {viewButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => setView(button.id as CalendarView)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  view === button.id
                    ? "bg-primary-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddEvent}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <Plus size={20} />
              {t("addEvent")}
            </button>
            <button
              onClick={handleQuickCreateInterview}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <CalendarIcon size={20} />
              {t("createQuickInterview")}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Days of Week Header (for month and week view) */}
        {(view === "month" || view === "week") && (
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700"
              >
                {t(day as any)}
              </div>
            ))}
          </div>
        )}

        {/* Calendar Content */}
        {view === "month" && (
          <div className="grid grid-cols-7">
            {dates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isSelected = dayjs(selectedDate).isSame(dayjs(date), "day");
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  onClick={() => onDateSelect(date)}
                  onContextMenu={(e) => handleContextMenu(e, date)}
                  className={`min-h-[120px] p-3 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isTodayDate
                          ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          : isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex items-center gap-1">
                        {dayEvents.slice(0, 3).map((event: any, i: number) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event: any) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: event.color }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="grid grid-cols-7">
            {dates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isSelected = dayjs(selectedDate).isSame(dayjs(date), "day");
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  onClick={() => onDateSelect(date)}
                  onContextMenu={(e) => handleContextMenu(e, date)}
                  className={`min-h-[200px] p-3 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-lg font-medium ${
                        isTodayDate
                          ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                          : isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayEvents.map((event: any) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className="text-xs p-2 rounded text-white cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: event.color }}
                      >
                        <div className="font-medium truncate">
                          {event.title}
                        </div>
                        <div className="opacity-75">
                          {formatTime(new Date(event.startDate))} -{" "}
                          {formatTime(new Date(event.endDate))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Day View - Timeline Style */}
        {view === "day" && (
          <div className="flex">
            {/* Time Column */}
            <div className="w-20 border-r border-gray-200 dark:border-gray-700">
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className="h-16 flex items-start justify-end pr-3 pt-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                >
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </div>
              ))}
            </div>
            
            {/* Events Column */}
            <div className="flex-1 relative">
              {/* Hour Grid Lines */}
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-100 dark:border-gray-800 relative"
                >
                  {/* Half-hour line */}
                  <div className="absolute top-8 left-0 right-0 h-px bg-gray-50 dark:bg-gray-900"></div>
                </div>
              ))}
              
              {/* Current Time Indicator */}
              {isToday(currentDate) && (() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const topPosition = (currentHour * 64) + (currentMinute * 64 / 60);
                
                return (
                  <div
                    className="absolute left-0 right-0 z-10"
                    style={{ top: `${topPosition}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 -ml-1.5"></div>
                      <div className="flex-1 h-0.5 bg-red-500"></div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Events */}
              {getEventsForDate(currentDate).map((event: any) => {
                const startTime = dayjs(event.startDate);
                const endTime = dayjs(event.endDate);
                const startHour = startTime.hour();
                const startMinute = startTime.minute();
                const endHour = endTime.hour();
                const endMinute = endTime.minute();
                
                const topPosition = (startHour * 64) + (startMinute * 64 / 60);
                const duration = (endHour - startHour) * 64 + ((endMinute - startMinute) * 64 / 60);
                const height = Math.max(duration, 32); // Minimum height of 32px
                
                return (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="absolute left-2 right-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-sm border border-white/20"
                    style={{
                      top: `${topPosition}px`,
                      height: `${height}px`,
                      backgroundColor: event.color,
                      minHeight: '32px'
                    }}
                  >
                    <div className="p-2 text-white text-xs h-full flex flex-col">
                      <div className="font-medium truncate">
                        {event.title}
                      </div>
                      <div className="text-white/80 text-xs mt-1">
                        {startTime.format("HH:mm")} - {endTime.format("HH:mm")}
                      </div>
                      {event.description && height > 48 && (
                        <div className="text-white/70 text-xs mt-1 truncate">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* No Events Message */}
              {getEventsForDate(currentDate).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <CalendarIcon size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No events for this day</p>
                    <button
                      onClick={handleAddEvent}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Add an event
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Events */}
      {view !== "day" && (
        <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Events for {dayjs(selectedDate).format("MMMM D, YYYY")}
          </h3>
          <div className="space-y-3">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No events for this day
              </div>
            ) : (
              getEventsForDate(selectedDate).map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleEventClick(event)}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatTime(new Date(event.startDate))} -{" "}
                      {formatTime(new Date(event.endDate))}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.category === "task"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        : event.category === "bill"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : event.category === "pomodoro"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                        : event.category === "interview"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }`}
                  >
                    {event.category}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleCreateEventFromContext("personal")}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            添加个人事件
          </button>
          <button
            onClick={() => handleCreateEventFromContext("interview")}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            添加面试
          </button>
        </div>
      )}

      {/* 添加事件模态框 */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditingEvent ? "编辑事件" : "添加事件"}
              </h3>
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setIsEditingEvent(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-3">
              {/* AI解析区域 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-3">
                  <Bot size={20} className="text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    {t("aiSettings")}
                  </h4>
                </div>
                <div className="space-y-2">
                  <textarea
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder={t("aiParseInputPlaceholder")}
                    rows={3}
                  />
                  <button
                    onClick={handleAiParse}
                    disabled={isAiParsing || !aiText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isAiParsing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("aiParsing")}
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} />
                        {t("aiParseButton")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 事件类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  事件类型
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setNewEvent({ ...newEvent, category: "personal" })
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newEvent.category === "personal"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    个人事件
                  </button>
                  <button
                    onClick={() =>
                      setNewEvent({ ...newEvent, category: "interview" })
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newEvent.category === "interview"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    面试
                  </button>
                </div>
              </div>

              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="输入事件标题"
                />
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  描述
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="输入事件描述"
                  rows={2}
                />
              </div>

              {/* 开始日期和时间 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    开始日期
                  </label>
                  <DatePicker
                    selected={
                      newEvent.startDate ? new Date(newEvent.startDate) : null
                    }
                    onChange={(date) => {
                      if (date) {
                        setNewEvent({
                          ...newEvent,
                          startDate: dayjs(date).format("YYYY-MM-DD"),
                        });
                      }
                    }}
                    placeholder="选择开始日期"
                    dateFormat="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    开始时间
                  </label>
                  <TimePicker
                    value={newEvent.startTime}
                    onChange={(time) =>
                      setNewEvent({ ...newEvent, startTime: time })
                    }
                    placeholder="选择开始时间"
                    className="w-full"
                    timeIntervals={30}
                  />
                </div>
              </div>

              {/* 结束日期和时间 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    结束日期
                  </label>
                  <DatePicker
                    selected={
                      newEvent.endDate ? new Date(newEvent.endDate) : null
                    }
                    onChange={(date) => {
                      if (date) {
                        setNewEvent({
                          ...newEvent,
                          endDate: dayjs(date).format("YYYY-MM-DD"),
                        });
                      }
                    }}
                    placeholder="选择结束日期"
                    dateFormat="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    结束时间
                  </label>
                  <TimePicker
                    value={newEvent.endTime}
                    onChange={(time) =>
                      setNewEvent({ ...newEvent, endTime: time })
                    }
                    placeholder="选择结束时间"
                    className="w-full"
                    timeIntervals={30}
                  />
                </div>
              </div>

              {/* 面试相关字段 */}
              {newEvent.category === "interview" && (
                <>
                  {/* 面试类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      面试类型
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setNewEvent({ ...newEvent, interviewType: "online" })
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newEvent.interviewType === "online"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        线上面试
                      </button>
                      <button
                        onClick={() =>
                          setNewEvent({ ...newEvent, interviewType: "offline" })
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newEvent.interviewType === "offline"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        线下面试
                      </button>
                    </div>
                  </div>

                  {/* 地点/会议链接 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {newEvent.interviewType === "online"
                        ? t("meetingLink")
                        : t("interviewLocation")}
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, location: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={
                        newEvent.interviewType === "online"
                          ? t("enterMeetingLink")
                          : t("enterInterviewLocation")
                      }
                    />
                  </div>

                  {/* 会议号/联系电话和联系人 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {newEvent.interviewType === "online"
                          ? t("meetingId")
                          : t("contactPhone")}
                      </label>
                      <input
                        type="text"
                        value={newEvent.meetingId}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            meetingId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={
                          newEvent.interviewType === "online"
                            ? t("meetingId")
                            : t("contactPhone")
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("contact")}
                      </label>
                      <input
                        type="text"
                        value={newEvent.contact}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, contact: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t("contactName")}
                      />
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-lg">
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setIsEditingEvent(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isEditingEvent ? t("edit") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 事件详情模态框 */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("eventDetails")}
              </h3>
              <div className="flex items-center gap-2">
                {/* 编辑按钮 */}
                {selectedEvent.category !== "task" &&
                  selectedEvent.category !== "bill" &&
                  selectedEvent.category !== "pomodoro" && (
                    <button
                      onClick={handleEditEvent}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="编辑事件"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                <button
                  onClick={() => setShowEventDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                  {selectedEvent.title}
                </h4>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    selectedEvent.category === "task"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      : selectedEvent.category === "bill"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : selectedEvent.category === "pomodoro"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                      : selectedEvent.category === "interview"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  }`}
                >
                  {selectedEvent.category}
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    描述:
                  </span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  时间:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {dayjs(selectedEvent.startDate).format("YYYY-MM-DD HH:mm")} -{" "}
                  {dayjs(selectedEvent.endDate).format("HH:mm")}
                </span>
              </div>

              {/* 面试相关信息 */}
              {selectedEvent.category === "interview" && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">


                  {selectedEvent.interviewType && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("interviewType")}:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEvent.interviewType === "online"
                          ? t("online")
                          : t("offline")}
                      </span>
                    </div>
                  )}

                  {selectedEvent.location && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEvent.interviewType === "online"
                          ? t("meetingLink") + ":"
                          : t("interviewLocation") + ":"}
                      </span>
                      <div className="text-sm font-medium max-w-[200px] text-right">
                        {selectedEvent.interviewType === "online" &&
                        selectedEvent.location.startsWith("http") ? (
                          <a
                            href={selectedEvent.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {selectedEvent.location}
                          </a>
                        ) : (
                          <span className="text-gray-900 dark:text-white">
                            {selectedEvent.location}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedEvent.meetingId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEvent.interviewType === "online"
                          ? t("meetingId") + ":"
                          : t("contactPhone") + ":"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEvent.meetingId}
                      </span>
                    </div>
                  )}

                  {selectedEvent.contact && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("contact")}:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEvent.contact}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
