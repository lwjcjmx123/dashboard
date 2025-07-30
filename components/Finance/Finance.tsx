import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  CreditCard,
} from "lucide-react";
import {
  useClientBills,
  useClientExpenses,
  useClientUserSettings,
} from "@/lib/client-data-hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/utils/dateUtils";
import DatePicker from "../UI/DatePicker";
import dayjs from "dayjs";

const Finance: React.FC = () => {
  const {
    bills,
    loading: billsLoading,
    createBill,
    updateBill,
    deleteBill,
  } = useClientBills();
  const {
    expenses,
    loading: expensesLoading,
    createExpense,
    deleteExpense,
  } = useClientExpenses();
  const { settings, loading: settingsLoading } = useClientUserSettings();
  const { t } = useLanguage();

  // Currency symbol mapping
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      CNY: "¥",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[currency] || "$";
  };

  const currencySymbol = settings ? getCurrencySymbol(settings.currency) : "$";

  const [activeTab, setActiveTab] = useState<
    "overview" | "bills" | "expenses" | "budget"
  >("overview");
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const [newBill, setNewBill] = useState({
    title: "",
    amount: "",
    category: "",
    dueDate: "",
    recurring: false,
  });

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    date: dayjs().format("YYYY-MM-DD"),
  });

  // Calculate financial metrics
  const totalBills = bills.reduce(
    (sum: number, bill: any) => sum + bill.amount,
    0
  );
  const unpaidBills = bills
    .filter((bill: any) => !bill.paid)
    .reduce((sum: number, bill: any) => sum + bill.amount, 0);
  const totalExpenses = expenses.reduce(
    (sum: number, expense: any) => sum + expense.amount,
    0
  );
  const thisMonthExpenses = expenses
    .filter((expense: any) => {
      return dayjs().isSame(dayjs(expense.date), "month");
    })
    .reduce((sum: number, expense: any) => sum + expense.amount, 0);

  const upcomingBills = bills
    .filter((bill: any) => {
      return !bill.paid && dayjs(bill.dueDate).isBefore(dayjs().add(7, "day"));
    })
    .sort(
      (a: any, b: any) =>
        dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()
    );

  const expenseCategories = expenses.reduce((acc: any, expense: any) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const handleAddBill = async () => {
    if (!newBill.title || !newBill.amount || !newBill.dueDate) return;

    try {
      await createBill({
        title: newBill.title,
        amount: parseFloat(newBill.amount),
        category: newBill.category,
        dueDate: dayjs(newBill.dueDate).toISOString(),
        recurring: newBill.recurring,
      });

      setNewBill({
        title: "",
        amount: "",
        category: "",
        dueDate: "",
        recurring: false,
      });
      setShowAddBill(false);
    } catch (error) {
      console.error("Error creating bill:", error);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) return;

    try {
      await createExpense({
        title: newExpense.title,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: dayjs(newExpense.date).toISOString(),
        description: newExpense.description,
        tags: [],
      });

      setNewExpense({
        title: "",
        amount: "",
        category: "",
        description: "",
        date: dayjs().format("YYYY-MM-DD"),
      });
      setShowAddExpense(false);
    } catch (error) {
      console.error("Error creating expense:", error);
    }
  };

  const toggleBillPaid = async (bill: any) => {
    try {
      await updateBill({
        variables: {
          input: {
            id: bill.id,
            paid: !bill.paid,
            paidDate: !bill.paid ? dayjs().toISOString() : null,
          },
        },
      });
    } catch (error) {
      console.error("Error updating bill:", error);
    }
  };

  const tabs = [
    { id: "overview", label: t("overview"), icon: TrendingUp },
    { id: "bills", label: t("bills"), icon: AlertCircle },
    { id: "expenses", label: t("expenses"), icon: DollarSign },
  ];

  if (billsLoading || expensesLoading || settingsLoading) {
    return <div className="p-6">{t("loading")}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("finance")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("trackExpensesBillsBudget")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddBill(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <Plus size={20} />
            {t("addBill")}
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            {t("addExpense")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <TrendingUp
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-green-500 font-medium">+5.2%</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currencySymbol}
                  {totalExpenses.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("totalExpenses")}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <AlertCircle
                    className="text-red-600 dark:text-red-400"
                    size={24}
                  />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currencySymbol}
                  {unpaidBills.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("unpaidBills")}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <DollarSign
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown size={16} className="text-red-500" />
                  <span className="text-red-500 font-medium">-2.1%</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currencySymbol}
                  {thisMonthExpenses.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("thisMonth")}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <CreditCard
                    className="text-purple-600 dark:text-purple-400"
                    size={24}
                  />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currencySymbol}
                  {totalBills.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("totalBills")}
                </p>
              </div>
            </div>
          </div>

          {/* Charts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Bills */}
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("upcomingBills")}
              </h3>
              <div className="space-y-3">
                {upcomingBills.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t("noUpcomingBills")}
                  </p>
                ) : (
                  upcomingBills.map((bill: any) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bill.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("due")}: {formatDate(new Date(bill.dueDate), "24")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 dark:text-red-400">
                          {currencySymbol}
                          {bill.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {bill.category}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("expenseCategories")}
              </h3>
              <div className="space-y-3">
                {Object.entries(expenseCategories).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t("noExpenseCategories")}
                  </p>
                ) : (
                  Object.entries(expenseCategories)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([category, amount]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {currencySymbol}
                            {(amount as number).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(
                              ((amount as number) / totalExpenses) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === "bills" && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("allBills")}
              </h3>
              <div className="space-y-3">
                {bills.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t("noBillsAddedYet")}
                  </p>
                ) : (
                  bills.map((bill: any) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={bill.paid}
                          onChange={() => toggleBillPaid(bill)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              bill.paid
                                ? "line-through text-gray-500"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {bill.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {formatDate(new Date(bill.dueDate), "24")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            bill.paid
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {currencySymbol}
                          {bill.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {bill.category}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("recentExpenses")}
              </h3>
              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t("noExpensesRecordedYet")}
                  </p>
                ) : (
                  expenses
                    .slice()
                    .reverse()
                    .map((expense: any) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {expense.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(new Date(expense.date), "24")} •{" "}
                            {expense.category}
                          </p>
                          {expense.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {expense.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {currencySymbol}
                            {expense.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {expense.currency}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("addNewBill")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("title")}
                </label>
                <input
                  type="text"
                  value={newBill.title}
                  onChange={(e) =>
                    setNewBill({ ...newBill, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("enterBillTitle")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("amount")}
                </label>
                <input
                  type="number"
                  value={newBill.amount}
                  onChange={(e) =>
                    setNewBill({ ...newBill, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("category")}
                </label>
                <input
                  type="text"
                  value={newBill.category}
                  onChange={(e) =>
                    setNewBill({ ...newBill, category: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("billCategoryPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("dueDate")}
                </label>
                <DatePicker
                  selected={
                    newBill.dueDate ? dayjs(newBill.dueDate).toDate() : null
                  }
                  onChange={(date) =>
                    setNewBill({
                      ...newBill,
                      dueDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
                    })
                  }
                  placeholder={t("selectDueDate")}
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newBill.recurring}
                    onChange={(e) =>
                      setNewBill({ ...newBill, recurring: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t("recurringBill")}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddBill(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleAddBill}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                {t("addBill")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("addNewExpense")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("title")}
                </label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("enterExpenseTitle")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("amount")}
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("category")}
                </label>
                <input
                  type="text"
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("expenseCategoryPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("dueDate")}
                </label>
                <DatePicker
                  selected={
                    newExpense.date ? dayjs(newExpense.date).toDate() : null
                  }
                  onChange={(date) =>
                    setNewExpense({
                      ...newExpense,
                      date: date ? dayjs(date).format("YYYY-MM-DD") : "",
                    })
                  }
                  placeholder={t("selectDate")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("description")}
                </label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("optionalDescription")}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleAddExpense}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {t("addExpense")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
