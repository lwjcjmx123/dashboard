import React, { useState, useEffect } from 'react';
import { Bot, Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AIConfig, getAIConfig, saveAIConfig, createAIParser } from '@/lib/ai-parser';

/**
 * AI设置组件
 * 用于配置AI解析服务的参数
 */
const AISettings: React.FC = () => {
  const { t } = useLanguage();
  const [config, setConfig] = useState<AIConfig>({
    apiKey: '',
    baseUrl: 'https://api.siliconflow.cn',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    enabled: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 组件挂载时加载配置
  useEffect(() => {
    const savedConfig = getAIConfig();
    setConfig(savedConfig);
  }, []);

  /**
   * 处理配置字段变更
   */
  const handleConfigChange = (field: keyof AIConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
    setTestResult(null); // 清除测试结果
  };

  /**
   * 保存配置
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveAIConfig(config);
      // 显示保存成功提示
      setTestResult({
        success: true,
        message: '配置保存成功！',
      });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult({
        success: false,
        message: '保存配置失败',
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 测试AI连接
   */
  const handleTest = async () => {
    if (!config.apiKey) {
      setTestResult({
        success: false,
        message: '请先输入API密钥',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // 临时保存配置用于测试
      const tempConfig = { ...config, enabled: true };
      saveAIConfig(tempConfig);
      
      const parser = createAIParser();
      if (!parser) {
        throw new Error('无法创建AI解析器');
      }

      // 使用简单的测试文本
      const testText = '明天下午3点开会讨论项目进展';
      const result = await parser.parseTextToEvent(testText);
      
      setTestResult({
        success: true,
        message: `测试成功！解析结果：${result.title}`,
      });
      
      // 恢复原配置
      saveAIConfig(config);
    } catch (error) {
      setTestResult({
        success: false,
        message: `测试失败：${error}`,
      });
      // 恢复原配置
      saveAIConfig(config);
    } finally {
      setIsTesting(false);
    }
  };

  const availableModels = [
    'Qwen/Qwen2.5-7B-Instruct',
    'Qwen/Qwen2.5-14B-Instruct',
    'deepseek-ai/DeepSeek-V3',
    'meta-llama/Llama-3.1-8B-Instruct',
    'google/gemma-2-9b-it',
  ];

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('aiSettings')}
        </h3>
      </div>

      {/* 启用开关 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {t('aiParsingEnabled')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('aiParsingDescription')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleConfigChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* API 配置 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('apiKey')} *
          </label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
            placeholder={t('apiKeyPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            您的 API 密钥将安全存储在本地
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('baseUrl')}
          </label>
          <input
            type="url"
            value={config.baseUrl}
            onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
            placeholder={t('baseUrlPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('aiModel')}
          </label>
          <input
            type="text"
            value={config.model}
            onChange={(e) => handleConfigChange('model', e.target.value)}
            placeholder={t('aiModelPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('aiModelHint')}
          </p>
        </div>
      </div>

      {/* 测试结果 */}
      {testResult && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            testResult.success
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
          }`}
        >
          {testResult.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{testResult.message}</span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? t('saving') : t('saveConfiguration')}
        </button>
        
        <button
          onClick={handleTest}
          disabled={isTesting || !config.apiKey}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <TestTube className="w-4 h-4" />
          {isTesting ? t('testing') : t('testConnection')}
        </button>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
          {t('aiUsageInstructions')}
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• 启用后，在创建事件时可以使用自然语言描述</li>
          <li>• 例如："明天下午3点和张三开会讨论项目"</li>
          <li>• AI 会自动解析时间、地点、联系人等信息</li>
          <li>• 支持中文和英文输入</li>
        </ul>
      </div>
    </div>
  );
};

export default AISettings;