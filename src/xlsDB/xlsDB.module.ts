import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { xlsDBController } from './xlsDB.controller';
import { xlsDBService } from './xlsDB.service';
import { TransformBodyMiddleware } from './xlsDB.middleware';
import { ConfigModule } from '@nestjs/config';
import { GoogleSheetsService } from './googleSheets.service';
import { APP_FILTER } from '@nestjs/core';
import { XlsDBExceptionFilter } from './filters/xlsDB-exception.filter';

/**
 * Main module for xlsDB functionality
 * Provides services for interacting with Google Sheets as a database
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [xlsDBController],
  providers: [
    xlsDBService,
    GoogleSheetsService,
    {
      provide: APP_FILTER,
      useClass: XlsDBExceptionFilter,
    },
  ],
})
export class xlsDBModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransformBodyMiddleware).forRoutes(xlsDBController); // Apply middleware to specific route or controller
  }
}
