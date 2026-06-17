import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

type HttpExceptionResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

type ErrorResponse = {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const body = this.buildResponseBody(statusCode, exceptionResponse, request.path);
    response.status(statusCode).json(body);
  }

  private buildResponseBody(
    statusCode: number,
    exceptionResponse: string | object | undefined,
    path: string,
  ): ErrorResponse {
    if (typeof exceptionResponse === 'string') {
      return {
        statusCode,
        message: exceptionResponse,
        error: this.getDefaultError(statusCode),
        path,
        timestamp: new Date().toISOString(),
      };
    }

    const responseBody = this.isHttpExceptionResponse(exceptionResponse)
      ? exceptionResponse
      : undefined;
    const message = responseBody?.message;

    return {
      statusCode,
      message: Array.isArray(message)
        ? 'Validation failed'
        : (message ?? this.getDefaultError(statusCode)),
      error: responseBody?.error ?? this.getDefaultError(statusCode),
      path,
      timestamp: new Date().toISOString(),
    };
  }

  private isHttpExceptionResponse(value: unknown): value is HttpExceptionResponse {
    return typeof value === 'object' && value !== null;
  }

  private getDefaultError(statusCode: number): string {
    const statusName = HttpStatus[statusCode] ?? 'Error';
    return statusName
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
