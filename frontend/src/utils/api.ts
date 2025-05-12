import { useUserStore } from '../stores';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 定义API结果接口
export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 创建通用的API请求函数
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  if (!API_BASE_URL) {
    return { success: false, error: 'API_BASE_URL is not defined' };
  }

  const userStore = useUserStore();
  const token = userStore.getToken;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // 检查HTTP错误
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP错误: ${response.status} ${response.statusText}`,
      };
    }

    // 解析JSON数据
    let data;
    try {
      data = await response.json();
    } catch (e) {
      return {
        success: false,
        error: '无效的JSON响应',
      };
    }

    // 检查API错误
    if (data.code !== 0) {
      return {
        success: false,
        error: data.message || '请求失败',
      };
    }

    // 返回成功的数据
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API请求错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

// 用户认证相关API
export const authApi = {
  login: async (username: string, password: string) => {
    return apiRequest('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register: async (username: string, password: string) => {
    return apiRequest('/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

// 景点相关API
export const attractionApi = {
  query: async (params: {
    id?: number;
    page?: number;
    pageSize?: number;
    keyword?: string;
  }) => {
    return apiRequest('/attraction/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  add: async (attractionData: {
    name: string;
    description: string;
    open_time: string;
    image_url: string;
  }) => {
    return apiRequest('/attraction/add', {
      method: 'POST',
      body: JSON.stringify(attractionData),
    });
  },

  stats: async () => {
    return apiRequest('/attraction/stats', {
      method: 'POST',
    });
  },
};

// 反馈相关API
export const feedbackApi = {
  add: async (feedbackData: {
    attraction_id: number;
    score: number;
    comment?: string;
  }) => {
    return apiRequest('/feedback/add', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  query: async (params: {
    id?: number;
    attraction_id?: number;
    user_id?: number;
    min_score?: number;
    max_score?: number;
    has_comment?: boolean;
    keyword?: string;
    include_deleted?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    return apiRequest('/feedback/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  update: async (feedbackData: {
    id?: number;
    attraction_id?: number;
    score?: number;
    comment?: string;
    status?: string;
  }) => {
    return apiRequest('/feedback/update', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  stats: async (params: {
    attraction_id?: number;
    include_deleted?: boolean;
  }) => {
    return apiRequest('/feedback/stats', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// 添加管理员API
export const adminApi = {
  getStats: async () => {
    return apiRequest('/admin/stats', {
      method: 'POST',
    });
  },

  getLogs: async (params: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return apiRequest('/admin/logs', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// 订单相关API
export const orderApi = {
  // 查询用户的订单
  query: async (params: { user_id?: number; order_id?: number }) => {
    return apiRequest('/order/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // 创建新订单
  create: async (orderData: {
    ticket_id: number;
    quantity: number;
    date: string;
  }) => {
    return apiRequest('/order/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // 修改订单
  update: async (orderData: {
    order_id: number;
    quantity?: number;
    date?: string;
    status?: string;
  }) => {
    return apiRequest('/order/update', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
};

// 票务相关API
export const ticketApi = {
  // 查询票种
  query: async (params: { attraction_id: number }) => {
    return apiRequest('/ticket/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // 检查票种余量
  check: async (params: { ticket_id: number; date: string }) => {
    return apiRequest('/ticket/check', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
