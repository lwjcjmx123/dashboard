import { useLanguage } from '@/contexts/LanguageContext';

/**
 * AI解析服务类，用于将自然语言文本解析为结构化的日历事件数据
 */
export class AIParser {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.siliconflow.cn', model: string = 'Qwen/Qwen2.5-7B-Instruct') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  /**
   * 使用AI模型解析自然语言文本为日历事件
   * @param text 用户输入的自然语言文本
   * @returns 解析后的事件数据
   */
  async parseTextToEvent(text: string): Promise<{
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    category: 'personal' | 'interview' | 'meeting' | 'task';
    location?: string;
    contact?: string;
    interviewType?: 'online' | 'offline';
    meetingId?: string;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 定义提示词
      const prompt = `
解析以下文本并提取日历事件信息："${text}"

请提取以下字段：
1. 标题（title）：
   - 如果是面试事件，格式为："[线上面试/线下面试]-[公司名称]"，例如："线上面试-同程旅行"、"线下面试-阿里巴巴"
   - 如果是其他事件，生成简短的事件标题
2. 描述（description）：事件的详细描述
3. 开始日期（startDate）：格式为YYYY-MM-DD，今天是${today}
4. 开始时间（startTime）：格式为HH:mm，24小时制
5. 结束日期（endDate）：格式为YYYY-MM-DD
6. 结束时间（endTime）：格式为HH:mm，24小时制
7. 类别（category）：personal（个人）、interview（面试）、meeting（会议）、task（任务）
8. 地点（location）：如果提到地点
9. 联系人（contact）：如果提到联系人
10. 面试类型（interviewType）：如果是面试，判断是online（线上）还是offline（线下）
11. 会议号（meetingId）：如果提到会议号、会议ID、房间号等

返回JSON格式：
{
  "title": "事件标题（面试时格式：线上面试-公司名称 或 线下面试-公司名称）",
  "description": "事件描述",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "endDate": "YYYY-MM-DD",
  "endTime": "HH:mm",
  "category": "类别",
  "location": "地点（可选）",
  "contact": "联系人（可选）",
  "interviewType": "online或offline（仅面试时）",
  "meetingId": "会议号（可选）"
}

特别注意：
- 面试事件的标题必须严格按照格式："线上面试-公司名称" 或 "线下面试-公司名称"
- 从文本中识别公司名称，如果没有明确提到公司名称，可以从上下文推断
- 面试类型（线上/线下）要与interviewType字段保持一致
      `;

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个智能日历助手，负责将自然语言文本解析为结构化的日历事件数据。请严格按照JSON格式返回结果。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      console.log('AI API 响应状态码：', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI 解析失败: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('AI API 响应数据：', responseData);

      const result = responseData.choices[0].message.content;
      console.log('AI 返回的JSON字符串：', result);

      const parsedResult = JSON.parse(result);
      console.log('解析后的结构化数据：', parsedResult);

      // 验证必需字段
      if (!parsedResult.title || !parsedResult.startDate || !parsedResult.startTime) {
        throw new Error('AI解析结果缺少必需字段');
      }

      // 设置默认值
      return {
        title: parsedResult.title,
        description: parsedResult.description || '',
        startDate: parsedResult.startDate,
        startTime: parsedResult.startTime,
        endDate: parsedResult.endDate || parsedResult.startDate,
        endTime: parsedResult.endTime || this.addOneHour(parsedResult.startTime),
        category: parsedResult.category || 'personal',
        location: parsedResult.location || '',
        contact: parsedResult.contact || '',
        interviewType: parsedResult.interviewType || (parsedResult.category === 'interview' ? 'online' : undefined),
        meetingId: parsedResult.meetingId || '',
      };
    } catch (error) {
      console.error('AI 解析失败:', error);
      throw new Error(`AI 解析失败: ${error}`);
    }
  }

  /**
   * 为时间添加一小时（用于默认结束时间）
   * @param timeStr 时间字符串 HH:mm
   * @returns 添加一小时后的时间字符串
   */
  private addOneHour(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

/**
 * AI配置接口
 */
export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
}

/**
 * 默认AI配置
 */
export const defaultAIConfig: AIConfig = {
  apiKey: '',
  baseUrl: 'https://api.siliconflow.cn',
  model: 'Qwen/Qwen2.5-7B-Instruct',
  enabled: false,
};

/**
 * 从localStorage获取AI配置
 */
export const getAIConfig = (): AIConfig => {
  if (typeof window === 'undefined') return defaultAIConfig;
  
  try {
    const stored = localStorage.getItem('ai-config');
    if (stored) {
      return { ...defaultAIConfig, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('获取AI配置失败:', error);
  }
  return defaultAIConfig;
};

/**
 * 保存AI配置到localStorage
 */
export const saveAIConfig = (config: AIConfig): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('ai-config', JSON.stringify(config));
  } catch (error) {
    console.error('保存AI配置失败:', error);
  }
};

/**
 * 创建AI解析器实例
 */
export const createAIParser = (): AIParser | null => {
  const config = getAIConfig();
  
  if (!config.enabled || !config.apiKey) {
    return null;
  }
  
  return new AIParser(config.apiKey, config.baseUrl, config.model);
};