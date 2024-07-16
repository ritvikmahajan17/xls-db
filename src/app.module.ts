import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { xlsDBController } from './app.controller';
import { xlsDBService } from './app.service';
import { TransformBodyMiddleware } from './app.middleware';

@Module({
  imports: [],
  controllers: [xlsDBController],
  providers: [xlsDBService],
})
export class xlsDBModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransformBodyMiddleware).forRoutes(xlsDBController); // Apply middleware to specific route or controller
  }
}
