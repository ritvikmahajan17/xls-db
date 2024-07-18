import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { xlsDBModule } from './xlsDB/xlsDB.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    xlsDBModule,
  ],
})
export class AppModule {}
