export interface IApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: unknown;
}

export interface IApiResponse<T> {
  data?: T;
  error?: IApiError;
  success: boolean;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
