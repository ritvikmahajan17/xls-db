import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { xlsDBService } from './app.service';
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
    console.log(body, 'controller');
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
    console.log(values, 'controller');
    const response = await this.xlsDBService.batchAdd(
      values,
      sheetId,
      sheetName,
    );
    return response;
  }

  @Get('get-one')
  getOne(@Body() body: FindDto) {
    const { where, sheetId } = body;
    return this.xlsDBService.getOne(where, sheetId);
  }

  @Get('get-all')
  getAll(@Body() body: FindDto) {
    const { where, sheetId } = body;
    return this.xlsDBService.getAll(where, sheetId);
  }

  @Put('update')
  update(@Body() body: UpdateDto) {
    const { where, newValues, sheetId } = body;
    return this.xlsDBService.update(where, newValues, sheetId);
  }

  @Delete('delete')
  delete(@Body() body: DeleteDto) {
    const { where, sheetId } = body;
    return this.xlsDBService.delete(where, sheetId);
  }

  @Get('get-cache')
  getCache() {
    return Object.fromEntries(this.xlsDBService.getCache());
  }

  @Get('get-credentials')
  getCredentials() {
    return this.xlsDBService.getCredentials();
  }
}
