import { useUserStore } from '../stores';
import { useRouter } from 'vue-router';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();

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
      // 处理用户凭据过期的情况
      if (
        response.status === 401 ||
        (response.status === 200 &&
          (await response.text().then((text) => {
            try {
              const data = JSON.parse(text);
              return (
                data.message?.includes('token') ||
                data.message?.includes('认证') ||
                data.message?.includes('登录')
              );
            } catch {
              return false;
            }
          })))
      ) {
        // 清除用户凭据
        userStore.$reset();
        // 跳转到登录页面，并携带当前路径作为 redirect 参数
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath },
        });
        return {
          success: false,
          error: '用户凭据已过期，请重新登录',
        };
      }

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
      // 处理用户凭据过期的情况
      if (
        data.message?.includes('token') ||
        data.message?.includes('认证') ||
        data.message?.includes('登录')
      ) {
        // 清除用户凭据
        userStore.$reset();
        // 跳转到登录页面，并携带当前路径作为 redirect 参数
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath },
        });
        return {
          success: false,
          error: '用户凭据已过期，请重新登录',
        };
      }

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
  
  logout: async () => {
    return apiRequest('/user/logout', {
      method: 'POST',
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

  // 更新景点
  update: async (attractionData: {
    id: number;
    name?: string;
    description?: string;
    open_time?: string;
    image_url?: string;
  }) => {
    return apiRequest('/attraction/update', {
      method: 'POST',
      body: JSON.stringify(attractionData),
    });
  },

  // 删除景点
  delete: async (params: { id: number }) => {
    return apiRequest('/attraction/delete', {
      method: 'POST',
      body: JSON.stringify(params),
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

  // 用户管理API
  queryUsers: async (params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    role?: string;
  }) => {
    return apiRequest('/admin/users/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  addUser: async (userData: {
    username: string;
    password: string;
    role: string;
  }) => {
    return apiRequest('/admin/users/add', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (userData: { id: number; role?: string }) => {
    return apiRequest('/admin/users/update', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (params: { id: number }) => {
    return apiRequest('/admin/users/delete', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// 订单相关API
export const orderApi = {
  // 查询用户的订单
  query: async (params: {
    user_id?: number;
    order_id?: number;
    page?: number;
    pageSize?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    ticket_id?: number;
    attraction_id?: number;
  }) => {
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
    ticket_id?: number;
  }) => {
    return apiRequest('/order/update', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // 取消订单
  cancel: async (params: { order_id: number }) => {
    return apiRequest('/order/cancel', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // 获取订单统计信息
  stats: async (params: {
    start_date?: string;
    end_date?: string;
    attraction_id?: number;
  }) => {
    return apiRequest('/order/stats', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// 票务相关API
export const ticketApi = {
  // 查询票种
  query: async (params: {
    attraction_id?: number; // 改为可选参数
    page?: number;
    pageSize?: number;
  }) => {
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

  // 添加票种
  add: async (ticketData: {
    attraction_id: number;
    name: string;
    price: number;
    daily_limit: number;
  }) => {
    return apiRequest('/ticket/add', {
      method: 'POST',
      body: JSON.stringify({
        attraction_id: ticketData.attraction_id,
        name: ticketData.name,
        available: ticketData.daily_limit,
        price: ticketData.price,
      }),
    });
  },

  // 更新票种
  update: async (ticketData: {
    id: number;
    name?: string;
    price?: number;
    daily_limit?: number;
    status?: string;
  }) => {
    const requestData: any = { id: ticketData.id };

    if (ticketData.name !== undefined) requestData.name = ticketData.name;
    if (ticketData.price !== undefined) requestData.price = ticketData.price;
    if (ticketData.daily_limit !== undefined)
      requestData.available = ticketData.daily_limit;
    if (ticketData.status !== undefined) requestData.status = ticketData.status;

    return apiRequest('/ticket/update', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // 删除票种
  delete: async (params: { id: number }) => {
    return apiRequest('/ticket/delete', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// 设施相关API
export const facilityApi = {
  // 查询设施列表
  query: async (params: {
    attraction_id?: number;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) => {
    return apiRequest('/facility/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // 添加设施
  add: async (facilityData: {
    name: string;
    location: string;
    status: string;
    attraction_id: number;
  }) => {
    return apiRequest('/facility/add', {
      method: 'POST',
      body: JSON.stringify(facilityData),
    });
  },

  // 更新设施
  update: async (facilityData: {
    id: number;
    name?: string;
    location?: string;
    status?: string;
    attraction_id?: number;
  }) => {
    return apiRequest('/facility/update', {
      method: 'POST',
      body: JSON.stringify(facilityData),
    });
  },

  // 删除设施
  delete: async (params: { id: number }) => {
    return apiRequest('/facility/delete', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// 日志相关API
export const logApi = {
  // 查询日志列表
  query: async (params: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    userId?: number;
    action?: string;
    target?: string;
  }) => {
    return apiRequest('/log/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // 获取日志统计信息
  stats: async () => {
    return apiRequest('/log/stats', {
      method: 'POST',
    });
  },
};
