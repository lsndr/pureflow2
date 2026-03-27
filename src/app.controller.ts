import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppConfig } from './app.config.api';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('config')
  getConfig(): Omit<AppConfig, 'sql'> { // Exclude 'sql' from the response
    const { sql, ...configWithoutSql } = this.appService.getConfig();
    return configWithoutSql;
  }
}