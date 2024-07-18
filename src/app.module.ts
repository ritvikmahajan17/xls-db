import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { xlsDBController } from './app.controller';
import { xlsDBService } from './app.service';
import { TransformBodyMiddleware } from './app.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [xlsDBController],
  providers: [xlsDBService],
})
export class xlsDBModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransformBodyMiddleware).forRoutes(xlsDBController); // Apply middleware to specific route or controller
  }
}
