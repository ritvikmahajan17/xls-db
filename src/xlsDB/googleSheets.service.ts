import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  async createClient(serviceAccountJson: any) {
    if (!serviceAccountJson?.client_email || !serviceAccountJson?.private_key) {
      throw new Error('Invalid service account credentials');
    }

    const auth = new google.auth.JWT(
      serviceAccountJson.client_email,
      undefined,
      serviceAccountJson.private_key.replace(/\\n/g, '\n'), // Fix for JSON format
      ['https://www.googleapis.com/auth/spreadsheets'],
    );

    await auth.authorize();

    return google.sheets({ version: 'v4', auth });
  }
}
