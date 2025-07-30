import React, { useState } from "react";
import {
  Plus,
  Search,
  CheckSquare,
  Clock,
  AlertCircle,
  Edit3,
} from "lucide-react";
import { useClientTasks } from "@/lib/client-data-hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/utils/dateUtils";
import dayjs from "dayjs";

const Tasks: React.FC = () => {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useClientTasks();
  const { t } = useLanguage();
  const [editingTask, setEditingTask] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "NOT_URGENT_IMPORTANT" as any,
    dueDate: "",
  });

  const priorityColors = {
    URGENT_IMPORTANT:
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    URGENT_NOT_IMPORTANT:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    NOT_URGENT_IMPORTANT:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    NOT_URGENT_NOT_IMPORTANT:
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const priorityLabels = {
    URGENT_IMPORTANT: t('urgentImportant'),
    URGENT_NOT_IMPORTANT: t('urgent'),
    NOT_URGENT_IMPORTANT: t('important'),
    NOT_URGENT_NOT_IMPORTANT: t('lowPriority'),
  };

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    const matchesCompleted = showCompleted || !task.completed;

    return matchesSearch && matchesPriority && matchesCompleted;
  });

  const handleAddTask = async () => {
    if (!newTask.title) return;

    try {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: newTask.dueDate
          ? dayjs(newTask.dueDate).toISOString()
          : null,
      });

      setNewTask({
        title: "",
        description: "",
        priority: "NOT_URGENT_IMPORTANT",
        dueDate: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const toggleTask = async (task: any) => {
    try {
      await updateTask({
        id: task.id,
        completed: !task.completed,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEditTask = async (updatedTask: any) => {
    try {
      await updateTask({
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate
          ? dayjs(updatedTask.dueDate).toISOString()
          : null,
      });
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  // Group tasks by priority for Eisenhower Matrix
  const groupedTasks = {
    URGENT_IMPORTANT: filteredTasks.filter(
      (t: any) => t.priority === "URGENT_IMPORTANT"
    ),
    URGENT_NOT_IMPORTANT: filteredTasks.filter(
      (t: any) => t.priority === "URGENT_NOT_IMPORTANT"
    ),
    NOT_URGENT_IMPORTANT: filteredTasks.filter(
      (t: any) => t.priority === "NOT_URGENT_IMPORTANT"
    ),
    NOT_URGENT_NOT_IMPORTANT: filteredTasks.filter(
      (t: any) => t.priority === "NOT_URGENT_NOT_IMPORTANT"
    ),
  };

  if (loading) return <div className="p-6">{t('loading')}...</div>;
  if (error)
    return <div className="p-6">Error: {error.message}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('tasks')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your tasks with the Eisenhower Matrix
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Plus size={20} />
          {t('addTask')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder={t('searchTasks')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option key="all" value="all">{t('all')}</option>
          <option key="URGENT_IMPORTANT" value="URGENT_IMPORTANT">{t('urgentImportant')}</option>
          <option key="URGENT_NOT_IMPORTANT" value="URGENT_NOT_IMPORTANT">{t('urgent')}</option>
          <option key="NOT_URGENT_IMPORTANT" value="NOT_URGENT_IMPORTANT">{t('important')}</option>
          <option key="NOT_URGENT_NOT_IMPORTANT" value="NOT_URGENT_NOT_IMPORTANT">{t('lowPriority')}</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t('showCompleted')}
          </span>
        </label>
      </div>

      {/* Eisenhower Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(groupedTasks).map(([priority, tasks]) => (
          <div
            key={priority}
            className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {priorityLabels[priority as keyof typeof priorityLabels]}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    priorityColors[priority as keyof typeof priorityColors]
                  }`}
                >
                  {tasks.length}
                </span>
                {priority === "URGENT_IMPORTANT" && (
                  <AlertCircle className="text-red-500" size={16} />
                )}
                {priority === "URGENT_NOT_IMPORTANT" && (
                  <Clock className="text-yellow-500" size={16} />
                )}
                {priority === "NOT_URGENT_IMPORTANT" && (
                  <CheckSquare className="text-blue-500" size={16} />
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('noTasks')}
                </p>
              ) : (
                tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border transition-all duration-200 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mt-1"
                      />
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            task.completed
                              ? "line-through text-gray-500"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2">
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t('dueDate')}: {formatDate(new Date(task.dueDate), "24")}
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-1">
                              {task.tags.map((tag: any, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full text-gray-700 dark:text-gray-300"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="text-primary-500 hover:text-primary-600"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('updateTask')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('taskTitle')}
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('taskDescription')}
                </label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('priority')}
                </label>
                <select
                  value={editingTask.priority}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option key="URGENT_IMPORTANT" value="URGENT_IMPORTANT">{t('urgentImportant')}</option>
                  <option key="URGENT_NOT_IMPORTANT" value="URGENT_NOT_IMPORTANT">{t('urgent')}</option>
                  <option key="NOT_URGENT_IMPORTANT" value="NOT_URGENT_IMPORTANT">{t('important')}</option>
                  <option key="NOT_URGENT_NOT_IMPORTANT" value="NOT_URGENT_NOT_IMPORTANT">{t('lowPriority')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('dueDate')}
                </label>
                <input
                  type="datetime-local"
                  value={
                    editingTask.dueDate
                      ? dayjs(editingTask.dueDate).format('YYYY-MM-DDTHH:mm')
                      : ""
                  }
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTask(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleEditTask(editingTask)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('createTask')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option key="URGENT_IMPORTANT" value="URGENT_IMPORTANT">Urgent & Important</option>
                  <option key="URGENT_NOT_IMPORTANT" value="URGENT_NOT_IMPORTANT">Urgent</option>
                  <option key="NOT_URGENT_IMPORTANT" value="NOT_URGENT_IMPORTANT">Important</option>
                  <option key="NOT_URGENT_NOT_IMPORTANT" value="NOT_URGENT_NOT_IMPORTANT">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                {t('addTask')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
