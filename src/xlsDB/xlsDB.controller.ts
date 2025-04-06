import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { xlsDBService } from './xlsDB.service';
import { AddDto } from './dto/add.dto';
import { FindDto } from './dto/find.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { BatchAddDto } from './dto/batch-add.dto';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleSheetsService } from './googleSheets.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('xlsDB')
export class xlsDBController {
  constructor(
    private readonly xlsDBService: xlsDBService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  @ApiOperation({ summary: 'Append single data row to Google Sheet' })
  @ApiResponse({
    status: 201,
    description:
      'Response includes spreadsheetId, updatedRange, updatedRows, updatedColumns, and updatedCells.',
    schema: {
      example: {
        spreadsheetId: '<your-spreadsheet-id>',
        updatedRange: '<sheet-name>!A4:D4',
        updatedRows: 1,
        updatedColumns: 4,
        updatedCells: 4,
      },
    },
  })
  @Post('add')
  async add(@Body() body: AddDto) {
    const values = body.values;
    const sheetId = body.sheetId;
    const serviceClientEmail = body.serviceClientEmail;
    const servicePrivateKey = body.servicePrivateKey;
    const sheetName = body?.sheetName;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    const response = await this.xlsDBService.add(
      values,
      sheetId,
      sheets,
      sheetName,
    );
    return response;
  }

  @ApiOperation({ summary: 'Append multiple data rows to Google Sheet' })
  @ApiResponse({
    status: 201,
    description:
      'Response includes spreadsheetId, updatedRange, updatedRows, updatedColumns, and updatedCells.',
    schema: {
      example: {
        spreadsheetId: '<your-spreadsheet-id>',
        updatedRange: '<sheet-name>!A4:D4',
        updatedRows: 1,
        updatedColumns: 4,
        updatedCells: 4,
      },
    },
  })
  @Post('batch-add')
  async batchAdd(@Body() body: BatchAddDto) {
    const values = body.values;
    const sheetId = body.sheetId;
    const sheetName = body?.sheetName;
    const serviceClientEmail = body.serviceClientEmail;
    const servicePrivateKey = body.servicePrivateKey;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    const response = await this.xlsDBService.batchAdd(
      values,
      sheetId,
      sheets,
      sheetName,
    );
    return response;
  }

  @ApiOperation({
    summary: 'Get one data row from Google Sheet, matching the where condition',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        matchingRowIndex: 3,
        value: {
          name: 'John Doe',
          age: '30',
          city: 'New York',
        },
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        matchingRowIndex: -1,
        value: 'No data found',
        success: false,
      },
    },
  })
  @Post('get-one')
  async getOne(@Body() body: FindDto, @Res() res: Response) {
    const { where, sheetId, serviceClientEmail, servicePrivateKey, sheetName } =
      body;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    const response = await this.xlsDBService.getOne(
      where,
      sheetId,
      sheets,
      sheetName,
    );

    if (!response.success) {
      return res.status(HttpStatus.NOT_FOUND).json(response);
    }
    return res.status(HttpStatus.OK).json(response);
  }

  @ApiOperation({
    summary:
      'Get all data rows from Google Sheet, matching the where condition',
    description:
      'If no where condition is provided, all data rows will be returned.',
  })
  @Post('get-all')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        matchingRowIndex: [3, 5],
        value: [
          {
            name: 'John Doe',
            age: '30',
            city: 'New York',
          },
          {
            name: 'Jane Doe',
            age: '25',
            city: 'Los Angeles',
          },
        ],
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        matchingRowIndex: [],
        value: 'No data found',
        success: false,
      },
    },
  })
  async getAll(@Body() body: FindDto, @Res() res: Response) {
    const { where, sheetId, serviceClientEmail, servicePrivateKey, sheetName } =
      body;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    const response = await this.xlsDBService.getAll(
      where,
      sheetId,
      sheets,
      sheetName,
    );

    if (!response.success) {
      return res.status(HttpStatus.NOT_FOUND).json(response);
    }
    return res.status(HttpStatus.OK).json(response);
  }

  @ApiOperation({
    summary: 'Update one or more data rows in Google Sheet',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Data updated',
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        message: 'No data found',
        success: false,
      },
    },
  })
  @Put('update')
  async update(@Body() body: UpdateDto, @Res() res: Response) {
    const {
      where,
      newValues,
      sheetId,
      serviceClientEmail,
      servicePrivateKey,
      sheetName,
    } = body;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    const response = await this.xlsDBService.update(
      where,
      newValues,
      sheetId,
      sheets,
      sheetName,
    );

    if (!response.success) {
      return res.status(HttpStatus.NOT_FOUND).json(response);
    }
    return res.status(HttpStatus.OK).json(response);
  }

  @ApiOperation({
    summary: 'Delete one or more data rows from Google Sheet',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Data deleted',
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        message: 'No data found',
        success: false,
      },
    },
  })
  @Delete('delete')
  async delete(@Body() body: DeleteDto, @Res() res: Response) {
    const { where, sheetId, serviceClientEmail, servicePrivateKey, sheetName } =
      body;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    const response = await this.xlsDBService.delete(
      where,
      sheetId,
      sheets,
      sheetName,
    );

    if (!response.success) {
      return res.status(HttpStatus.NOT_FOUND).json(response);
    }
    return res.status(HttpStatus.OK).json(response);
  }

  @ApiExcludeEndpoint()
  @Get('get-cache')
  getCache() {
    return Object.fromEntries(this.xlsDBService.getCache());
  }

  @ApiExcludeEndpoint()
  @Get('')
  serveDocs(@Res() res: Response) {
    console.log('serveDocs');
    const filePath = path.join(__dirname, '..', '..', 'src', 'xlsDB.html');
    console.log('filePath', filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(HttpStatus.NOT_FOUND).send('docs.html not found');
    }
    res.sendFile(filePath);
  }

  @ApiExcludeEndpoint()
  @Get('health')
  check() {
    console.log('health check');
    return {
      status: 'ok',
    };
  }
}
