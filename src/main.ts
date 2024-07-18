import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform incoming payloads to DTO instances
      whitelist: true, // Strips incoming payloads of any extra properties not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error when extra properties are present in the incoming payload
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('xls-db')
    .setDescription('apis for xls-db')
    .setVersion('1.0')
    .addTag('xls-db')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(5050);
  console.log('App is running on port 5050');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
