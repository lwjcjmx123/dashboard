import React from 'react';

/**
 * 仪表盘加载骨架屏组件
 * Dashboard loading skeleton component
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="p-4 md:p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="p-2 md:p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="mt-4">
              <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Card Skeletons */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className={`p-4 md:p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${index === 2 ? 'md:col-span-2 xl:col-span-3' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-3">
              {[...Array(index === 2 ? 6 : 3)].map((_, itemIndex) => (
                <div key={itemIndex} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;