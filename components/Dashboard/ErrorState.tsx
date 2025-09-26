import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getTranslation } from '../../lib/i18n';

interface ErrorStateProps {
  /** 错误信息 */
  error?: string;
  /** 重试回调函数 */
  onRetry?: () => void;
  /** 是否显示重试按钮 */
  showRetry?: boolean;
}

/**
 * 仪表盘错误状态组件
 * Dashboard error state component
 */
const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  showRetry = true 
}) => {
  // 这里需要从某个地方获取当前语言，暂时使用中文
  const t = (key: string) => getTranslation('zh', key as any);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('dashboardErrorTitle')}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
          {error || t('dashboardErrorMessage')}
        </p>
        
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('dashboardErrorRetry')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;