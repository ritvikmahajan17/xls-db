import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { XlsDBException } from '../exceptions/xlsDB.exceptions';

/**
 * Global exception filter for xlsDB application
 * Handles all exceptions and provides consistent error responses
 */
@Catch()
export class XlsDBExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(XlsDBExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof XlsDBException) {
      status = exception.getStatus();
      message = exception.message;
      error = exception.constructor.name;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      error = exception.constructor.name;
    }

    // Log the error
    this.logger.error(
      `Error occurred: ${message}`,
      exception instanceof Error ? exception.stack : '',
      'XlsDBExceptionFilter',
    );

    // Send response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
