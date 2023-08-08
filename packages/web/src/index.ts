import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as process from 'process';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());

  await app.listen(3001);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
