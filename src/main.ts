import { NestFactory } from '@nestjs/core';
import { xlsDBModule } from './app.module';
import { TransformBodyMiddleware } from './app.middleware';
import { ValidationPipe } from '@nestjs/common';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(xlsDBModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform incoming payloads to DTO instances
      whitelist: true, // Strips incoming payloads of any extra properties not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error when extra properties are present in the incoming payload
    }),
  );
  await app.listen(5050);
  console.log('App is running on port 5050');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
