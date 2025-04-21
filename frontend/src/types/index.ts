export interface User {
  id: number;
  username: string;
  role: string;
  token?: string;
}

export interface Attraction {
  id: number;
  name: string;
  description: string;
  open_time: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  attraction_id: number;
  score: number;
  comment?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AttractionFilter {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface FeedbackFilter {
  attraction_id?: number;
  score?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface FeedbackStats {
  totalCount: number;
  avgScore: number;
  withCommentCount: number;
  withCommentPercent: number;
  scoreDistribution: Record<number, number>;
}
