export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;

export type HealthData = {
  status: "ok";
  service: string;
  timestamp: string;
};
