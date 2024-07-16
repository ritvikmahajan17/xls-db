import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { google } from 'googleapis';
import { matchData } from './utils/matchData';
import { create } from 'domain';
import { createObjectfromArrays } from './utils/createObjectfromArrays';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
];
const CREDENTIALS_PATH =
  '/Users/Ritvik_Mahajan/xls-db/sheets-as-db-427314-7ad9c5288c0d.json';

@Injectable()
export class xlsDBService {
  private auth: any;
  private sheets: any;
  private columnHeadersCache: Map<
    string,
    { numOfColumns: number; headersPosition: { [key in string]: number } }
  >;
  constructor() {
    const credentials = JSON.parse(
      fs.readFileSync(CREDENTIALS_PATH).toString(),
    );
    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.columnHeadersCache = new Map();
  }

  getCache() {
    return this.columnHeadersCache;
  }

  getCredentials() {
    return {
      clientEmail: JSON.parse(fs.readFileSync(CREDENTIALS_PATH).toString())
        .client_email,
    };
  }

  private async fetchColumnHeaders(
    sheetId: string,
    sheetName?: string,
  ): Promise<string[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetName ? `${sheetName}!1:1` : 'Sheet1!1:1',
    });
    return response.data.values[0];
  }

  private async initColumnHeaders(sheetId: string, sheetName?: string) {
    const headers = await this.fetchColumnHeaders(sheetId, sheetName);
    const numOfColumns = headers.length;

    const headersPosition = {};
    headers.forEach((header, index) => {
      headersPosition[header.trim()] = index;
    });

    this.columnHeadersCache.set(sheetId, { numOfColumns, headersPosition });
  }

  private async getNumOfColumns(
    sheetId: string,
    sheetName?: string,
  ): Promise<number> {
    if (!this.columnHeadersCache.has(sheetId)) {
      await this.initColumnHeaders(sheetId, sheetName);
    }
    return this.columnHeadersCache.get(sheetId).numOfColumns;
  }

  private async getColumnsHeaders(
    sheetId: string,
    sheetName?: string,
  ): Promise<any> {
    if (!this.columnHeadersCache.has(sheetId)) {
      await this.initColumnHeaders(sheetId, sheetName);
    }
    const { numOfColumns, headersPosition: columnHeaders } =
      this.columnHeadersCache.get(sheetId);

    return {
      numOfColumns,
      columnHeaders,
    };
  }
  private async getColumnIndex(
    sheetId: string,
    columnName: string,
    sheetName?: string,
  ): Promise<{
    numOfColumns: number;
    columnPosition: number;
  }> {
    const { numOfColumns, columnHeaders } = await this.getColumnsHeaders(
      sheetId,
      sheetName,
    );

    if (columnHeaders) {
      return {
        numOfColumns,
        columnPosition: columnHeaders?.[columnName] ?? -1,
      };
    }
    return {
      numOfColumns,
      columnPosition: -1,
    };
  }

  private async getSheetId(
    spreadsheetId: string,
    sheetName: string,
  ): Promise<number> {
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = spreadsheet.data.sheets.find(
      (sheet) => sheet.properties.title === sheetName,
    );
    if (!sheet) {
      throw new Error(`Sheet with name "${sheetName}" not found.`);
    }
    return sheet.properties.sheetId;
  }

  async add(
    values: {
      [key in string]: string;
    },
    sheetId: string,
    sheetName?: string,
  ) {
    const positionValuesMap = {};
    let totalColumns = 0;
    for (let column in values) {
      const { numOfColumns, columnPosition: index } = await this.getColumnIndex(
        sheetId,
        column,
        sheetName,
      );
      positionValuesMap[index] = values[column];
      totalColumns = numOfColumns;
    }
    const row = [];
    for (let i = 0; i < totalColumns; i++) {
      if (!positionValuesMap[i]) {
        row.push('');
      } else {
        row.push(positionValuesMap[i]);
      }
    }
    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: sheetName ?? 'Sheet1',
      valueInputOption: 'RAW',
      resource: { values: [row] },
    });
    return response.data.updates;
  }

  async batchAdd(
    values: Record<string, string>[],
    sheetId: string,
    sheetName?: string,
  ) {
    const positionValuesMap = {};
    const newValues = [];
    for (let i = 0; i < values.length; i++) {
      const currentValue = values[i];
      for (let column in currentValue) {
        const { columnPosition: index } = await this.getColumnIndex(
          sheetId,
          column,
          sheetName,
        );
        positionValuesMap[index] = currentValue[column];
      }

      const row = [];
      for (
        let i = 0;
        i < (await this.getNumOfColumns(sheetId, sheetName));
        i++
      ) {
        if (!positionValuesMap[i]) {
          row.push('');
        } else {
          row.push(positionValuesMap[i]);
        }
      }
      newValues.push(row);
    }
    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: sheetName ?? 'Sheet1',
      valueInputOption: 'RAW',
      resource: { values: newValues },
    });
    return response.data.updates;
  }

  async getOne(
    whereCondition: {
      [key in string]: string;
    },
    sheetId: string,
    sheetName?: string,
  ) {
    // get all data
    const response = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: sheetName ?? 'Sheet1',
    });
    const sheetData = response.data.valueRanges[0].values;
    let matchingRowIndex = -1;

    // create a map of column index and value
    const whereConditionArray = Object.entries(whereCondition);
    const positionValuesMap = {};
    for (let i = 0; i < whereConditionArray.length; i++) {
      const [column, value] = whereConditionArray[i];
      const index = (await this.getColumnIndex(sheetId, column, sheetName))
        .columnPosition;
      positionValuesMap[index] = value;
    }

    // find the row that matches the where condition
    // Time complexity: O(noOfRows * noOfColumns)
    const matchingRow = sheetData.find((dataRow: string[], index: number) => {
      if (matchData(dataRow, positionValuesMap)) {
        matchingRowIndex = index;
        return true;
      }
      return false;
    });

    const { columnHeaders } = await this.getColumnsHeaders(sheetId, sheetName);

    const valuesAsObject = createObjectfromArrays(
      Object.keys(columnHeaders),
      matchingRow,
    );

    // return the matching row
    if (matchingRow)
      return {
        matchingRowIndex,
        value: valuesAsObject,
        success: true,
      };
    // return no data found
    else {
      return {
        matchingRowIndex,
        value: 'No data found',
        success: false,
      };
    }
  }

  async getAll(
    whereCondition: {
      [key in string]: string;
    },
    sheetId: string,
    sheetName?: string,
  ) {
    const response = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: 'Sheet1',
    });
    const sheetData = response.data.valueRanges[0].values;
    let matchingRowIndex: number[] = [];

    const whereConditionArray = Object.entries(whereCondition);
    const positionValuesMap = {};

    for (let i = 0; i < whereConditionArray.length; i++) {
      const [column, value] = whereConditionArray[i];
      const index = (await this.getColumnIndex(sheetId, column, sheetName))
        .columnPosition;
      positionValuesMap[index] = value;
    }

    let matchingRows = sheetData.filter((dataRow: string[], index: number) => {
      if (matchData(dataRow, positionValuesMap)) {
        matchingRowIndex.push(index);
        return true;
      }
      return false;
    });

    const { columnHeaders } = await this.getColumnsHeaders(sheetId, sheetName);

    matchingRows = matchingRows.map((row) =>
      createObjectfromArrays(Object.keys(columnHeaders), row),
    );

    if (matchingRows.length)
      return {
        matchingRowIndex,
        value: matchingRows,
        success: true,
      };
    else {
      return {
        matchingRowIndex,
        value: 'No data found',
        success: false,
      };
    }
  }

  async update(
    whereCondition: {
      [key in string]: string;
    },
    newValues: {
      [key in string]: string;
    },
    sheetId: string,
    sheetName?: string,
  ) {
    const response = await this.getAll(whereCondition, sheetId);
    const { matchingRowIndex } = response;

    if (matchingRowIndex.length === 0) {
      return {
        message: 'No data found',
        success: false,
      };
    } else {
      for (let i = 0; i < matchingRowIndex.length; i++) {
        const range = `Sheet1!A${matchingRowIndex[i] + 1}:Z${matchingRowIndex[i] + 1}`;
        const oldData = await this.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range,
        });
        let newRow = oldData.data.values[0];
        for (let key in newValues) {
          const index = (await this.getColumnIndex(sheetId, key, sheetName))
            .columnPosition;
          newRow[index] = newValues[key];
        }
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range,
          valueInputOption: 'RAW',
          resource: { values: [newRow] },
        });
      }
      return {
        message: 'Data updated',
        success: true,
      };
    }
  }

  async delete(
    whereCondition: {
      [key in string]: string;
    },
    sheetId: string,
  ) {
    const response = await this.getAll(whereCondition, sheetId);

    let { matchingRowIndex } = response;

    matchingRowIndex.reverse();

    if (matchingRowIndex.length === 0) {
      return {
        message: 'No data found',
        success: false,
      };
    } else {
      const sheetid = await this.getSheetId(sheetId, 'Sheet1');
      for (let i = 0; i < matchingRowIndex.length; i++) {
        const request = {
          spreadsheetId: sheetId,
          resource: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: sheetid,
                    dimension: 'ROWS',
                    startIndex: matchingRowIndex[i], //TODO: can be optimized
                    endIndex: matchingRowIndex[i] + 1,
                  },
                },
              },
            ],
          },
        };
        await this.sheets.spreadsheets.batchUpdate(request);
      }
      return {
        message: 'Data deleted',
        success: true,
      };
    }
  }
}
