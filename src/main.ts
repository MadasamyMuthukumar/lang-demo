import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LangChainIntro } from './practice/langchain-intro';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    validateCustomDecorators: true
  }));

  await app.listen(4000);
}
bootstrap();
