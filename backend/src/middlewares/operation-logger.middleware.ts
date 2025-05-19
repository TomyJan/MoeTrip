import { Request, Response, NextFunction } from 'express';
import LogService from '../utils/log-service';
import logger from '../utils/logger';

// TODO: 这个日志记录写的一坨, 但是像这样糊弄过去吧改不动了

/**
 * 操作日志中间件
 * 自动记录所有认证用户的POST请求操作
 */
export const operationLogger = (req: Request, res: Response, next: NextFunction) => {
  // 克隆原始json方法
  const originalJson = res.json;
  
  // 只处理POST请求
  if (req.method === 'POST') {
    res.json = function(data: any) {
      // 恢复原始json方法以避免递归
      res.json = originalJson;
      
      // 请求成功且用户已登录才记录日志
      if (data && data.code === 0 && req.user && req.user.id) {
        try {
          // 解析URL确定target和action
          const { target, action, targetId } = parseOperation(req);
          
          // 不记录日志相关操作
          if (target !== 'log' && target !== 'logs') {
            // 记录操作日志
            LogService.createLog(
              req.user.id,
              action,
              target,
              targetId,
              {
                method: req.method,
                path: req.originalUrl || req.url,
                body: sanitizeRequestBody(req.body),
                result: 'success'
              },
              req.ip || req.socket.remoteAddress || '',
              req.headers['user-agent'] || ''
            ).catch(err => {
              logger.error('记录操作日志失败:', err);
            });
          }
        } catch (error) {
          logger.error('处理操作日志时出错:', error);
        }
      }
      
      // 返回原始响应
      return originalJson.call(res, data);
    };
  }
  
  next();
};

/**
 * 解析路径获取操作类型和目标对象
 * 直接使用路径部分，不做映射处理
 */
function parseOperation(req: Request): { target: string; action: string; targetId: number | null } {
  // 使用originalUrl获取完整路径，而不是req.path
  const fullPath = req.originalUrl || req.url;
  const body = req.body || {};
  
  // 从URL中移除查询参数
  const path = fullPath.split('?')[0];
  
  console.log("原始完整路径:", path);
  
  // 去掉前缀并分解路径
  let processedPath = path;
  
  // 匹配并去除/api/v1/或/api/v2/等前缀
  const apiPrefixMatch = path.match(/^\/api\/v\d+\//);
  if (apiPrefixMatch) {
    processedPath = path.substring(apiPrefixMatch[0].length);
  }
  
  // 分解路径部分
  const parts = processedPath.split('/').filter(p => p);
  
  console.log("处理后路径:", processedPath);
  console.log("路径部分:", parts);
  
  // 默认值
  let target = 'system';
  let action = 'other';
  let targetId: number | null = null;
  
  // 处理路径部分
  if (parts.length === 0) {
    // 没有有效路径部分
    target = 'unknown';
    action = 'access';
  } else if (parts.length === 1) {
    // 只有一段路径，将它作为action，target设为unknown
    target = 'unknown';
    action = parts[0];
  } else {
    // 至少有两段路径，第一段作为target，第二段作为action
    target = parts[0];
    action = parts[1];
    
    // 特殊处理admin路径，跳过admin本身
    if (target === 'admin' && parts.length >= 2) {
      if (parts.length === 2) {
        // 只有admin和一个部分，如/admin/dashboard
        target = 'admin';
        action = parts[1];
      } else {
        // 有admin和至少两个部分，如/admin/users/query
        target = parts[1];
        action = parts[2];
      }
    }
  }
  
  // 从请求体中提取可能的ID
  if (body.id && !isNaN(parseInt(String(body.id)))) {
    targetId = parseInt(String(body.id));
  } else {
    // 尝试从target_id字段获取ID
    const idField = `${target}_id`;
    if (body[idField] && !isNaN(parseInt(String(body[idField])))) {
      targetId = parseInt(String(body[idField]));
    }
  }
  
  console.log(`解析结果: target=${target}, action=${action}, targetId=${targetId}`);
  return { target, action, targetId };
}

/**
 * 清理请求体中的敏感信息
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return {};
  
  // 创建请求体的副本
  const sanitized = { ...body };
  
  // 移除敏感字段
  const sensitiveFields = ['password', 'password_hash', 'token', 'credit_card'];
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
} 
