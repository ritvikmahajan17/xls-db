import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception class for xlsDB related errors
 */
export class XlsDBException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}

/**
 * Exception thrown when a sheet is not found
 */
export class SheetNotFoundException extends XlsDBException {
  constructor(sheetId: string) {
    super(`Sheet with ID ${sheetId} not found`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Exception thrown when a column is not found
 */
export class ColumnNotFoundException extends XlsDBException {
  constructor(columnName: string) {
    super(`Column ${columnName} not found`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Exception thrown when there's an error with Google Sheets API
 */
export class GoogleSheetsApiException extends XlsDBException {
  constructor(message: string) {
    super(
      `Google Sheets API Error: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Exception thrown when cache operations fail
 */
export class CacheOperationException extends XlsDBException {
  constructor(message: string) {
    super(
      `Cache Operation Error: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Exception thrown when input validation fails
 */
export class ValidationException extends XlsDBException {
  constructor(message: string) {
    super(`Validation Error: ${message}`, HttpStatus.BAD_REQUEST);
  }
}
