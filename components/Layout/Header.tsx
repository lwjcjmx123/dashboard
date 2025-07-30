"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Search, User, Globe, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "../../utils/dateUtils";
import { useClientNotifications } from "@/lib/client-data-hooks";
import {
  formatNotificationTime,
  getNotificationView,
} from "@/utils/notificationUtils";

interface HeaderProps {
  selectedDate: Date;
  onViewChange?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedDate, onViewChange }) => {
  const { t, language, setLanguage } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    toggleHideRead,
    deleteReadNotifications,
    hideRead,
    refetch,
    createNotification,
  } = useClientNotifications();
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [allNotificationsWithRead, setAllNotificationsWithRead] = useState<
    any[]
  >([]);

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = async (
    notification: any,
    event?: React.MouseEvent
  ) => {
    // Prevent event bubbling if clicking on the mark as read button
    if (event && (event.target as HTMLElement).closest(".mark-read-btn")) {
      return;
    }

    try {
      // Navigate to the appropriate view
      const view = getNotificationView(notification);
      if (onViewChange) {
        onViewChange(view);
      }

      // Close notification panel
      setShowNotifications(false);
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleMarkAsRead = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    try {
      await markAsRead(notificationId);
      // Refresh all notifications for modal
      await loadAllNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleViewAllNotifications = async () => {
    await loadAllNotifications();
    setShowAllNotifications(true);
    setShowNotifications(false);
  };

  const closeAllNotificationsModal = () => {
    setShowAllNotifications(false);
  };

  // Load all notifications including read ones for the modal
  const loadAllNotifications = async () => {
    try {
      const { notificationService } = await import(
        "@/lib/notification-service"
      );
      const allNotifs = await notificationService.getNotifications(
        "demo-user-id",
        false
      ); // false means don't hide read notifications
      setAllNotificationsWithRead(allNotifs || []);
    } catch (error) {
      console.error("Error loading all notifications:", error);
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // 点击外部关闭通知面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(selectedDate)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center gap-1"
          title={language === "zh" ? "切换到英文" : "Switch to Chinese"}
        >
          <Globe size={20} />
          <span className="text-xs font-medium">{language.toUpperCase()}</span>
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t("notifications")}
                  </h3>
                  <div className="flex items-center gap-2">
                    {notifications.some((n: any) => !n.read) && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                        title="标记所有通知已读"
                      >
                        全部已读
                      </button>
                    )}
                    {notifications.some((n: any) => n.read) && (
                      <button
                        onClick={deleteReadNotifications}
                        className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        title="删除已读通知"
                      >
                        清理已读
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {t("noNotifications")}
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      onClick={(e) => handleNotificationClick(notification, e)}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.read
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {!notification.read && (
                            <>
                              <button
                                onClick={(e) =>
                                  handleMarkAsRead(notification.id, e)
                                }
                                className="mark-read-btn text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                title="标记为已读"
                              >
                                已读
                              </button>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleViewAllNotifications}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {t("viewAllNotifications")}
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
          <User size={20} />
        </button>
      </div>

      {/* All Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                所有通知
              </h2>
              <button
                onClick={closeAllNotificationsModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {allNotificationsWithRead.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  暂无通知
                </div>
              ) : (
                allNotificationsWithRead.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={(e) => {
                      handleNotificationClick(notification, e);
                      closeAllNotificationsModal();
                    }}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                      !notification.read
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`font-medium text-sm ${
                            notification.read
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {!notification.read ? (
                          <>
                            <button
                              onClick={(e) =>
                                handleMarkAsRead(notification.id, e)
                              }
                              className="mark-read-btn text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              title="标记为已读"
                            >
                              已读
                            </button>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            已读
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div className="flex gap-2">
                {allNotificationsWithRead.some((n) => !n.read) && (
                  <button
                    onClick={() => {
                      markAllAsRead();
                    }}
                    className="px-3 py-2 text-sm rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    全部标记已读
                  </button>
                )}
                {allNotificationsWithRead.some((n) => n.read) && (
                  <button
                    onClick={() => {
                      deleteReadNotifications();
                    }}
                    className="px-3 py-2 text-sm rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    删除已读通知
                  </button>
                )}
              </div>
              <button
                onClick={closeAllNotificationsModal}
                className="px-4 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
