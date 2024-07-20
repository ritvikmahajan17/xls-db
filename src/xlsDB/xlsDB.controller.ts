import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { xlsDBService } from './xlsDB.service';
import { AddDto } from './dto/add.dto';
import { FindDto } from './dto/find.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { BatchAddDto } from './dto/batch-add.dto';

@Controller('xlsDB')
export class xlsDBController {
  constructor(private readonly xlsDBService: xlsDBService) {}

  @Post('add')
  async add(@Body() body: AddDto) {
    const values = body.values;
    const sheetId = body.sheetId;
    const sheetName = body?.sheetName;
    const response = await this.xlsDBService.add(values, sheetId, sheetName);
    return response;
  }

  @Post('batch-add')
  async batchAdd(@Body() body: BatchAddDto) {
    const values = body.values;
    const sheetId = body.sheetId;
    const sheetName = body?.sheetName;
    const response = await this.xlsDBService.batchAdd(
      values,
      sheetId,
      sheetName,
    );
    return response;
  }

  @Post('get-one')
  getOne(@Body() body: FindDto) {
    const { where, sheetId, sheetName } = body;

    return this.xlsDBService.getOne(where, sheetId, sheetName);
  }

  @Post('get-all')
  getAll(@Body() body: FindDto) {
    const { where, sheetId, sheetName } = body;
    return this.xlsDBService.getAll(where, sheetId, sheetName);
  }

  @Put('update')
  update(@Body() body: UpdateDto) {
    const { where, newValues, sheetId, sheetName } = body;
    return this.xlsDBService.update(where, newValues, sheetId, sheetName);
  }

  @Delete('delete')
  delete(@Body() body: DeleteDto) {
    const { where, sheetId, sheetName } = body;
    return this.xlsDBService.delete(where, sheetId, sheetName);
  }

  @Get('get-cache')
  getCache() {
    return Object.fromEntries(this.xlsDBService.getCache());
  }

  @Get('get-credentials')
  getCredentials() {
    return this.xlsDBService.getCredentials();
  }
  @Get('health')
  check() {
    console.log('health check');
    return {
      status: 'ok',
    };
  }
}
