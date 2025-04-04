import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { xlsDBService } from './xlsDB.service';
import { AddDto } from './dto/add.dto';
import { FindDto } from './dto/find.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { BatchAddDto } from './dto/batch-add.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { GoogleSheetsService } from './googleSheets.service';

@Controller('xlsDB')
export class xlsDBController {
  constructor(
    private readonly xlsDBService: xlsDBService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

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

  @Post('get-one')
  async getOne(@Body() body: FindDto) {
    const { where, sheetId, serviceClientEmail, servicePrivateKey, sheetName } =
      body;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    return await this.xlsDBService.getOne(where, sheetId, sheets, sheetName);
  }

  @Post('get-all')
  async getAll(@Body() body: FindDto) {
    const { where, sheetId, serviceClientEmail, servicePrivateKey, sheetName } =
      body;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    return await this.xlsDBService.getAll(where, sheetId, sheets, sheetName);
  }

  @Put('update')
  async update(@Body() body: UpdateDto) {
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

    return await this.xlsDBService.update(
      where,
      newValues,
      sheetId,
      sheets,
      sheetName,
    );
  }

  @Delete('delete')
  async delete(@Body() body: DeleteDto) {
    const { where, sheetId, serviceClientEmail, servicePrivateKey, sheetName } =
      body;

    const sheets = await this.googleSheetsService.createClient({
      client_email: serviceClientEmail,
      private_key: servicePrivateKey,
    });

    return await this.xlsDBService.delete(where, sheetId, sheets, sheetName);
  }

  @ApiExcludeEndpoint()
  @Get('get-cache')
  getCache() {
    return Object.fromEntries(this.xlsDBService.getCache());
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
