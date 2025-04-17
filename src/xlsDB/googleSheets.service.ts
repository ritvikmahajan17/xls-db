import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleSheetsApiException } from './exceptions/xlsDB.exceptions';

/**
 * Service for handling Google Sheets API interactions
 * Provides authentication and client creation functionality
 */
@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);

  /**
   * Creates a Google Sheets API client with the provided service account credentials
   * @param serviceAccountJson - Service account credentials in JSON format
   * @returns Promise resolving to Google Sheets API client
   * @throws GoogleSheetsApiException when authentication fails
   * @example
   * const sheets = await googleSheetsService.createClient({
   *   client_email: 'service-account@project.iam.gserviceaccount.com',
   *   private_key: '-----BEGIN PRIVATE KEY-----\n...'
   * });
   */
  async createClient(serviceAccountJson: any) {
    try {
      if (
        !serviceAccountJson?.client_email ||
        !serviceAccountJson?.private_key
      ) {
        throw new GoogleSheetsApiException(
          'Invalid service account credentials',
        );
      }

      const auth = new google.auth.JWT(
        serviceAccountJson.client_email,
        undefined,
        serviceAccountJson.private_key.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets'],
      );

      await auth.authorize();

      return google.sheets({ version: 'v4', auth });
    } catch (error) {
      this.logger.error(
        `Failed to create Google Sheets client: ${error.message}`,
      );
      throw new GoogleSheetsApiException(error.message);
    }
  }
}
