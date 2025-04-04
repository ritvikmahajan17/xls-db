import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { xlsDBController } from './xlsDB.controller';
import { xlsDBService } from './xlsDB.service';
import { TransformBodyMiddleware } from './xlsDB.middleware';
import { ConfigModule } from '@nestjs/config';
import { GoogleSheetsService } from './googleSheets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [xlsDBController],
  providers: [xlsDBService, GoogleSheetsService],
})
export class xlsDBModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransformBodyMiddleware).forRoutes(xlsDBController); // Apply middleware to specific route or controller
  }
}
