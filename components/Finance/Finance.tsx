import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus, CreditCard } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BILLS, GET_EXPENSES } from '@/lib/graphql/queries';
import { CREATE_BILL, UPDATE_BILL, DELETE_BILL, CREATE_EXPENSE, DELETE_EXPENSE } from '@/lib/graphql/mutations';
import { formatDate } from '@/utils/dateUtils';
import DatePicker from '../UI/DatePicker';
import dayjs from 'dayjs';

const Finance: React.FC = () => {
  const { data: billsData, loading: billsLoading } = useQuery(GET_BILLS);
  const { data: expensesData, loading: expensesLoading } = useQuery(GET_EXPENSES);
  
  const [createBill] = useMutation(CREATE_BILL, {
    refetchQueries: [{ query: GET_BILLS }],
  });
  const [updateBill] = useMutation(UPDATE_BILL, {
    refetchQueries: [{ query: GET_BILLS }],
  });
  const [deleteBill] = useMutation(DELETE_BILL, {
    refetchQueries: [{ query: GET_BILLS }],
  });
  const [createExpense] = useMutation(CREATE_EXPENSE, {
    refetchQueries: [{ query: GET_EXPENSES }],
  });
  const [deleteExpense] = useMutation(DELETE_EXPENSE, {
    refetchQueries: [{ query: GET_EXPENSES }],
  });

  const bills = billsData?.bills || [];
  const expenses = expensesData?.expenses || [];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'expenses' | 'budget'>('overview');
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const [newBill, setNewBill] = useState({
    title: '',
    amount: '',
    category: '',
    dueDate: '',
    recurring: false,
  });
  
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: dayjs().format('YYYY-MM-DD'),
  });

  // Calculate financial metrics
  const totalBills = bills.reduce((sum: number, bill: any) => sum + bill.amount, 0);
  const unpaidBills = bills.filter((bill: any) => !bill.paid).reduce((sum: number, bill: any) => sum + bill.amount, 0);
  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
  const thisMonthExpenses = expenses.filter((expense: any) => {
    return dayjs().isSame(dayjs(expense.date), 'month');
  }).reduce((sum: number, expense: any) => sum + expense.amount, 0);

  const upcomingBills = bills.filter((bill: any) => {
    return !bill.paid && dayjs(bill.dueDate).isBefore(dayjs().add(7, 'day'));
  }).sort((a: any, b: any) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());

  const expenseCategories = expenses.reduce((acc: any, expense: any) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const handleAddBill = async () => {
    if (!newBill.title || !newBill.amount || !newBill.dueDate) return;
    
    try {
      await createBill({
        variables: {
          input: {
            title: newBill.title,
            amount: parseFloat(newBill.amount),
            category: newBill.category,
            dueDate: dayjs(newBill.dueDate).toISOString(),
            recurring: newBill.recurring,
          },
        },
      });
      
      setNewBill({ title: '', amount: '', category: '', dueDate: '', recurring: false });
      setShowAddBill(false);
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) return;
    
    try {
      await createExpense({
        variables: {
          input: {
            title: newExpense.title,
            amount: parseFloat(newExpense.amount),
            category: newExpense.category,
            date: dayjs(newExpense.date).toISOString(),
            description: newExpense.description,
            tags: [],
          },
        },
      });
      
      setNewExpense({ 
        title: '', 
        amount: '', 
        category: '', 
        description: '', 
        date: dayjs().format('YYYY-MM-DD') 
      });
      setShowAddExpense(false);
    } catch (error) {
      console.error('Error creating expense:', error);
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
      console.error('Error updating bill:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'bills', label: 'Bills', icon: AlertCircle },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'budget', label: 'Budget', icon: CreditCard },
  ];

  if (billsLoading || expensesLoading) {
    return <div className="p-6">Loading financial data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Finance
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your expenses, bills, and budget
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddBill(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <Plus size={20} />
            Add Bill
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            Add Expense
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
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-green-500 font-medium">+5.2%</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalExpenses.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Expenses
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${unpaidBills.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unpaid Bills
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown size={16} className="text-red-500" />
                  <span className="text-red-500 font-medium">-2.1%</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${thisMonthExpenses.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This Month
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <CreditCard className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalBills.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Bills
                </p>
              </div>
            </div>
          </div>

          {/* Charts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Bills */}
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Bills
              </h3>
              <div className="space-y-3">
                {upcomingBills.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No upcoming bills
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
                          Due: {formatDate(new Date(bill.dueDate), '24')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 dark:text-red-400">
                          ${bill.amount.toFixed(2)}
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
                Expense Categories
              </h3>
              <div className="space-y-3">
                {Object.entries(expenseCategories).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No expense categories
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
                            ${(amount as number).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(((amount as number) / totalExpenses) * 100).toFixed(1)}%
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
      {activeTab === 'bills' && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                All Bills
              </h3>
              <div className="space-y-3">
                {bills.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No bills added yet
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
                          <p className={`font-medium ${
                            bill.paid 
                              ? 'line-through text-gray-500' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {bill.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {formatDate(new Date(bill.dueDate), '24')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          bill.paid 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ${bill.amount.toFixed(2)}
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
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Expenses
              </h3>
              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No expenses recorded yet
                  </p>
                ) : (
                  expenses.slice().reverse().map((expense: any) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {expense.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(new Date(expense.date), '24')} • {expense.category}
                        </p>
                        {expense.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          ${expense.amount.toFixed(2)}
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
              Add New Bill
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newBill.title}
                  onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bill title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newBill.category}
                  onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Utilities, Rent, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <DatePicker
                  selected={newBill.dueDate ? dayjs(newBill.dueDate).toDate() : null}
                  onChange={(date) => setNewBill({ ...newBill, dueDate: date ? dayjs(date).format('YYYY-MM-DD') : '' })}
                  placeholder="Select due date"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newBill.recurring}
                    onChange={(e) => setNewBill({ ...newBill, recurring: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Recurring bill
                  </span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddBill(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBill}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Add Bill
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
              Add New Expense
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter expense title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Food, Transport, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <DatePicker
                  selected={newExpense.date ? dayjs(newExpense.date).toDate() : null}
                  onChange={(date) => setNewExpense({ ...newExpense, date: date ? dayjs(date).format('YYYY-MM-DD') : '' })}
                  placeholder="Select date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;