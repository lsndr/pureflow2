import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('config')
  getConfig() {
    // Do not expose sensitive information
    const config = this.appService.getConfig();
    return {
      awsBucket: config.awsBucket,
      // Do not return SQL connection string
      // Do not return Google Maps API key
    };
  }
}