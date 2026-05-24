export class AiServiceError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(message: string, code: string, httpStatus: number) {
    super(message);
    this.name = "AiServiceError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export function toAiServiceError(error: unknown): AiServiceError {
  if (error instanceof AiServiceError) return error;

  if (error instanceof Error) {
    if (error.message.includes("GEMINI_API_KEY")) {
      return new AiServiceError(error.message, "missing_api_key", 503);
    }
    return new AiServiceError(error.message, "unknown", 502);
  }

  return new AiServiceError("AI request failed", "unknown", 502);
}
