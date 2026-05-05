export class ApiError extends Error {
  status: number;
  url: string;
  data?: unknown;

  constructor(message: string, status: number, url: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.data = data;
  }
}
