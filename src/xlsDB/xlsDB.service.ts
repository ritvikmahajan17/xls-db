import { Injectable } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { matchData } from './utils/matchData';
import { createObjectfromArrays } from './utils/createObjectfromArrays';
import { GoogleSheetsService } from './googleSheets.service';
import logger from '../config/logger.config';

@Injectable()
export class xlsDBService {
  private columnHeadersCache: Map<
    string,
    { numOfColumns: number; headersPosition: { [key in string]: number } }
  >;

  constructor(private readonly googleSheetsService: GoogleSheetsService) {
    this.columnHeadersCache = new Map();
  }

  getCache() {
    return this.columnHeadersCache;
  }

  /*
    HELPER FUNCTIONS
  */

  private async fetchColumnHeaders(
    sheetId: string,
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ): Promise<string[]> {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetName ? `${sheetName}!1:1` : 'Sheet1!1:1',
    });
    return response.data.values[0];
  }

  private async initColumnHeaders(
    sheetId: string,
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ) {
    const headers = await this.fetchColumnHeaders(sheetId, sheets, sheetName);
    const numOfColumns = headers.length;

    const headersPosition = {};
    headers.forEach((header, index) => {
      headersPosition[header.trim()] = index;
    });

    this.columnHeadersCache.set(sheetId, { numOfColumns, headersPosition });
  }

  private async getNumOfColumns(
    sheetId: string,
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ): Promise<number> {
    if (!this.columnHeadersCache.has(sheetId)) {
      await this.initColumnHeaders(sheetId, sheets, sheetName);
    }
    return this.columnHeadersCache.get(sheetId).numOfColumns;
  }

  private async getColumnsHeaders(
    sheetId: string,
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ): Promise<any> {
    if (!this.columnHeadersCache?.has(sheetId)) {
      await this.initColumnHeaders(sheetId, sheets, sheetName);
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
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ): Promise<{
    numOfColumns: number;
    columnPosition: number;
  }> {
    const { numOfColumns, columnHeaders } = await this.getColumnsHeaders(
      sheetId,
      sheets,
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
    sheets: sheets_v4.Sheets,
    sheetName: string,
  ): Promise<number> {
    const spreadsheet = await sheets.spreadsheets.get({
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

  /*
   REAL FUNCTIONS
   */

  async add(
    values: {
      [key in string]: string;
    },
    sheetId: string,
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ) {
    logger.info(`Starting add operation for sheet: ${sheetId}`, { 
      sheetName, 
      valuesCount: Object.keys(values).length 
    });
    
    const positionValuesMap = {};
    let totalColumns = 0;

    // iterate over keys of values which user wants to add
    // and get the column index of each key
    // and add in the positionValuesMap, they index of column and value to be added at that index
    // for example if user wants to add {name: 'John', age: '30'}
    // and the column index of name is 0 and age is 1
    // then the positionValuesMap will be {0: 'John', 1: '30'}

    // then we will iterate from 0 to totalColumns(in the sheet) and check if the index is present in the positionValuesMap
    // if it is present then we will push the value to the row
    // if it is not present then we will push an empty string to the row
    // so that we can create a row of the same length as the sheet
    // and then append the row to the sheet
    // for example if the positionValuesMap is {0: 'John', 1: '30'}
    // then the row will be ['John', '30']

    // and then we will append the row to the sheet

    for (let column in values) {
      const { numOfColumns, columnPosition: index } = await this.getColumnIndex(
        sheetId,
        column,
        sheets,
        sheetName,
      );
      positionValuesMap[index] = values[column];
      totalColumns = numOfColumns;
    }
    const row = [];
    for (let i = 0; i < totalColumns; i++) {
      if (!positionValuesMap[i]) {
        row.push(JSON.stringify(''));
      } else {
        row.push(JSON.stringify(positionValuesMap[i])); // fiqure out json.stringy
      }
    }
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: sheetName ?? 'Sheet1',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });
    
    logger.info(`Successfully added row to sheet: ${sheetId}`, { 
      sheetName, 
      updatedCells: response.data.updates?.updatedCells 
    });
    
    return response.data.updates;
  }

  async batchAdd(
    values: Record<string, string>[],
    sheetId: string,
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ) {
    const positionValuesMap = {};

    // to be an array of arrays, where each array is a row
    // for example if the values are [{name: 'John', age: '30'}, {name: 'Jane', age: '25'}]
    // then the newValues will be [['John', '30'], ['Jane', '25']]
    // and then we will append the newValues to the sheet
    const newValues = [];

    // iterate of each values which user wants to add
    for (let i = 0; i < values.length; i++) {
      const currentValue = values[i];
      // iterate over keys of values which user wants to add
      for (let column in currentValue) {
        // get the column index of each key
        const { columnPosition: index } = await this.getColumnIndex(
          sheetId,
          column,
          sheets,
          sheetName,
        );
        // add in the positionValuesMap, they index of column and value to be added at that index
        // for example if user wants to add {name: 'John', age: '30'}
        // and the column index of name is 0 and age is 1
        // then the positionValuesMap will be {0: 'John', 1: '30'}
        positionValuesMap[index] = currentValue[column];
      }

      const row = [];
      // then we will iterate from 0 to totalColumns(in the sheet) and check if the index is present in the positionValuesMap
      // if it is present then we will push the value to the row
      // if it is not present then we will push an empty string to the row
      // so that we can create a row of the same length as the sheet
      for (
        let i = 0;
        i < (await this.getNumOfColumns(sheetId, sheets, sheetName));
        i++
      ) {
        if (!positionValuesMap[i]) {
          row.push(JSON.stringify(''));
        } else {
          row.push(JSON.stringify(positionValuesMap[i]));
        }
      }
      // then we will append the row to the newValues
      // for example if the positionValuesMap is {0: 'John', 1: '30'}
      // then the row will be ['John', '30']
      // and then we will append the row to the newValues
      // for example if the newValues is [['John', '30']]
      // then the newValues will be [['John', '30'], ['Jane', '25']]
      newValues.push(row);
    }

    // and then we will append the newValues to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: sheetName ?? 'Sheet1',
      valueInputOption: 'RAW',
      requestBody: { values: newValues },
    });
    return response.data.updates;
  }

  async getOne(
    whereCondition: {
      [key in string]: string;
    },
    sheetId: string,
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ) {
    logger.info(`Starting getOne operation for sheet: ${sheetId}`, { 
      sheetName, 
      whereCondition 
    });
    
    // get all data from the sheet
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: [sheetName ?? 'Sheet1'],
    });
    const sheetData = response.data.valueRanges[0].values;
    let matchingRowIndex = -1;

    // create a map of column index and value
    // for example if the whereCondition is {name: 'John', age: '30'}
    // and the column index of name is 0 and age is 1
    // then the positionValuesMap will be {0: 'John', 1: '30'}
    const whereConditionArray = Object.entries(whereCondition);
    const positionValuesMap = {};
    for (let i = 0; i < whereConditionArray.length; i++) {
      const [column, value] = whereConditionArray[i];
      const index = (
        await this.getColumnIndex(sheetId, column, sheets, sheetName)
      ).columnPosition;
      positionValuesMap[index] = value;
    }

    // find the row that matches the where condition
    // Time complexity: O(noOfRows * noOfColumns)

    // iterate over each row and check if the row matches the where condition
    // if it matches then return the row
    const matchingRow = sheetData.find((dataRow: string[], index: number) => {
      if (index > 0 && matchData(dataRow, positionValuesMap)) {
        matchingRowIndex = index;
        return true;
      }
      return false;
    });

    const { columnHeaders } = await this.getColumnsHeaders(
      sheetId,
      sheets,
      sheetName,
    );

    // return the matching row
    // if the matching row is found then create an object from the arrays
    // for example if the matching row is ['John', '30', 'New York']
    // and the column headers are ['name', 'age', 'city']
    // then the object will be {name: 'John', age: '30', city: 'New York'}
    if (matchingRow) {
      const valuesAsObject = createObjectfromArrays(
        Object.keys(columnHeaders),
        matchingRow,
      );
      
      logger.info(`Successfully found matching row in sheet: ${sheetId}`, { 
        sheetName, 
        matchingRowIndex 
      });
      
      return {
        matchingRowIndex,
        value: valuesAsObject,
        success: true,
      };
    } else {
      logger.warn(`No matching row found in sheet: ${sheetId}`, { 
        sheetName, 
        whereCondition 
      });
      
      // return no data found
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
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ) {
    // get all data from the sheet
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: [sheetName ?? 'Sheet1'],
    });
    const sheetData = response.data.valueRanges[0].values;
    let matchingRowIndex: number[] = [];

    const whereConditionArray = Object.entries(whereCondition);
    const positionValuesMap = {};

    // create a map of column index and value
    // for example if the whereCondition is {name: 'John', age: '30'}
    // and the column index of name is 0 and age is 1
    // then the positionValuesMap will be {0: 'John', 1: '30'}
    for (let i = 0; i < whereConditionArray.length; i++) {
      const [column, value] = whereConditionArray[i];
      const index = (
        await this.getColumnIndex(sheetId, column, sheets, sheetName)
      ).columnPosition;
      positionValuesMap[index] = value;
    }

    // find the rows that match the where condition
    // Time complexity: O(noOfRows * noOfColumns)

    // iterate over each row and check if the row matches the where condition
    // if it matches then add the row to the matchingRows array
    let matchingRows: Record<string, any>[] = sheetData.filter(
      (dataRow: string[], index: number) => {
        if (index > 0 && matchData(dataRow, positionValuesMap)) {
          matchingRowIndex.push(index);
          return true;
        }
        return false;
      },
    );

    const { columnHeaders } = await this.getColumnsHeaders(
      sheetId,
      sheets,
      sheetName,
    );

    // return the matching rows
    // if the matching rows are found then create an object from the arrays
    // for example if the matching rows are [['John', '30', 'New York'], ['Jane', '25', 'Los Angeles']]
    // and the column headers are ['name', 'age', 'city']
    // then the object will be [{name: 'John', age: '30', city: 'New York'}, {name: 'Jane', age: '25', city: 'Los Angeles'}]
    matchingRows = matchingRows.map((row) =>
      createObjectfromArrays(
        Object.keys(columnHeaders),
        Array.isArray(row) ? row : [],
      ),
    );

    if (matchingRows.length)
      return {
        matchingRowIndex,
        value: matchingRows,
        success: true,
      };
    // if no matching rows are found then return no data found
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
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ) {
    logger.info(`Starting update operation for sheet: ${sheetId}`, { 
      sheetName, 
      whereCondition, 
      newValuesCount: Object.keys(newValues).length 
    });
    
    // get all data from the sheet, which matches the where condition
    const response = await this.getAll(whereCondition, sheetId, sheets);

    // get the matching rows indexes
    const { matchingRowIndex } = response;

    // if no matching rows are found then return no data found
    if (matchingRowIndex.length === 0) {
      return {
        message: 'No data found',
        success: false,
      };
    } else {
      //TODO: this logic sucks, optimize it in the future

      // for every matching row index, update the row with the new values
      // for example if the matching row index is [3, 5]
      // and the new values are {name: 'John', age: '30'}
      // then the rows at index 3 and 5 will be updated with the new values
      for (let i = 0; i < matchingRowIndex.length; i++) {
        // get the row which needs to be updated
        // +1 because the first row is the header
        const range = `Sheet1!A${matchingRowIndex[i] + 1}:Z${matchingRowIndex[i] + 1}`;
        const oldData = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range,
        });
        let newRow = oldData.data.values[0];

        // iterate over keys of newValues which user wants to update
        // and get the column index of each key
        // and add in the newRow, they index of column and value to be updated at that index
        // for example if user wants to update {name: 'John', age: '30'}
        // and the column index of name is 0 and age is 1
        // then the newRow will be ['John', '30']
        for (let key in newValues) {
          const index = (
            await this.getColumnIndex(sheetId, key, sheets, sheetName)
          ).columnPosition;
          newRow[index] = JSON.stringify(newValues[key]);
        }
        // update the row in the sheet
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range,
          valueInputOption: 'RAW',
          requestBody: { values: [newRow] },
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
    sheets: sheets_v4.Sheets,
    sheetName?: string,
  ) {
    logger.info(`Starting delete operation for sheet: ${sheetId}`, { 
      sheetName, 
      whereCondition 
    });
    
    // get all data from the sheet, which matches the where condition
    const response = await this.getAll(whereCondition, sheetId, sheets);

    // get the matching rows indexes
    let { matchingRowIndex } = response;

    //
    // matchingRowIndex.reverse();

    if (matchingRowIndex.length === 0) {
      return {
        message: 'No data found',
        success: false,
      };
    } else {
      const sheetid = await this.getSheetId(
        sheetId,
        sheets,
        sheetName ?? 'Sheet1',
      );
      // delete the rows from the sheet, starting from the last row
      // to avoid index shifting
      // for example if the matching row index is [3, 5]
      // and we delete the row at index 3 first, then the row at index 5 will shift to index 4
      // and we will end up deleting the wrong row
      // so we need to delete the rows from the last index to the first index
      // since matchingRowIndex is sorted in ascending order
      // we need to reverse it to delete the rows from the last index to the first index
      for (let i = matchingRowIndex.length; i >= 0; i--) {
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
        await sheets.spreadsheets.batchUpdate(request);
      }
      return {
        message: 'Data deleted',
        success: true,
      };
    }
  }
}
