export interface ValidationError {
  message: string;
  type: string;
  segment?: number;
}

export interface ApiErrorResponse {
  errors: ValidationError[];
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors: ValidationError[];

  constructor(status: number, message: string, errors: ValidationError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let errorData: ApiErrorResponse | null = null;
    let errorMessage = `Error ${response.status}`;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
        if (errorData && errorData.errors && errorData.errors.length > 0) {
          // Construir mensaje desde los errores de validación
          const errorMessages = errorData.errors.map(err => err.message).join(', ');
          errorMessage = errorMessages;
        }
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }

    return new ApiError(
      response.status,
      errorMessage,
      errorData?.errors || []
    );
  }

  getErrorMessage(): string {
    if (this.errors.length > 0) {
      return this.errors.map(err => err.message).join(', ');
    }
    return this.message;
  }
}

