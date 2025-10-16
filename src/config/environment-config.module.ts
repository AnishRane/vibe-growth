import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentConfigService } from './environment-config.service';
import { validate } from './environment-config.validation';
require('dotenv').config();

const environment = process.env.NODE_ENV;
console.log('Environment: ', environment);

const chooseFilePath = function () {
  let filePath = '.env';
  switch (environment) {
    case 'local':
      filePath = './env/.local.env';
      break;
    case 'production':
      filePath = './env/.prod.env';
      break;
    default:
      filePath = '.env';

  }
  return filePath;
};

const environmentVariableFilePath = chooseFilePath();
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environmentVariableFilePath,
      isGlobal: true,
      ignoreEnvFile:
        process.env.NODE_ENV === 'local' ||
        process.env.NODE_ENV === 'production'
          ? false
          : true,
      validate,
    }),
  ],
  providers: [EnvironmentConfigService],
  exports: [EnvironmentConfigService],
})
export class EnvironmentConfigModule {}