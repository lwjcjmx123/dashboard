import React, { useState } from "react";
import {
  Plus,
  Search,
  CheckSquare,
  Clock,
  AlertCircle,
  Edit3,
  X,
  Trash2,
} from "lucide-react";
import {
  useClientTasks,
  useClientPomodoroSessions,
} from "@/lib/client-data-hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/utils/dateUtils";
import dayjs from "dayjs";

const Tasks: React.FC = () => {
  const { tasks, loading, error, createTask, updateTask, deleteTask } =
    useClientTasks();
  const { sessions: pomodoroSessions } = useClientPomodoroSessions();
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
    dueTime: "",
  });

  // 生成半小时间隔的时间选项
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const priorityColors = {
    URGENT_IMPORTANT:
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    URGENT_NOT_IMPORTANT:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    NOT_URGENT_IMPORTANT:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    NOT_URGENT_NOT_IMPORTANT:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  };

  const priorityLabels = {
    URGENT_IMPORTANT: "紧急重要",
    URGENT_NOT_IMPORTANT: "紧急不重要",
    NOT_URGENT_IMPORTANT: "不紧急重要",
    NOT_URGENT_NOT_IMPORTANT: "不紧急不重要",
  };

  // 处理添加任务
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      alert("请输入任务标题");
      return;
    }

    try {
      let dueDateISO = null;
      if (newTask.dueDate) {
        if (newTask.dueTime) {
          dueDateISO = dayjs(
            `${newTask.dueDate} ${newTask.dueTime}`
          ).toISOString();
        } else {
          dueDateISO = dayjs(newTask.dueDate).startOf("day").toISOString();
        }
      }

      await createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: dueDateISO,
        completed: false,
        tags: [],
        subtasks: [],
        timeSpent: 0,
      });

      setNewTask({
        title: "",
        description: "",
        priority: "NOT_URGENT_IMPORTANT",
        dueDate: "",
        dueTime: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const toggleTask = async (task: any) => {
    try {
      await updateTask({
        ...task,
        completed: !task.completed,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask.title.trim()) {
      alert("请输入任务标题");
      return;
    }

    try {
      let dueDateISO = null;
      if (editingTask.dueDate) {
        if (editingTask.dueTime) {
          dueDateISO = dayjs(
            `${editingTask.dueDate} ${editingTask.dueTime}`
          ).toISOString();
        } else {
          dueDateISO = dayjs(editingTask.dueDate).startOf("day").toISOString();
        }
      }

      await updateTask({
        ...editingTask,
        dueDate: dueDateISO,
      });
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("确定要删除这个任务吗？")) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  // 按优先级分组任务（艾森豪威尔矩阵）
  const groupTasksByPriority = (tasks: any[]) => {
    return {
      URGENT_IMPORTANT: tasks.filter((t) => t.priority === "URGENT_IMPORTANT"),
      URGENT_NOT_IMPORTANT: tasks.filter(
        (t) => t.priority === "URGENT_NOT_IMPORTANT"
      ),
      NOT_URGENT_IMPORTANT: tasks.filter(
        (t) => t.priority === "NOT_URGENT_IMPORTANT"
      ),
      NOT_URGENT_NOT_IMPORTANT: tasks.filter(
        (t) => t.priority === "NOT_URGENT_NOT_IMPORTANT"
      ),
    };
  };

  // 过滤任务
  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    const matchesCompleted = showCompleted || !task.completed;

    return matchesSearch && matchesPriority && matchesCompleted;
  });

  const groupedTasks = groupTasksByPriority(filteredTasks);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-8">
        Error loading tasks: {error?.toString()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            任务管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            使用艾森豪威尔矩阵管理您的任务
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          添加任务
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">所有优先级</option>
          <option value="URGENT_IMPORTANT">紧急重要</option>
          <option value="URGENT_NOT_IMPORTANT">紧急不重要</option>
          <option value="NOT_URGENT_IMPORTANT">不紧急重要</option>
          <option value="NOT_URGENT_NOT_IMPORTANT">不紧急不重要</option>
        </select>
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          显示已完成
        </label>
      </div>

      {/* Eisenhower Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent & Important */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600" size={24} />
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
              紧急重要 ({groupedTasks.URGENT_IMPORTANT.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.URGENT_IMPORTANT.map((task: any) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={(task) => {
                  const dueDate = task.dueDate
                    ? dayjs(task.dueDate).format("YYYY-MM-DD")
                    : "";
                  const dueTime = task.dueDate
                    ? dayjs(task.dueDate).format("HH:mm")
                    : "";
                  setEditingTask({ ...task, dueDate, dueTime });
                }}
                onDelete={handleDeleteTask}
                priorityColor={priorityColors.URGENT_IMPORTANT}
              />
            ))}
            {groupedTasks.URGENT_IMPORTANT.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                暂无任务
              </p>
            )}
          </div>
        </div>

        {/* Urgent & Not Important */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-orange-600" size={24} />
            <h2 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              紧急不重要 ({groupedTasks.URGENT_NOT_IMPORTANT.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.URGENT_NOT_IMPORTANT.map((task: any) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={(task) => {
                  const dueDate = task.dueDate
                    ? dayjs(task.dueDate).format("YYYY-MM-DD")
                    : "";
                  const dueTime = task.dueDate
                    ? dayjs(task.dueDate).format("HH:mm")
                    : "";
                  setEditingTask({ ...task, dueDate, dueTime });
                }}
                onDelete={handleDeleteTask}
                priorityColor={priorityColors.URGENT_NOT_IMPORTANT}
              />
            ))}
            {groupedTasks.URGENT_NOT_IMPORTANT.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                暂无任务
              </p>
            )}
          </div>
        </div>

        {/* Not Urgent & Important */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckSquare className="text-blue-600" size={24} />
            <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              不紧急重要 ({groupedTasks.NOT_URGENT_IMPORTANT.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.NOT_URGENT_IMPORTANT.map((task: any) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={(task) => {
                  const dueDate = task.dueDate
                    ? dayjs(task.dueDate).format("YYYY-MM-DD")
                    : "";
                  const dueTime = task.dueDate
                    ? dayjs(task.dueDate).format("HH:mm")
                    : "";
                  setEditingTask({ ...task, dueDate, dueTime });
                }}
                onDelete={handleDeleteTask}
                priorityColor={priorityColors.NOT_URGENT_IMPORTANT}
              />
            ))}
            {groupedTasks.NOT_URGENT_IMPORTANT.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                暂无任务
              </p>
            )}
          </div>
        </div>

        {/* Not Urgent & Not Important */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-gray-400" />
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              不紧急不重要 ({groupedTasks.NOT_URGENT_NOT_IMPORTANT.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.NOT_URGENT_NOT_IMPORTANT.map((task: any) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={(task) => {
                  const dueDate = task.dueDate
                    ? dayjs(task.dueDate).format("YYYY-MM-DD")
                    : "";
                  const dueTime = task.dueDate
                    ? dayjs(task.dueDate).format("HH:mm")
                    : "";
                  setEditingTask({ ...task, dueDate, dueTime });
                }}
                onDelete={handleDeleteTask}
                priorityColor={priorityColors.NOT_URGENT_NOT_IMPORTANT}
              />
            ))}
            {groupedTasks.NOT_URGENT_NOT_IMPORTANT.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                暂无任务
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                添加新任务
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  任务标题 *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入任务标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  任务描述
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入任务描述（可选）"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  优先级
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="URGENT_IMPORTANT">紧急重要</option>
                  <option value="URGENT_NOT_IMPORTANT">紧急不重要</option>
                  <option value="NOT_URGENT_IMPORTANT">不紧急重要</option>
                  <option value="NOT_URGENT_NOT_IMPORTANT">不紧急不重要</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    截止日期
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    截止时间
                  </label>
                  <select
                    value={newTask.dueTime}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择时间</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加任务
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                编辑任务
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  任务标题 *
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  任务描述
                </label>
                <textarea
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  优先级
                </label>
                <select
                  value={editingTask.priority}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="URGENT_IMPORTANT">紧急重要</option>
                  <option value="URGENT_NOT_IMPORTANT">紧急不重要</option>
                  <option value="NOT_URGENT_IMPORTANT">不紧急重要</option>
                  <option value="NOT_URGENT_NOT_IMPORTANT">不紧急不重要</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    截止日期
                  </label>
                  <input
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    截止时间
                  </label>
                  <select
                    value={editingTask.dueTime}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择时间</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingTask(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditTask}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// TaskItem Component
interface TaskItemProps {
  task: any;
  onToggle: (task: any) => void;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  priorityColor: string;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  priorityColor,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 ${
        task.completed
          ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-75"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 dark:border-gray-600 hover:border-green-500"
          }`}
        >
          {task.completed && <CheckSquare size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-medium ${
                task.completed
                  ? "line-through text-gray-500 dark:text-gray-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {task.title}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`text-sm mt-1 ${
                task.completed
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}
            >
              {task.priority === "URGENT_IMPORTANT"
                ? "紧急重要"
                : task.priority === "URGENT_NOT_IMPORTANT"
                ? "紧急不重要"
                : task.priority === "NOT_URGENT_IMPORTANT"
                ? "不紧急重要"
                : "不紧急不重要"}
            </span>

            {task.dueDate && (
              <span
                className={`text-xs ${
                  new Date(task.dueDate) < new Date() && !task.completed
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {formatDate(new Date(task.dueDate), "24")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
